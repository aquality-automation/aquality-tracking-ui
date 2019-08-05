import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { SimpleRequester } from './simple-requester';
import { TestSuite, SuiteDashboard } from '../shared/models/testSuite';


@Injectable()
export class TestSuiteService extends SimpleRequester {

  getTestSuite(testsuite: TestSuite, overlay: boolean = true): Promise<TestSuite[]> {
    testsuite.project_id = this.route.snapshot.params['projectId'];
    return this.doGet('/suite', testsuite, overlay).map(res => res.json()).toPromise<TestSuite[]>();
  }

  getTestSuiteWithChilds(testsuite: TestSuite): Promise<TestSuite[]> {
    testsuite.project_id = this.route.snapshot.params['projectId'];
    testsuite['withChildren'] = 1;
    return this.doGet(`/suite`, testsuite).map(res => res.json()).toPromise();
  }

  getTestSuiteStat(testsuite: TestSuite) {
    const params = {
      projectId: this.route.snapshot.params['projectId']
    };
    if (testsuite.id) { params['suiteId'] = testsuite.id; }

    return this.doGet(`/suite/stat`, params).map(res => res.json());
  }

  createTestSuite(testsuite: TestSuite): Promise<TestSuite> {
    return this.doPost('/suite', testsuite).map(res => res.json()).toPromise();
  }

  removeTestSuite(testSuite: TestSuite): Promise<void> {
    return this.doDelete(`/suite?id=${testSuite.id}&projectId=${testSuite.project_id}`)
      .map(() => this.handleSuccess(`Test Suite '${testSuite.name}' was deleted.`)).toPromise();
  }

  getSuiteDashboards(projectId: number): Promise<SuiteDashboard[]> {
    const params = { project_id: projectId };
    return this.doGet(`/suite/dashboard`, params).map(res => res.json()).toPromise();
  }

  removeSuiteDashboard(id: number): Promise<void> {
    const params = { id };
    return this.doDelete(`/suite/dashboard`, params)
      .map(() => this.handleSuccess(`Dashboard was deleted.`)).toPromise();
  }

  createSuiteDashboard(suiteDashboard: SuiteDashboard): Promise<SuiteDashboard> {
    return this.doPost(`/suite/dashboard`, suiteDashboard).map(res => res.json()).toPromise();
  }
}
