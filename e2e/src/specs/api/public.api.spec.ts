import { TestSuite } from '../../../../src/app/shared/models/test-suite';
import { ProjectHelper } from '../../helpers/project.helper';
import { TestRun } from '../../../../src/app/shared/models/testrun';
import { Test } from '../../../../src/app/shared/models/test';
import { TestResult } from '../../../../src/app/shared/models/test-result';
import { ATError } from '../../../../src/app/shared/models/error';
import { ApiAssertMessages, apiResponseErrors } from './api.constants';
import { PublicAPI } from '../../api/public.api';

let suite: TestSuite;
let test: Test;
let testrun: TestRun;
let testResult: TestResult;
let atError: ATError;
const unaccessibleId = 100000;
const suiteName = 'My Suite';
const editedSuiteName = 'My Edited Suite';
const testName = 'My Test';
const editedTestName = 'My Edited Test';
const buildName = 'build_1';

describe('Public API', () => {
  const projectHelper: ProjectHelper = new ProjectHelper();
  let api: PublicAPI;

  beforeAll(async () => {
    await projectHelper.init();
    api = projectHelper.publicAPI;
  });

  afterAll(async () => {
    await projectHelper.dispose();
  });

  afterEach(() => {
    atError = undefined;
  });

  describe('Suite:', () => {
    it('Can not create Suite via public API without name and id', async () => {
      return api.assertNegativeResponse(api.createOrUpdateSuite({
        project_id: projectHelper.project.id
      }), apiResponseErrors.missedIdOrName);
    });

    it('Can not create Suite via public API without project_id', async () => {
      return api.assertNegativeResponse(api.createOrUpdateSuite({
        name: suiteName
      }), apiResponseErrors.missedProjectId);
    });

    it('Can not create Suite via public API for unaccessible project', async () => {
      return api.assertNegativeResponse(api.createOrUpdateSuite({
        name: suiteName,
        project_id: unaccessibleId
      }), apiResponseErrors.anonymousNotAllowedToViewTestSuites);
    });

    it('Can create Suite via public API', async () => {
      suite = await api.createOrUpdateSuite({
        name: suiteName,
        project_id: projectHelper.project.id
      });

      expect(suite.id).toBeDefined(ApiAssertMessages.idMissed);
      expect(suite.name).toBe(suiteName, ApiAssertMessages.nameWrong);
      expect(suite.project_id).toBe(projectHelper.project.id, ApiAssertMessages.projecIdWrong);
    });

    it('Can not update Suite via public API with unaccessible id', async () => {
      return api.assertNegativeResponse(api.createOrUpdateSuite({
        id: unaccessibleId,
        name: editedSuiteName,
        project_id: projectHelper.project.id
      }), apiResponseErrors.entityWithIdDoesNotExist(unaccessibleId));
    });

    it('Can update Suite via public API with id', async () => {
      const newSuite = await api.createOrUpdateSuite({
        id: suite.id,
        name: editedSuiteName,
        project_id: projectHelper.project.id
      });

      expect(newSuite.id).toBe(suite.id, ApiAssertMessages.idMissed);
      expect(newSuite.name).toBe(editedSuiteName, ApiAssertMessages.nameWrong);
      expect(newSuite.project_id).toBe(projectHelper.project.id, ApiAssertMessages.projecIdWrong);
      suite = newSuite;
    });

    it('Existing suite returned when trying to add duplicate', async () => {
      const newSuite = await api.createOrUpdateSuite({
        name: editedSuiteName,
        project_id: projectHelper.project.id
      });

      expect(newSuite.id).toBe(suite.id, ApiAssertMessages.idMissed);
      expect(newSuite.name).toBe(editedSuiteName, ApiAssertMessages.nameWrong);
      expect(newSuite.project_id).toBe(projectHelper.project.id, ApiAssertMessages.projecIdWrong);
      suite = newSuite;
    });
  });

  describe('Test:', () => {
    it('Can not create Test via public API without name and id', async () => {
      return api.assertNegativeResponse(api.createOrUpdateTest({
        suites: [{ id: suite.id }],
        project_id: projectHelper.project.id
      }), apiResponseErrors.missedIdOrName);
    });

    it('Can not create Test via public API without project_id', async () => {
      return api.assertNegativeResponse(api.createOrUpdateTest({
        name: testName,
        suites: [{ id: suite.id }]
      }), apiResponseErrors.missedProjectId);
    });

    it('Can not create Test via public API without suites', async () => {
      return api.assertNegativeResponse(api.createOrUpdateTest({
        name: testName,
        project_id: projectHelper.project.id
      }), apiResponseErrors.missedSuites);
    });

    it('Can not create Test via public API for unaccessible project', async () => {
      return api.assertNegativeResponse(api.createOrUpdateTest({
        name: testName,
        suites: [{ id: suite.id }],
        project_id: unaccessibleId
      }), apiResponseErrors.anonymousNotAllowedToViewTests);
    });

    it('Can create Test via public API', async () => {
      test = await api.createOrUpdateTest({
        name: testName,
        suites: [{ id: suite.id }],
        project_id: projectHelper.project.id
      });

      expect(test.id).toBeDefined(ApiAssertMessages.idMissed);
      expect(test.name).toBe(testName, ApiAssertMessages.nameWrong);
      expect(test.project_id).toBe(projectHelper.project.id, ApiAssertMessages.projecIdWrong);
      expect(test.suites.length).toBe(1, ApiAssertMessages.suiteMissed);
    });

    it('Can update Test via public API with id', async () => {
      const newTest = await api.createOrUpdateTest({
        id: test.id,
        name: editedTestName,
        suites: [{ id: suite.id }],
        project_id: projectHelper.project.id
      });

      expect(newTest.id).toBe(test.id, ApiAssertMessages.idWrong);
      expect(newTest.name).toBe(editedTestName, ApiAssertMessages.nameWrong);
      expect(newTest.project_id).toBe(projectHelper.project.id, ApiAssertMessages.projecIdWrong);
      expect(newTest.suites.length).toBe(1, ApiAssertMessages.suiteMissed);
      test = newTest;
    });

    it('Can update Test via public API with name', async () => {
      const newTest = await api.createOrUpdateTest({
        name: editedTestName,
        suites: [{ id: suite.id }],
        project_id: projectHelper.project.id
      });

      expect(newTest.id).toBe(test.id, ApiAssertMessages.idWrong);
      expect(newTest.name).toBe(editedTestName, ApiAssertMessages.nameWrong);
      expect(newTest.project_id).toBe(projectHelper.project.id, ApiAssertMessages.projecIdWrong);
      expect(newTest.suites.length).toBe(1, ApiAssertMessages.suiteMissed);
      test = newTest;
    });
  });

  describe('Test Run:', () => {
    it('Can not create Test Run via public API without build_name', async () => {
      return api.assertNegativeResponse(api.startTestrun({
        test_suite_id: suite.id,
        project_id: projectHelper.project.id
      }), apiResponseErrors.missedBuildName);
    });

    it('Can not create Test Run via public API without test_suite_id', async () => {
      return api.assertNegativeResponse(api.startTestrun({
        build_name: buildName,
        project_id: projectHelper.project.id
      }), apiResponseErrors.missedSuiteId);
    });

    it('Can not create Test Run via public API without project_id', async () => {
      return api.assertNegativeResponse(api.startTestrun({
        build_name: buildName,
        test_suite_id: suite.id
      }), apiResponseErrors.missedProjectId);
    });

    it('Can not create Test Run via public API for unaccessible project', async () => {
      return api.assertNegativeResponse(api.startTestrun({
        build_name: buildName,
        test_suite_id: suite.id,
        project_id: unaccessibleId
      }), apiResponseErrors.anonymousNotAllowedToCreateTestRun);
    });

    it('Can start Test Run via public API', async () => {
      testrun = await api.startTestrun({
        build_name: buildName,
        test_suite_id: suite.id,
        project_id: projectHelper.project.id
      });

      expect(testrun.id).toBeDefined(ApiAssertMessages.idMissed);
      expect(testrun.start_time).toBeDefined(ApiAssertMessages.startTimeMissed);
      expect(testrun.build_name).toBe(buildName, ApiAssertMessages.nameWrong);
      expect(testrun.project_id).toBe(projectHelper.project.id, ApiAssertMessages.projecIdWrong);
      expect(testrun.test_suite_id).toBe(suite.id, ApiAssertMessages.suiteMissed);
    });


    describe('Test Result:', () => {
      it('Can not start Test Result via public API without test_id', async () => {
        return api.assertNegativeResponse(api.testResultStart(undefined, testrun.id, projectHelper.project.id),
          apiResponseErrors.missedTestId);
      });

      it('Can not start Test Result via public API without test_run_id', async () => {
        return api.assertNegativeResponse(api.testResultStart(test.id, undefined, projectHelper.project.id),
          apiResponseErrors.missedTestRunId);
      });

      it('Can not start Test Result via public API without project_id', async () => {
        return api.assertNegativeResponse(api.testResultStart(test.id, testrun.id, undefined),
          apiResponseErrors.missedProjectId);
      });

      it('Can not start Test Result via public API for unaccessible project', async () => {
        return api.assertNegativeResponse(api.testResultStart(test.id, testrun.id, unaccessibleId),
          apiResponseErrors.anonymousNotAllowedToViewTestResults);
      });

      it('Can start Test Result via public API', async () => {
        testResult = await api.testResultStart(test.id, testrun.id, projectHelper.project.id);

        expect(testResult.id).toBeDefined(ApiAssertMessages.idMissed);
        expect(testResult.start_date).toBeDefined(ApiAssertMessages.startDateMissed);
        expect(testResult.final_result_id).toBe(4, ApiAssertMessages.finalResultIdWrong);
        expect(testResult.project_id).toBe(projectHelper.project.id, ApiAssertMessages.projecIdWrong);
        expect(testResult.test_id).toBe(test.id, ApiAssertMessages.testIdWrong);
      });

      it('Can not finish Test Result via public API without id', async () => {
        return api.assertNegativeResponse(api.testResultFinish({
          project_id: projectHelper.project.id
        }), apiResponseErrors.missedId);
      });

      it('Can not finish Test Result via public API without project_id', async () => {
        return api.assertNegativeResponse(api.testResultFinish({
          id: testResult.id
        }), apiResponseErrors.missedProjectId);
      });

      it('Can not finish Test Result via public API without final_result_id', async () => {
        return api.assertNegativeResponse(api.testResultFinish({
          id: testResult.id,
          project_id: projectHelper.project.id
        }), apiResponseErrors.missedFinalResultId);
      });

      it('Can not finish Test Result via public API for unaccessible project', async () => {
        return api.assertNegativeResponse(api.testResultFinish({
          id: testResult.id,
          final_result_id: 2,
          project_id: unaccessibleId
        }), apiResponseErrors.anonymousNotAllowedToViewTestResults);
      });

      it('Can finish Test Result via public API', async () => {
        testResult = await api.testResultFinish({
          id: testResult.id,
          final_result_id: 2,
          project_id: projectHelper.project.id
        });

        expect(testResult.id).toBeDefined(ApiAssertMessages.idMissed);
        expect(testResult.start_date).toBeDefined(ApiAssertMessages.startDateMissed);
        expect(testResult.final_result_id).toBe(2, ApiAssertMessages.finalResultIdWrong);
        expect(testResult.project_id).toBe(projectHelper.project.id, ApiAssertMessages.projecIdWrong);
        expect(testResult.test_id).toBe(test.id, ApiAssertMessages.testIdWrong);
      });
    });

    it('Can not finish Test Run via public API without id', async () => {
      return api.assertNegativeResponse(api.finishTestRun(projectHelper.project.id, undefined),
        apiResponseErrors.missedId);
    });

    it('Can not finish Test Run via public API without project_id', async () => {
      return api.assertNegativeResponse(api.finishTestRun(undefined, testrun.id),
        apiResponseErrors.missedProjectId);
    });

    it('Can not finish Test Run via public API for unaccessible project', async () => {
      return api.assertNegativeResponse(api.finishTestRun(unaccessibleId, testrun.id),
        apiResponseErrors.anonymousNotAllowedToCreateTestRun);
    });

    it('Can finish Test Run via public API', async () => {
      const newTestrun: TestRun = await api.finishTestRun(projectHelper.project.id, testrun.id);

      expect(newTestrun.id).toBe(testrun.id, ApiAssertMessages.idWrong);
      expect(newTestrun.start_time).toBe(testrun.start_time, ApiAssertMessages.startTimeWrong);
      expect(newTestrun.finish_time).not.toBe(testrun.finish_time, ApiAssertMessages.finishTimeWrong);
      expect(testrun.build_name).toBe(buildName, ApiAssertMessages.nameWrong);
      expect(testrun.project_id).toBe(projectHelper.project.id, ApiAssertMessages.projecIdWrong);
      expect(testrun.test_suite_id).toBe(suite.id, ApiAssertMessages.suiteMissed);
    });
  });
});

