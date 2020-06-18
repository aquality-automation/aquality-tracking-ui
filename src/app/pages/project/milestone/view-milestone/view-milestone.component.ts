import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Milestone } from '../../../../shared/models/milestone';
import { TestRun } from '../../../../shared/models/testRun';
import { FinalResult } from '../../../../shared/models/final-result';
import { Test } from '../../../../shared/models/test';
import { TestResult } from '../../../../shared/models/test-result';
import { TransformationsService } from '../../../../services/transformations.service';
import { ResultResolutionsChartsComponent } from '../../../../elements/charts/resultResolutions/resultResolutions.charts.component';
import { FinalResultChartsComponent } from '../../../../elements/charts/finalResults/finalResults.charts.component';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { Issue } from '../../../../shared/models/issue';
import { MilestoneService } from 'src/app/services/milestone/milestones.service';
import { UserService } from 'src/app/services/user/user.services';
import { TestService } from 'src/app/services/test/test.service';
import { FinalResultService } from 'src/app/services/final-result/final_results.service';
import { ResultResolutionService } from 'src/app/services/result-resolution/result-resolution.service';
import { TestSuiteService } from 'src/app/services/test-suite/test-suite.service';
import { TestRunService } from 'src/app/services/testrun/testrun.service';
import { PermissionsService, ELocalPermissions, EGlobalPermissions } from 'src/app/services/permissions/current-permissions.service';
import { IssueService } from 'src/app/services/issue/issue.service';
import { ResultResolution } from 'src/app/shared/models/result-resolution';
import { TestSuite } from 'src/app/shared/models/test-suite';
import { TFColumn, TFOrder, TFColumnType } from 'src/app/elements/table-filter/tfColumn';
import { Subscription } from 'rxjs/internal/Subscription';
import { ConditionalExpr } from '@angular/compiler';

@Component({
  templateUrl: './view-milestone.component.html',
  styleUrls: ['./view-milestone.component.scss']
})
export class ViewMilestoneComponent implements OnInit, OnDestroy {

  constructor(
    public userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private milestoneService: MilestoneService,
    private testService: TestService,
    private finalResultService: FinalResultService,
    private resultResolutionService: ResultResolutionService,
    private suitesService: TestSuiteService,
    private testRunService: TestRunService,
    private transformationsService: TransformationsService,
    private permissions: PermissionsService,
    private issueService: IssueService
  ) { }

  @ViewChild(ResultResolutionsChartsComponent) resultResolutionsChart: ResultResolutionsChartsComponent;
  @ViewChild(FinalResultChartsComponent) finalResultChart: FinalResultChartsComponent;
  milestone: Milestone;
  viewData: ViewData[];
  resolutions: ResultResolution[];
  finalResults: FinalResult[];
  testRuns: TestRun[];
  issues: Issue[];
  resultsToShow: TestResult[];
  latestResults: TestResult[];
  suites: TestSuite[];
  tests: Test[];
  columns: TFColumn[];
  stackSuites = false;
  sortBy = { order: TFOrder.desc, property: 'result.final_result.name' };
  paramsSubscription: Subscription;
  notExecutedSuites: string;
  canEdit: boolean;
  icons = { faExclamationTriangle };
  warningMessage: string;
  myDate = new Date().getTime();

  async ngOnInit() {
    this.paramsSubscription = this.route.params.subscribe(params => {
      this.milestone = {
        project_id: params.projectId,
        id: params.milestoneId
      };
    });
    await this.updateData();
    this.canEdit = await this.permissions.hasProjectPermissions(this.milestone.project_id,
      [EGlobalPermissions.manager], [ELocalPermissions.manager, ELocalPermissions.engineer]);
  }

  ngOnDestroy(): void {
    this.paramsSubscription.unsubscribe();
  }

  async updateData() {
    const milestones = await this.milestoneService.getMilestone(this.milestone);
    if (milestones.length !== 1) {
      this.router.navigate(['**']);
    }
    this.milestone = milestones[0];
    this.warningMessage = this.getWarningMessage();
    [
      this.suites,
      this.testRuns,
      this.resolutions,
      this.finalResults,
      this.latestResults,
      this.tests,
      this.issues
    ] = await this.getInitialInfo();

    this.columns = this.getColumns();
    this.updateStackSuites(this.stackSuites);
    const notExecutedSuites = (this.milestone.suites.filter(suite => !this.testRuns.find(x => x.test_suite_id === suite.id)))
      .map(x => x.name);
    this.notExecutedSuites = notExecutedSuites.join(', ');
  }

  async updateStackSuites(state: boolean) {
    const showMessage = this.stackSuites !== state;
    this.stackSuites = state;
    this.viewData = this.getData();
    this.resultsToShow = this.getResultsFromViewData();
    this.updateCharts();
    if (showMessage) {
      this.milestoneService.handleInfo(`The Latest results by ${this.stackSuites ? 'Test' : 'Suite'} are shown.`);
    }
  }

  getInitialInfo() {
    return Promise.all([
      this.suitesService.getTestSuite({ project_id: this.milestone.project_id }),
      this.testRunService.getTestRun({ project_id: this.milestone.project_id, milestone_id: this.milestone.id }),
      this.resultResolutionService.getResolution(this.milestone.project_id),
      this.finalResultService.getFinalResult({}),
      this.milestoneService.getMilestoneResults(this.milestone),
      this.testService.getTest({ project_id: this.milestone.project_id }),
      this.issueService.getIssues({ project_id: this.milestone.project_id })
    ]);
  }

