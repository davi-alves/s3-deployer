var
  path = require('path'),
  chalk = require('chalk'),
  S3 = require('./aws/s3')(),
  scan = require('./helpers/scan'),
  distFolder = __dirname + '/' + require('./config.json').distFolder;

distFolder = distFolder.replace(new RegExp('\\' + path.sep, 'g'), '/'); // UNIX style path
print = console.log;

// starting
print();
print(chalk.underline.bgGreen('Starting deploy'));
print();

// scan
print(chalk.green('  > ') + chalk.gray('Scaning [ ' + chalk.white(distFolder) + ' ] folder'));
scan(distFolder)
  .then(function (files) {

    // scan completed, starting upload
    print(chalk.green('    + ') + chalk.cyan('Scan completed with ' + chalk.white(files.length) + ' files found.'));
    print(chalk.green('  > ') + chalk.gray('Starting upload process'));

    S3.upload(files); // upload files
  }, function (err) {
    // scan fail
    print(chalk.bold.red('    - ' + err.message));
  })
  .catch(function (err) {
    // promises erros
    print(chalk.bold.red('    - ' + err.message));
  });

// events
S3
  .on(S3.CLEAN, function (message) {
    // bucket clean
    print(chalk.green('    + ') + chalk.cyan(message));
    print();
  })
  .on(S3.FILE, function (file) {
    // file uploaded
    print(chalk.green('    + ') + chalk.cyan('File [ ' + chalk.white(file) + ' ] uploaded'));
  })
  .on(S3.COMPLETED, function (message) {
    // upload completed
    print();
    print(chalk.green('    + ') + chalk.cyan(message));
    print();
    print(chalk.underline.bgGreen('Deploy completed'));
    print();
  })
  .on(S3.ERROR, function (err) {
    // error on upload process
    print(chalk.bold.red('    - ' + err.message));
  });
