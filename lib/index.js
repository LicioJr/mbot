'use strict';
/**
 * MBOT - Modular Bot Framework
 * Copyright (c) 2017 Licio Medeiros Jr. All rights reserved.
 * 
 * License: GNU Lesser General Public License (LGPL), version 3 or later.
 * See the LICENSE file in the root directory or {@link https://www.gnu.org/licenses/lgpl.html}.
 * 
 * @module
 * @description Modules loader, featuring filesystem overlay, 
 * configuration support, init/dispose management and helpers.
 */
module.exports = {
    path,       // core overlay
    configPath, // path for config files
    load,       // core loader (use path)
    config,     // use load
    init,       // use load
    dispose,    // from load
    logger,     // helper for 'util/logger'
    _: require('./core/util') // generic helpers
}

// imports
let fs = require('fs'),
    path_ = require('path'),
    util_logger, // dynamic ref in logger()
    _ = require('./core/util'); // use & exports

/** @private */
let _env = process.env.MBOT_NODE_ENV || 'dev', // tst, prd
    _env_alt = process.env.MBOT_NODE_ENV_ALT || 'dev',
    _root = path_.resolve() + '/',
    _logger, // local logger
    _cfg,
    _path = {}, // path cache
    _mod = {}, // module cache
    _initList = {},
    _disposeList = {},
    _loggers = {}; // loggers dictionary

// Modules property to store init status.
const cInitError = '$initError';

/**
 * Internal logger.
 * @private
 */
function getLogger() {
    if (!_logger) {
        let m_logger = require('../util/logger');
        _logger = new m_logger();
    }
    return _logger;
}

/**
 * Internal configuration.
 * @private
 */
function getConfig() {
    if (!_cfg)
        _cfg = config('index');
    return _cfg;
}

/**
 * Return full path for a file, within a filesystem overlay between 
 * application (precedence) and framework files.
 * @static
 * @param {string} file - Relative pathname.
 */
function path(file) {
    if (file in _path)
        return _path[file];

    // app path precedence
    let appFile = _root + file;
    if (fs.existsSync(appFile)) {
        _path[file] = appFile;
    } else {
        appFile += '.js';
        if (fs.existsSync(appFile)) {
            _path[file] = appFile;
        } else {
            let libFile = _root + 'node_modules/mbot/' + file;
            if (fs.existsSync(libFile)) {
                _path[file] = libFile;
            } else {
                libFile += '.js';
                if (fs.existsSync(libFile))
                    _path[file] = libFile;
                else
                    _path[file] = null;
            }
        }
    }
    if (_path[file])
        _path[file] = path_.normalize(_path[file]);
    return _path[file];
}

function configName(name) {
    let filename = `config/${name}.${_env}.json`;
    let fullpath = path(filename);
    if (!fullpath) {
        filename = `config/${name}.${_env_alt}.json`;
    }
    return filename;
}

/**
 * Return full path for a config file, based on environment.
 * @static
 * @param {string} name - Full name (e.g. 'dir/name')
 */
function configPath(name) {
    return path(configName(name));
}

function loadSubFiles(dir, result, deep) {
    let fulldir = path(dir);
    fs.readdirSync(fulldir)
        .forEach(entry => {
            let key = dir + '/' + entry;
            if (fs.statSync(path_.join(fulldir, entry)).isFile())
                result[key] = load(key);
            else
                if (deep)
                    loadSubFiles(key, result, deep);
        });
}

function loadPath(name, cfg, result) {
    result = result || {};

    if (!cfg) // first?
        cfg = getConfig().loader[name];

    if (_.isString(cfg))
        if (cfg === '.')
            loadSubFiles(name, result, false);
        else
            if (cfg === '*')
                loadSubFiles(name, result, true);
            else {
                let fullname = name + '/' + cfg;
                result[fullname] = load(fullname);
            }

    if (_.isArray(cfg))
        cfg.forEach(e => {
            let fullname = name + '/' + e;
            result[fullname] = load(fullname);
        });

    if (_.isObject(cfg))
        for (let dir in cfg) {
            let subname = name + '/' + dir;
            loadPath(subname, cfg[dir], result);
        }
    
    return result;
}

/**
 * Load module(s). Encapsulate 'require', use filesystem overlay
 * and save init/dispose callback. Usage:<br>
 * (a) file name (optional init config): return one module object;<br>
 * (b) directory name (e.g. 'bot_modules'): use 'loader' subkey information 
 * in config/index.{env}.json, and return a modules dictionary.
 * Wildcard "*" include subdirectories, while "." load only current directory.
 * @static
 * @param {string} file - Relative pathname.
 * @param {Object} [cfg] - Optional Configuration
 */
function load(file, cfg) {
    // verify cache
    if (file in _mod)
        return _mod[file];

    // check exists
    let pathFile = path(file);
    if (pathFile == null) {
        let e = new Error(`[${file}] not found`);
        getLogger().error(e);
        throw e;
    }

    // is directory?
    let stat = fs.statSync(pathFile);
    if (stat.isDirectory()) {
        // load all
        let plugs = loadPath(file);

        // cache and verify init / dispose
        for (let p in plugs) {
            _mod[p] = plugs[p];
            saveCallbacks(p, plugs[p]);
        }
        getLogger().info(`...directory loaded [${file}]`);
        return plugs;
    }

    // load
    let module = require(pathFile);
    
    // cache and verify init / dispose
    _mod[file] = module;
    saveCallbacks(file, module, cfg);
    getLogger().info(`loaded [${file}]`);
    return module;
}

