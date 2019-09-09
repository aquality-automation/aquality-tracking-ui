// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/lib/config.ts

const { SpecReporter } = require('jasmine-spec-reporter');
const path = require('path');
const downloadsPath = path.resolve(__dirname, './e2e/data/downloads/');

exports.config = {
  specs: [
    './e2e/**/*.spec.ts'
  ],
  capabilities: {
    browserName: 'chrome',
    chromeOptions: {
      args: [
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--headless',
        '--disable-gpu',
        '--window-size=1366,768',
        '--disable-web-security'
      ],
      prefs: {
        'download': {
          'prompt_for_download': false,
          'default_directory': downloadsPath,
        }
      }
    },
  },
  directConnect: true,
  baseUrl: 'http://localhost:8080/',
  framework: 'jasmine',
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 100000,
    allScriptsTimeout: 60000,
    print: function () { }
  },
  onPrepare() {
    require('ts-node').register({
      project: 'e2e/tsconfig.e2e.json'
    });
    browser.driver.sendChromiumCommand('Page.setDownloadBehavior', {
      behavior: 'allow',
      downloadPath: downloadsPath
    });
    console.log(`Download Folder: ${downloadsPath}`)
    jasmine.getEnv().addReporter(new SpecReporter({ spec: { displayStacktrace: true } }));
    var AllureReporter = require('jasmine-allure-reporter');
    jasmine.getEnv().addReporter(new AllureReporter());
    jasmine.getEnv().afterEach(function (done) {
      browser.takeScreenshot().then(function (png) {
        allure.createAttachment('Screenshot', function () {
          return new Buffer(png, 'base64')
        }, 'image/png')();
        done();
      })
    });
  }
};
