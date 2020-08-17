import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { TestResult, TestResultAttachment } from '../../../../shared/models/test-result';
import { Router, ActivatedRoute } from '@angular/router';
import { ListToCsvService } from '../../../../services/listToCsv.service';
import { FinalResult } from '../../../../shared/models/final-result';
import { Issue } from '../../../../shared/models/issue';
import { User } from '../../../../shared/models/user';
import { TestRun } from '../../../../shared/models/testrun';
import { TestRunService } from 'src/app/services/testrun/testrun.service';
import { ResultResolutionService } from 'src/app/services/result-resolution/result-resolution.service';
import { UserService } from 'src/app/services/user/user.services';
import { PermissionsService, ELocalPermissions, EGlobalPermissions } from 'src/app/services/permissions/current-permissions.service';
import { IssueService } from 'src/app/services/issue/issue.service';
import { TFColumn, TFColumnType, TFOrder } from 'src/app/elements/table-filter/tfColumn';
import { ResultResolution } from 'src/app/shared/models/result-resolution';
import { LocalPermissions } from 'src/app/shared/models/local-permissions';
import { TestResultService } from 'src/app/services/test-result/test-result.service';
import { TestService } from 'src/app/services/test/test.service';
import { FinalResultService } from 'src/app/services/final-result/final_results.service';
import { ResultSearcherComponent } from '../results-searcher/results-searcher.component';
import { GlobalDataService } from 'src/app/services/globaldata.service';
import { TransformationsService } from 'src/app/services/transformations.service';

@Component({
  selector: 'results-grid',
  templateUrl: './results-grid.component.html',
})
export class ResultGridComponent implements OnInit {
  @Input() testResultTemplate: TestResult;
  @ViewChild(ResultSearcherComponent) resultSearcher: ResultSearcherComponent;
  public testResults: TestResult[];
  public refreshedResults: Promise<void>;
  @Input() sortBy = { property: 'final_result.name', order: TFOrder.desc };
  @Input() showOnly: string[] = ['Test Name', 'Fail Reason', 'Result', 'Resolution', 'Last Results', 'Issue', 'Attachments'];
  @Output() resultUpdated = new EventEmitter<TestResult[]>();
  @Output() refreshed = new EventEmitter<TestResult[]>();
  public listOfResolutions: ResultResolution[];
  public finalResults: FinalResult[];
  public listOfIssues: Issue[];
  public listOfActiveIssues: Issue[];
  public users: User[];
  public showSearcher = false;
  public searcherText = '';
  public redirect: { url: string, property: string };
  public tbCols: TFColumn[];
  public tbHiddenCols: TFColumn[];
  public allColumns: TFColumn[];
  canEdit: boolean;
  projectId: number;
  hideCreateModal = true;
  issueForModal: Issue;
  resultToAddIssue: TestResult;
  issueFailReason: string;

  constructor(
    private resultResolutionService: ResultResolutionService,
    private testResultService: TestResultService,
    private testrunService: TestRunService,
    private testService: TestService,
    private route: ActivatedRoute,
    private router: Router,
    public userService: UserService,
    private finalResultService: FinalResultService,
    private permissions: PermissionsService,
    private issueService: IssueService,
    private globalDataService: GlobalDataService,
    private transformationService: TransformationsService
  ) { }

  async ngOnInit() {
    this.projectId = this.route.snapshot.params.projectId;
    this.canEdit = await this.permissions.hasProjectPermissions(this.projectId,
      [EGlobalPermissions.manager], [ELocalPermissions.admin, ELocalPermissions.engineer, ELocalPermissions.manager]);

    this.listOfResolutions = await this.resultResolutionService.getResolution();
    this.finalResults = await this.finalResultService.getFinalResult({});
    const projectUsers = (await this.userService.getProjectUsers(this.projectId))
      .filter((x: LocalPermissions) => x.admin === 1 || x.manager === 1 || x.engineer === 1);
    this.users = projectUsers.map((x: LocalPermissions) => x.user);
    this.refreshedResults = this.refreshResults();
  }

