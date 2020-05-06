import { TestSuite } from '../../src/app/shared/models/testSuite';
import { Test } from '../../src/app/shared/models/test';
import { TestRun } from '../../src/app/shared/models/testRun';
import { TestResult } from '../../src/app/shared/models/test-result';
import { BaseAPI } from './base.api';

enum Endpoints {
    suite_create_or_update = '/public/suite/create-or-update',
    testrun_start = '/public/testrun/start',
    testrun_finish = '/public/testrun/finish',
    test_result_start = '/public/test/result/start',
    test_result_finish = '/public/test/result/finish',
    test_create_or_update = '/public/test/create-or-update'
}

export class PublicAPI extends BaseAPI {

    public createOrUpdateSuite(suite: TestSuite): Promise<TestSuite> {
        return this.sendPost(Endpoints.suite_create_or_update, undefined, suite);
    }

    public createOrUpdateTest(test: Test): Promise<Test> {
        return this.sendPost(Endpoints.test_create_or_update, undefined, test);
    }

    public startTestrun(testrun: TestRun): Promise<TestRun> {
        return this.sendPost(Endpoints.testrun_start, undefined, testrun);
    }

    public finishTestRun(project_id: number, id: number) {
        return this.sendGet(Endpoints.testrun_finish, { project_id, id });
    }

    public testResultStart(test_id: number, test_run_id: number, project_id: number) {
        return this.sendGet(Endpoints.test_result_start, { test_id, test_run_id, project_id });
    }

    public testResultFinish(testResult: TestResult): Promise<TestResult> {
        return this.sendPost(Endpoints.test_result_finish, undefined, testResult);
    }
}
