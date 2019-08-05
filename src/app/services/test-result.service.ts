import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { SimpleRequester } from './simple-requester';
import { TestResult, TestResultStat } from '../shared/models/test-result';


@Injectable()
export class TestResultService extends SimpleRequester {

  getTestResult(testresult: TestResult): Promise<TestResult[]> {
    testresult.project_id = this.route.snapshot.params['projectId'];
    return this.doGet('/testresult', testresult).map(res => res.json()).toPromise();
  }

  createTestResult(testresult: TestResult): Promise<TestResult> {
    testresult.project_id = this.route.snapshot.params['projectId'];
    return this.doPost('/testresult', testresult).map(res => res.json()).toPromise();
  }

  bulkUpdate(testresults: TestResult[]): Promise<void> {
    testresults.forEach(testresult => {
      testresult.project_id = this.route.snapshot.params['projectId'];
      if (testresult.test_resolution) {
        testresult.test_resolution_id = testresult.test_resolution.id;
      }
      if (testresult.assigned_user) {
        testresult.assignee = testresult.assigned_user.user_id;
      }
    });
    return this.doPut('/testresult', testresults).map(() => {}).toPromise();
  }

  removeTestResult(testresult: TestResult): Promise<void> {
    return this.doDelete(`/testrun?id=${testresult.id}&projectId=${testresult.project_id}`)
      .map(() => this.handleSuccess(`Test result '${testresult.id}' was deleted.`)).toPromise();
  }

  getTestResultsStat(projectId, testRunStartedFrom, testRunStartedTo): Promise<TestResultStat[]> {
    const params = { projectId, testRunStartedFrom, testRunStartedTo };
    return this.doGet(`/stats/testresult`, params).map(res => res.json()).toPromise();
  }
}
