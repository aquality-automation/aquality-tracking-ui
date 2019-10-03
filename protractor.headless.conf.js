// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/lib/config.ts

const { SpecReporter } = require('jasmine-spec-reporter');

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
    jasmine.getEnv().addReporter(new SpecReporter({ spec: { displayStacktrace: true } }));
    const AllureReporter = require('jasmine-allure-reporter');
    jasmine.getEnv().addReporter(new AllureReporter());
    const AqualityReporter = require('@aquality-automation/aquality-tracking-reporter-jasmine');
    console.log(`Token => ${process.env.AT_TOKEN}`)
    console.log(`Test run => ${process.env.AT_TESTRUNID}`)
    jasmine.getEnv().addReporter(new AqualityReporter({
            token: process.env.AT_TOKEN,
            api_url: 'http://46.243.183.199:8888/api',
            project_id: 1,
            testrun_id: process.env.AT_TESTRUNID
        }));
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
