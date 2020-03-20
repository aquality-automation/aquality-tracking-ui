import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { SimpleRequester } from '../../../../services/simple-requester';
import { TestResultService } from '../../../../services/test-result.service';
import { TestResult } from '../../../../shared/models/test-result';
import { ResultResolution } from '../../../../shared/models/result_resolution';
import { ResultResolutionService } from '../../../../services/result-resolution.service';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../../../../services/user.services';
import { ListToCsvService } from '../../../../services/listToCsv.service';
import { LocalPermissions } from '../../../../shared/models/LocalPermissions';
import { ResultSearcherComponent } from '../results-searcher/results.searcher.component';
import { FinalResult } from '../../../../shared/models/final-result';
import { FinalResultService } from '../../../../services/final_results.service';
import { TestRunService } from '../../../../services/testRun.service';
import { TFColumn, TFColumnType, TFOrder } from '../../../../elements/table/tfColumn';
import { PermissionsService, EGlobalPermissions, ELocalPermissions } from '../../../../services/current-permissions.service';
import { TestService } from '../../../../services/test.service';
import { Issue } from '../../../../shared/models/issue';
import { IssueService } from '../../../../services/issue.service';
import { columns } from '../../../../../../e2e/pages/project/list.po/constants';
import { User } from '../../../../shared/models/user';

@Component({
  selector: 'results-grid',
  templateUrl: './results.grid.component.html',
  providers: [
    SimpleRequester,
    TestResultService,
    ResultResolutionService,
    ListToCsvService,
    FinalResultService,
    TestRunService
  ]
})
export class ResultGridComponent implements OnInit {
  @Input() testResultTempalte: TestResult;
  @ViewChild(ResultSearcherComponent) resultSearcher: ResultSearcherComponent;
  @Input() testResults: TestResult[];
  @Input() sortBy = { property: 'final_result.name', order: TFOrder.desc };
  @Input() showOnly: string[] = ['Test Name', 'Fail Reason', 'Result', 'Resolution', 'Last Results', 'Issue'];
  @Output() resultUpdated = new EventEmitter<TestResult[]>();
  listOfResolutions: ResultResolution[];
  finalResults: FinalResult[];
  listOfIssues: Issue[];
  users: User[];
  public showSearcher = false;
  public searcherText = '';
  redirect: { url: string, property: string };
  public tbCols: TFColumn[];
  public tbHiddenCols: TFColumn[];
  public allColumns: TFColumn[];
  canEdit: boolean;
  projectId: number;
  hideCreateModal = true;
  newIssueTitle: string;
  resultToAddIssue: TestResult;

  constructor(
    private resultResolutionService: ResultResolutionService,
    private testResultService: TestResultService,
    private testRunService: TestRunService,
    private testService: TestService,
    private route: ActivatedRoute,
    private router: Router,
    public userService: UserService,
    private finalResultService: FinalResultService,
    private permissions: PermissionsService,
    private issueService: IssueService
  ) {
  }

  async ngOnInit() {
    this.projectId = this.route.snapshot.params.projectId;
    this.canEdit = await this.permissions.hasProjectPermissions(this.projectId,
      [EGlobalPermissions.manager], [ELocalPermissions.admin, ELocalPermissions.engineer, ELocalPermissions.manager]);

    this.listOfResolutions = await this.resultResolutionService.getResolution().toPromise();
    this.finalResults = await this.finalResultService.getFinalResult({});
    this.listOfIssues = await this.issueService.getIssues({ project_id: this.projectId });
    const testruns = await this.testRunService.getTestRun({ project_id: this.projectId });
    const projectUsers = (await this.userService.getProjectUsers(this.projectId).toPromise())
      .filter((x: LocalPermissions) => x.admin === 1 || x.manager === 1 || x.engineer === 1);
    this.users = projectUsers.map((x: LocalPermissions) => x.user);

    this.testResults.forEach(result => {
      result['developer'] = this.users.find(x => x.id === result.test.developer_id);
      result['testrun'] = testruns.find(x => x.id === result.test_run_id);
      result['duration'] = this.calculateDuration(result);
      result['combinedLastResults'] = this.testService.combineLastResults(result.test);
    });

    this.createColumns();
  }

