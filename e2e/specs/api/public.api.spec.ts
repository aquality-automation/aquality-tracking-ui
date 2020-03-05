import { TestSuite } from '../../../src/app/shared/models/testSuite';
import { ProjectHelper } from '../../helpers/project.helper';
import { TestRun } from '../../../src/app/shared/models/testRun';
import { Test } from '../../../src/app/shared/models/test';
import { TestResult } from '../../../src/app/shared/models/test-result';
import { ATError } from '../../../src/app/shared/models/error';
import { ApiAssertMessages, apiResponseErrors } from './api.constants';

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

  beforeAll(async () => {
    await projectHelper.init();
  });

  afterAll(async () => {
    await projectHelper.dispose();
  });

  afterEach(() => {
    atError = undefined;
  });

  describe('Suite:', () => {
    it('Can not create Suite via public API without name and id', async () => {
      try {
        await projectHelper.publicAPI.createOrUpdateSuite({
          project_id: projectHelper.project.id
        });
      } catch (error) {
        atError = error;
      }

      expect(atError).toBeDefined(ApiAssertMessages.errorNotRaised);
      expect(atError.message).toBe(apiResponseErrors.missedIdOrName, ApiAssertMessages.errorIsWrong);
    });

    it('Can not create Suite via public API without project_id', async () => {
      try {
        await projectHelper.publicAPI.createOrUpdateSuite({
          name: suiteName
        });
      } catch (error) {
        atError = error;
      }

      expect(atError).toBeDefined(ApiAssertMessages.errorNotRaised);
      expect(atError.message).toBe(apiResponseErrors.missedProjectId, ApiAssertMessages.errorIsWrong);
    });

    it('Can not create Suite via public API for unaccessible project', async () => {
      try {
        await projectHelper.publicAPI.createOrUpdateSuite({
          name: suiteName,
          project_id: unaccessibleId
        });
      } catch (error) {
        atError = error;
      }

      expect(atError).toBeDefined(ApiAssertMessages.errorNotRaised);
      expect(atError.message).toBe(apiResponseErrors.anonymousNotAllowedToViewTestSuites, ApiAssertMessages.errorIsWrong);
    });

    it('Can create Suite via public API', async () => {
      suite = await projectHelper.publicAPI.createOrUpdateSuite({
        name: suiteName,
        project_id: projectHelper.project.id
      });

      expect(suite.id).toBeDefined(ApiAssertMessages.idMissed);
      expect(suite.name).toBe(suiteName, ApiAssertMessages.nameWrong);
      expect(suite.project_id).toBe(projectHelper.project.id, ApiAssertMessages.projecIdWrong);
    });

    it('Can not update Suite via public API with unaccessible id', async () => {
      try {
        await projectHelper.publicAPI.createOrUpdateSuite({
          id: unaccessibleId,
          name: editedSuiteName,
          project_id: projectHelper.project.id
        });
      } catch (error) {
        atError = error;
      }

      expect(atError).toBeDefined(ApiAssertMessages.errorNotRaised);
      expect(atError.message).toBe(apiResponseErrors.entityWithIdDoesNotExist(unaccessibleId), ApiAssertMessages.errorIsWrong);
    });

    it('Can update Suite via public API with id', async () => {
      const newSuite = await projectHelper.publicAPI.createOrUpdateSuite({
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
      const newSuite = await projectHelper.publicAPI.createOrUpdateSuite({
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
      try {
        await projectHelper.publicAPI.createOrUpdateTest({
          suites: [{ id: suite.id }],
          project_id: projectHelper.project.id
        });
      } catch (error) {
        atError = error;
      }

      expect(atError).toBeDefined(ApiAssertMessages.errorNotRaised);
      expect(atError.message).toBe(apiResponseErrors.missedIdOrName, ApiAssertMessages.errorIsWrong);
    });

    it('Can not create Test via public API without project_id', async () => {
      try {
        await projectHelper.publicAPI.createOrUpdateTest({
          name: testName,
          suites: [{ id: suite.id }]
        });
      } catch (error) {
        atError = error;
      }

      expect(atError).toBeDefined(ApiAssertMessages.errorNotRaised);
      expect(atError.message).toBe(apiResponseErrors.missedProjectId, ApiAssertMessages.errorIsWrong);
    });

    it('Can not create Test via public API without suites', async () => {
      try {
        await projectHelper.publicAPI.createOrUpdateTest({
          name: testName,
          project_id: projectHelper.project.id
        });
      } catch (error) {
        atError = error;
      }

      expect(atError).toBeDefined(ApiAssertMessages.errorNotRaised);
      expect(atError.message)
        .toBe(apiResponseErrors.missedSuites, ApiAssertMessages.errorIsWrong);
    });

    it('Can not create Test via public API for unaccessible project', async () => {
      try {
        await projectHelper.publicAPI.createOrUpdateTest({
          name: testName,
          suites: [{ id: suite.id }],
          project_id: unaccessibleId
        });
      } catch (error) {
        atError = error;
      }

      expect(atError).toBeDefined(ApiAssertMessages.errorNotRaised);
      expect(atError.message).toBe(apiResponseErrors.anonymousNotAllowedToViewTests, ApiAssertMessages.errorIsWrong);
    });

    it('Can create Test via public API', async () => {
      test = await projectHelper.publicAPI.createOrUpdateTest({
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
      const newTest = await projectHelper.publicAPI.createOrUpdateTest({
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
      const newTest = await projectHelper.publicAPI.createOrUpdateTest({
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
      try {
        await projectHelper.publicAPI.startTestrun({
          test_suite_id: suite.id,
          project_id: projectHelper.project.id
        });
      } catch (error) {
        atError = error;
      }

      expect(atError).toBeDefined(ApiAssertMessages.errorNotRaised);
      expect(atError.message).toBe(apiResponseErrors.missedBuildName, ApiAssertMessages.errorIsWrong);
    });

    it('Can not create Test Run via public API without test_suite_id', async () => {
      try {
        await projectHelper.publicAPI.startTestrun({
          build_name: buildName,
          project_id: projectHelper.project.id
        });
      } catch (error) {
        atError = error;
      }

      expect(atError).toBeDefined(ApiAssertMessages.errorNotRaised);
      expect(atError.message).toBe(apiResponseErrors.missedSuiteId, ApiAssertMessages.errorIsWrong);
    });

    it('Can not create Test Run via public API without project_id', async () => {
      try {
        await projectHelper.publicAPI.startTestrun({
          build_name: buildName,
          test_suite_id: suite.id
        });
      } catch (error) {
        atError = error;
      }

      expect(atError).toBeDefined(ApiAssertMessages.errorNotRaised);
      expect(atError.message).toBe(apiResponseErrors.missedProjectId, ApiAssertMessages.errorIsWrong);
    });

    it('Can not create Test Run via public API for unaccessible project', async () => {
      try {
        await projectHelper.publicAPI.startTestrun({
          build_name: buildName,
          test_suite_id: suite.id,
          project_id: unaccessibleId
        });
      } catch (error) {
        atError = error;
      }

      expect(atError).toBeDefined(ApiAssertMessages.errorNotRaised);
      expect(atError.message).toBe(apiResponseErrors.anonymousNotAllowedToCreateTestRun, ApiAssertMessages.errorIsWrong);
    });

    it('Can start Test Run via public API', async () => {
      testrun = await projectHelper.publicAPI.startTestrun({
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
        try {
          await projectHelper.publicAPI.testResultStart(undefined, testrun.id, projectHelper.project.id);
        } catch (error) {
          atError = error;
        }

        expect(atError).toBeDefined(ApiAssertMessages.errorNotRaised);
        expect(atError.message).toBe(apiResponseErrors.missedTestId, ApiAssertMessages.errorIsWrong);
      });

      it('Can not start Test Result via public API without test_run_id', async () => {
        try {
          await projectHelper.publicAPI.testResultStart(test.id, undefined, projectHelper.project.id);
        } catch (error) {
          atError = error;
        }

        expect(atError).toBeDefined(ApiAssertMessages.errorNotRaised);
        expect(atError.message).toBe(apiResponseErrors.missedTestRunId, ApiAssertMessages.errorIsWrong);
      });

      it('Can not start Test Result via public API without project_id', async () => {
        try {
          await projectHelper.publicAPI.testResultStart(test.id, testrun.id, undefined);
        } catch (error) {
          atError = error;
        }

        expect(atError).toBeDefined(ApiAssertMessages.errorNotRaised);
        expect(atError.message).toBe(apiResponseErrors.missedProjectId, ApiAssertMessages.errorIsWrong);
      });

      it('Can not start Test Result via public API for unaccessible project', async () => {
        try {
          await projectHelper.publicAPI.testResultStart(test.id, testrun.id, unaccessibleId);
        } catch (error) {
          atError = error;
        }

        expect(atError).toBeDefined(ApiAssertMessages.errorNotRaised);
        expect(atError.message).toBe(apiResponseErrors.anonymousNotAllowedToViewTestResults, ApiAssertMessages.errorIsWrong);
      });

      it('Can start Test Result via public API', async () => {
        testResult = await projectHelper.publicAPI.testResultStart(test.id, testrun.id, projectHelper.project.id);

        expect(testResult.id).toBeDefined(ApiAssertMessages.idMissed);
        expect(testResult.start_date).toBeDefined(ApiAssertMessages.startDateMissed);
        expect(testResult.final_result_id).toBe(4, ApiAssertMessages.finalResultIdWrong);
        expect(testResult.project_id).toBe(projectHelper.project.id, ApiAssertMessages.projecIdWrong);
        expect(testResult.test_id).toBe(test.id, ApiAssertMessages.testIdWrong);
      });

      it('Can not finish Test Result via public API without id', async () => {
        try {
          await projectHelper.publicAPI.testResultFinish({
            project_id: projectHelper.project.id
          });
        } catch (error) {
          atError = error;
        }

        expect(atError).toBeDefined(ApiAssertMessages.errorNotRaised);
        expect(atError.message).toBe(apiResponseErrors.missedId, ApiAssertMessages.errorIsWrong);
      });

      it('Can not finish Test Result via public API without project_id', async () => {
        try {
          await projectHelper.publicAPI.testResultFinish({
            id: testResult.id
          });
        } catch (error) {
          atError = error;
        }

        expect(atError).toBeDefined(ApiAssertMessages.errorNotRaised);
        expect(atError.message).toBe(apiResponseErrors.missedProjectId, ApiAssertMessages.errorIsWrong);
      });

      it('Can not finish Test Result via public API without final_result_id', async () => {
        try {
          await projectHelper.publicAPI.testResultFinish({
            id: testResult.id,
            project_id: projectHelper.project.id
          });
        } catch (error) {
          atError = error;
        }

        expect(atError).toBeDefined(ApiAssertMessages.errorNotRaised);
        expect(atError.message)
          .toBe(apiResponseErrors.missedFinalResultId, ApiAssertMessages.errorIsWrong);
      });

      it('Can not finish Test Result via public API for unaccessible project', async () => {
        try {
          await projectHelper.publicAPI.testResultFinish({
            id: testResult.id,
            final_result_id: 2,
            project_id: unaccessibleId
          });
        } catch (error) {
          atError = error;
        }

        expect(atError).toBeDefined(ApiAssertMessages.errorNotRaised);
        expect(atError.message).toBe(apiResponseErrors.anonymousNotAllowedToViewTestResults, ApiAssertMessages.errorIsWrong);
      });

      it('Can finish Test Result via public API', async () => {
        testResult = await projectHelper.publicAPI.testResultFinish({
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
      try {
        await projectHelper.publicAPI.finishTestRun(projectHelper.project.id, undefined);
      } catch (error) {
        atError = error;
      }

      expect(atError).toBeDefined(ApiAssertMessages.errorNotRaised);
      expect(atError.message).toBe(apiResponseErrors.missedId, ApiAssertMessages.errorIsWrong);
    });

    it('Can not finish Test Run via public API without project_id', async () => {
      try {
        await projectHelper.publicAPI.finishTestRun(undefined, testrun.id);
      } catch (error) {
        atError = error;
      }

      expect(atError).toBeDefined(ApiAssertMessages.errorNotRaised);
      expect(atError.message).toBe(apiResponseErrors.missedProjectId, ApiAssertMessages.errorIsWrong);
    });

    it('Can not finish Test Run via public API for unaccessible project', async () => {
      try {
        await projectHelper.publicAPI.finishTestRun(unaccessibleId, testrun.id);
      } catch (error) {
        atError = error;
      }

      expect(atError).toBeDefined(ApiAssertMessages.errorNotRaised);
      expect(atError.message).toBe(apiResponseErrors.anonymousNotAllowedToCreateTestRun, ApiAssertMessages.errorIsWrong);
    });

    it('Can finish Test Run via public API', async () => {
      const newTestrun: TestRun = await projectHelper.publicAPI.finishTestRun(projectHelper.project.id, testrun.id);

      expect(newTestrun.id).toBe(testrun.id, ApiAssertMessages.idWrong);
      expect(newTestrun.start_time).toBe(testrun.start_time, ApiAssertMessages.startTimeWrong);
      expect(newTestrun.finish_time).not.toBe(testrun.finish_time, ApiAssertMessages.finishTimeWrong);
      expect(testrun.build_name).toBe(buildName, ApiAssertMessages.nameWrong);
      expect(testrun.project_id).toBe(projectHelper.project.id, ApiAssertMessages.projecIdWrong);
      expect(testrun.test_suite_id).toBe(suite.id, ApiAssertMessages.suiteMissed);
    });
  });
});

