var expect = require('chai').expect,
  proxyquire = require('proxyquire'),
  Credentials = require('aws-sdk').Credentials,
  credentialsStub = {
    key: "abc",
    secret: "shhhh",
  };

var credentials = proxyquire('../aws/credentials', {
  '../config.json': credentialsStub
});

describe('Credentials Lib', function () {
  it('should return an instanceof Credentials', function () {
    expect(credentials).to.be.an.instanceof(Credentials);
  });

  it('should have the right credentials', function () {
    expect(credentials.accessKeyId).to.equal(credentialsStub.key);
  });
});