  getData() {
    const viewData: ViewData[] = [];

    this.tests.forEach(test => {
      if (this.isTestFromSelectedSuites(test)) {
        if (test.suites && test.suites.length > 0) {
          if (!this.stackSuites) {
            test.suites.forEach(suite => {
              if (this.isSuiteFromSelectedSuites(suite)) {
                const testLatestResult = this.findLatestResult(this.latestResults, test, suite);
                viewData.push({
                  testName: test.name,
                  suite: suite,
                  result: testLatestResult
                });
              }
            });
          } else {
            const testLatestResult = this.findLatestResult(this.latestResults, test);
            viewData.push({
              testName: test.name,
              suite: testLatestResult.id
                ? this.testRuns.find(testRun => testRun.id === testLatestResult.test_run_id).test_suite
                : { name: 'Any Suite' },
              result: testLatestResult
            });
          }
        }
      }
    });

    return viewData;
  }

  hideTableValue(entity: ViewData, property: string) {
    if ((property === 'issue.resolution.name') && entity.result.final_result.color === 5) {
      return true;
    }
    return false;
  }

  finalResultChartClick(result: FinalResult) {
    this.router.navigate(
      [`/project/${this.milestone.project_id}/milestone/${this.milestone.id}`],
      { queryParams: { 'f_result.final_result_opt': result.id } }
    );
  }

  resolutionChartClick(resolution: ResultResolution) {
    const queryParams = resolution.id === 1
      ? { 'f_result.issue_opt': 0 }
      : { 'f_result.issue.resolution_opt': resolution.id };

    this.router.navigate(
      [`/project/${this.milestone.project_id}/milestone/${this.milestone.id}`],
      { queryParams });
  }

  async updateMilestone() {
    this.milestone.active = +this.milestone.active;
    await this.milestoneService.createMilestone(this.milestone);
    await this.updateData();
    return this.milestoneService.handleSuccess(`The milestone '${this.milestone.name}' was updated.`);
  }

  private getWarningMessage() {
    if (this.milestone.due_date && this.milestone.active && this.milestone.due_date < new Date()) {
      const now = new Date(new Date().toDateString()).getTime();
      const due = new Date(new Date(this.milestone.due_date).toDateString()).getTime();
      const diffDays = Math.ceil(Math.abs(now - due) / (1000 * 3600 * 24));
      return diffDays > 0
        ? `Past due by ${diffDays} day${diffDays > 1 ? 's' : ''}`
        : `Today is the last day for the '${this.milestone.name}' Milestone`;
    }
  }

  private isTestFromSelectedSuites(test: Test) {
    return test.suites.find(suite => this.isSuiteFromSelectedSuites(suite)) !== undefined;
  }

  private isSuiteFromSelectedSuites(suite: TestSuite) {
    return this.milestone.suites.find(x => suite.id === x.id) !== undefined;
  }

  private findLatestResult(results: TestResult[], test: Test, suite?: TestSuite) {
    let latest: TestResult;
    if (suite) {
      latest = this.findResultFromSuite(test, suite, results);
    } else {
      latest = this.findResultFromTest(results, test);
    }

    if (!latest) {
      latest = this.getNotExecutedResult();
    }
    return latest;
  }

  private findResultFromTest(results: TestResult[], test: Test): TestResult {
    this.transformationsService.sort(results, { order: TFOrder.asc, property: 'finish_date' });
    return results.find(result => result.test_id === test.id);
  }

  private findResultFromSuite(test: Test, suite: TestSuite, results: TestResult[]): TestResult {
    const suiteRuns = this.testRuns.filter(testRun => testRun.test_suite_id === suite.id);
    return results.find(result => {
      return result.test_id === test.id && suiteRuns.find(run => run.id === result.test_run_id) !== undefined;
    });
  }

  private getNotExecutedResult(): TestResult {
    return {
      final_result: this.finalResults.find(x => x.id === 3),
      start_date: undefined
    };
  }

  private getColumns(): TFColumn[] {
    return [
      { name: 'Test', property: 'testName', filter: true, sorting: true, type: TFColumnType.text, class: 'ft-width-150' },
      {
        name: 'Test Suite', property: 'suite',
        filter: true,
        sorting: true,
        type: TFColumnType.autocomplete,
        lookup: {
          propToShow: ['name'],
          values: this.suites
        },
        class: 'fit'
      }, {
        name: 'Test Run', property: 'result.test_run_id',
        filter: true,
        type: TFColumnType.text,
        link: {
          template: '/project/{result.project_id}/testrun/{result.test_run_id}',
          properties: ['result.project_id', 'result.test_run_id']
        },
        class: 'fit'
      }, {
        name: 'Result',
        property: 'result.final_result',
        filter: true,
        sorting: true,
        type: TFColumnType.colored,
        lookup: {
          values: this.finalResults,
          propToShow: ['name']
        },
        class: 'fit'
      }, {
        name: 'Resolution',
        property: 'issue.resolution',
        filter: true,
        sorting: true,
        type: TFColumnType.colored,
        lookup: {
          values: this.resolutions,
          propToShow: ['name']
        },
        class: 'fit'
      },
      {
        name: 'Issue',
        property: 'result.issue',
        filter: true,
        type: TFColumnType.autocomplete,
        nullFilter: true,
        lookup: {
          values: this.issues,
          propToShow: ['title']
        },
        class: 'ft-width-150'
      },
      { name: 'Finished', property: 'result.finish_date', filter: true, sorting: true, type: TFColumnType.date, class: 'fit' }
    ];
  }

  private getResultsFromViewData() {
    return this.viewData.map(data => data.result);
  }

  private updateCharts() {
    if (this.resultResolutionsChart) {
      this.resultResolutionsChart.ngOnChanges();
    }
    if (this.finalResultChart) {
      this.finalResultChart.ngOnChanges();
    }
  }
}

interface ViewData {
  testName: string;
  suite: TestSuite;
  result: TestResult;
}


