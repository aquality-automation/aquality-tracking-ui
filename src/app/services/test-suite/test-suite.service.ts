import { Injectable } from '@angular/core';
import { BaseHttpService } from '../base-http/base-http.service';
import { TestSuite, TestSuiteStat, SuiteDashboard } from 'src/app/shared/models/test-suite';
import { Test } from 'src/app/shared/models/test';


@Injectable()
export class TestSuiteService extends BaseHttpService {

  getTestSuite(testsuite: TestSuite): Promise<TestSuite[]> {
    if (!testsuite.project_id) {
      testsuite.project_id = this.currentProjectId;
    }
    return this.http.get<TestSuite[]>('/suite', { params: this.convertToParams(testsuite) }).toPromise();
  }

  getTestSuiteWithChilds(testsuite: TestSuite): Promise<TestSuite[]> {
    testsuite.project_id = this.currentProjectId;
    testsuite['withChildren'] = 1;
    return this.http.get<TestSuite[]>(`/suite`, { params: this.convertToParams(testsuite) }).toPromise();
  }

  getTestSuiteStat(testsuite: TestSuite) {
    const params = {
      projectId: this.currentProjectId.toString()
    };
    if (testsuite.id) { params['suiteId'] = testsuite.id; }

    return this.http.get<TestSuiteStat[]>(`/stats/suite`, { params }).toPromise();
  }

  createTestSuite(testsuite: TestSuite): Promise<TestSuite> {
    return this.http.post<TestSuite>('/suite', testsuite).toPromise();
  }

  async removeTestSuite(testSuite: TestSuite): Promise<void> {
    await this.http.delete(`/suite`, { params: { id: testSuite.id.toString(), project_id: testSuite.project_id.toString() } }).toPromise();
    this.handleSuccess(`Test Suite '${testSuite.name}' was deleted.`);
  }

  getSuiteDashboards(projectId: number): Promise<SuiteDashboard[]> {
    const params = { project_id: projectId.toString() };
    return this.http.get<SuiteDashboard[]>(`/suite/dashboard`, { params }).toPromise();
  }

  async removeSuiteDashboard(id: number): Promise<void> {
    await this.http.delete(`/suite/dashboard`, { params: { id: id.toString() } }).toPromise();
    this.handleSuccess(`Dashboard was deleted.`);
  }

  createSuiteDashboard(suiteDashboard: SuiteDashboard): Promise<SuiteDashboard> {
    return this.http.post<SuiteDashboard>(`/suite/dashboard`, suiteDashboard).toPromise();
  }

  syncSuite(tests: Test[], suiteId: number, removeNotExecutedResults: boolean) {
    const project_id = this.currentProjectId;
    return this.http.post(`/suite/sync`, tests,
      { params: this.convertToParams({ project_id, suiteId, removeNotExecutedResults }) }).toPromise();
  }

  findTestToSync(notExecutedFor: number, suiteId: number): Promise<Test[]> {
    const project_id = this.currentProjectId;
    return this.http.get<Test[]>('/suite/sync',
      { params: this.convertToParams({ project_id, notExecutedFor, suiteId }) }).toPromise();
  }
}
