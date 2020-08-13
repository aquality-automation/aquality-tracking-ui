import { Injectable } from '@angular/core';
import { BaseHttpService } from '../base-http/base-http.service';
import { Import } from 'src/app/shared/models/import';
import { ImportType } from 'src/app/shared/models/import-type'
import { ImportTestNameType } from 'src/app/shared/models/import-test-name-type'


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
  MavenSurefire: new ImportType('MavenSurefire', 'Most Java projects are using Maven Surefire Plugin to run tests (both for JUnit and TestNG).', 'https://maven.apache.org/surefire/maven-surefire-plugin/usage.html', 'xml'),
  MSTest: new ImportType('MSTest', 'MSTest generates results files with *.trx extension.', 'https://docs.microsoft.com/en-us/dotnet/core/testing/unit-testing-with-mstest', 'trx'),
  Robot: new ImportType('Robot', 'RobotFramework provides its own reporting. Use output.xml file to import results.', 'https://robotframework.org/robotframework/latest/RobotFrameworkUserGuide.html', 'xml'),
  Cucumber: new ImportType('Cucumber', 'Cucumber provides results in JSON format. This import type can be applied for any programming language implementation of Cucumber (Cucumber JVM, Specflow and etc.).', 'https://cucumber.io/docs/cucumber/reporting/', 'json'),
  PHPCodeception: new ImportType('PHPCodeception', 'For projects based on Codeception tool.', 'https://codeception.com/docs/reference/Commands', 'xml'),
  NUnit_v2: new ImportType('NUnit_v2', 'For projects based on NUnit2.', 'https://docs.nunit.org/articles/nunit/technical-notes/usage/XML-Formats.html', 'xml'),
  NUnit_v3: new ImportType('NUnit_v3', 'For projects based on NUnit3.', 'https://docs.nunit.org/articles/nunit/technical-notes/usage/XML-Formats.html', 'xml')
};

export const importTestNameTypes = {
  Name: new ImportTestNameType('testName'),
  Class: new ImportTestNameType('className'),
  FeatureName: new ImportTestNameType('featureNameTestName'),
  Description: new ImportTestNameType('descriptionNode')
}

export class ImportParameters {
  projectId: number;
  testNameKey: ImportTestNameType;
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
