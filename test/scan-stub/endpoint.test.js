var expect = require('chai').expect,
  proxyquire = require('proxyquire'),
  Endpoint = require('AWS').Endpoint,
  endpointStub = "s3-sa-east-1.amazonaws.com";

var endpoint = proxyquire('../aws/endpoint', {
  '../config.json': {
    "endpoint": endpointStub
  }
});

describe('Endpoint Lib', function () {
  it('should return an instanceof Endpoint', function () {
    expect(endpoint).to.be.an.instanceof(Endpoint);
  });

  it('should have the right endpoint', function () {
    expect(endpoint._endpoint).to.equal(endpointStub);
  });
});