  async resultUpdate(result: TestResult) {
    const testResultUpdateTemplate: TestResult = {
      id: result.id,
      test_id: result.test.id,
      final_result_id: result.final_result.id,
      debug: result.debug,
      issue_id: result.issue ? result.issue.id : 0
    };
    result = await this.testResultService.createTestResult(testResultUpdateTemplate);
    this.resultUpdated.emit([result]);
  }

  async bulkResultUpdate(results: TestResult[]) {
    await this.testResultService.bulkUpdate(results);
    this.resultUpdated.emit(results);
  }

  async getResults(testResultTemplate: TestResult) {
    this.testResults = await this.testResultService.getTestResult(testResultTemplate);
  }

  getExecutedNumber(): number {
    return this.testResults.filter(x => x.final_result.id !== 3).length;
  }

  calculateDuration(testResult: TestResult) {
    if (testResult.start_date && testResult.finish_date) {
      const start_time = new Date(testResult.start_date);
      const finish_time = new Date(testResult.finish_date);
      const duration = finish_time.getTime() - start_time.getTime();
      return duration;
    } else {
      return 0;
    }
  }

  async serchForSameResults($event) {
    this.fillResults($event.value);
    await this.resultSearcher.getResults();
  }

  fillResults(fail_reason: string) {
    this.resultSearcher.toggledOn = 'in';
    this.resultSearcher.failReasonSearch = fail_reason.replace('\r\n', ' ').replace('\n', ' ').replace('\r', ' ');
  }

  getItemValue(event, property: string) {
    const props = property.split('.');
    let itemValue = event;
    props.forEach(prop => {
      if (!itemValue) {
        return '';
      }
      itemValue = itemValue[prop];
    });
    return itemValue;
  }

  hideVal(entity: TestResult, property: string) {
    if ((property === 'issue.resolution.name' || property === 'issue') && entity.final_result.color === 5) {
      return true;
    }
    return false;
  }

  handleLookupCreation(event: { value: string, column: TFColumn, entity: TestResult }) {
    if (event.column.property === 'issue') {
      this.issueForModal = {
        title: event.value
      };
      this.issueFailReason = event.entity.fail_reason;
      this.hideCreateModal = false;
      this.resultToAddIssue = event.entity;
    }
  }

  async execute(result: { executed: boolean, result?: Issue }) {
    this.hideCreateModal = true;
    if (result.executed) {
      this.listOfIssues = await this.issueService.getIssues({ project_id: this.projectId });
      await this.assignCreatedIssue(this.listOfIssues.find(x => x.id === result.result.id));
      this.refreshedResults = this.refreshResults();
      await this.refreshedResults;
    }
  }

  async assignCreatedIssue(issue: Issue) {
    if (this.resultToAddIssue) {
      this.resultToAddIssue.issue = issue;
      await this.resultUpdate(this.resultToAddIssue);
      this.resultToAddIssue = undefined;
    }
  }

  wasClosed() {
    this.hideCreateModal = true;
    this.issueFailReason = undefined;
    this.issueForModal = undefined;
  }

  handleLookupAction(event: { value: any, column: TFColumn, entity: TestResult }) {
    if (event.column.property === 'issue') {
      this.issueForModal = event.value;
      this.issueFailReason = event.entity.fail_reason;
      this.hideCreateModal = false;
    }
  }

  private async refreshResults() {
    let testruns: TestRun[];
    [testruns, this.listOfIssues, this.testResults] = await Promise.all([
      this.testrunService.getTestRun({ project_id: this.projectId }),
      this.issueService.getIssues({ project_id: this.projectId }),
      this.testResultService.getTestResult(this.testResultTemplate)
    ]);
    this.testResults.forEach(result => {
      result['developer'] = this.users.find(x => x.id === result.test.developer_id);
      result['testrun'] = testruns.find(x => x.id === result.test_run_id);
      result['duration'] = this.calculateDuration(result);
      result['combinedLastResults'] = this.testService.combineLastResults(result.test);
      result.attachments?.forEach(attachment => {
        attachment.name = this.transformationService.getFileNameFromPath(attachment.path);
      });
    });
    this.listOfActiveIssues = this.listOfIssues.filter(x => x.status_id !== 4);
    this.createColumns();
    this.refreshed.emit(this.testResults);
  }

