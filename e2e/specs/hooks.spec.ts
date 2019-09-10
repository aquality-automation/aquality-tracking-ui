import { browser } from 'protractor';
import chai from 'chai';
import { environment } from '../../src/environments/environment';
import chaiHttp = require('chai-http');
import { waiter } from '../utils/wait.util';
import path from 'path';

chai.use(chaiHttp);
const downloadsPath = path.resolve(__dirname, '..', './data/downloads/');

beforeAll(async () => {
    const isBackendAvailable = waiter.forTrue(async () => {
        const result = await chai.request(environment.host).get('/authInfo');
        return result.status === 200;
    }, 5, 1000);
    await browser.manage().window().maximize();
    if (!isBackendAvailable) {
        throw new Error(`Backend is unavailable ${environment.host}`);
    }
});

beforeEach(async () => {
    browser.driver.sendChromiumCommand('Page.setDownloadBehavior', {
        behavior: 'allow',
        downloadPath: downloadsPath
      });
});
