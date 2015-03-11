var expect = require('chai').expect,
  scan = require('../helpers/scan.js'),
  filesStub = ['./scan-stub/a.log', './scan-stub/b.txt'];

describe('Scan Helper', function () {
  it('should scan a folder and return an array of files', function () {
    scan('./scan-stub').then(function (files) {
      expect(files).to.equal(filesStub);
    });
  });
});
