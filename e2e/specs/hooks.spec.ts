import { browser } from 'protractor';
import { environment } from '../../src/environments/environment';
import { waiter } from '../utils/wait.util';
import { logIn } from '../pages/login.po';
import { projectList } from '../pages/project/list.po';
import { userAdministration } from '../pages/administration/users.po';
import path from 'path';
import chai from 'chai';
import chaiHttp = require('chai-http');
import usersTestData from '../data/users.json';

chai.use(chaiHttp);
const downloadsPath = path.resolve(__dirname, '..', './data/downloads/');

beforeAll(async () => {
    const isBackendAvailable = waiter.forTrue(async () => {
        const result = await chai.request(environment.host).get('/settings');
        return result.status === 200;
    }, 5, 1000);
    await browser.manage().window().maximize();
    if (!isBackendAvailable) {
        throw new Error(`Backend is unavailable ${environment.host}`);
    }
    await logIn.navigateTo();
    await logIn.logInAs(usersTestData.admin.user_name, usersTestData.admin.password);
    await projectList.menuBar.administration();
    await userAdministration.create(usersTestData.autoAdmin);
    await userAdministration.create(usersTestData.localAdmin);
    await userAdministration.create(usersTestData.auditAdmin);
    await userAdministration.create(usersTestData.assignedAuditor);
    await userAdministration.create(usersTestData.localManager);
    await userAdministration.create(usersTestData.localEngineer);
    await userAdministration.create(usersTestData.manager);
    await userAdministration.create(usersTestData.projectTemp);
    await userAdministration.create(usersTestData.viewer);
    await userAdministration.create(usersTestData.unitCoordinator);
    await userAdministration.menuBar.clickLogOut();
});

beforeEach(async () => {
    browser.driver.sendChromiumCommand('Page.setDownloadBehavior', {
        behavior: 'allow',
        downloadPath: downloadsPath
    });
});

afterAll(async () => {
    await logIn.logInAs(usersTestData.admin.user_name, usersTestData.admin.password);
    await projectList.menuBar.administration();
    await userAdministration.remove(usersTestData.localAdmin.user_name);
    await userAdministration.remove(usersTestData.autoAdmin.user_name);
    await userAdministration.remove(usersTestData.localManager.user_name);
    await userAdministration.remove(usersTestData.localEngineer.user_name);
    await userAdministration.remove(usersTestData.manager.user_name);
    await userAdministration.remove(usersTestData.projectTemp.user_name);
    await userAdministration.remove(usersTestData.viewer.user_name);
    await userAdministration.remove(usersTestData.unitCoordinator.user_name);
    await userAdministration.menuBar.clickLogOut();
});
