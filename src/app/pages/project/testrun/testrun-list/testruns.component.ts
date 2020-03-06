import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SimpleRequester } from '../../../../services/simple-requester';
import { TestRunService } from '../../../../services/testRun.service';
import { TestSuiteService } from '../../../../services/testSuite.service';
import { MilestoneService } from '../../../../services/milestones.service';
import { TestRun, TestRunLabel } from '../../../../shared/models/testRun';
import { TestSuite } from '../../../../shared/models/testSuite';
import { Milestone } from '../../../../shared/models/milestone';
import { TestRunStat } from '../../../../shared/models/testrunStats';
import { ListToCsvService } from '../../../../services/listToCsv.service';
import { TestResultService } from '../../../../services/test-result.service';
import { TestResultStat } from '../../../../shared/models/test-result';
import { UserService } from '../../../../services/user.services';
import { TableFilterComponent } from '../../../../elements/table/table.filter.component';
import { TFColumn, TFColumnType, TFOrder } from '../../../../elements/table/tfColumn';
import { PermissionsService, EGlobalPermissions, ELocalPermissions } from '../../../../services/current-permissions.service';

@Component({
  templateUrl: './testruns.component.html',
  styleUrls: ['./testruns.component.css'],
  providers: [
    TestRunService,
    SimpleRequester,
    TestSuiteService,
    MilestoneService,
    TestResultService
  ]
})

export class TestRunsComponent implements OnInit {
  allowDelete: boolean;
  labels: TestRunLabel[];
  hideModal = true;
  removeModalTitle: string;
  removeModalMessage: string;
  testrunToRemove: TestRun;
  testRunStats: TestRunStat[];
  testRunStatsFiltered: TestRunStat[];
  testRuns: TestRun[];
  testRun: TestRun;
  activeMilestones: Milestone[];
  milestones: Milestone[];
  suites: TestSuite[];
  tbCols: TFColumn[];
  hiddenCols: any[];
  sortBy: { property: 'start_time', order: TFOrder.desc };
  canEdit: boolean;
  @ViewChild(TableFilterComponent) testRunsTable: TableFilterComponent;

  constructor(
    private listTocsv: ListToCsvService,
    private userService: UserService,
    private testResultsService: TestResultService,
    private testrunService: TestRunService,
    private testSuiteService: TestSuiteService,
    private milestoneService: MilestoneService,
    private route: ActivatedRoute,
    private router: Router,
    private permissions: PermissionsService
  ) { }

  async ngOnInit() {
    this.testRun = {
      project_id: this.route.snapshot.params.projectId
    };
    this.allowDelete = await this.permissions.hasProjectPermissions(this.testRun.project_id,
      [EGlobalPermissions.manager], [ELocalPermissions.manager, ELocalPermissions.admin]);
    this.canEdit = await this.permissions.hasProjectPermissions(this.testRun.project_id,
      [EGlobalPermissions.manager], [ELocalPermissions.manager, ELocalPermissions.admin, ELocalPermissions.engineer]);
    this.milestones = await this.milestoneService.getMilestone({ project_id: this.route.snapshot.params.projectId});
    this.activeMilestones = this.milestones.filter(x => !!x.active);
    this.labels = await this.testrunService.getTestsRunLabels(0).toPromise();
    this.suites = await this.testSuiteService.getTestSuite({ project_id: this.route.snapshot.params.projectId });
    this.testRunStats = await this.testrunService.getTestsRunStats({ project_id: this.route.snapshot.params.projectId });
    this.testRuns = await this.testrunService.getTestRun({ project_id: this.route.snapshot.params.projectId });
    this.testRuns.forEach(run => {
      if (run.finish_time && run.start_time) {
        run['duration'] = new Date(run.finish_time).getTime() - new Date(run.start_time).getTime();
        run['totalTests'] = (this.testRunStats.find(stat => stat.id === run.id) || { 'total': 0 }).total;
        run['not_assigned'] = (this.testRunStats.find(stat => stat.id === run.id) || { 'not_assigned': 0 }).not_assigned;
        run['passrate'] = this.testrunService.getPassRate(this.testRunStats.find(stat => stat.id === run.id) || new TestRunStat());
      }
    });
    this.tbCols = [
      {
        name: 'Label',
        property: 'label.name',
        filter: true,
        sorting: true,
        type: TFColumnType.colored,
        lookup: {
          entity: 'label',
          values: this.labels,
          propToShow: ['name']
        },
        editable: this.canEdit,
        class: 'fit'
      },
      {
        name: 'Start Time',
        property: 'start_time',
        filter: true,
        sorting: true,
        type: TFColumnType.date,
        class: 'fit'
      },
      {
        name: 'Build',
        property: 'build_name',
        filter: true,
        sorting: true,
        type: TFColumnType.text,
        class: 'ft-width-350'
      },
      {
        name: 'Test Suite',
        property: 'test_suite.name',
        filter: true,
        sorting: true,
        type: TFColumnType.autocomplete,
        lookup: {
          values: this.suites,
          propToShow: ['name'],
          entity: 'test_suite',
          allowEmpty: true
        },
        class: 'fit'
      },
      {
        name: 'Milestone',
        property: 'milestone.name',
        filter: true,
        sorting: true,
        type: TFColumnType.autocomplete,
        lookup: {
          values: this.activeMilestones,
          filterValues: this.milestones,
          propToShow: ['name'],
          entity: 'milestone',
          allowEmpty: true
        },
        editable: this.canEdit,
        class: 'fit'
      },
      {
        name: 'Execution Environment',
        property: 'execution_environment',
        filter: true,
        sorting: true,
        type: TFColumnType.text,
        class: 'fit'
      }, {
        name: 'Executor',
        property: 'author',
        filter: true,
        sorting: true,
        type: TFColumnType.text,
        class: 'fit'
      },
      { name: 'Total', property: 'totalTests', sorting: true, type: TFColumnType.text, class: 'fit' },
      {
        name: 'No Resolution',
        property: 'not_assigned',
        filter: true,
        sorting: true,
        type: TFColumnType.number,
        editable: false,
        link: {
          template: `/project/${this.route.snapshot.params.projectId}/testrun/{id}`,
          properties: ['id'],
          params: { f_test_resolution_opt: 1 }
        },
        class: 'ft-width-250'
      },
      { name: 'Pass Rate', property: 'passrate', sorting: true, type: TFColumnType.percent, class: 'fit' },
      { name: 'Duration', property: 'duration', filter: true, sorting: true, type: TFColumnType.time, class: 'fit' }
    ];
    this.hiddenCols = [
      { name: 'Debug', property: 'debug', filter: true, sorting: true, type: TFColumnType.checkbox, editable: true },
      { name: 'Finish Time', property: 'finish_time', filter: true, sorting: true, type: TFColumnType.date }
    ];
  }

