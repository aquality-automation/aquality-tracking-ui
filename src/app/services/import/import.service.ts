import { Injectable } from '@angular/core';
import { BaseHttpService } from '../base-http/base-http.service';
import { Import } from 'src/app/shared/models/imports/import';
import { ImportType } from 'src/app/shared/models/imports/import-type'
import { ImportTestNameType } from 'src/app/shared/models/imports/import-test-name-type'
import { ImportProcessType } from 'src/app/shared/models/imports/import-process-type';


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
  MavenSurefire: new ImportType('MavenSurefire', 'Most Java projects are using Maven Surefire Plugin to run tests (both for JUnit and TestNG).', 'https://maven.apache.org/surefire/maven-surefire-plugin/usage.html', 'xml', true),
  MSTest: new ImportType('MSTest', 'MSTest generates results files with *.trx extension.', 'https://docs.microsoft.com/en-us/dotnet/core/testing/unit-testing-with-mstest', 'trx', true),
  Robot: new ImportType('Robot', 'RobotFramework provides its own reporting. Use output.xml file to import results.', 'https://robotframework.org/robotframework/latest/RobotFrameworkUserGuide.html', 'xml', false),
  Cucumber: new ImportType('Cucumber', 'Cucumber provides results in JSON format. This import type can be applied for any programming language implementation of Cucumber (Cucumber JVM, Specflow and etc.).', 'https://cucumber.io/docs/cucumber/reporting/', 'json', false),
  PHPCodeception: new ImportType('PHPCodeception', 'For projects based on Codeception tool.', 'https://codeception.com/docs/reference/Commands', 'xml', false),
  NUnit_v2: new ImportType('NUnit_v2', 'For projects based on NUnit2.', 'https://docs.nunit.org/articles/nunit/technical-notes/usage/XML-Formats.html', 'xml', false),
  NUnit_v3: new ImportType('NUnit_v3', 'For projects based on NUnit3.', 'https://docs.nunit.org/articles/nunit/technical-notes/usage/XML-Formats.html', 'xml', true)
};

export const importTestNameTypes = {
  Name: new ImportTestNameType('testName', 'Test Name', 'Attribute "name" will be used as test name'),
  Class: new ImportTestNameType('className', 'Test Class', 'Attribute "classname" will be used as test name'),
  FeatureName: new ImportTestNameType('featureNameTestName', 'Scenario Name', 'Scenario name will be used as test name'),
  Description: new ImportTestNameType('descriptionNode', 'Test Description', 'Attribute "description" will be used as test name')
}

export const importProcessTypes = {
  TestRunPerFile: new ImportProcessType("testRunPerFile", "Test Run For Each File", "For each results file, the new test run will be created"),
  SingleTestRun: new ImportProcessType("singleTestRun", "Single Test Run", "Results from all files will be imported into a new single test run"),
  AddToLastTestRun: new ImportProcessType("addToLastTestRun", "Add To Last Test Run", "Add results from the file(s) into the last test run")
}

export class ImportParameters {
  projectId: number;
  testNameKey: string;
  singleTestRun: boolean;
  addToLastTestRun: boolean;
  environment: string;
  pattern: string;
  format: string;
  suite: string;
  author: string;
  buildName: string;
  testrunId: number;
  cilink: string;
  debug: boolean;
}
