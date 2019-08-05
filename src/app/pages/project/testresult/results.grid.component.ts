import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { SimpleRequester } from '../../../services/simple-requester';
import { TestResultService } from '../../../services/test-result.service';
import { TestResult } from '../../../shared/models/test-result';
import { ResultResolution } from '../../../shared/models/result_resolution';
import { ResultResolutionService } from '../../../services/result-resolution.service';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../../../services/user.services';
import { ListToCsvService } from '../../../services/listToCsv.service';
import { LocalPermissions } from '../../../shared/models/LocalPermissions';
import { ResultSearcherComponent } from './results.searcher.component';
import { FinalResult } from '../../../shared/models/final-result';
import { FinalResultService } from '../../../services/final_results.service';
import { TestRunService } from '../../../services/testRun.service';

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
  public tbCols: any[];
  public tbHiddenCols: any[];
  public allColumns: any[];
  canEdit: boolean;

  constructor(
    private resultResolutionService: ResultResolutionService,
    private testResultService: TestResultService,
    private testRunService: TestRunService,
    private route: ActivatedRoute,
    private router: Router,
    public userService: UserService,
    private finalResultService: FinalResultService
  ) {
  }

  ngOnInit() {
    this.userService.HaveAnyLocalPermissionsExceptViewer(this.route.snapshot.params['projectId']).then(resolve =>
      this.canEdit = this.userService.IsManager() || resolve);
    this.resultResolutionService.getResolution().subscribe(async resolutions => {
      this.testResults.forEach(result => {
        if (result.final_result.color === 5) { result.test_resolution = undefined; }
        result['duration'] = this.calculateDuration(result);
      });
      this.listOfResolutions = resolutions;
      this.finalResults = await this.finalResultService.getFinalResult({});
      const testruns = await this.testRunService.getTestRun({ project_id: this.route.snapshot.params['projectId'] });
      this.userService.getProjectUsers(this.route.snapshot.params['projectId']).subscribe(projectUsers => {
        this.users = projectUsers.filter(x => x.admin === 1 || x.manager === 1 || x.engineer === 1);
        this.testResults.forEach(result => {
          result['developer'] = this.users.find(x => x.user_id === result.test.developer_id);
          result['testrun'] = testruns.find(x => x.id === result.test_run_id);
        });
        this.allColumns = [
          { name: 'Started', property: 'start_date', filter: true, sorting: true, type: 'date', editable: false, class: 'fit' },
          { name: 'Build Name', property: 'testrun.build_name', filter: true, sorting: true, type: 'text', class: 'ft-width-150' },
          {
            name: 'Test Name',
            property: 'test.name',
            filter: true,
            sorting: true,
            type: 'text',
            editable: false,
            class: 'ft-width-150'
          },
          {
            name: 'Fail Reason',
            property: 'fail_reason',
            filter: true,
            sorting: true,
            type: 'long-text',
            editable: false,
            listeners: ['contextmenu'],
            class: 'ft-width-250'
          },
          {
            name: 'Result',
            property: 'final_result.name',
            filter: true,
            sorting: true,
            type: 'lookup-colored',
            entity: 'final_result',
            values: this.finalResults,
            editable: false,
            class: 'fit'
          },
          {
            name: 'Resolution',
            property: 'test_resolution.name',
            filter: true,
            sorting: true,
            type: 'lookup-colored',
            entity: 'test_resolution',
            allowEmpty: false,
            values: this.listOfResolutions,
            editable: this.canEdit,
            bulkEdit: true,
            class: 'fit'
          },
          {
            name: 'Assignee',
            property: 'assigned_user.user',
            filter: true,
            sorting: false,
            type: 'lookup-autocomplete',
            propToShow: ['user.first_name', 'user.second_name'],
            entity: 'assigned_user',
            allowEmpty: true,
            nullFilter: true,
            objectWithId: 'assigned_user.user',
            values: this.users,
            editable: this.canEdit,
            bulkEdit: true,
            class: 'fit'
          },
          {
            name: 'Comment',
            property: 'comment',
            filter: true,
            sorting: false,
            type: 'textarea',
            editable: this.canEdit,
            bulkEdit: true,
            class: 'ft-width-150'
          },
          {
            name: 'Developer',
            property: 'developer.user',
            filter: true,
            sorting: false,
            type: 'lookup-autocomplete',
            propToShow: ['user.first_name', 'user.second_name'],
            entity: 'developer',
            nullFilter: true,
            objectWithId: 'developer.user',
            values: this.users,
            editable: false,
            class: 'fit'
          },
          { name: 'Finished', property: 'finish_date', filter: true, sorting: true, type: 'date', editable: false, class: 'fit' },
          { name: 'Updated', property: 'updated', filter: true, sorting: true, type: 'date', editable: false, class: 'fit' },
          { name: 'Duration', property: 'duration', filter: true, sorting: true, type: 'time', editable: false, class: 'fit' },
          { name: 'Debug', property: 'debug', filter: false, sorting: true, type: 'checkbox', editable: this.canEdit, class: 'fit' }
        ];
        this.tbCols = this.allColumns.filter(x => this.showOnly.includes(x.name));
        this.tbHiddenCols = this.allColumns.filter(x => !this.showOnly.includes(x.name));
      });
    }, error => console.log(error));
  }

  rowClicked($event) {
    window.open(`#/project/${this.route.snapshot.params['projectId']}/testresult/${$event.id}`);
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
      this.router.navigate(['/project/' + this.route.snapshot.params['projectId'] + '/testresult/' + testResultId]);
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
    if ((property === 'test_resolution.name' || property === 'assigned_user.user.user_name') && entity.final_result.color === 5) {
      return true;
    }
    return false;
  }
}
