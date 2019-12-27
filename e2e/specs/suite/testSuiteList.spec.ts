import { LogIn } from '../../pages/login.po';
import { ProjectCreate } from '../../pages/project/create.po';
import { ProjectList } from '../../pages/project/list.po';
import { ProjectView } from '../../pages/project/view.po';
import { SuiteList } from '../../pages/suite/list.po';
import { Project } from '../../../src/app/shared/models/project';
import { TestSuite } from '../../../src/app/shared/models/testSuite';

import users from '../../data/users.json';
import projects from '../../data/projects.json';
import suites from '../../data/suites.json';
import { browser } from 'protractor';
import { SuiteView } from '../../pages/suite/view.po';

describe('Full Admin Test Suite List', () => {

  const logIn: LogIn = new LogIn();
  const projectCreate: ProjectCreate = new ProjectCreate();
  const projectList: ProjectList = new ProjectList();
  const projectView: ProjectView = new ProjectView();
  const testSuiteList: SuiteList = new SuiteList();
  const testSuiteView: SuiteView = new SuiteView();
  const project: Project = projects.suiteProject;
  const suite: TestSuite = suites.suiteCreation;

  beforeAll(async () => {
    await logIn.logInAs(users.admin.user_name, users.admin.password);
    await projectList.clickCreateProjectButton();
    await projectCreate.createProject(project);
    await projectList.openProject(project.name);
  });

  afterAll(async () => {
    await projectList.navigateTo();
    await projectList.clickRemoveProjectButton(project.name);
    await projectList.modal.clickYes();
    if (await projectList.menuBar.isLogged()) {
      return projectList.menuBar.clickLogOut();
    }
  });

  it('The error message exists for not filled creation row', async () => {
    await (await projectView.menuBar.tests()).suites();
    await testSuiteList.openCreationRow();
    return expect(testSuiteList.getCreationError()).toEqual('Fill all required fields');
  });

  it('No error messages when suite name is filled', async () => {
    await testSuiteList.setCreationName(suite.name);
    return expect(testSuiteList.getCreationError()).toEqual('');
  });

  it('Green notification appears and suite is created', async () => {
    await testSuiteList.acceptCreation();
    await expect(testSuiteList.notification.isSuccess()).toEqual(true);
    await expect(testSuiteList.notification.getContent()).toEqual(`Suite '${suite.name}' was created!`);
    await expect(testSuiteList.isTestSuitePresent(suite.name)).toEqual(true);
    await testSuiteList.notification.close();
  });

  it('Green notification appears and suite is updated', async () => {
    const newName = `${suite.name} New`;
    await testSuiteList.updateSuiteName(newName, suite.name);
    suite.name = newName;
    await expect(testSuiteList.notification.isSuccess()).toEqual(true);
    await expect(testSuiteList.notification.getContent()).toEqual(`Suite '${suite.name}' was updated!`);
    await expect(testSuiteList.isTestSuitePresent(suite.name)).toEqual(true);
    await testSuiteList.notification.close();
  });

  it('Suite is still updated after refresh', async () => {
    await browser.refresh();
    await expect(testSuiteList.isTestSuitePresent(suite.name)).toEqual(true);
  });

  it('Suite with same name cannot be created', async () => {
    await testSuiteList.openCreationRow();
    await testSuiteList.setCreationName(suite.name);
    await testSuiteList.acceptCreation();
    await expect(testSuiteList.notification.isError()).toEqual(true);
    await expect(testSuiteList.notification.getContent()).toEqual(`You are trying to create duplicate entity.`);
    await testSuiteList.notification.close();
  });

  it('Suite should be opened after click on row', async () => {
    await testSuiteList.clickTestSuite(suite.name);
    return expect(testSuiteView.getNameOfLabelTestSuite()).toEqual(suite.name);
  });

  it('I can Remove Test Suite', async () => {
    await (await testSuiteView.menuBar.tests()).suites();
    await testSuiteList.clickRemoveSuiteButton(suite.name);
    await expect(testSuiteList.modal.isVisible()).toBe(true, 'Remove Test Run modal is not opened');
    await testSuiteList.modal.clickYes();
    await testSuiteList.refresh();
    await expect(testSuiteList.isTestSuitePresent(suite.name)).toBe(false,
      `Suite ${suite.name} is still displayed`);
  });
});
