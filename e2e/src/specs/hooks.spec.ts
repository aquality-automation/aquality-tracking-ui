import { browser } from 'protractor';
import { environment } from '../../../src/environments/environment';
import { waiter } from '../utils/wait.util';
import { logIn } from '../pages/login.po';
import path from 'path';
import chai from 'chai';
import chaiHttp = require('chai-http');
import { logger } from '../utils/log.util';

chai.use(chaiHttp);
const downloadsPath = path.resolve(__dirname, '..', './data/downloads/');

beforeAll(async () => {
  const isBackendAvailable = await waiter.forTrue(
    async () => {
      try {
        const result = await chai.request(environment.host).get('/settings');
        return result.status === 200;
      } catch (error) {
        logger.warn(`Error checking backend availability: ${error}`);
        return false;
      }
    },
    5,
    1000
  );

  await browser.manage().window().maximize();
  if (!isBackendAvailable) {
    /**
     * Currently, tests will still execute despite this error being thrown.
     * However, after upgrading to Jasmine >= 4.0, this error will cause all tests to skip
     * since Jasmine 4.0 supports aborting execution if `beforeAll` fails.
     * Note: Jasmine 4.0 requires Node 12, but the current Angular version requires Node 10.
     * Therefore, Jasmine will be updated along with Angular in a future upgrade.
     * See: https://github.com/jasmine/jasmine/issues/1533
     */
    throw new Error(`Backend is unavailable ${environment.host}`);
  }
  await logIn.navigateTo();
});

beforeEach(async () => {
  browser.driver.sendChromiumCommand('Page.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: downloadsPath
  });
});
