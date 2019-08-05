import { ProjectList } from '../../pages/project/list.po';
import { ProjectView } from '../../pages/project/view.po';
import { ProjectCreate } from '../../pages/project/create.po';
import { LogIn } from '../../pages/login.po';
import { Project } from '../../../src/app/shared/models/project';

import users from '../../data/users.json';
import projects from '../../data/projects.json';

describe('Full Admin Project', () => {

  const projectList: ProjectList = new ProjectList();
  const projectView: ProjectView = new ProjectView();
  const projectCreate: ProjectCreate = new ProjectCreate();
  const logInPage: LogIn = new LogIn();
  const project: Project = projects.creation;

  beforeAll(() => {
    return logInPage.logIn(users.admin.user_name, users.admin.password);
  });

  afterAll(async () => {
    if (await logInPage.menuBar.isLogged()) {
      return logInPage.menuBar.clickLogOut();
    }
  });

  describe('Create Project', () => {
    it('Create button exists on projects list', () => {
      return expect(projectList.isCreateProjectExists()).toEqual(true);
    });

    it('I can open Create Project page by clicking Create Project', async () => {
      await projectList.clickCreateProjectButton();
      return expect(projectCreate.isOpened());
    });

    it('Create button is disabled when fields are empty', () => {
      return expect(projectCreate.isCreateButtonEnabled()).toBe(false);
    });

    it('Create button is disabled when only Project Name is filled', async () => {
      await projectCreate.fillProjectNameField(project.name);
      return expect(projectCreate.isCreateButtonEnabled()).toBe(false);
    });

    it('Create is enabled when all fields are filled', async () => {
      await projectCreate.selectCustomer(project.customer.name);
      return expect(projectCreate.isCreateButtonEnabled()).toBe(true);
    });

    it('Redirected to List after success project creation', async () => {
      await projectCreate.clickCreateButton();
      return expect(projectList.isOpened()).toEqual(true);
    });

    it('Message about creation is shown', async () => {
      await expect(projectList.notification.isSuccess()).toEqual(true);
      await expect(projectList.notification.getContent()).toEqual(`${project.name} project is created!`);
      return projectList.notification.close();
    });

    it(`Project is in list after creation`, async () => {
      return expect(projectList.isProjectInList(project.name)).toEqual(true);
    });
  });

  describe('Open Project', () => {
    it(`Project can be opened from list`, async () => {
      await projectList.openProject(project.name);
      return expect(projectView.isOpened()).toEqual(true);
    });

    it('Just created project should show a message that this project is empty', () => {
      return expect(projectView.isEmpty()).toEqual(true);
    });
  });

  describe('Delete Project', () => {
    it(`Project can be removed by clicking remove button from Actions column`, async () => {
      await projectView.menuBar.clickLogo();
      await projectList.clickRemoveProjectButton(project.name);
      await expect(projectList.modal.isVisible()).toEqual(true);
      await projectList.modal.clickActionBtn('yes');
      await expect(projectList.notification.isSuccess()).toEqual(true);
      await expect(projectList.notification.getContent()).toEqual(`Project '${project.name}' was deleted.`);
      return expect(projectList.isProjectInList(project.name)).toEqual(false);
    });
  });
});
