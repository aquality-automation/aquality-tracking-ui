import { Component, OnInit, ViewChild } from '@angular/core';
import { UserService } from '../../../../services/user.services';
import { Router, ActivatedRoute } from '@angular/router';
import { MilestoneService } from '../../../../services/milestones.service';
import { Milestone } from '../../../../shared/models/milestone';
import { TestRunService } from '../../../../services/testRun.service';
import { TestRun } from '../../../../shared/models/testRun';
import { FinalResult } from '../../../../shared/models/final-result';
import { ResultResolution } from '../../../../shared/models/result_resolution';
import { TestService } from '../../../../services/test.service';
import { Test } from '../../../../shared/models/test';
import { TestResult } from '../../../../shared/models/test-result';
import { TestSuite } from '../../../../shared/models/testSuite';
import { FinalResultService } from '../../../../services/final_results.service';
import { ResultResolutionService } from '../../../../services/result-resolution.service';
import { TransformationsService } from '../../../../services/transformations.service';
import { ResultResolutionsChartsComponent } from '../../../../elements/charts/resultResolutions/resultResolutions.charts.component';
import { FinalResultChartsComponent } from '../../../../elements/charts/finalResults/finalResults.charts.component';
import { TestSuiteService } from '../../../../services/testSuite.service';
import { TFColumn, TFColumnType } from '../../../../elements/table/tfColumn';

@Component({
  templateUrl: './view-milestone.component.html',
  styleUrls: ['./view-milestone.component.css']
})
export class ViewMilestoneComponent implements OnInit {

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
    private transformationsService: TransformationsService
  ) { }

  @ViewChild(ResultResolutionsChartsComponent) resultResolutionsChart: ResultResolutionsChartsComponent;
  @ViewChild(FinalResultChartsComponent) finalResultChart: FinalResultChartsComponent;
  milestone: Milestone;
  viewData: ViewData[];
  resolutions: ResultResolution[];
  finalResults: FinalResult[];
  testRuns: TestRun[];
  resultsToShow: TestResult[];
  latestResults: TestResult[];
  suites: TestSuite[];
  tests: Test[];
  columns: TFColumn[];
  stackSuites = false;
  sortBy = { order: 'desc', property: 'result.final_result.name' };

  async ngOnInit() {
    this.route.params.subscribe(params => {
      this.milestone = {
        project_id: params.projectId,
        id: params.milestoneId
      };
    });
    const milestones = await this.milestoneService.getMilestone(this.milestone);
    if (milestones.length !== 1) {
      this.router.navigate(['**']);
    }
    this.milestone = milestones[0];
    [
      this.suites,
      this.testRuns,
      this.resolutions,
      this.finalResults,
      this.latestResults,
      this.tests
    ] = await this.getInitialInfo();

    this.viewData = this.getData();
    this.resultsToShow = this.getResultsFromViewData();
    this.columns = this.getColumns();
  }

  async updateStackSuites(state: boolean) {
    this.stackSuites = state;
    this.viewData = this.getData();
    this.resultsToShow = this.getResultsFromViewData();
    this.updateCharts();
    this.milestoneService.handleInfo(`The Latest results by ${this.stackSuites ? 'Test' : 'Suite'} are shown.`);
  }

  getInitialInfo() {
    return Promise.all([
      this.suitesService.getTestSuite({ project_id: this.milestone.project_id }),
      this.testRunService.getTestRun({ project_id: this.milestone.project_id, milestone_id: this.milestone.id }),
      this.resultResolutionService.getResolution(this.milestone.project_id).toPromise(),
      this.finalResultService.getFinalResult({}),
      this.milestoneService.getMilestoneResults(this.milestone),
      this.testService.getTest({ project_id: this.milestone.project_id }, false)
    ]);
  }

  getData() {
    const viewData: ViewData[] = [];

    this.tests.forEach(test => {
      if (test.suites.length > 0) {
        if (!this.stackSuites) {
          test.suites.forEach(suite => {
            const testLatestResult = this.findLatestResult(this.latestResults, test, suite, this.testRuns);
            viewData.push({
              testName: test.name,
              suite: suite,
              result: testLatestResult
            });
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
    });

    return viewData;
  }

  findLatestResult(results: TestResult[], test: Test, suite?: TestSuite, testRuns?: TestRun[]) {
    let latest: TestResult;
    if (suite) {
      const suiteRuns = testRuns.filter(testRun => testRun.test_suite_id === suite.id);
      latest = results.find(result => {
        return result.test_id === test.id && suiteRuns.find(run => run.id === result.test_run_id) !== undefined;
      });
    } else {
      this.transformationsService.sort(results, { order: 'asc', property: 'finish_date' });
      latest = results.find(result => result.test_id === test.id);
    }

    if (!latest) {
      latest = {
        final_result: this.finalResults.find(x => x.id === 3),
        test_resolution: this.resolutions.find(x => x.id === 1),
        comment: undefined,
        start_date: undefined
      };
    }
    return latest;
  }

  hideTableValue(entity: ViewData, property: string) {
    if ((property === 'test_resolution.name') && entity.result.final_result.color === 5) {
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
    this.router.navigate(
      [`/project/${this.milestone.project_id}/milestone/${this.milestone.id}`],
      { queryParams: { 'f_result.test_resolution_opt': resolution.id } }
    );
  }

  private getColumns(): TFColumn[] {
    return [
      { name: 'Test', property: 'testName', filter: true, sorting: true, type: TFColumnType.text, class: 'ft-width-150' },
      {
        name: 'Test Suite', property: 'suite.name',
        filter: true,
        sorting: true,
        type: TFColumnType.autocomplete,
        lookup: {
          entity: 'suite',
          propToShow: ['name'],
          values: this.suites
        },
        class: 'fit'
      },
      {
        name: 'Result',
        property: 'result.final_result.name',
        filter: true,
        sorting: true,
        type: TFColumnType.colored,
        lookup: {
          entity: 'result.final_result',
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
          entity: 'result.test_resolution',
          values: this.resolutions,
          propToShow: ['name']
        },
        class: 'fit'
      },
      { name: 'Comment', property: 'result.comment', filter: true, type: TFColumnType.text, class: 'ft-width-150' },
      { name: 'Finished', property: 'result.finish_date', filter: true, sorting: true, type: TFColumnType.date, class: 'fit' }
    ];
  }

  private getResultsFromViewData() {
    return this.viewData.map(data => data.result);
  }

  private updateCharts() {
    this.resultResolutionsChart.ngOnChanges();
    this.finalResultChart.ngOnChanges();
  }
}

interface ViewData {
  testName: string;
  suite: TestSuite;
  result: TestResult;
}


