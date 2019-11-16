import { ProjectList } from '../pages/project/list.po';
import { ProjectCreate } from '../pages/project/create.po';
import { PermissionsAdministration } from '../pages/administration/permissions.po';
import { Project } from '../../src/app/shared/models/project';
import { APITokenAdministration } from '../pages/administration/apiToken.po';
import {
  doImport,
  ImportParams,
  postSuite,
  postTest,
  postStep,
  postStepToTest,
  postTestToSuite,
  postTestRun
} from '../utils/aqualityTrackingAPI.util';
import { User } from '../../src/app/shared/models/user';
import { logger } from '../utils/log.util';
import { Test } from '../../src/app/shared/models/test';
import { TestSuite } from '../../src/app/shared/models/testSuite';
import { Step, StepToTest } from '../../src/app/shared/models/steps';
import { TestRun } from '../../src/app/shared/models/testRun';

const projectList: ProjectList = new ProjectList();
const projectCreate: ProjectCreate = new ProjectCreate();
const importTokenAdministration: APITokenAdministration = new APITokenAdministration();
const permissionsAdministration: PermissionsAdministration = new PermissionsAdministration();

export const userPermissionTypeKeys = {
  admin: 'admin',
  localAdmin: 'localAdmin',
  localManager: 'localManager',
  localEngineer: 'localEngineer',
  manager: 'manager',
  projectTemp: 'projectTemp',
  viewer: 'viewer'
};

export const createProject = async (project: Project): Promise<void> => {
  await projectList.clickCreateProjectButton();
  await projectCreate.fillProjectNameField(project.name);
  await projectCreate.selectCustomer(project.customer.name);
  return projectCreate.clickCreateButton();
};

export const prepareProject = async (project: Project): Promise<string> => {
  await createProject(project);
  await (await projectList.menuBar.user()).administration();
  await importTokenAdministration.sidebar.apiToken();
  const token = await importTokenAdministration.generateToken(project.name);
  await importTokenAdministration.menuBar.clickLogo();
  await projectList.openProject(project.name);
  return token;
};

export const executeImport = async (
  importParameters: ImportParams,
  files: string[],
  fileNames: string[]) => {
  const result = await doImport(importParameters, files, fileNames);
  if (!result) {
    throw Error('Import Failed!');
  }
  return result;
};

export const executeCucumberImport = async (
  projectId: number,
  suiteName: string,
  importToken: string,
  files: string[],
  fileNames: string[]) => {
  return executeImport({ projectId, suite: suiteName, importToken, format: 'Cucumber', addToLastTestRun: false }, files, fileNames);
};

export const generateBuilds = (count: number): { names: any, filenames: string[] } => {
  const names = {};
  const filenames: string[] = [];

  for (let i = 0; i < count; i++) {
    const name = `build_${i + 1}`;
    names[name] = name;
    filenames.push(`${name}.json`);
  }

  return { names, filenames };
};

export const setProjectPermissions = async (project: Project, users: any) => {
  await permissionsAdministration.selectProject(project.name);
  const keys = Object.keys(users);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const user: User = users[key];
    switch (key) {
      case userPermissionTypeKeys.localAdmin:
        await permissionsAdministration.create({ user, admin: 1, manager: 0, engineer: 0 });
        break;
      case userPermissionTypeKeys.localEngineer:
        await permissionsAdministration.create({ user, admin: 0, manager: 0, engineer: 1 });
        break;
      case userPermissionTypeKeys.localManager:
        await permissionsAdministration.create({ user, admin: 0, manager: 1, engineer: 0 });
        break;
      case userPermissionTypeKeys.projectTemp:
        await permissionsAdministration.create({ user, admin: 0, manager: 0, engineer: 0 });
        break;
      case userPermissionTypeKeys.viewer:
        await permissionsAdministration.create({ user, admin: 0, manager: 0, engineer: 0 });
        break;
      default:
        logger.info(`Local Permissions for ${key} are not required`);
    }
  }
};

export const prepareSuite = async (suite: TestSuite, token: string, projectId: number): Promise<TestSuite> => {
  suite.project_id = projectId;
  return postSuite(suite, token, projectId);
};

export const prepareTest = async (test: Test, token: string, projectId: number): Promise<Test> => {
  test.project_id = projectId;
  return postTest(test, token, projectId);
};

export const prepareStep = async (step: Step, token: string, projectId: number): Promise<Step> => {
  step.project_id = projectId;
  return postStep(step, token, projectId);
};

export const addStepToTest = (stepToTest: StepToTest, token: string, projectId: number): Promise<Step> => {
  stepToTest.project_id = projectId;
  return postStepToTest(stepToTest, token, projectId);
};

export const addTestToSuite = (testId: number, suiteId: number, token: string, projectId: number) => {
  return postTestToSuite(testId, suiteId, token, projectId);
};

export const prepareTestRun = (testrun: TestRun, token: string, projectId: number) => {
  testrun.project_id = projectId;
  return postTestRun(testrun, token, projectId);
}
