import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { SimpleRequester } from './simple-requester';


@Injectable()
export class ImportService extends SimpleRequester {

  upload(importParameters: ImportParameters, fileListArray: File[]) {
    return this.doPostFiles(`/import`, fileListArray, importParameters)
      .map(res => res);
  }

  importResults(projectId: number) {
    return this.doGet(`/import/results?project_id=${projectId}`)
      .map(res => res.json());
  }
}

export const importTypes = {
  MSTest: 'MSTest',
  Robot: 'Robot',
  TestNG: 'TestNG',
  Cucumber: 'Cucumber',
  PHPCodeception: 'PHPCodeception',
  NUnit_v2: 'NUnit_v2',
  NUnit_v3: 'NUnit_v3',
  JUnit: 'JUnit'
};

export class ImportParameters {
  projectId: number;
  testNameKey: string;
  environment: string;
  pattern: string;
  format: string;
  suite: string;
  singleTestRun: boolean;
  author: string;
  buildName: string;
  testRunId: number;
  cilink: string;
  addToLastTestRun: boolean;
  debug: boolean;
}
