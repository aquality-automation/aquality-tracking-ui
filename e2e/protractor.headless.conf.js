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
    defaultTimeoutInterval: 30000,
    allScriptsTimeout: 30000,
    print: function () { }
  },
  onPrepare() {
    require('ts-node').register({
      project: 'e2e/tsconfig.json'
    });
    jasmine.getEnv().addReporter(new SpecReporter({ spec: { displayStacktrace: true } }));
    const AllureReporter = require('jasmine-allure-reporter');
    jasmine.getEnv().addReporter(new AllureReporter());
    const AqualityReporter = require('@aquality-automation/aquality-tracking-reporter-jasmine');
    console.log(`Running tests for ${process.env.AT_TESTRUNID} aquality testrun!`);
    jasmine.getEnv().addReporter(new AqualityReporter({
            token: process.env.AT_TOKEN,
            api_url: 'http://46.243.183.199:8888/api',
            project_id: 1,
            suite: 'All',
            testrun: {
              build_name: `build_${process.env.AT_CIRCLE_BULD_NUM}_${process.env.AT_CIRCLE_BRANCH}`,
              ci_build: process.env.AT_CIRCLE_BUILD_URL,
              execution_environment: 'Docker_Chrome'
            }
        }));
    jasmine.getEnv().afterEach(function (done) {
      browser.takeScreenshot().then(function (png) {
        allure.createAttachment('Screenshot', function () {
          return new Buffer(png, 'base64')
        }, 'image/png')();
        done();
      })

      browser.manage().logs().get('browser').then(function(browserLog) {
        allure.createAttachment('log', function () {
          return require('util').inspect(browserLog)
        }, 'text/plain')();
        done();
      });
    });
  }
};
