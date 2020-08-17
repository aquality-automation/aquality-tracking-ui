import { Injectable } from '@angular/core';
import { BaseHttpService } from '../base-http/base-http.service';
import { TestResult, TestResultStat, TestResultAttachment } from 'src/app/shared/models/test-result';


@Injectable()
export class TestResultService extends BaseHttpService {

  getTestResult(testresult: TestResult): Promise<TestResult[]> {
    testresult = this.setProjectId(testresult);
    return this.http.get<TestResult[]>('/testresult', { params: this.convertToParams(testresult) }).toPromise();
  }

  getTestResultAttachments(testResultAttachment: TestResultAttachment): Promise<TestResultAttachment[]> {
      this.setProjectId(testResultAttachment);
      return this.http.get<TestResultAttachment[]>('/testresult/attachment',
       { params: this.convertToParams(testResultAttachment) }).toPromise();
  }

  createTestResult(testresult: TestResult): Promise<TestResult> {
    testresult.project_id = this.currentProjectId;
    return this.http.post<TestResult>('/testresult', testresult).toPromise();
  }

  bulkUpdate(testresults: TestResult[]): Promise<void> {
    testresults.forEach(testresult => {
      testresult = this.setProjectId(testresult);
      if (testresult.issue) {
        testresult.issue_id = testresult.issue.id;
      }
    });
    return this.http.put<void>('/testresult', testresults).toPromise();
  }

  async removeTestResult(testresult: TestResult): Promise<void> {
    testresult = this.setProjectId(testresult);
    await this.http.delete(`/testrun`, { params: this.convertToParams(testresult) }).toPromise();
    this.handleSuccess(`Test result '${testresult.id}' was deleted.`);
  }

  getTestResultsStat(project_id: number, testrunStartedFrom: string, testrunStartedTo: string): Promise<TestResultStat[]> {
    const params = { project_id: project_id.toString(), testrunStartedFrom, testrunStartedTo };
    return this.http.get<TestResultStat[]>(`/stats/testresult`, { params }).toPromise();
  }

  private setProjectId(testResult: TestResult): TestResult {
    if (!testResult.project_id) {
      testResult.project_id = this.currentProjectId;
    }

    return testResult;
  }
}
