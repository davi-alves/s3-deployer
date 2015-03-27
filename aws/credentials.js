var
  AWS = require('aws-sdk'),
  config = require('../deploy.config.js'),
  _instance,
  Credentials;

module.exports = Credentials();

function Credentials() {
  if (undefined === _instance) {
    _instance = new AWS.Credentials(config.key, config.secret);
  }

  return _instance;
}