  handleAction($event) {
    this.removeTestRun($event.entity);
  }

  tableDataUpdate($event: TestRun[]) {
    this.testRunStatsFiltered = this.testRunStats.filter(stat => $event.find(testrun => testrun.id === stat.id));
  }

  rowClicked($event: TestRun) {
    this.router.navigate([`/project/${$event.project_id}/testrun/${$event.id}`]);
  }

  removeTestRun(testrun: TestRun) {
    this.testrunToRemove = testrun;
    this.removeModalTitle = `Remove Test Run: ${testrun.build_name} | ${new Date(testrun.start_time).toLocaleString('en-US')}`;
    this.removeModalMessage = `Are you sure that you want to delete the '${
      testrun.build_name} | ${new Date(testrun.start_time).toLocaleString('en-US')
      }' test run? This action cannot be undone.`;
    this.hideModal = false;
  }

  async testRunUpdate(testrun: TestRun) {
    await this.testrunService.createTestRun({
      id: testrun.id,
      label_id: testrun.label.id,
      debug: testrun.debug,
      milestone_id: testrun.milestone ? testrun.milestone.id : 0
    });
    this.testrunService.handleSuccess(`Test run '${
      testrun.build_name} | ${new Date(testrun.start_time).toLocaleString('en-US')
      }' was updated!`);
    this.tableDataUpdate(this.testRunsTable.filteredData);
  }

  async execute($event) {
    if (await $event) {
      this.testrunService.removeTestRun(this.testrunToRemove).then(() => {
        this.testRuns = this.testRuns.filter(x => x.id !== this.testrunToRemove.id);
      });
    }
    this.hideModal = true;
  }

  wasClosed() {
    this.hideModal = true;
  }

  uploadResults() {
    const columns = [
      { name: 'Test Run ID', property: 'test_run_id' },
      { name: 'Test Run Started', property: 'test_run_started', type: 'date' },
      { name: 'Test Name', property: 'name' },
      { name: 'Result', property: 'status' },
      { name: 'Resolution', property: 'resolution' },
      { name: 'Comment', property: 'comment' },
      { name: 'Assignee', property: 'assignee' },
      { name: 'Developer', property: 'developer' }];
    const from = this.route.snapshot.queryParamMap.get('f_start_time_from')
      ? new Date(this.route.snapshot.queryParamMap.get('f_start_time_from')).toISOString()
      : '';
    const to = this.route.snapshot.queryParamMap.get('f_start_time_to')
      ? new Date(this.route.snapshot.queryParamMap.get('f_start_time_to')).toISOString()
      : '';
    let data: TestResultStat[];
    this.testResultsService.getTestResultsStat(this.route.snapshot.params.projectId, from, to).then(res => {
      data = res;
      this.downloadCSV(data, columns);
    });
  }

  downloadCSV(data, columns) {
    const csv = this.listTocsv.generateCSVString(data, columns);
    if (csv === null) { return; }
    const a = document.createElement('a');
    const mimeType = 'text/csv';
    const projectId = this.route.snapshot.params.projectId;
    const from = this.route.snapshot.queryParamMap.get('f_start_time_from')
      ? `_from_${this.route.snapshot.queryParamMap.get('f_start_time_from')}`
      : '';
    const to = this.route.snapshot.queryParamMap.get('f_start_time_to')
      ? `_to_${this.route.snapshot.queryParamMap.get('f_start_time_to')}`
      : '';
    const fileName = `export_project_${projectId}${from}${to}.csv`;

    if (navigator.msSaveBlob) { // IE10
      navigator.msSaveBlob(new Blob(['\ufeff', csv], {
        type: mimeType
      }), fileName);
    } else if (URL && 'download' in a) { // html5 A[download]
      a.href = URL.createObjectURL(new Blob(['\ufeff', csv], {
        type: mimeType
      }));
      a.setAttribute('download', fileName);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      location.href = 'data:application/octet-stream,' + encodeURIComponent(csv); // only this mime type is supported
    }
  }
}
