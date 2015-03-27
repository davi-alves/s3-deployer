var
  fs = require('fs'),
  mime = require('mime'),
  AWS = require('aws-sdk'),
  EventEmitter = require('events').EventEmitter,
  Q = require('q'),
  util = require('util'),
  Credentials = require('./credentials'),
  Endpoint = require('./endpoint'),
  config = require('../deploy.config.js'),
  S3Lib, _instance;

/**
 * Instantiate S3 class
 */
function S3Lib() {
  if (undefined === _instance) {
    _instance = new S3();
  }

  return _instance;
}

/**
 * S3 interface to AWS.S3 functions
 */
function S3() {
  EventEmitter.call(this);

  this.COMPLETED = 'upload-completed';
  this.FILE = 'upload-file';
  this.ERROR = 'upload-error';
  this.CLEAN = 'upload-clean';
  this._cleanBucket = config.cleanBucket;
}

// inherit events.EventEmitter
util.inherits(S3, EventEmitter);

/**
 * Get AWS.S3 object
 * @return {Object} AWS.S3
 */
S3.prototype.getBucket = function () {
  if (!this.Bucket) {
    this.Bucket = new AWS.S3({
      credentials: Credentials,
      apiVersion: config.apiVersion,
      endpoint: Endpoint,
      params: {
        Bucket: config.bucket
      }
    });
  }

  return this.Bucket;
};

/**
 * List objects in the bucket
 * @return {Object} returns a Q.promise with an array of Objects ([{Key:'x'}, {Key: 'y'}]) on sucess
 */
S3.prototype.list = function () {
  var deferred = Q.defer();

  this.getBucket()
    .listObjects({
      Bucket: config.bucket
    }, function (err, data) {
      if (err) {
        deferred.reject(err);
      } else if (!data instanceof Object || !data.Contents) {
        deferred.reject(new Error('Invalid bucket information recived'));
      } else {
        var keys = [];
        data.Contents.forEach(function (item) {
          keys.push({
            Key: item.Key
          });
        });

        deferred.resolve(keys);
      }
    });

  return deferred.promise;
};

/**
 * Clean the bucket
 * @return {Object} returns a Q.promise with a string as success
 */
S3.prototype.clean = function () {
  var _this = this;
  var deferred = Q.defer();

  if (!this._cleanBucket) {
    return Q.promise(function (resolve, reject) {
      resolve('Skiping bucket clean by configuration.');
    });
  }

  this.list()
    .then(function (keys) {
      if (!keys.length) {
        deferred.resolve('Bucket was empty');
      } else {
        var params = {
          Delete: {
            Objects: keys
          }
        };

        _this.getBucket()
          .deleteObjects(params, function (err) {
            if (err) {
              deferred.reject(err);
            } else {
              deferred.resolve("Bucket clean");
            }
          });
      }
    }, function (err) {
      deferred.reject(err);
    });

  return deferred.promise;
};

/**
 * Upload an array of files to the bucket
 * @param  {array}     files array of files
 * @return {void|null} this fuctions use events to notify what is happening
 */
S3.prototype.upload = function (files) {
  var _this = this;
  if (!files instanceof Array) {
    files = [files];
  }

  var length = files.length;
  if (!length || !files[0]) {
    this.emit(this.COMPLETED, 'No files found');
    return;
  }

  var buffer, mimeType, params;

  this.clean()
    .then(function (message) {
      _this.emit(_this.CLEAN, message);

      // loop through files
      files.forEach(function (file) {
        // file does not exists
        if (!fs.existsSync(file)) {
          _this.emmit(_this.ERROR, 'File [' + file + '] does not exists');
          return;
        }

        var key = file.split(config.distFolder + '/')[1];
        // upload config
        params = {
          Key: key,
          ContentType: mime.lookup(file),
          Body: fs.readFileSync(file),
          ACL: config.ACL
        };

        _this.getBucket()
          .putObject(params, function (err) {
            if (err) {
              _this.emit(_this.ERROR, err.message);
            }

            _this.emit(_this.FILE, key);
            if (--length === 0) {
              _this.emit(_this.COMPLETED, 'All files uploaded');
            }
          });
      });
    }, function (err) {
      _this.emit('upload-error', err.message);
    });
};

// module.exportes goes at end due javascript processing way
module.exports = S3Lib();
