import { TestSuite } from '../../../src/app/shared/models/testSuite';
import { ProjectHelper } from '../../helpers/project.helper';
import suites from '../../data/suites.json';
import cucumberImport from '../../data/import/cucumber.json';
import { TestRun } from '../../../src/app/shared/models/testRun';
import { Test } from '../../../src/app/shared/models/test';
import { TestResult } from '../../../src/app/shared/models/test-result';

describe('Public API tests', () => {
  const projectHelper: ProjectHelper = new ProjectHelper();
  const builds = { build_1: 'Build_1' };
  let suite: TestSuite = suites.suiteCreation;
  let testrun: TestRun;
  let tests: Test[];
  let testresult: TestResult;
  let newtest: Test;

  beforeAll(async () => {
    await projectHelper.init();
    await projectHelper.importer.executeCucumberImport(suite.name, [cucumberImport], [`${builds.build_1}.json`]);
    suite.project_id = projectHelper.project.id;
    suite = (await projectHelper.editorAPI.getSuites(suite))[0];
    return;
  });

  afterAll(async () => {
    await projectHelper.dispose();
  });

  it('Test Run can be created via API', async () => {
    testrun = await projectHelper.editorAPI.createTestRun({
      start_time: new Date(),
      build_name: 'Build_2',
      project_id: projectHelper.project.id,
      test_suite_id: suite.id
    });
    expect(testrun.id).toBeDefined('Test run was not created');
  });

  it('Tests can be found for Suite', async () => {
    tests = await projectHelper.editorAPI.getTests({ test_suite_id: suite.id, project_id: projectHelper.project.id });
    expect(tests.length).toBe(3, 'Tests number is not correct');
  });

  it('Test Result can be found by test tun and test id', async () => {
    const testResults = await projectHelper.editorAPI.getResults({ test_id: tests[0].id, test_run_id: testrun.id, project_id: projectHelper.project.id });
    expect(testResults.length).toBe(1, 'Test Results number is not correct');
    expect(testResults[0].final_result_id).toBe(3, 'Final Result should be Not Executed!');
    testresult = testResults[0];
  });

  it('Test Result can be updated', async () => {
    testresult.final_result_id = 4;
    testresult = await projectHelper.editorAPI.createResult(testresult);
    expect(testresult.final_result_id).toBe(4, 'Final Result should be In Progress!');
  });

  it('Test can be updated', async () => {
    let test: Test = tests[0];
    test.body = 'New Test Body';
    test = await projectHelper.editorAPI.createTest(test);
    expect(test.body).toBe('New Test Body', 'Test Body Should be updated!');
  });

  it('Test can be created', async () => {
    newtest = await projectHelper.editorAPI.createTest(
      {
        name: 'Super New Test',
        project_id: projectHelper.project.id,
        suites: [{ id: suite.id, project_id: projectHelper.project.id }]
      });
    expect(newtest.id).toBeDefined('Test was not created');
  });

  it('Test Result can be created', async () => {
    const newResult = await await projectHelper.editorAPI.createResult(
      {
        project_id: projectHelper.project.id,
        test_id: newtest.id,
        final_result_id: 4,
        test_run_id: testrun.id,
        start_date: new Date()
      });
    expect(newResult.id).toBeDefined('Test Result was not created');
  });
});
