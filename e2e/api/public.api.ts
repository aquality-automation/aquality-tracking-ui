import { TestSuite } from '../../src/app/shared/models/testSuite';
import { Test } from '../../src/app/shared/models/test';
import { TestRun } from '../../src/app/shared/models/testRun';
import { sendPost, sendGet } from '../utils/aqualityTrackingAPI.util';
import { TestResult } from '../../src/app/shared/models/test-result';
import { Project } from '../../src/app/shared/models/project';

enum Endpoints {
    suite_create_or_update = '/public/suite/create-or-update',
    test_create_or_update = '​/public​/test​/create-or-update',
    testrun_start = '/public/testrun/start',
    testrun_finish = '/public/testrun/finish',
    test_result_start = '/public/test/result/start',
    test_result_finish = '/public/test/result/finish'
}

export class PublicAPI {
    project: Project;
    token: string;

    constructor(project: Project, token: string) {
        this.project = project;
        this.token = token;
    }

    public async createOrUpdateSuite(suite: TestSuite): Promise<TestSuite> {
        return sendPost(Endpoints.suite_create_or_update, undefined, suite, this.token, this.project.id);
    }

    public async createOrUpdateTest(test: Test): Promise<Test> {
        return sendPost(Endpoints.test_create_or_update, undefined, test, this.token, this.project.id);
    }

    public async startTestrun(testrun: TestRun): Promise<TestRun> {
        return sendPost(Endpoints.testrun_start, undefined, testrun, this.token, this.project.id);
    }

    public async finishTestRun(project_id: number, id: number) {
        return sendGet(Endpoints.testrun_finish, { project_id, id }, this.token, this.project.id);
    }

    public async testResultStart(test_id: number, test_run_id: number, project_id: number) {
        return sendGet(Endpoints.test_result_start, { test_id, test_run_id, project_id }, this.token, this.project.id);
    }

    public async testResultFinish(testResult: TestResult): Promise<TestResult> {
        return sendPost(Endpoints.test_result_finish, undefined, testResult, this.token, this.project.id);
    }
}
