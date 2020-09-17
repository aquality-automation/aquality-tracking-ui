import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TestRun, TestRunLabel } from '../../../../shared/models/testrun';
import { Milestone } from '../../../../shared/models/milestones/milestone';
import { ListToCsvService } from '../../../../services/listToCsv.service';
import { TestResultStat } from '../../../../shared/models/test-result';
import { TestRunStat } from 'src/app/shared/models/testrun-stats';
import { TestSuite } from 'src/app/shared/models/test-suite';
import { TFColumn, TFOrder, TFColumnType } from 'src/app/elements/table-filter/tfColumn';
import { TableFilterComponent } from 'src/app/elements/table-filter/table-filter.component';
import { UserService } from 'src/app/services/user/user.services';
import { TestResultService } from 'src/app/services/test-result/test-result.service';
import { TestRunService } from 'src/app/services/testrun/testrun.service';
import { TestSuiteService } from 'src/app/services/test-suite/test-suite.service';
import { MilestoneService } from 'src/app/services/milestone/milestones.service';
import { PermissionsService, EGlobalPermissions, ELocalPermissions } from 'src/app/services/permissions/current-permissions.service';

@Component({
  templateUrl: './testrun-list.component.html',
  styleUrls: ['./testrun-list.component.scss']
})

export class TestRunsComponent implements OnInit {
  allowDelete: boolean;
  labels: TestRunLabel[];
  hideModal = true;
  removeModalTitle: string;
  removeModalMessage: string;
  testrunToRemove: TestRun;
  testrunStats: TestRunStat[];
  testrunStatsFiltered: TestRunStat[];
  testruns: TestRun[];
  testrun: TestRun;
  activeMilestones: Milestone[];
  milestones: Milestone[];
  suites: TestSuite[];
  tbCols: TFColumn[];
  hiddenCols: any[];
  sortBy: { property: 'start_time', order: TFOrder.desc };
  canEdit: boolean;
  @ViewChild(TableFilterComponent) testrunsTable: TableFilterComponent;

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
    this.testrun = {
      project_id: this.route.snapshot.params.projectId
    };
    this.allowDelete = await this.permissions.hasProjectPermissions(this.testrun.project_id,
      [EGlobalPermissions.manager], [ELocalPermissions.manager, ELocalPermissions.admin]);
    this.canEdit = await this.permissions.hasProjectPermissions(this.testrun.project_id,
      [EGlobalPermissions.manager], [ELocalPermissions.manager, ELocalPermissions.admin, ELocalPermissions.engineer]);
    this.milestones = await this.milestoneService.getMilestone({ project_id: this.route.snapshot.params.projectId});
    this.activeMilestones = this.milestones.filter(x => !!x.active);
    this.labels = await this.testrunService.getTestsRunLabels(0);
    this.suites = await this.testSuiteService.getTestSuite({ project_id: this.route.snapshot.params.projectId });
    this.testrunStats = await this.testrunService.getTestsRunStats({ project_id: this.route.snapshot.params.projectId });
    this.testruns = await this.testrunService.getTestRun({ project_id: this.route.snapshot.params.projectId });
    this.testruns.forEach(run => {
      if (run.finish_time && run.start_time) {
        run['duration'] = new Date(run.finish_time).getTime() - new Date(run.start_time).getTime();
        run['totalTests'] = (this.testrunStats.find(stat => stat.id === run.id) || { 'total': 0 }).total;
        run['failed'] = (this.testrunStats.find(stat => stat.id === run.id) || { 'failed': 0 }).failed;
        run['not_assigned'] = (this.testrunStats.find(stat => stat.id === run.id) || { 'not_assigned': 0 }).not_assigned;
        run['passrate'] = this.testrunService.getPassRate(this.testrunStats.find(stat => stat.id === run.id) || new TestRunStat());
      }
    });

