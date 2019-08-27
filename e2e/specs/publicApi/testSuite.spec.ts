import { LogIn } from '../../pages/login.po';
import { ProjectCreate } from '../../pages/project/create.po';
import { ProjectList } from '../../pages/project/list.po';
import { ProjectView } from '../../pages/project/view.po';
import { SuiteCreate } from '../../pages/suite/create.po';
import { Project } from '../../../src/app/shared/models/project';

import users from '../../data/users.json';
import projects from '../../data/projects.json';

describe('Public API Test', () => {

  const logIn: LogIn = new LogIn();
  const projectCreate: ProjectCreate = new ProjectCreate();
  const projectList: ProjectList = new ProjectList();
  const projectView: ProjectView = new ProjectView();
  const createTestSuite: SuiteCreate = new SuiteCreate();
  const project: Project = projects.suiteProject;

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
});
