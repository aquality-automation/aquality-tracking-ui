import { Injectable } from '@angular/core';
import { BaseHttpService } from '../base-http/base-http.service';
import { TestRun, TestRunLabel } from 'src/app/shared/models/testrun';
import { TestRunStat } from 'src/app/shared/models/testrun-stats';
import { User } from 'src/app/shared/models/user';

@Injectable()
export class TestRunService extends BaseHttpService {

  getTestRun(testrun: TestRun, limit: number = 0): Promise<TestRun[]> {
    testrun = this.setProjectId(testrun);
    testrun['limit'] = limit;
    return this.http.get<TestRun[]>(`/testrun`, { params: this.convertToParams(testrun) }).toPromise();
  }

  getTestRunWithChilds(testrun: TestRun, limit: number = 0): Promise<TestRun[]> {
    testrun = this.setProjectId(testrun);
    testrun['limit'] = limit;
    testrun['withChildren'] = 1;
    return this.http.get<TestRun[]>(`/testrun`, { params: this.convertToParams(testrun) }).toPromise();
  }

  createTestRun(testrun: TestRun): Promise<TestRun> {
    testrun = this.setProjectId(testrun);
    if (testrun.testResults) {
      testrun.testResults = undefined;
    }
    return this.http.post<TestRun>('/testrun', testrun).toPromise();
  }

  async removeTestRun(toRemove: TestRun | TestRun[]): Promise<void> {
    if (Array.isArray(toRemove)) {
      await this.http.request('delete', `/testrun`, { body: toRemove }).toPromise();
      this.handleSuccess(`Test runs were deleted.`);
    }
    const testrun = this.setProjectId(toRemove as TestRun);
    await this.http.delete(`/testrun`, { params: this.convertToParams({ id: testrun.id, project_id: testrun.project_id }) }).toPromise();
    this.handleSuccess(`Test run '${testrun.build_name}/${testrun.start_time}' was deleted.`);
  }

  getTestsRunStats(testrun: TestRun, overlay: boolean = true): Promise<TestRunStat[]> {
    testrun = this.setProjectId(testrun);
    return this.http.get<TestRunStat[]>('/stats/testrun', { params: this.convertToParams(testrun) }).toPromise();
  }

  getTestsRunLabels(id?: number) {
    const queryParams: TestRunLabel = { id };
    return this.http.get<TestRunLabel[]>(`/testrun/labels`, { params: this.convertToParams(queryParams) }).toPromise();
  }

  sendReport(testrun: TestRun, users: User[]) {
    return this.http.post(`/testrun/report`, users, { params: { test_run_id: testrun.id.toString() } }).toPromise();
  }

  calculateDuration(testrun: TestRun | TestRunStat): string {
    const start_time = new Date(testrun.start_time);
    const finish_time = new Date(testrun.finish_time);
    const duration = (finish_time.getTime() - start_time.getTime()) / 1000;
    const hours = (duration - duration % 3600) / 3600;
    const minutes = (duration - hours * 3600 - (duration - hours * 3600) % 60) / 60;
    const seconds = duration - (hours * 3600 + minutes * 60);
    return hours + 'h:' + minutes + 'm:' + seconds + 's';
  }

  getPassRate(stat: TestRunStat): string | number {
    return stat ? ((stat.passed / stat.total) * 100).toFixed(2) : 0;
  }

  private setProjectId(testrun: TestRun): TestRun {
    if (!testrun.project_id) {
      testrun.project_id = this.currentProjectId;
    }
    return testrun;
  }
}
