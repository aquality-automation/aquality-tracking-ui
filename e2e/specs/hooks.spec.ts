import { browser } from 'protractor';
import { environment } from '../../src/environments/environment';
import { waiter } from '../utils/wait.util';
import { logIn } from '../pages/login.po';
import path from 'path';
import chai from 'chai';
import chaiHttp = require('chai-http');

chai.use(chaiHttp);
const downloadsPath = path.resolve(__dirname, '..', './data/downloads/');

beforeAll(async () => {
  const isBackendAvailable = waiter.forTrue(
    async () => {
      const result = await chai.request(environment.host).get('/settings');
      return result.status === 200;
    }, 5, 1000);
  await browser.manage().window().maximize();
  if (!isBackendAvailable) {
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
