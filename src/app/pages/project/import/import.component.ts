import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ImportBodyPattern } from '../../../shared/models/project';
import { ProjectService } from '../../../services/project.service';
import { ImportService, ImportParameters, importTypes } from '../../../services/import.service';
import { TransformationsService } from '../../../services/transformations.service';
import { TestSuite } from '../../../shared/models/testSuite';
import { TestSuiteService } from '../../../services/testSuite.service';
import { TestRun } from '../../../shared/models/testRun';
import { TestRunService } from '../../../services/testRun.service';
import { Import } from '../../../shared/models/import';

@Component({
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.css'],
  providers: [
    ImportService,
    ProjectService,
    TransformationsService,
    TestRunService,
    TestSuiteService
  ]
})
export class ImportComponent {
  testNameOptions:
    {
      testName: boolean;
      testDescription: boolean;
      featureTest: boolean;
      testClassName: boolean;
      selectedKey?: '' | 'testName' | 'featureNameTestName' | 'className' | 'descriptionNode';
    };
  importParameters: ImportParameters = new ImportParameters();
  suites: TestSuite[];
  suite: TestSuite;
  testRuns: TestRun[] = [];
  testRun: TestRun;
  fileListArray: File[];
  fileStatusArray: {}[] = [];
  uploadedArray: {}[] = [];
  loadingInProgress: boolean;
  pattern: ImportBodyPattern;
  bodyPatterns: ImportBodyPattern[];
  format: { name: string, key: string };
  importResults: Import[];
  resultsColumnsToShow: any[];
  timerToken: any;
  statuses: { name: string, color: number }[] = [{
    name: 'Finished',
    color: 5
  }, {
    name: 'In Progress',
    color: 2
  }];
  sortBy = { order: 'asc', property: 'started' };
  imports: { name: string, key: string }[] = [
    { name: 'MSTest (.trx)', key: importTypes.MSTest },
    { name: 'Robot (.xml)', key: importTypes.Robot },
    { name: 'TestNG (.xml)', key: importTypes.TestNG },
    { name: 'Cucumber (.json)', key: importTypes.Cucumber },
    { name: 'PHP Codeception (.xml)', key: importTypes.PHPCodeception },
    { name: 'NUnit v2 (.xml)', key: importTypes.NUnit_v2 },
    { name: 'NUnit v3 (.xml)', key: importTypes.NUnit_v3 }
  ];

  constructor(
    private importService: ImportService,
    private importServiceForUpload: ImportService,
    private suiteService: TestSuiteService,
    private projectService: ProjectService,
    private testrunService: TestRunService,
    private route: ActivatedRoute
  ) {
    this.testNameOptions = this.testNameTypes();
    this.projectService.getImportBodyPatterns({ project_id: this.route.snapshot.params.projectId }).subscribe(res => {
      this.bodyPatterns = res;
    });
    this.suiteService.getTestSuite({ project_id: this.route.snapshot.params.projectId }).then(res => {
      this.suites = res;
    });

    this.getImportResults();
  }

  private getImportResults() {
    this.importService.importResults(this.route.snapshot.params.projectId).subscribe(res => {
      this.importResults = res;
      this.importResults.forEach(result => {
        result['status'] = result.is_finished === 1
          ? this.statuses.find(status => status.color === 5)
          : this.statuses.find(status => status.color === 2);
      });
      this.resultsColumnsToShow = [
        {
          name: 'Status',
          property: 'status.name',
          filter: true,
          sorting: true,
          type: 'lookup-colored',
          entity: 'status',
          values: this.statuses,
          editable: false,
          class: 'fit'
        },
        { name: 'Test Run ID', property: 'testrun_id', filter: false, sorting: true, type: 'text', class: 'fit' },
        { name: 'Started', property: 'started', filter: true, sorting: true, type: 'date', class: 'fit' },
        { name: 'Finished', property: 'finished', filter: true, sorting: true, type: 'date', class: 'fit' },
        { name: 'Logs', property: 'log', filter: true, sorting: true, type: 'long-text', editable: false, class: 'ft-width-250' }
      ];
    });
  }

  fileChange(event) {
    if (this.fileListArray === undefined) {
      this.fileListArray = Array.from(event.target.files);
    } else {
      this.fileListArray = this.fileListArray.concat(Array.from(event.target.files));
    }
    for (const f of event.target.files) {
      this.fileStatusArray.push(false);
    }
    event.target.value = '';
  }

