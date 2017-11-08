// Export the same configuration object for use throughout modules
var config = {
  'static': 'client/dest/',
  'rootFile' : '/index.html',
  'port' : 9090,
  'db' : {
    'host':     'localhost',
    'user':     'tshikaji',
    'password': 'hiscongotshikaji',
    'database': 'tshikaji',
  },
  'session' : {
    'secret' : 'xopen blowfish',
    'resave' : false,
    'saveUninitialized' : false,
    'reapInterval' : -1 // disables session reaping
  },
  'uploadFolder' : 'client/upload/',

  /* Configuration for plugins
   * Each plugin REQUIRES two properties:
   * name      - Stored as the name of the plugin. Write in camelCase.
   * script    - The script relative to the plugins directory
   *e.g : {'name' : 'mail', 'script' : '/../../plugins/mail/index.js'}
  */
  'plugins' : [
    // {'name' : 'mail', 'script' : '/../../plugins/mail/index.js'}
  ],
  'tls' : {
    'key' : 'server/config/keys/server.key',
    'cert' : 'server/config/keys/server.crt'
  }
};

module.exports = config;
