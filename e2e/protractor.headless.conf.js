// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/lib/config.ts

const { SpecReporter } = require('jasmine-spec-reporter');

exports.config = {
  specs: [
    './src/**/*.spec.ts'
  ],
  capabilities: {
    browserName: 'chrome',
    chromeOptions: {
      args: [
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--headless',
        '--disable-gpu',
        '--window-size=1920,1080',
        '--disable-web-security'
      ],
    },
  },
  directConnect: true,
  baseUrl: 'http://localhost:4200/',
  framework: 'jasmine',
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 30000,
    allScriptsTimeout: 40000,
    print: function () { }
  },
  onPrepare() {
    require('ts-node').register({
      project: 'e2e/tsconfig.json'
    });
    jasmine.getEnv().addReporter(new SpecReporter({ spec: { displayStacktrace: true } }));
    const AllureReporter = require('jasmine-allure-reporter');
    jasmine.getEnv().addReporter(new AllureReporter());
    jasmine.getEnv().afterEach(function (done) {
      const promises = [];
      promises.push(
        browser.takeScreenshot().then(function (png) {
          return allure.createAttachment('Screenshot', function () {
            return Buffer.from(png, 'base64');
          }, 'image/png')();
        })
      );
      promises.push(
        browser.manage().logs().get('browser').then(function (browserLog) {
          return allure.createAttachment('log', function () {
            return require('util').inspect(browserLog);
          }, 'text/plain')();
        })
      );
    
      Promise.all(promises).then(() => {
        done();
      }).catch(err => {
        console.error('Error creating attachments:', err);
        done();
      });
    });
  }
};