  private createColumns() {
    this.allColumns = [
      { name: 'Started', property: 'start_date', filter: true, sorting: true, type: TFColumnType.date, class: 'fit' },
      {
        name: 'Build Name', property: 'testrun.build_name', filter: true,
        sorting: true, type: TFColumnType.text, class: 'ft-width-150'
      },
      {
        name: 'Execution Environment', property: 'testrun.execution_environment', filter: true,
        sorting: true, type: TFColumnType.text, class: 'ft-width-150'
      },
      {
        name: 'Test Name',
        property: 'test.name',
        filter: true,
        sorting: true,
        type: TFColumnType.link,
        link: {
          template: `/project/${this.projectId}/testresult/{id}`,
          properties: ['id']
        },
        class: 'ft-width-150'
      },
      {
        name: 'Fail Reason',
        property: 'fail_reason',
        filter: true,
        sorting: true,
        type: TFColumnType.longtext,
        listeners: ['contextmenu'],
        class: 'ft-width-250'
      },
      {
        name: 'Last Results',
        property: 'combinedLastResults',
        type: TFColumnType.dots,
        class: 'fit',
        filter: true,
        sorting: true,
        sorter: {
          order: TFOrder.desc,
          property: 'combinedLastResults',
          weights: this.testService.getResultWeights()
        },
        dotsFilter: {
          values: [
            { name: 'Stable', only: [5] },
            { name: 'Unstable', contains: [1, 2, 3, 4] },
            { name: 'Passed or App Issue', only: [1, 5] },
            { name: 'Has Test Issues', contains: [2, 3, 4] }
          ],
          propToShow: ['name']
        }
      },
      {
        name: 'Result',
        property: 'final_result',
        filter: true,
        sorting: true,
        type: TFColumnType.colored,
        lookup: {
          values: this.finalResults,
          propToShow: ['name']
        },
        class: 'fit'
      },
      {
        name: 'Resolution',
        property: 'issue.resolution',
        filter: true,
        sorting: true,
        type: TFColumnType.colored,
        lookup: {
          values: this.listOfResolutions,
          propToShow: ['name']
        },
        class: 'fit'
      },
      {
        name: 'Issue',
        property: 'issue',
        filter: true,
        sorting: false,
        type: TFColumnType.autocomplete,
        editable: this.canEdit,
        bulkEdit: this.canEdit,
        nullFilter: true,
        lookup: {
          allowCreation: true,
          allowEmpty: true,
          filterValues: this.listOfIssues,
          values: this.listOfActiveIssues,
          propToShow: ['id', 'title'],
          addAction: true
        },
        class: 'ft-width-250'
      },
      {
        name: 'Attachments',
        property: 'attachments',
        type: TFColumnType.attachmentModals,
        class: 'ft-width-150'
      },
      {
        name: 'Developer',
        property: 'developer',
        filter: true,
        sorting: false,
        type: TFColumnType.autocomplete,
        lookup: {
          propToShow: ['first_name', 'second_name'],
          objectWithId: 'developer',
          values: this.users,
        },
        nullFilter: true,
        class: 'fit'
      },
      { name: 'Finished', property: 'finish_date', filter: true, sorting: true, type: TFColumnType.date, class: 'fit' },
      { name: 'Updated', property: 'updated', filter: true, sorting: true, type: TFColumnType.date, class: 'fit' },
      { name: 'Duration', property: 'duration', filter: true, sorting: true, type: TFColumnType.time, class: 'fit' },
      { name: 'Debug', property: 'debug', sorting: true, type: TFColumnType.checkbox, editable: this.canEdit, class: 'fit' }
    ];
    this.tbCols = this.allColumns.filter(x => this.showOnly.includes(x.name));
    this.tbHiddenCols = this.allColumns.filter(x => !this.showOnly.includes(x.name));
  }
}
