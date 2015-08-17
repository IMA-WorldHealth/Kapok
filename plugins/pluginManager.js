/**
 * PluginManager.js
 *
 * A bare bones plugin manager.  It is meant to look very much like the linux
 * process management.  It creates hooks for the startup of plugins, restarts,
 * and halts.
 *
*/

var path =  require('path'),
    thread = require('child_process');


var MAX_RESTARTS = 3;

/*
 * An instance of a plugin.
 * @constructor
 * @param {string} script - the script to execute a node process on.
 *
*/
function Plugin(script) {

  // the location of the program
  this.script = script;

  // number of attempted restarts
  this.restarts = 0;

  // the number of times to attempt a restart
  // in case of unknown termination signal.
  this.maxRestarts = MAX_RESTARTS;

  // perform the initial startup
  this.startup();
}


/** performs the initial fork, and sets up handlers */
Plugin.prototype.startup = function () {

  // fork the process and assign it to this.process
  this.process = thread.fork(__dirname + this.script);

  // set up the exit handler
  this.process.on('exit', this.exitHandler);

  // the child fork is running
  this.running = true;
};


/** exit handler for the underlying process */
Plugin.prototype.exitHandler = function (code, signal) {

  // 0 is the successful exit code
  // SIGTERM is emitted on process.kill()
  if (code !== 0 && signal !== 'SIGTERM') {

    // if we have received more than the maxRestarts, something may be amiss
    // and we should quit trying to restart
    if (this.restarts < this.maxRestarts) {
      this.startup();
      this.restarts++;
    }
  }
};


/** nice event emitter for the underlying process */
Plugin.prototype.emit = function (event, data) {
  this.process.send({ event : event, data : data });
};


/** wraps process.kill() */
Plugin.prototype.kill = function (code) {
  this.process.kill(code);
};


/** wraps process.on() */
Plugin.prototype.register = function (event, callback) {
  this.process.on(event, callback);
};


/**
 * A class to manage all plugins.
 * @constructor
 * @param {Array} cfgArray - configuration array with plugins names and scripts
 */
function PluginManager(cfgArray) {
  'use strict';

  var plugins = this.plugins = {};

  function echo() {
    var args = Array.prototype.slice.call(arguments);
    console.log('[PluginManager]', args.join(' '));
  }

  // PluginManager Methods

  function _onStartup() {
    echo('Starting PluginManager...');

    // TODO Should we have a 'priority' tag to determine which plugins are
    // initialized first?  This would require sorting the array by priority
    // prior to loading it

    // load and map the plugins to their namespaces
    cfgArray.forEach(function (plugin) {
      echo('Loading ' + plugin.name);
      plugins[plugin.name] = new Plugin(plugin.script);
    });
  }

  // kills all subprocesses in the case that the parent process dies.
  this.killChildren = function (e) {
    echo('Killing all subprocesses ...');

    // look through the 
    Object.keys(plugins).forEach(function (key) {
      echo('Killing', key);
      plugins[key].kill('SIGTERM');
    });

    echo('Done. Exiting...');
    // exit the main thread
    process.exit(e);
  };

  // parses events and routes them to the correct plugin
  this.routeEvent = function (event, data) {
    try {
      // parse the plugin name from the event
      var params = event.split('::'),
          pluginId = params[0],
          eventId = params[1];

      // error if the plugin is not defined for the manager
      if (!this.plugins[pluginId]) {
        throw new Error('Error: Plugin not found %s'.replace('%s', pluginId));
      }

      // send the event to the plugin
      this.plugins[pluginId].emit(eventId);
    } catch (e) {
  
      // ensure that the event failure is broadcast
      throw new Error('Error: Event %s not properly constructed'.replace('%s', event));
    }
  };

  _onStartup();
}


/* expose routes to the greater bhima server */
module.exports = function (app, pluginConfig) {
  'use strict';

  var pm = new PluginManager(pluginConfig);

  // configure plugin routes

  // :action is actually {pluginId}::{eventId}}
  // Example : /plugin/events/mail::restart
  app.post('/plugin/events/:action', function (req, res, next) {

    // make sure the plugin exists
    try {
      pm.routeEvent(req.params.action, req.body.data);
    } catch (err) {
      return res.status(500).json(err);
    }

    res.status(200).send();
  });

  // clean up children one exception, error, exit
  process.on('uncaughtException', pm.killChildren);
  process.on('SIGINT', pm.killChildren);
  process.on('SIGTERM', pm.killChildren);
};
