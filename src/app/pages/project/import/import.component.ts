import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ImportBodyPattern } from '../../../shared/models/project';
import { ProjectService } from '../../../services/project.service';
import { ImportService } from '../../../services/import.service';
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
  testName = false;
  testClassName = false;
  testDescription = false;
  suites: TestSuite[];
  suite: TestSuite;
  testRuns: TestRun[] = [];
  testRun: TestRun;
  fileListArray: File[];
  fileStatusArray: {}[] = [];
  uploadedArray: {}[] = [];
  loadingInProgress: boolean;
  environment = '';
  pattern: ImportBodyPattern;
  bodyPatterns: ImportBodyPattern[];
  format: string;
  ci_build: string;
  executor = '';
  buildName = '';
  singleTestRun = false;
  placeholder = 'Select Import Type';
  imports: string[] = ['MSTest (.trx)',
    'Robot (.xml)',
    'TestNG (.xml)',
    'Cucumber (.json)',
    'PHP Codeception (.xml)',
    'NUnit v2 (.xml)',
    'NUnit v3 (.xml)'];
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

  constructor(
    private importService: ImportService,
    private importServiceForUpload: ImportService,
    private suiteService: TestSuiteService,
    private projectService: ProjectService,
    private testrunService: TestRunService,
    private route: ActivatedRoute
  ) {
    this.projectService.getImportBodyPatterns({ project_id: this.route.snapshot.params['projectId'] }).subscribe(res => {
      this.bodyPatterns = res;
    });
    this.suiteService.getTestSuite({ project_id: this.route.snapshot.params['projectId'] }).then(res => {
      this.suites = res;
    });

    this.getImportResults();
  }

  private getImportResults() {
    this.importService.importResults(this.route.snapshot.params['projectId']).subscribe(res => {
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

  uploadAll(event) {
    const oldname = event.target.textContent;
    this.setButtonInProgress(event);
    this.loadingInProgress = true;
    this.importServiceForUpload.uploadAll(this.buildParams(), this.fileListArray).subscribe(result => {
      this.uploadedArray = this.uploadedArray.concat(this.fileListArray);
      this.fileListArray.splice(0, this.fileListArray.length);
    }, () => {
      this.loadingInProgress = false;
      this.setButtonImport(event, oldname);
    },
      () => {
        this.loadingInProgress = false;
        this.setButtonImport(event, oldname);
      });
  }

  upload(file: File, event) {
    const oldname = event.target.textContent;
    this.setButtonInProgress(event);
    this.loadingInProgress = true;
    this.importServiceForUpload.upload(this.buildParams(), file).subscribe(result => {
      const index = this.fileListArray.indexOf(file);
      if (index > -1) {
        this.uploadedArray.push(this.fileListArray[index]);
        this.fileListArray.splice(index, 1);
      }
    }, () => {
      this.loadingInProgress = false;
      this.setButtonImport(event, oldname);
    },
      () => {
        this.loadingInProgress = false;
        this.setButtonImport(event, oldname);
      });
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

  buildParams(): string {
    let params = '?';
    params += `projectId=${this.route.snapshot.params['projectId']}`;
    params += this.testName || this.testClassName || this.testDescription
      ? `&testNameKey=${this.testDescription
        ? 'descriptionNode'
        : this.testClassName
          ? 'className'
          : 'testName'}`
      : '';
    params += this.environment ? `&environment=${encodeURIComponent(this.environment)}` : '';
    params += this.pattern ? `&pattern=${encodeURIComponent(this.pattern.name)}` : '';
    params += this.format ? `&format=${this.getFormatParam()}` : '';
    params += this.suite ? `&suite=${encodeURIComponent(this.suite.name)}` : '';
    params += this.singleTestRun ? `&singleTestRun=${this.singleTestRun}` : '';
    params += this.executor ? `&author=${this.executor}` : '';
    params += this.buildName ? `&buildName=${this.buildName}` : '';
    params += this.testRun ? `&testRunId=${this.testRun.id}` : '';
    params += this.ci_build ? `&cilink=${this.ci_build}` : '';

    return params;
  }

  getFormatParam() {
    switch (this.format) {
      case 'MSTest (.trx)':
        return 'MSTest';
      case 'Robot (.xml)':
        return 'Robot';
      case 'TestNG (.xml)':
        return 'TestNG';
      case 'Cucumber (.json)':
        return 'Cucumber';
      case 'PHP Codeception (.xml)':
        return 'PHPCodeception';
      case 'NUnit v2 (.xml)':
        return 'NUnit_v2';
      case 'NUnit v3 (.xml)':
        return 'NUnit_v3';
    }
  }

  createBodyPattern($event) {
    this.projectService.createImportBodyPattern({ name: $event, project_id: this.route.snapshot.params['projectId'] }).subscribe(() => {
      this.projectService.getImportBodyPatterns({ project_id: this.route.snapshot.params['projectId'] }).subscribe(patterns => {
        this.bodyPatterns = patterns;
        this.pattern = this.bodyPatterns.find(x => x.name === $event);
      });
    });
  }

  async createTestSuite($event) {
    await this.suiteService.createTestSuite({ name: $event, project_id: this.route.snapshot.params['projectId'] });
    this.suites = await this.suiteService.getTestSuite({ project_id: this.route.snapshot.params['projectId'] });
    this.suite = this.suites.find(x => x.name === $event);
  }

  reqMark(field: string) {
    switch (field) {
      case 'suite':
        return this.format === 'MSTest (.trx)'
          || this.format === 'Cucumber (.json)'
          || this.format === 'NUnit v3 (.xml)'
          || this.singleTestRun;
      case 'executor':
      case 'buildName':
        return this.singleTestRun;
    }
  }

  IsTestNameValid() {
    if (this.format === 'MSTest (.trx)') {
      return this.testClassName || this.testName || this.testDescription;
    } else if (this.format === 'TestNG (.xml)') {
      return this.testClassName || this.testName;
    } else {
      return true;
    }
  }

  testNameChange($event) {
    this.testName = $event;
    if ($event) {
      this.testDescription = false;
      this.testClassName = false;
    }
  }

  testClassNameChange($event) {
    this.testClassName = $event;
    if ($event) {
      this.testDescription = false;
      this.testName = false;
    }
  }

  testDescriptionChange($event) {
    this.testDescription = $event;
    if ($event) {
      this.testClassName = false;
      this.testName = false;
    }
  }

  async setSuite($event) {
    this.suite = $event;
    this.testRuns = await this.testrunService.getTestRun({ test_suite: $event });
  }
}
