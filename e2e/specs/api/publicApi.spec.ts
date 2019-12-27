import { logIn } from '../../pages/login.po';
import { projectList } from '../../pages/project/list.po';
import { projectView } from '../../pages/project/view.po';
import { Project } from '../../../src/app/shared/models/project';
import { TestSuite } from '../../../src/app/shared/models/testSuite';
import { postTestRun, getSuites, getTests, getResults, postResult, postTest } from '../../utils/aqualityTrackingAPI.util';

import users from '../../data/users.json';
import projects from '../../data/projects.json';
import suites from '../../data/suites.json';
import cucumberImport from '../../data/import/cucumber.json';
import { prepareProject, executeCucumberImport } from '../project.hooks';
import { TestRunList } from '../../pages/testrun/list.po';
import { TestRun } from '../../../src/app/shared/models/testRun';
import { Test } from '../../../src/app/shared/models/test';
import { TestResult } from '../../../src/app/shared/models/test-result';

describe('Public API tests', () => {
  const testRunList = new TestRunList();
  const project: Project = projects.apiTests;
  const builds = { build_1: 'Build_1' };
  let suite: TestSuite = suites.suiteCreation;
  let importToken: string;
  let projectId: number;
  let testrun: TestRun;
  let tests: Test[];
  let testresult: TestResult;
  let newtest: Test;

  beforeAll(async () => {
    await logIn.logInAs(users.admin.user_name, users.admin.password);
    importToken = await prepareProject(project);
    projectId = await projectView.getCurrentProjectId();
    await executeCucumberImport(projectId, suite.name,
      importToken, [JSON.stringify(cucumberImport)], [`${builds.build_1}.json`]);
    await projectView.menuBar.testRuns();
    const isTestRunAppear = await testRunList.waitForTestRun(builds.build_1);
    expect(isTestRunAppear).toBe(true, 'Import was not finished!');
    suite.project_id = projectId;
    suite = (await getSuites(suite, importToken, projectId))[0];
    return;
  });

  afterAll(async () => {
    await projectList.navigateTo();
    await projectList.clickRemoveProjectButton(project.name);
    await projectList.modal.clickYes();
    if (await projectList.menuBar.isLogged()) {
      return projectList.menuBar.clickLogOut();
    }
  });

  it('Test Run can be created via API', async () => {
    testrun = await postTestRun({
      start_time: new Date(),
      build_name: 'Build_2',
      project_id: projectId,
      test_suite_id: suite.id
    }, importToken, projectId);
    expect(testrun.id).toBeDefined('Test run was not created');
  });

  it('Tests can be found for Suite', async () => {
    tests = await getTests({ test_suite_id: suite.id, project_id: projectId }, importToken, projectId);
    expect(tests.length).toBe(3, 'Tests number is not correct');
  });

  it('Test Result can be found by test tun and test id', async () => {
    const testResults = await getResults({ test_id: tests[0].id, test_run_id: testrun.id, project_id: projectId }, importToken, projectId);
    expect(testResults.length).toBe(1, 'Test Results number is not correct');
    expect(testResults[0].final_result_id).toBe(3, 'Final Result should be Not Executed!');
    testresult = testResults[0];
  });

  it('Test Result can be updated', async () => {
    testresult.final_result_id = 4;
    testresult = await postResult(testresult, importToken, projectId);
    expect(testresult.final_result_id).toBe(4, 'Final Result should be In Progress!');
  });

  it('Test can be updated', async () => {
    let test: Test = tests[0];
    test.body = 'New Test Body';
    test = await postTest(test, importToken, projectId);
    expect(test.body).toBe('New Test Body', 'Test Body Should be updated!');
  });

  it('Test can be created', async () => {
    newtest = await postTest(
      {
        name: 'Super New Test',
        project_id: projectId,
        suites: [{ id: suite.id, project_id: projectId }]
      }, importToken, projectId);
    expect(newtest.id).toBeDefined('Test was not created');
  });

  it('Test Result can be created', async () => {
    const newResult = await postResult(
      {
        project_id: projectId,
        test_id: newtest.id,
        final_result_id: 4,
        test_run_id: testrun.id,
        start_date: new Date()
      }, importToken, projectId);
    expect(newResult.id).toBeDefined('Test Result was not created');
  });
});
