import { TestSuite } from '../../src/app/shared/models/testSuite';
import { Test } from '../../src/app/shared/models/test';
import { Step, StepToTest } from '../../src/app/shared/models/steps';
import { TestRun } from '../../src/app/shared/models/testRun';
import { Milestone } from '../../src/app/shared/models/milestone';
import { sendPost, sendGet, sendDelete } from '../utils/aqualityTrackingAPI.util';
import { TestResult } from '../../src/app/shared/models/test-result';
import { BaseAPI } from './base.api';
import { Issue } from '../../src/app/shared/models/issue';

enum Endpoints {
    suite = '/suite',
    test = '/test',
    steps = '/steps',
    testrun = '/testrun',
    milestone = '/milestone',
    testresult = '/testresult',
    testSteps = '/test/steps',
    testToSuite = '/testToSuite',
    issue = '/issues'
}

export class EditorAPI extends BaseAPI {

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
        testResult.project_id = this.project.id;
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
        testSuite.project_id = this.project.id;
        return sendGet(Endpoints.suite, testSuite, this.token, this.project.id);
    }

    public async getTests(test: Test): Promise<Test[]> {
        return sendGet(Endpoints.test, test, this.token, this.project.id);
    }

    public async getResults(testResult: TestResult): Promise<TestResult[]> {
        testResult.project_id = this.project.id;
        return sendGet(Endpoints.testresult, testResult, this.token, this.project.id);
    }

    public async getTestRuns(testrun: TestRun): Promise<TestRun[]> {
        return sendGet(Endpoints.testrun, testrun, this.token, this.project.id);
    }

    public async getMilestones(milestone: Milestone): Promise<Milestone[]> {
        milestone.project_id = this.project.id;
        return sendGet(Endpoints.milestone, milestone, this.token, this.project.id);
    }

    public async removeTestRun(testRunId: number) {
        return sendDelete(Endpoints.testrun, { id: testRunId, project_id: this.project.id }, null, this.token, this.project.id);
    }

    public async createIssue(issue: Issue): Promise<Issue> {
        issue.project_id = this.project.id;
        issue.creator_id = 1;
        return sendPost(Endpoints.issue, undefined, issue, this.token, this.project.id);
    }

    public async addSuiteToMilestone(milestoneName: string, suiteName: string) {
        const milestone: Milestone = (await this.getMilestones({ name: milestoneName }))[0];
        const suite: TestSuite = (await this.getSuites({ name: suiteName }))[0];
        if (milestone.suites) {
            milestone.suites.push(suite);
        } else {
            milestone.suites = [suite];
        }
        return this.createMilestone(milestone);
    }
}
