import { projectList } from '../../pages/project/list.po';
import { projectView } from '../../pages/project/view.po';
import { projectCreate } from '../../pages/project/create.po';
import { logIn } from '../../pages/login.po';
import { Project } from '../../../../src/app/shared/models/project';

import users from '../../data/users.json';
import projects from '../../data/projects.json';

describe('Full Admin Project', () => {
  const project: Project = projects.creation;

  beforeAll(() => {
    return logIn.logInAs(users.admin.user_name, users.admin.password);
  });

  afterAll(async () => {
    if (await logIn.menuBar.isLogged()) {
      return logIn.menuBar.clickLogOut();
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

    it('Message about creation is shown', async () => {
      await projectCreate.clickCreateButton();
      return projectList.notification.assertIsSuccess(`${project.name} project is created!`);
    });

    it('Redirected to List after success project creation', async () => {
      return expect(projectList.isOpened()).toEqual(true);
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
      await projectList.modal.clickYes();
      await projectList.notification.assertIsSuccess(`Project '${project.name}' was deleted.`);
      return expect(projectList.isProjectInList(project.name)).toEqual(false);
    });
  });
});
