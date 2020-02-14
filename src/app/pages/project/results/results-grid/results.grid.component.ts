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
import { TFColumn, TFColumnType } from '../../../../elements/table/tfColumn';
import { PermissionsService, EGlobalPermissions, ELocalPermissions } from '../../../../services/current-permissions.service';

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
  @Input() sortBy = { property: 'final_result.name', order: 'desc' };
  @Input() showOnly: string[] = ['Test Name', 'Fail Reason', 'Result', 'Resolution', 'Assignee', 'Comment'];
  @Output() resultUpdated = new EventEmitter;
  listOfResolutions: ResultResolution[];
  finalResults: FinalResult[];
  users: LocalPermissions[];
  public showSearcher = false;
  public searcherText = '';
  redirect: { url: string, property: string };
  public tbCols: TFColumn[];
  public tbHiddenCols: TFColumn[];
  public allColumns: TFColumn[];
  canEdit: boolean;
  projectId: number;

  constructor(
    private resultResolutionService: ResultResolutionService,
    private testResultService: TestResultService,
    private testRunService: TestRunService,
    private route: ActivatedRoute,
    private router: Router,
    public userService: UserService,
    private finalResultService: FinalResultService,
    private permissions: PermissionsService
  ) {
  }

  async ngOnInit() {
    this.projectId = this.route.snapshot.params.projectId;
    this.canEdit = await this.permissions.hasProjectPermissions(this.projectId,
      [EGlobalPermissions.manager], [ELocalPermissions.admin, ELocalPermissions.engineer, ELocalPermissions.manager]);
    this.resultResolutionService.getResolution().subscribe(async resolutions => {
      this.testResults.forEach(result => {
        if (result.final_result.color === 5) { result.test_resolution = undefined; }
        result['duration'] = this.calculateDuration(result);
      });
      this.listOfResolutions = resolutions;
      this.finalResults = await this.finalResultService.getFinalResult({});
      const testruns = await this.testRunService.getTestRun({ project_id: this.projectId });
      this.userService.getProjectUsers(this.projectId).subscribe(projectUsers => {
        this.users = projectUsers.filter(x => x.admin === 1 || x.manager === 1 || x.engineer === 1);
        this.testResults.forEach(result => {
          result['developer'] = this.users.find(x => x.user_id === result.test.developer_id);
          result['testrun'] = testruns.find(x => x.id === result.test_run_id);
        });
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
            property: 'test_resolution.name',
            filter: true,
            sorting: true,
            type: TFColumnType.colored,
            lookup: {
              entity: 'test_resolution',
              values: this.listOfResolutions,
              propToShow: ['name']
            },
            editable: this.canEdit,
            bulkEdit: true,
            class: 'fit'
          },
          {
            name: 'Assignee',
            property: 'assigned_user.user',
            filter: true,
            type: TFColumnType.autocomplete,
            lookup: {
              propToShow: ['user.first_name', 'user.second_name'],
              entity: 'assigned_user',
              allowEmpty: true,
              objectWithId: 'assigned_user.user',
              values: this.users,
            },
            nullFilter: true,
            editable: this.canEdit,
            bulkEdit: true,
            class: 'fit'
          },
          {
            name: 'Comment',
            property: 'comment',
            filter: true,
            sorting: false,
            type: TFColumnType.textarea,
            editable: this.canEdit,
            bulkEdit: true,
            class: 'ft-width-150'
          },
          {
            name: 'Developer',
            property: 'developer.user',
            filter: true,
            sorting: false,
            type: TFColumnType.autocomplete,
            lookup: {
              propToShow: ['user.first_name', 'user.second_name'],
              entity: 'developer',
              objectWithId: 'developer.user',
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
      });
    }, error => console.log(error));
  }

  rowClicked($event) {
    window.open(`#/project/${this.projectId}/testresult/${$event.id}`);
  }

  async resultUpdate(result: TestResult) {
    const testResultUpdateTemplate: TestResult = {
      id: result.id,
      test_id: result.test.id,
      final_result_id: result.final_result.id,
      test_resolution_id: result.test_resolution.id,
      comment: result.comment,
      debug: result.debug,
      assignee: result.assigned_user ? result.assigned_user.user_id : undefined
    };
    await this.testResultService.createTestResult(testResultUpdateTemplate)
    this.resultUpdated.emit(result);
  }

  bulkResultUpdate(results: TestResult[]) {
    return this.testResultService.bulkUpdate(results);
  }

  async getResults(testResultTemplate: TestResult) {
    this.testResults = await this.testResultService.getTestResult(testResultTemplate);
  }

  openTestResult(testResultId: number) {
    const queryParam = {};
    queryParam['selectedResult'] = testResultId;
    this.router.navigate([], { queryParams: queryParam, queryParamsHandling: 'merge' }).then(() => {
      this.router.navigate(['/project/' + this.projectId + '/testresult/' + testResultId]);
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
    if ((property === 'test_resolution.name' || property === 'assigned_user.user') && entity.final_result.color === 5) {
      return true;
    }
    return false;
  }
}
