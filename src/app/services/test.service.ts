import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { SimpleRequester } from './simple-requester';
import { Test } from '../shared/models/test';
import { TestSuite } from '../shared/models/testSuite';


@Injectable()
export class TestService extends SimpleRequester {

  getTest(test: Test, withChildren: boolean = false, numberOfResults: number = 10000) {
    const params: { [key: string]: any | any[]; } = {
      id: test.id,
      project_id: test.project_id,
      test_suite_id: test.test_suite_id,
      name: test.name,
      developer_id: test.developer_id,
      withChildren: withChildren ? 1 : 0,
      numberOfResults
    };
    return this.doGet('/test', params).map(res => res.json());
  }

  createTest(test: Test) {
    return this.doPost('/test', test).map(res => {
      this.handleSuccess(`Test '${test.name}' was updated.`);
      return res.headers.get('id');
    });
  }

  bulkUpdate(tests: Test[]) {
    return this.doPut('/test', tests).map(() => {
      this.handleSuccess(`Tests were updated.`);
    });
  }

  addTestToTestSuite(test: Test, suite: TestSuite) {
    return this.doPost(`/testToSuite?testId=${test.id}&suiteId=${suite.id}&projectId=${suite.project_id}`).map(() => {
      this.handleSuccess(`Test '${test.name}' was added to '${suite.name}' suite.`);
    });
  }

  removeTestFromTestSuite(test: Test, suite: TestSuite) {
    return this.doDelete(`/testToSuite?testId=${test.id}&suiteId=${suite.id}&projectId=${suite.project_id}`).map(() => {
      this.handleSuccess(`Test '${test.name}' was removed from '${suite.name}' suite.`);
    });
  }

  moveTest(from: Test, to: Test, remove: boolean, project_id: number) {
    return this.doGet(`/test/move?from=${from.id}&to=${to.id}&remove=${remove}&projectId=${project_id}`).map(() => { });
  }

  removeTest(test: Test) {
    return this.doDelete(`/test?id=${test.id}&projectId=${test.project_id}`)
    .map(() => this.handleSuccess(`Test '${test.name}' was deleted.`));
  }
}
