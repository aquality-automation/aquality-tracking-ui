import { TestSuite } from '../../../src/app/shared/models/test-suite';
import { Test } from '../../../src/app/shared/models/test';
import { Step, StepToTest } from '../../../src/app/shared/models/steps';
import { TestRun } from '../../../src/app/shared/models/testrun';
import { Milestone } from '../../../src/app/shared/models/milestones/milestone';
import { TestResult, TestResultAttachment } from '../../../src/app/shared/models/test-result';
import { BaseAPI } from './base.api';
import { Issue } from '../../../src/app/shared/models/issue';

enum Endpoints {
    suite = '/suite',
    test = '/test',
    steps = '/steps',
    testrun = '/testrun',
    milestone = '/milestone',
    testresult = '/testresult',
    testSteps = '/test/steps',
    testToSuite = '/testToSuite',
    issue = '/issues',
    testResultAttachment = '/testresult/attachment'
}

export class EditorAPI extends BaseAPI {

    public async createSuite(suite: TestSuite): Promise<TestSuite> {
        suite.project_id = this.project.id;
        return this.sendPost(Endpoints.suite, undefined, suite);
    }

    public async createTest(test: Test): Promise<Test> {
        test.project_id = this.project.id;
        return this.sendPost(Endpoints.test, undefined, test);
    }

    public async createStep(step: Step): Promise<Step> {
        step.project_id = this.project.id;
        return this.sendPost(Endpoints.steps, undefined, step);
    }

    public async createTestRun(testrun: TestRun) {
        testrun.project_id = this.project.id;
        return this.sendPost(Endpoints.testrun, undefined, testrun);
    }

    public async createMilestone(milestone: Milestone) {
        milestone.project_id = this.project.id;
        return this.sendPost(Endpoints.milestone, undefined, milestone);
    }

    public async createResult(testResult: TestResult): Promise<TestResult> {
        testResult.project_id = this.project.id;
        return this.sendPost(Endpoints.testresult, undefined, testResult);
    }

    public async addStepToTest(stepToTest: StepToTest): Promise<Step> {
        stepToTest.project_id = this.project.id;
        return this.sendPost(Endpoints.testSteps, undefined, stepToTest);
    }

    public async addTestToSuite(testId: number, suiteId: number) {
        return this.sendPost(Endpoints.testToSuite, { testId, suiteId, project_id: this.project.id }, {});
    }

    public async getSuites(testSuite: TestSuite): Promise<TestSuite[]> {
        testSuite.project_id = this.project.id;
        return this.sendGet(Endpoints.suite, testSuite);
    }

    public async getTests(test: Test): Promise<Test[]> {
        return this.sendGet(Endpoints.test, test);
    }

    public async getResults(testResult: TestResult): Promise<TestResult[]> {
        testResult.project_id = this.project.id;
        return this.sendGet(Endpoints.testresult, testResult);
    }

    public async getTestRuns(testrun: TestRun): Promise<TestRun[]> {
        return this.sendGet(Endpoints.testrun, testrun);
    }

    public async getMilestones(milestone: Milestone): Promise<Milestone[]> {
        milestone.project_id = this.project.id;
        return this.sendGet(Endpoints.milestone, milestone);
    }

    public async createIssue(issue: Issue): Promise<Issue> {
        issue.project_id = this.project.id;
        issue.creator_id = 1;
        return this.sendPost(Endpoints.issue, undefined, issue);
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

    public async addTestResultAttachment(
        testResultAttachment: TestResultAttachment,
        files: string[],
        fileNames: string[]) {
        return this.sendPostFiles(Endpoints.testResultAttachment,
            {
                project_id: this.project.id,
                test_result_id: testResultAttachment.test_result_id
            },
            files, fileNames, this.token, this.project.id);
    }
}