    this.generateColumns();
  }

  handleAction($event) {
    this.removeTestRun($event.entity);
  }

  tableDataUpdate($event: TestRun[]) {
    this.testrunStatsFiltered = this.testrunStats.filter(stat => $event.find(testrun => testrun.id === stat.id));
  }

  rowClicked($event: TestRun) {
    this.router.navigate([`/project/${$event.project_id}/testrun/${$event.id}`]);
  }

  bulkDelete(testruns: TestRun[]) {
    this.testrunService.removeTestRun(testruns);
    this.testruns = this.testruns.filter(x => !testruns.find(y => y.id === x.id));
  }

  removeTestRun(testrun: TestRun) {
    this.testrunToRemove = testrun;
    this.removeModalTitle = `Remove Test Run: ${testrun.build_name} | ${new Date(testrun.start_time).toLocaleString('en-US')}`;
    this.removeModalMessage = `Are you sure that you want to delete the '${
      testrun.build_name} | ${new Date(testrun.start_time).toLocaleString('en-US')
      }' test run? This action cannot be undone.`;
    this.hideModal = false;
  }

  async testrunUpdate(testrun: TestRun) {
    await this.testrunService.createTestRun({
      id: testrun.id,
      label_id: testrun.label.id,
      debug: testrun.debug,
      milestone_id: testrun.milestone ? testrun.milestone.id : 0
    });
    this.testrunService.handleSuccess(`Test run '${
      testrun.build_name} | ${new Date(testrun.start_time).toLocaleString('en-US')
      }' was updated!`);
    this.tableDataUpdate(this.testrunsTable.filteredData);
  }

  async execute($event) {
    if (await $event) {
      this.testrunService.removeTestRun(this.testrunToRemove).then(() => {
        this.testruns = this.testruns.filter(x => x.id !== this.testrunToRemove.id);
      });
    }
    this.hideModal = true;
  }

  wasClosed() {
    this.hideModal = true;
  }

  generateColumns() {
    this.tbCols = [
      {
        name: 'Label',
        property: 'label',
        filter: true,
        sorting: true,
        type: TFColumnType.colored,
        lookup: {
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
        property: 'test_suite',
        filter: true,
        sorting: true,
        type: TFColumnType.autocomplete,
        lookup: {
          values: this.suites,
          propToShow: ['name'],
          allowEmpty: true
        },
        class: 'fit'
      },
      {
        name: 'Milestone',
        property: 'milestone',
        filter: true,
        sorting: true,
        type: TFColumnType.autocomplete,
        lookup: {
          values: this.activeMilestones,
          filterValues: this.milestones,
          propToShow: ['name'],
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
      { name: 'Failed', property: 'failed', sorting: true, type: TFColumnType.text, class: 'fit' },
      {
        name: 'No Issue',
        property: 'not_assigned',
        filter: true,
        sorting: true,
        type: TFColumnType.number,
        editable: false,
        link: {
          template: `/project/${this.route.snapshot.params.projectId}/testrun/{id}`,
          properties: ['id'],
          params: { f_issue_opt: 0 }
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

  async uploadResults() {
    const columns: TFColumn[] = [
      { name: 'Test Run ID', property: 'test_run_id', type: TFColumnType.text },
      { name: 'Test Run Started', property: 'test_run_started', type: TFColumnType.date },
      { name: 'Test Name', property: 'name', type: TFColumnType.text },
      { name: 'Result', property: 'status', type: TFColumnType.text },
      { name: 'Resolution', property: 'issue.resolution', type: TFColumnType.text },
      { name: 'Issue', property: 'issue.title', type: TFColumnType.text },
      { name: 'Assignee', property: 'issue.assignee', type: TFColumnType.text },
      { name: 'Developer', property: 'developer', type: TFColumnType.text }];
    const from = this.route.snapshot.queryParamMap.get('f_start_time_from')
      ? new Date(this.route.snapshot.queryParamMap.get('f_start_time_from')).toISOString()
      : '';
    const to = this.route.snapshot.queryParamMap.get('f_start_time_to')
      ? new Date(this.route.snapshot.queryParamMap.get('f_start_time_to')).toISOString()
      : '';
    let data: TestResultStat[];
    data = await this.testResultsService.getTestResultsStat(this.route.snapshot.params.projectId, from, to);
    this.downloadCSV(data, columns);
  }

  downloadCSV(data: any[], columns: TFColumn[])  {
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