  removeAll() {
    this.fileListArray.splice(0, this.fileListArray.length);
  }

  remove(file: File) {
    const index = this.fileListArray.indexOf(file);
    if (index > -1) {
      this.fileListArray.splice(index, 1);
    }
  }

  async uploadAll(event) {
    return this.uploadFiles(this.fileListArray, event);
  }

  async upload(file: File, event) {
    return this.uploadFiles([file], event);
  }

  async uploadFiles(files: File[], event) {
    const filesToImport = [...files];
    const oldname = event.target.textContent;
    this.setButtonInProgress(event);
    this.loadingInProgress = true;
    try {
      this.buildParams();
      await this.importServiceForUpload.upload(this.importParameters, filesToImport).toPromise();
      for (let i = 0; i < filesToImport.length; i++) {
        const index = this.fileListArray.indexOf(filesToImport[i]);
        if (index > -1) {
          this.uploadedArray.push(this.fileListArray[index]);
          this.fileListArray.splice(index, 1);
        }
      }
    } catch (error) {
      this.importService.handleError(error);
    } finally {
      this.loadingInProgress = false;
      this.setButtonImport(event, oldname);
    }
  }

  setButtonInProgress(event) {
    event.target.classList.add('btn-warning');
    event.target.classList.remove('btn-success');
    event.target.textContent = 'In Progress';
  }

  setButtonImport(event, name: string) {
    event.target.classList.remove('btn-warning');
    event.target.classList.add('btn-success');
    event.target.textContent = name;
  }

  buildParams() {
    this.importParameters.projectId = this.route.snapshot.params.projectId;
    this.importParameters.testNameKey = this.testNameOptions.selectedKey;
    this.importParameters.format = this.format.key;
    this.importParameters.suite = this.suite.name;
    if (this.testRun) {
      this.importParameters.testRunId = this.testRun.id;
    }
  }

  createBodyPattern($event) {
    this.projectService.createImportBodyPattern({ name: $event, project_id: this.route.snapshot.params.projectId }).subscribe(() => {
      this.projectService.getImportBodyPatterns({ project_id: this.route.snapshot.params.projectId }).subscribe(patterns => {
        this.bodyPatterns = patterns;
        this.pattern = this.bodyPatterns.find(x => x.name === $event);
      });
    });
  }

  async createTestSuite($event) {
    await this.suiteService.createTestSuite({ name: $event, project_id: this.route.snapshot.params.projectId });
    this.suites = await this.suiteService.getTestSuite({ project_id: this.route.snapshot.params.projectId });
    this.suite = this.suites.find(x => x.name === $event);
  }

  reqMark(field: string) {
    switch (field) {
      case 'suite':
        return true;
      case 'executor':
      case 'buildName':
        return this.importParameters.singleTestRun;
    }
  }

  IsTestNameValid() {
    if (this.format.key === importTypes.MSTest) {
      return this.testNameOptions.testClassName || this.testNameOptions.testName || this.testNameOptions.testDescription;
    } else if (this.format.key === importTypes.TestNG) {
      return this.testNameOptions.testClassName || this.testNameOptions.testName;
    } else if (this.format.key === importTypes.NUnit_v3) {
      return this.testNameOptions.testClassName || this.testNameOptions.featureTest;
    } else {
      return true;
    }
  }

  async setSuite($event) {
    this.suite = $event;
    this.testRuns = await this.testrunService.getTestRun({ test_suite_id: this.suite.id });
  }

  testNameTypes() {
    let props = 0;

    return {
      get testName() { return props === 1; },
      set testName(val) { if (val) { props = 1; } },
      get testDescription() { return props === 2; },
      set testDescription(val) { if (val) { props = 2; } },
      get featureTest() { return props === 3; },
      set featureTest(val) { if (val) { props = 3; } },
      get testClassName() { return props === 4; },
      set testClassName(val) { if (val) { props = 4; } },
      get selectedKey() {
        if (props === 0) { return ''; }
        if (props === 1) { return 'testName'; }
        if (props === 2) { return 'featureNameTestName'; }
        if (props === 3) { return 'className'; }
        if (props === 4) { return 'descriptionNode'; }
      }
    };
  }
}
