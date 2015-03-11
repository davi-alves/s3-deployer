var
  fs = require('fs'),
  Q = require('q'),
  scan;

scan = Q.denodeify(function (dir, done) {
  var results = [];
  fs.readdir(dir, function (err, list) {
    if (err) {
      return done(err);
    }

    var pending = list.length;
    if (!pending) {
      return done(null, results);
    }

    list.forEach(function (file) {
      file = dir + '/' + file;
      fs.stat(file, function (err, stat) {
        if (stat && stat.isDirectory()) {
          scan(file, function (err, res) {
            results = results.concat(res);
            if (!--pending) {
              done(null, results);
            }
          });
        } else {
          results.push(file);
          if (!--pending) {
            done(null, results);
          }
        }
      });
    });
  });
});

module.exports = scan;
