import { logIn } from '../../pages/login.po';
import { projectView } from '../../pages/project/view.po';
import { suiteCreate } from '../../pages/suite/create.po';
import { suiteList } from '../../pages/suite/list.po';
import { suiteView } from '../../pages/suite/view.po';
import { TestSuite } from '../../../src/app/shared/models/testSuite';
import { ProjectHelper } from '../../helpers/project.helper';
import users from '../../data/users.json';
import suites from '../../data/suites.json';

describe('Full Admin Test Suite', () => {
  const projectHelper: ProjectHelper = new ProjectHelper();
  const suite: TestSuite = suites.suiteCreation;

  beforeAll(async () => {
    await projectHelper.init({
      manager: users.manager
    });
    await logIn.logInAs(users.manager.user_name, users.manager.password);
    await projectHelper.openProject();
  });

  afterAll(async () => {
    await projectHelper.dispose();
  });

  it('Create button is disabled when Name is not filled', async () => {
    await (await projectView.menuBar.create()).suite();
    return expect(suiteCreate.isCreateEnabled()).toBe(false, 'Create button should be disabled');
  });

  it('Suites List page should be opend after Suite creation', async () => {
    await suiteCreate.createSuite(suite);
    return expect(suiteList.isOpened()).toBe(true, 'Suites List should be opened');
  });

  it('New Suite should be in list', () => {
    return expect(suiteList.isTestSuitePresent(suite.name)).toBe(true);
  });

  it('Suite name should be inherited from create page', async () => {
    await suiteList.clickTestSuite(suite.name);
    return expect(suiteView.getNameOfTestSuite()).toEqual(suite.name);
  });

  it('Suite manual duration should be 0s', () => {
    return expect(suiteView.getManualDurationeTestSuite()).toEqual('0s');
  });

  it('Number of tests should be 0', () => {
    return expect(suiteView.getTotalTestsSuite()).toEqual('0');
  });

  it('Automation Duration Label shouldn`t be shown', () => {
    return expect(suiteView.isAutomationDurationLabel()).toBe(false, 'Automation Duration Label is expected to absent');
  });
});
