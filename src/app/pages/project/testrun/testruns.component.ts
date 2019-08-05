import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SimpleRequester } from '../../../services/simple-requester';
import { TestRunService } from '../../../services/testRun.service';
import { TestSuiteService } from '../../../services/testSuite.service';
import { MilestoneService } from '../../../services/milestones.service';
import { TestRun, TestRunLabel } from '../../../shared/models/testRun';
import { TestSuite } from '../../../shared/models/testSuite';
import { Milestone } from '../../../shared/models/milestone';
import { TestRunStat } from '../../../shared/models/testrunStats';
import { ListToCsvService } from '../../../services/listToCsv.service';
import { TestResultService } from '../../../services/test-result.service';
import { TestResultStat } from '../../../shared/models/test-result';
import { UserService } from '../../../services/user.services';

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
  labels: TestRunLabel[];
  hideModal = true;
  removeModalTitle: string;
  removeModalMessage: string;
  testrunToRemove: TestRun;
  testRunStats: TestRunStat[];
  testRunStatsFiltered: TestRunStat[];
  testRuns: TestRun[];
  testRun: TestRun;
  milestones: Milestone[];
  suites: TestSuite[];
  tbCols: any[];
  hiddenCols: any[];
  sortBy: { property: 'start_time', order: 'desc' };

  constructor(
    private listTocsv: ListToCsvService,
    private userService: UserService,
    private testResultsService: TestResultService,
    private testrunService: TestRunService,
    private testSuiteService: TestSuiteService,
    private milestoneService: MilestoneService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  async ngOnInit() {
    this.testRun = {
      project_id: this.route.snapshot.params['projectId']
    };
    await this.milestoneService.getMilestone({ project_id: this.route.snapshot.params['projectId'] }).then(res => {
      this.milestones = res;
    });
    await this.testrunService.getTestsRunLabels(0).subscribe(res => {
      this.labels = res;
    });
    await this.testSuiteService.getTestSuite({ project_id: this.route.snapshot.params['projectId'] }).then(res => {
      this.suites = res;
    });
    await this.testrunService.getTestsRunStats({ project_id: this.route.snapshot.params['projectId'] }).then(res => {
      this.testRunStats = res;
      this.testrunService.getTestRun({ project_id: this.route.snapshot.params['projectId'] }).then(result => {
        this.testRuns = result;
        this.testRuns.forEach(run => {
          if (run.finish_time && run.start_time) {
            run['duration'] = new Date(run.finish_time).getTime() - new Date(run.start_time).getTime();
            run['totalTests'] = (this.testRunStats.find(stat => stat.id === run.id) || { 'total': 0 }).total;
            run['not_assigned'] = (this.testRunStats.find(stat => stat.id === run.id) || { 'not_assigned': 0 }).not_assigned;
          }
        });
        this.tbCols = [
          {
            name: 'Label',
            property: 'label.name',
            filter: true,
            sorting: true,
            type: 'lookup-colored',
            entity: 'label',
            values: this.labels,
            editable: true,
            class: 'fit'
          },
          { name: 'Start Time', property: 'start_time', filter: true, sorting: true, type: 'date', class: 'fit' },
          { name: 'Build', property: 'build_name', filter: true, sorting: true, type: 'text', editable: false, class: 'ft-width-350' },
          {
            name: 'Test Suite',
            property: 'test_suite.name',
            filter: true,
            sorting: true,
            type: 'lookup-autocomplete',
            values: this.suites,
            propToShow: ['name'],
            entity: 'test_suite',
            allowEmpty: false,
            editable: false,
            class: 'fit'
          },
          {
            name: 'Milestone',
            property: 'milestone.name',
            filter: true,
            sorting: true,
            type: 'lookup-autocomplete',
            values: this.milestones,
            propToShow: ['name'],
            entity: 'milestone',
            allowEmpty: true,
            editable: false,
            class: 'fit'
          },
          {
            name: 'Execution Environment',
            property: 'execution_environment',
            filter: true,
            sorting: true,
            type: 'text',
            editable: false,
            class: 'fit'
          },
          { name: 'Total Tests Executed', property: 'totalTests', filter: false, sorting: true, type: 'text', class: 'fit' },
          {
            name: 'No Resolution',
            property: 'not_assigned',
            filter: true,
            sorting: true,
            type: 'percent',
            editable: false,
            link: {
              template: `/project/${this.route.snapshot.params['projectId']}/testrun/{id}`,
              properties: ['id'], params: { f_test_resolution_opt: 1 }
            }
          },
          { name: 'Duration', property: 'duration', filter: true, sorting: true, type: 'time', class: 'ft-width-120' }
        ];
        this.hiddenCols = [
          { name: 'Finish Time', property: 'finish_time', filter: true, sorting: true, type: 'date' },
          { name: 'Debug', property: 'debug', filter: false, sorting: true, type: 'checkbox', editable: false }
        ];
      });
    });
  }

  handleAction($event) {
    this.removeTestRun($event.entity);
  }

  tableDataUpdate($event: TestRun[]) {
    this.testRunStatsFiltered = this.testRunStats.filter(x => $event.find(y => y.id === x.id));
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

  testRunUpdate($event) {
    this.testrunService.createTestRun($event).then();
  }

  async execute($event) {
    if (await $event) {
      this.testrunService.removeTestRun(this.testrunToRemove).then(() => {
        this.testRuns = this.testRuns.filter(x => x.id !== this.testrunToRemove.id);
      });
    }
    this.hideModal = true;
  }

  wasClosed($event) {
    this.hideModal = $event;
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
    this.testResultsService.getTestResultsStat(this.route.snapshot.params['projectId'], from, to).then(res => {
      data = res;
      this.downloadCSV(data, columns);
    });
  }

  downloadCSV(data, columns) {
    const csv = this.listTocsv.generateCSVString(data, columns);
    if (csv === null) { return; }
    const a = document.createElement('a');
    const mimeType = 'text/csv';
    const projectId = this.route.snapshot.params['projectId'];
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
