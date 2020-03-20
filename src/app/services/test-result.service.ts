import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { SimpleRequester } from './simple-requester';
import { TestResult, TestResultStat } from '../shared/models/test-result';


@Injectable()
export class TestResultService extends SimpleRequester {

  getTestResult(testresult: TestResult): Promise<TestResult[]> {
    testresult = this.setProjectId(testresult);
    return this.doGet('/testresult', testresult).map(res => res.json()).toPromise();
  }

  createTestResult(testresult: TestResult): Promise<TestResult> {
    testresult.project_id = this.route.snapshot.params['projectId'];
    return this.doPost('/testresult', testresult).map(res => res.json()).toPromise();
  }

  bulkUpdate(testresults: TestResult[]): Promise<void> {
    testresults.forEach(testresult => {
      testresult = this.setProjectId(testresult);
      if (testresult.issue) {
        testresult.issue_id = testresult.issue.id;
      }
    });
    return this.doPut('/testresult', testresults).map(() => {}).toPromise();
  }

  removeTestResult(testresult: TestResult): Promise<void> {
    testresult = this.setProjectId(testresult);
    return this.doDelete(`/testrun?id=${testresult.id}&project_id=${testresult.project_id}`)
      .map(() => this.handleSuccess(`Test result '${testresult.id}' was deleted.`)).toPromise();
  }

  getTestResultsStat(project_id: number, testRunStartedFrom: string, testRunStartedTo: string): Promise<TestResultStat[]> {
    const params = { project_id, testRunStartedFrom, testRunStartedTo };
    return this.doGet(`/stats/testresult`, params).map(res => res.json()).toPromise();
  }

  private setProjectId(testResult: TestResult): TestResult {
    if (!testResult.project_id) {
      testResult.project_id = this.route.snapshot.params.projectId;
    }

    return testResult;
  }
}
