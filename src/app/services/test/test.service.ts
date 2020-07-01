import { Injectable } from '@angular/core';
import { BaseHttpService } from '../base-http/base-http.service';
import { Test } from 'src/app/shared/models/test';
import { TestSuite } from 'src/app/shared/models/test-suite';

@Injectable()
export class TestService extends BaseHttpService {

  getTest(test: Test, numberOfResults: number = 10000): Promise<Test[]> {
    const params = this.convertToParams({
      id: test.id,
      project_id: test.project_id,
      test_suite_id: test.test_suite_id,
      name: test.name,
      developer_id: test.developer_id,
      numberOfResults
    });
    return this.http.get<Test[]>('/test', { params }).toPromise();
  }

  getTestByIssue(byIssue: { issueId: number, projectId: number }): Promise<Test[]> {
    return this.http.get<Test[]>('/test/issue', { params: this.convertToParams(byIssue) }).toPromise();
  }

  async createTest(test: Test): Promise<Test> {
    const result = await this.http.post('/test', test).toPromise();
    this.handleSuccess(`Test '${test.name}' was updated.`);
    return result;
  }

  async bulkUpdate(tests: Test[]) {
    await this.http.put('/test', tests).toPromise();
    this.handleSuccess(`Tests were updated.`);
  }

  async addTestToTestSuite(test: Test, suite: TestSuite) {
    await this.http.post(`/testToSuite`, { testId: test.id, suiteI: suite.id, project_id: suite.project_id }).toPromise();
    this.handleSuccess(`Test '${test.name}' was added to '${suite.name}' suite.`);
  }

  async emoveTestFromTestSuite(test: Test, suite: TestSuite) {
    await this.http.delete(`/testToSuite`, {
      params: {
        testId: test.id.toString(), suiteId: suite.id.toString(), project_id: suite.project_id.toString()
      }
    }).toPromise();
    this.handleSuccess(`Test '${test.name}' was removed from '${suite.name}' suite.`);
  }

  moveTest(from: Test, to: Test, remove: boolean, project_id: number) {
    return this.http.get(`/test/move`, {
      params: {
        from: from.id.toString(), to: to.id.toString(), remove: String(remove), project_id: project_id.toString()
      }
    }).toPromise();
  }

  async removeTest(test: Test) {
    await this.http.delete(`/test`, {
      params: { id: test.id.toString(), project_id: test.project_id.toString() }
    }).toPromise();
    this.handleSuccess(`Test '${test.name}' was deleted.`);
  }

  public getResultWeights(): { value: number, weight: number } [] {
  return [
    { value: 5, weight: 0 },
    { value: 1, weight: 2 },
    { value: 2, weight: 4 },
    { value: 3, weight: 4 },
    { value: 4, weight: 1 },
  ];
}

  public getLastResultsId(entity: Test): number[] {
  if (entity && entity.result_ids) {
    return JSON.parse(`[${entity.result_ids}]`) as number[];
  }

  return [];
}

  public combineLastResults(entity: Test): number[] {
  const combinedColors: number[] = [];
  if (entity && entity.resolution_colors && entity.result_colors) {
    const resolutionColors = entity.resolution_colors.split(',');
    const resultColors = entity.result_colors.split(',');
    for (let i = 0; i < resultColors.length; i++) {
      const resultColor = resultColors[i];
      if (+resultColor === 5) {
        combinedColors.push(+resultColor);
      } else {
        combinedColors.push(+resolutionColors[i]);
      }
    }
  }

  return combinedColors;
}
}
