import { browser } from 'protractor';
import chai from 'chai';
import { environment } from '../../src/environments/environment';
import chaiHttp = require('chai-http');
import { logger } from '../utils/log.util';
chai.use(chaiHttp);

beforeAll(async () => {
    const result = await chai.request(environment.host).get('/authInfo');
    await browser.manage().window().maximize();
    if (result.status !== 200) {
        logger.error(`Backend is unavailable ${environment.host}`);
    }
});
