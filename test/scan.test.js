var
  path = require('path'),
  expect = require('chai').expect,
  scan = require('../helpers/scan.js'),
  currentPath = __dirname,
  scanPath = currentPath + '/scan-stub',
  filesStub = [scanPath + '/a.txt', scanPath + '/b.txt'];

describe('Scan Helper', function () {
  it('should scan a folder and return an array of files', function (done) {
    scan(scanPath).then(function (value) {
      expect(value).to.have.members(filesStub);
      done();
    }).done(null, done);
  });
});
