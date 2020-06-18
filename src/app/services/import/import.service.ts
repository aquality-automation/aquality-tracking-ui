import { Injectable } from '@angular/core';
import { BaseHttpService } from '../base-http/base-http.service';
import { Import } from 'src/app/shared/models/import';

@Injectable()
export class ImportService extends BaseHttpService {

  upload(importParameters: ImportParameters, fileListArray: File[]) {
    const formData = new FormData();
    for (let i = 0; i < fileListArray.length; i++) {
      const file = fileListArray[i];
      formData.append(`file_${i}`, file, file.name);
    }
    return this.http.post(`/import`, formData, { params: this.convertToParams(importParameters) }).toPromise();
  }

  importResults(projectId: number) {
    return this.http.get<Import[]>(`/import/results`, { params: { project_id: projectId.toString() } }).toPromise();
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
  testrunId: number;
  cilink: string;
  addToLastTestRun: boolean;
  debug: boolean;
}
