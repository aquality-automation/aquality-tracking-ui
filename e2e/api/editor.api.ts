import { TestSuite } from '../../src/app/shared/models/testSuite';
import { Test } from '../../src/app/shared/models/test';
import { Step, StepToTest } from '../../src/app/shared/models/steps';
import { TestRun } from '../../src/app/shared/models/testRun';
import { Milestone } from '../../src/app/shared/models/milestone';
import { sendPost, sendGet, sendDelete } from '../utils/aqualityTrackingAPI.util';
import { TestResult } from '../../src/app/shared/models/test-result';
import { Project } from '../../src/app/shared/models/project';

enum Endpoints {
    suite = '/suite',
    test = '/test',
    steps = '/steps',
    testrun = '/testrun',
    milestone = '/milestone',
    testresult = '/testresult',
    testSteps = '/test/steps',
    testToSuite = '/testToSuite'
}

export class EditorAPI {
    project: Project;
    token: string;

    constructor(project: Project, token: string) {
        this.project = project;
        this.token = token;
    }

    public async createSuite(suite: TestSuite): Promise<TestSuite> {
        suite.project_id = this.project.id;
        return sendPost(Endpoints.suite, undefined, suite, this.token, this.project.id);
    }

    public async createTest(test: Test): Promise<Test> {
        test.project_id = this.project.id;
        return sendPost(Endpoints.test, undefined, test, this.token, this.project.id);
    }

    public async createStep(step: Step): Promise<Step> {
        step.project_id = this.project.id;
        return sendPost(Endpoints.steps, undefined, step, this.token, this.project.id);
    }

    public async createTestRun(testrun: TestRun) {
        testrun.project_id = this.project.id;
        return sendPost(Endpoints.testrun, undefined, testrun, this.token, this.project.id);
    }

    public async createMilestone(milestone: Milestone) {
        milestone.project_id = this.project.id;
        return sendPost(Endpoints.milestone, undefined, milestone, this.token, this.project.id);
    }

    public async createResult(testResult: TestResult): Promise<TestResult> {
        return sendPost(Endpoints.testresult, undefined, testResult, this.token, this.project.id);
    }

    public async addStepToTest(stepToTest: StepToTest): Promise<Step> {
        stepToTest.project_id = this.project.id;
        return sendPost(Endpoints.testSteps, undefined, stepToTest, this.token, this.project.id);
    }

    public async addTestToSuite(testId: number, suiteId: number) {
        return sendPost(Endpoints.testToSuite, { testId, suiteId, project_id: this.project.id }, {}, this.token, this.project.id);
    }

    public async getSuites(testSuite: TestSuite): Promise<TestSuite[]> {
        return sendGet(Endpoints.suite, testSuite, this.token, this.project.id);
    }

    public async getTests(test: Test): Promise<Test[]> {
        return sendGet(Endpoints.test, test, this.token, this.project.id);
    }

    public async getResults(testResult: TestResult): Promise<TestResult[]> {
        return sendGet(Endpoints.testresult, testResult, this.token, this.project.id);
    }

    public async getTestRuns(testrun: TestRun): Promise<TestRun[]> {
        return sendGet(Endpoints.testrun, testrun, this.token, this.project.id);
    }

    public async removeTestRun(testRunId: number) {
        return sendDelete(Endpoints.testrun, { id: testRunId, projectId: this.project.id}, null, this.token, this.project.id);
    }
}