  rowClicked($event) {
    window.open(`#/project/${this.projectId}/testresult/${$event.id}`);
  }

  async resultUpdate(result: TestResult) {
    const testResultUpdateTemplate: TestResult = {
      id: result.id,
      test_id: result.test.id,
      final_result_id: result.final_result.id,
      debug: result.debug,
      issue_id: result.issue ? result.issue.id : 0
    };
    await this.testResultService.createTestResult(testResultUpdateTemplate);
    this.resultUpdated.emit([result]);
  }

  async bulkResultUpdate(results: TestResult[]) {
    await this.testResultService.bulkUpdate(results);
    this.resultUpdated.emit(results);
  }

  async getResults(testResultTemplate: TestResult) {
    this.testResults = await this.testResultService.getTestResult(testResultTemplate);
  }

  openTestResult(testResultId: number) {
    const queryParam = {};
    queryParam['selectedResult'] = testResultId;
    this.router.navigate([], { queryParams: queryParam, queryParamsHandling: 'merge' }).then(() => {
      this.router.navigate([`/project/${this.projectId}/testresult/${testResultId}`]);
    });
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
      this.newIssueTitle = event.value;
      this.hideCreateModal = false;
      this.resultToAddIssue = event.entity;
    }
  }

  async execute(result: { executed: boolean, result?: Issue }) {
    this.hideCreateModal = true;
    if (result.executed) {
      this.listOfIssues = await this.issueService.getIssues({ project_id: this.projectId });
      await this.assignCreatedIssue(this.listOfIssues.find(x => x.id === result.result.id));
    }
  }

  async assignCreatedIssue(issue: Issue) {
    this.resultToAddIssue.issue = issue;
    return this.resultUpdate(this.resultToAddIssue);
  }

  wasClosed() {
    this.hideCreateModal = true;
  }

  private createColumns() {
    this.allColumns = [
      { name: 'Started', property: 'start_date', filter: true, sorting: true, type: TFColumnType.date, class: 'fit' },
      {
        name: 'Build Name', property: 'testrun.build_name', filter: true,
        sorting: true, type: TFColumnType.text, class: 'ft-width-150'
      },
      {
        name: 'Test Name',
        property: 'test.name',
        filter: true,
        sorting: true,
        type: TFColumnType.text,
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
        property: 'final_result.name',
        filter: true,
        sorting: true,
        type: TFColumnType.colored,
        lookup: {
          entity: 'final_result',
          values: this.finalResults,
          propToShow: ['name']
        },
        class: 'fit'
      },
      {
        name: 'Resolution',
        property: 'issue.resolution.name',
        filter: true,
        sorting: true,
        type: TFColumnType.colored,
        lookup: {
          entity: 'issue.resolution',
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
        lookup: {
          allowCreation: true,
          allowEmpty: true,
          entity: 'issue',
          values: this.listOfIssues,
          propToShow: ['id', 'title']
        },
        class: 'ft-width-250'
      },
      {
        name: 'Developer',
        property: 'developer',
        filter: true,
        sorting: false,
        type: TFColumnType.autocomplete,
        lookup: {
          propToShow: ['first_name', 'second_name'],
          entity: 'developer',
          objectWithId: 'developer',
          values: this.users,
        },
        nullFilter: true,
        class: 'fit'
      },
      { name: 'Finished', property: 'finish_date', filter: true, sorting: true, type: TFColumnType.date, class: 'fit' },
      { name: 'Updated', property: 'updated', filter: true, sorting: true, type: TFColumnType.date, class: 'fit' },
      { name: 'Duration', property: 'duration', filter: true, sorting: true, type: TFColumnType.time, class: 'fit' },
      { name: 'Debug', property: 'debug', sorting: true, type: TFColumnType.checkbox, editable: this.canEdit, class: 'fit' },
    ];
    this.tbCols = this.allColumns.filter(x => this.showOnly.includes(x.name));
    this.tbHiddenCols = this.allColumns.filter(x => !this.showOnly.includes(x.name));
  }
}
