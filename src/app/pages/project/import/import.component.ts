import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ImportBodyPattern } from '../../../shared/models/project';
import { TestRun } from '../../../shared/models/testrun';
import { Import } from '../../../shared/models/import';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { TestSuite } from 'src/app/shared/models/test-suite';
import { TFColumn, TFOrder, TFColumnType } from 'src/app/elements/table-filter/tfColumn';
import { TestSuiteService } from 'src/app/services/test-suite/test-suite.service';
import { ProjectService } from 'src/app/services/project/project.service';
import { TestRunService } from 'src/app/services/testrun/testrun.service';
import { importTypes, importTestNameTypes, ImportService, ImportParameters } from 'src/app/services/import/import.service';
import { ImportType } from 'src/app/shared/models/import-type';
import { ImportTestNameType } from 'src/app/shared/models/import-test-name-type';

@Component({
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.scss']
})
export class ImportComponent implements OnInit {

  importParameters: ImportParameters = new ImportParameters();
  suites: TestSuite[];
  suite: TestSuite;
  testruns: TestRun[] = [];
  testrun: TestRun;
  fileListArray: File[];
  fileStatusArray: {}[] = [];
  uploadedArray: {}[] = [];
  loadingInProgress: boolean;
  pattern: ImportBodyPattern;
  bodyPatterns: ImportBodyPattern[];
  format: { name: string, key: ImportType };
  importResults: Import[];
  resultsColumnsToShow: TFColumn[];
  timerToken: any;
  statuses: { id: number, name: string, color: number }[] = [{
    id: 1,
    name: 'Finished',
    color: 5
  }, {
    id: 0,
    name: 'In Progress',
    color: 2
  }, {
    id: 2,
    name: 'Failed',
    color: 1
  }];
  sortBy = { order: TFOrder.asc, property: 'started' };
  imports: { name: string, key: ImportType }[] = [
    { name: importTypes.MavenSurefire.getNameAndExtension(), key: importTypes.MavenSurefire },
    { name: importTypes.MSTest.getNameAndExtension(), key: importTypes.MSTest },
    { name: importTypes.Robot.getNameAndExtension(), key: importTypes.Robot },
    { name: importTypes.Cucumber.getNameAndExtension(), key: importTypes.Cucumber },
    { name: importTypes.PHPCodeception.getNameAndExtension(), key: importTypes.PHPCodeception },
    { name: importTypes.NUnit_v2.getNameAndExtension(), key: importTypes.NUnit_v2 },
    { name: importTypes.NUnit_v3.getNameAndExtension(), key: importTypes.NUnit_v3 }
  ];
  icons = {
    faInfoCircle
  };
  componentImportTypes = importTypes;
  componentImportTestNameTypes = importTestNameTypes;
  testNameType: ImportTestNameType;

  constructor(
    private importService: ImportService,
    private importServiceForUpload: ImportService,
    private suiteService: TestSuiteService,
    private projectService: ProjectService,
    private testrunService: TestRunService,
    private route: ActivatedRoute
  ) { }

  async ngOnInit() {
    this.bodyPatterns = await this.projectService.getImportBodyPatterns({ project_id: this.route.snapshot.params.projectId });
    this.suiteService.getTestSuite({ project_id: this.route.snapshot.params.projectId }).then(res => {
      this.suites = res;
    });

    this.getImportResults();
  }

  public async getImportResults() {
    this.importResults = await this.importService.importResults(this.route.snapshot.params.projectId);

    this.importResults.forEach(result => {
      result['status'] = this.statuses.find(status => status.id === result.finish_status);
    });
    this.resultsColumnsToShow = [
      {
        name: 'Status',
        property: 'status',
        filter: true,
        sorting: true,
        type: TFColumnType.colored,
        lookup: {
          values: this.statuses,
          propToShow: ['name']
        },
        class: 'fit'
      },
      { name: 'Test Run ID', property: 'testrun_id', sorting: true, type: TFColumnType.text, class: 'fit' },
      { name: 'Started', property: 'started', filter: true, sorting: true, type: TFColumnType.date, class: 'fit' },
      { name: 'Finished', property: 'finished', filter: true, sorting: true, type: TFColumnType.date, class: 'fit' },
      { name: 'Logs', property: 'log', filter: true, sorting: true, type: TFColumnType.longtext, class: 'ft-width-250' }
    ];
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
      await this.importServiceForUpload.upload(this.importParameters, filesToImport);
      for (let i = 0; i < filesToImport.length; i++) {
        const index = this.fileListArray.indexOf(filesToImport[i]);
        if (index > -1) {
          this.uploadedArray.push(this.fileListArray[index]);
          this.fileListArray.splice(index, 1);
        }
      }
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
    this.importParameters.testNameKey = this.testNameType
    this.importParameters.format = this.format.key.name;
    this.importParameters.suite = this.suite.name;
    if (this.testrun) {
      this.importParameters.testrunId = this.testrun.id;
    }
  }

  async createBodyPattern($event) {
    await this.projectService.createImportBodyPattern({ name: $event, project_id: this.route.snapshot.params.projectId });
    this.bodyPatterns = await this.projectService.getImportBodyPatterns({ project_id: this.route.snapshot.params.projectId });
    this.pattern = this.bodyPatterns.find(x => x.name === $event);
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

  getBuildName() {
    let buildName = this.suite?.name + "-" + this.importParameters.environment + "-" + this.importParameters.author;
    this.importParameters.buildName = buildName;
  }

  addToLastTestRun(state: boolean) {
    if (state) {
      this.importParameters.singleTestRun = false;
    }
  }

  isTestNameExtractStrategyDefined() {
    switch (this.format.key) {
      case importTypes.MSTest:
        return this.testNameType === importTestNameTypes.Class || this.testNameType === importTestNameTypes.Name || this.testNameType === importTestNameTypes.Description;
      case importTypes.MavenSurefire:
        return this.testNameType === importTestNameTypes.Class || this.testNameType === importTestNameTypes.Name;
      case importTypes.NUnit_v3:
        return this.testNameType === importTestNameTypes.FeatureName || this.testNameType === importTestNameTypes.Name;
      case importTypes.Robot:
      case importTypes.NUnit_v2:
      case importTypes.Cucumber:
      case importTypes.PHPCodeception:
        return true;
      default:
        return false;
    }
  }

  async setSuite($event) {
    this.suite = $event;
    this.testruns = await this.testrunService.getTestRun({ test_suite_id: this.suite.id });
  }
}
