import { LogIn } from '../../pages/login.po';
import { ProjectCreate } from '../../pages/project/create.po';
import { ProjectList } from '../../pages/project/list.po';
import { ProjectView } from '../../pages/project/view.po';
import { SuiteCreate } from '../../pages/suite/create.po';
import { SuiteList } from '../../pages/suite/list.po';
import { SuiteView } from '../../pages/suite/view.po';
import { Project } from '../../../src/app/shared/models/project';
import { TestSuite } from '../../../src/app/shared/models/testSuite';

import users from '../../data/users.json';
import projects from '../../data/projects.json';
import suites from '../../data/suites.json';

describe('Full Admin Test Suite', () => {

  const logIn: LogIn = new LogIn();
  const projectCreate: ProjectCreate = new ProjectCreate();
  const projectList: ProjectList = new ProjectList();
  const projectView: ProjectView = new ProjectView();
  const createTestSuite: SuiteCreate = new SuiteCreate();
  const testSuiteList: SuiteList = new SuiteList();
  const testSuiteView: SuiteView = new SuiteView();
  const project: Project = projects.suiteProject;
  const suite: TestSuite = suites.suiteCreation;

  beforeAll(async () => {
    await logIn.logIn(users.admin.user_name, users.admin.password);
    await projectList.clickCreateProjectButton();
    await projectCreate.createProject(project);
    await projectList.openProject(project.name);
  });

  afterAll(async () => {
    await projectList.navigateTo();
    await projectList.clickRemoveProjectButton(project.name);
    await projectList.modal.clickActionBtn('yes');
    if (await projectList.menuBar.isLogged()) {
      return projectList.menuBar.clickLogOut();
    }
  });

  it('Create button is disabled when Name is not filled', async () => {
    await (await projectView.menuBar.create()).suite();
    expect(createTestSuite.isCreateEnabled()).toBe(false, 'Create button should be disabled');
  });

  it('Suites List page should be opend after Suite creation', async () => {
    await createTestSuite.createSuite(suite);
    expect(testSuiteList.isOpened()).toBe(true, 'Suites List should be opened');
  });

  it('New Suite should be in list', () => {
    return expect(testSuiteList.isTestSuitePresent(suite.name)).toBe(true);
  });

  it('Suite should be selected in suites lookup', async () => {
    await testSuiteList.clickTestSuite(suite.name);
    return expect(testSuiteView.getNameOfLabelTestSuite()).toEqual(suite.name);
  });

  it('Suite name should be inherited from create page', () => {
    return expect(testSuiteView.getNameOfTestSuite()).toEqual(suite.name);
  });

  it('Suite manual duration should be 0s', () => {
    return expect(testSuiteView.getManualDurationeTestSuite()).toEqual('0s');
  });

  it('Number of tests should be 0', () => {
    return expect(testSuiteView.getTotalTestsSuite()).toEqual('0');
  });

  it('Automation Duration Label shouldn`t be shown', () => {
    return expect(testSuiteView.isAutomationDurationLabel()).toBe(false, 'Automation Duration Label is expected to absent');
  });

  it('I can Remove Test Suite', async () => {
    await (await testSuiteView.menuBar.tests()).suites();
    await testSuiteList.clickRemoveSuiteButton(suite.name);
    await expect(testSuiteList.modal.isVisible()).toBe(true, 'Remove Test Run modal is not opened');
    await testSuiteList.modal.clickActionBtn('yes');
    await testSuiteList.refresh();
    await expect(testSuiteList.isTestSuitePresent(suite.name)).toBe(false,
      `Suite ${suite.name} is still displayed`);
  });
});
