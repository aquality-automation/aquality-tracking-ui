import { TestSuite } from '../../../src/app/shared/models/testSuite';
import { ProjectHelper } from '../../helpers/project.helper';
import { TestRun } from '../../../src/app/shared/models/testRun';
import { Test } from '../../../src/app/shared/models/test';
import { TestResult } from '../../../src/app/shared/models/test-result';

let suite: TestSuite;
let test: Test;
let testrun: TestRun;
let testResult: TestResult;


fdescribe('Application API', () => {
  const projectHelper: ProjectHelper = new ProjectHelper();

  beforeAll(async () => {
    await projectHelper.init();
  });

  afterAll(async () => {
    await projectHelper.dispose();
  });

  describe('Suite:', () => {
    it('Can not create Suite via public API without name and id', async () => {
      await projectHelper.publicAPI.createOrUpdateSuite({
        project_id: projectHelper.project.id
      });
    });

    it('Can not create Suite via public API without project_id', async () => {
      await projectHelper.publicAPI.createOrUpdateSuite({
        name: 'My Suite'
      });
    });

    it('Can not create Suite via public API for unaccessible project', async () => {
      await projectHelper.publicAPI.createOrUpdateSuite({
        name: 'My Suite',
        project_id: 100000
      });
    });

    it('Can create Suite via public API', async () => {
      suite = await projectHelper.publicAPI.createOrUpdateSuite({
        name: 'My Suite',
        project_id: projectHelper.project.id
      });
    });

    it('Can update Suite via public API with id', async () => {
      suite = await projectHelper.publicAPI.createOrUpdateSuite({
        id: suite.id,
        name: 'My Edited Suite',
        project_id: projectHelper.project.id
      });
    });

    it('Existing suite returned when trying to add duplicate', async () => {
      suite = await projectHelper.publicAPI.createOrUpdateSuite({
        name: 'My Edited Suite',
        project_id: projectHelper.project.id
      });
    });
  });

  describe('Test:', () => {
    it('Can not create Test via public API without name and id', async () => {
    });

    it('Can not create Test via public API without project', async () => {
    });

    it('Can not create Test via public API without suites', async () => {
    });

    it('Can not create Test via public API without project_id', async () => {
    });

    it('Can not create Test via public API for unaccessible project', async () => {
    });

    it('Can create Test via public API', async () => {
    });

    it('Can update Test via public API with id', async () => {
    });

    it('Can update Test via public API with name', async () => {
    });
  });

  describe('Test Run:', () => {
    it('Can not create Test Run via public API without build_name', async () => {
    });

    it('Can not create Test Run via public API without test_suite_id', async () => {
    });

    it('Can not create Test Run via public API without project_id', async () => {
    });

    it('Can not create Test Run via public API for unaccessible project', async () => {
    });

    it('Can start Test Run via public API', async () => {
    });


    describe('Test Result:', () => {
      it('Can not start Test Result via public API without test_id', async () => {
      });

      it('Can not start Test Result via public API without test_run_id', async () => {
      });

      it('Can not start Test Result via public API without project_id', async () => {
      });

      it('Can not start Test Result via public API for unaccessible project', async () => {
      });

      it('Can start Test Result via public API', async () => {
      });

      it('Can not finish Test Result via public API without id', async () => {
      });

      it('Can not finish Test Result via public API without project_id', async () => {
      });

      it('Can not finish Test Result via public API for unaccessible project', async () => {
      });

      it('Can finish Test Result via public API', async () => {
      });
    });

    it('Can not finish Test Run via public API without id', async () => {
    });

    it('Can not finish Test Run via public API without project_id', async () => {
    });

    it('Can not finish Test Run via public API for unaccessible project', async () => {
    });

    it('Can finish Test Run via public API', async () => {
    });
  });
});

