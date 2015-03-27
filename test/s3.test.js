var expect = require('chai').expect,
  sinon = require('sinon'),
  proxyquire = require('proxyquire'),
  Q = require('q'),
  AWS = require('aws-sdk'),
  S3 = AWS.S3,
  configStub = {
    "key": "AKIAIMF7JRRTZWIHEN2A",
    "secret": "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",
    "bucket": "s3-deployer",
    "endpoint": "s3-sa-east-1.amazonaws.com",
    "apiVersion": "2006-03-01",
    "ACL": "public-read",
    "distFolder": "./dist",
    "cleanBucket": true,
  };

var s3Lib = proxyquire('../aws/s3', {
  '../deploy.config.js': configStub
});

describe('S3 Lib', function () {
  describe("#getBucket", function () {
    it('#getBucket should return an instanceof AWS.S3', function () {
      expect(s3Lib.getBucket()).to.be.an.instanceof(S3);
    });
  });

  describe("#list", function () {
    var bucket;

    beforeEach(function () {
      bucket = s3Lib.getBucket();
      sinon.stub(bucket, 'listObjects', function (obj, callback) {
        callback(null, {
          Contents: [{
            Key: 'file.txt'
          }]
        });
      });
    });

    afterEach(function () {
      bucket.listObjects.restore();
    });

    it("should call #S3.listObjects once", function (done) {
      s3Lib.list().fin(function () {
        expect(bucket.listObjects.calledOnce).to.be.true;
        done();
      });
    });
  });

  describe("#clean", function () {
    var bucket,
      s3LibStub = proxyquire('../aws/s3', {
        '../deploy.config.js': {
          'cleanBucket': true
        }
      });

    beforeEach(function () {
      s3LibStub._cleanBucket = true;
      sinon.stub(s3LibStub, 'list', function () {
        return Q.promise(function (resolve, reject) {
          resolve([{
            Key: 'file.txt'
          }]);
        });
      });

      bucket = s3LibStub.getBucket();
      sinon.stub(bucket, 'deleteObjects', function (param, callback) {
        callback(null);
      });
    });

    afterEach(function () {
      s3LibStub.list.restore();
      bucket.deleteObjects.restore();
    });

    it("should not clean the bucket if +cleanBucket configuration is false", function (done) {
      s3LibStub._cleanBucket = false;
      s3LibStub.clean().then(function (message) {
        expect(message).to.be.equal('Skiping bucket clean by configuration.');
        done();
      });
    });

    it("should call #list once", function (done) {
      s3LibStub.clean().fin(function () {
        expect(s3LibStub.list.calledOnce).to.be.true;
        done();
      });
    });

    it("should handle #list errors", function (done) {
      s3LibStub.list.restore();
      sinon.stub(s3LibStub, 'list', function () {
        return Q.promise(function (resolve, reject) {
          reject('Error');
        });
      });
      s3LibStub.clean().fail(function (message) {
        expect(message).to.be.equal('Error');
        done();
      });
    });

    it("should validate empty an empty bucket", function (done) {
      s3LibStub.list.restore();
      sinon.stub(s3LibStub, 'list', function () {
        return Q.promise(function (resolve, reject) {
          resolve([]);
        });
      });
      s3LibStub.clean().then(function (message) {
        expect(message).to.be.equal('Bucket was empty');
        done();
      });
    });

    it("should call #S3.deleteObjects once", function (done) {
      s3LibStub.clean().fin(function () {
        expect(bucket.deleteObjects.calledOnce).to.be.true;
        done();
      });
    });

    it("should clean the bucket", function (done) {
      s3LibStub.clean().then(function (message) {
        expect(message).to.be.equal('Bucket clean');
        done();
      });
    });

  });
});