function saveCallbacks(file, module, cfg) {
    // save init callback
    if (module.init instanceof Function) {
        _initList[file] = module;
        module.config = cfg || module.config;
    }

    // save dispose callback
    if (module.dispose instanceof Function) {
        _disposeList[file] = module;
    }
}

/**
 * Load a config file, considering environment variables.
 * @static
 * @param {string} name - Relative pathname.
 */
function config(name) {
    name = name || 'core/brain';
    let fileName = configName(name);
    let cfg = load(fileName);
    _.replaceEnv(cfg);
    return cfg;
}

/**
 * Initialize one or more modules. If [mods] is empty, 
 * execute bootstrap (first time) or init previous loaded modules.
 * @static
 * @param {string|Object} [mods] - Module name or dictionary name list. 
 * @param {Object=} mods.config - Optional init configuration. 
 * @param {function(Object)} cb - Callback with initialized modules dictionary.
 * @param {string} cb.$initError - Undefined or error information.
 * @example
 * mbot.init({
 *      'util/db': { config: {...} }
 * })
 */
function init(mods, cb) {
    // input overloads
    if (!mods) {
        if (Object.keys(_initList).length == 0) {
            getLogger().info(`MBOT starting on '${_env}'/'${_env_alt}' at ${new Date().toISOString()}, pid ${process.pid}`);
            mods = { 'lib/core/brain': {} }; // bootstrap
        }
    } else {
        if (_.isString(mods))
            mods = { mods };
    }

    // load new (mods may be empty)
    for (let name in mods)
        mods[name] = load(name, mods[name].config); // fill _initList

    // identify modules to init (caller or global)
    let initList = {};
    if (mods != null) { // caller
        for (let name in mods)
            if (!_initList[name].hasOwnProperty(cInitError)) // avoid double init
                initList[name] = mods[name]; // may have config
    } else { // global
        for (let name in _initList)
            if (!_initList[name].hasOwnProperty(cInitError)) // avoid double init
                initList[name] = _initList[name]; // may have config
    }

    // any init?
    let initLength = Object.keys(initList).length;
    if (initLength == 0) return cb();

    // async init
    let initiated = 0;
    for (let name in initList) {
        let mod = initList[name];
        let cfg = mod.config; // precedence (if exists)
        if (!cfg)
            if (_initList[name].hasOwnProperty('config'))
                cfg = _initList[name].config; // global fallback

        // has config?
        if (cfg) {
            if (_.isString(cfg))
                cfg = config(cfg);

            mod[cInitError] = null; // avoid double init
            mod.init(cfg, (er) => {
                _initList[name][cInitError] = er;

                if (er)
                    getLogger().error(`init fail [${name}]: [${er}]`);
                else
                    getLogger().info(`init ok [${name}]`);

                if (++initiated === initLength)
                    if (cb instanceof Function) cb(initList);
            });
        } else { // without config
            mod[cInitError] = null; // avoid double init
            mod.init((er) => {
                _initList[name][cInitError] = er;

                if (er)
                    getLogger().error(`init fail [${name}]: [${er}]`);
                else
                    getLogger().info(`init ok [${name}]`);

                if (++initiated === initLength)
                    if (cb instanceof Function) cb(initList);
            });
        }
    }
}

/**
 * Dispose all initiated modules, that have a dispose function.
 * @static
 * @param {function} cb - Callback
 */
function dispose(cb) {
    let disposeLength = Object.keys(_disposeList).length;
    if (disposeLength == 0) return cb();

    let disposed = 0;
    for (let name in _disposeList)
        if (!_disposeList[name].hasOwnProperty(cInitError)) {
            // not initiated
            if (++disposed === disposeLength)
                cb();
        } else {
            _disposeList[name].dispose((er) => {
                if (er)
                    getLogger().error(`dispose fail [${name}]: [${er}]`);
                else
                    getLogger().info(`dispose ok [${name}]`);

                if (++disposed === disposeLength)
                    cb();
            });
        }
}

/**
 * Use/Create a shared logger, with automatic dispose.<br>
 * If file 'config/name.{env}.json' exists, use 'logger' configuration key.
 * @static
 * @param {string=} [name] - Logger name (default: 'index')
 * @example
 * var log = mbot.logger('dir/name');
 */
function logger(name) {
    name = name || 'index';
    if (name === 'index') return getLogger();

    if (!_loggers[name]) {
        if (!util_logger)
            util_logger = load('util/logger');

        _loggers[name] = new util_logger(name);

        // if not dummy
        if (_loggers[name].config) {
            _loggers[name][cInitError] = undefined;
            saveCallbacks('logger#' + name, _loggers[name]); // dispose cb
        }
    }

    return _loggers[name];
}
