import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TestSuite, TestSuiteStat } from '../../../shared/models/testSuite';
import { Test } from '../../../shared/models/test';
import { SimpleRequester } from '../../../services/simple-requester';
import { TestService } from '../../../services/test.service';
import { TestSuiteService } from '../../../services/testSuite.service';
import { TestRunService } from '../../../services/testRun.service';
import { TestRun } from '../../../shared/models/testRun';
import { UserService } from '../../../services/user.services';
import { LocalPermissions } from '../../../shared/models/LocalPermissions';
import { ListToCsvService } from '../../../services/listToCsv.service';
import { TransformationsService } from '../../../services/transformations.service';
import { TableFilterComponent } from '../../../elements/table/table.filter.component';


@Component({
  templateUrl: './testsuite.view.component.html',
  providers: [
    TestService,
    SimpleRequester,
    TestSuiteService,
    TestRunService,
    TransformationsService
  ]
})
export class TestSuiteViewComponent implements OnInit {
  hideMoveModal = true;
  MoveModalTitle = 'Move Test';
  hideModal = true;
  removeModalTitle: string;
  removeModalMessage: string;
  testToRemove: Test;
  testSuite: TestSuite;
  testSuites: TestSuite[];
  selectedTestSuite: TestSuite;
  test: Test;
  testRuns: TestRun[];
  testRun: TestRun;
  totalManualDuration: string;
  users: LocalPermissions[];
  tbCols: any[];

  constructor(
    private testRunService: TestRunService,
    private testService: TestService,
    private testSuiteService: TestSuiteService,
    private route: ActivatedRoute,
    private router: Router,
    public userService: UserService,
    private listTocsv: ListToCsvService,
    private transformationsService: TransformationsService
  ) { }

  @ViewChild('table')
  private child: TableFilterComponent;

  async ngOnInit() {
    const suiteId: number = +this.route.snapshot.queryParams.suite;
    this.testSuites =  await this.testSuiteService.getTestSuite({ project_id: this.route.snapshot.params['projectId'] });
    this.getTestsInfo(suiteId);
    if (suiteId) {
      this.selectedTestSuite = this.testSuites.find(x => x.id === suiteId);
    }

    this.userService.getProjectUsers(this.route.snapshot.params['projectId'])
      .subscribe(res => {
        this.users = res;
        this.tbCols = [
          {
            name: 'Name',
            property: 'name',
            filter: true,
            sorting: true,
            type: 'text',
            editable: this.userService.IsLocalManager() || this.userService.IsManager() || this.userService.IsEngineer(),
            creationLength: '500'
          },
          {
            name: 'Developer',
            property: 'developer',
            objectWithId: 'developer.user',
            filter: true,
            sorting: false,
            type: 'lookup-autocomplete',
            propToShow: ['user.first_name', 'user.second_name'],
            entity: 'developer',
            allowEmpty: true,
            values: this.users,
            nullFilter: true,
            editable: this.userService.IsLocalManager() || this.userService.IsManager() || this.userService.IsEngineer(),
            bulkEdit: true,
            class: 'fit'
          },
          {
            name: 'Suites',
            property: 'suites',
            entity: 'suites',
            filter: true,
            sorting: false,
            type: 'multiselect',
            propToShow: ['name'],
            values: this.testSuites,
            editable: true,
            bulkEdit: true,
            class: 'ft-width-250'
          },
          {
            name: 'Manual Duration',
            property: 'manual_duration',
            filter: false,
            sorting: true,
            type: 'time',
            editable: this.userService.IsLocalManager() || this.userService.IsManager() || this.userService.IsEngineer(),
            bulkEdit: true,
            class: 'fit'
          }
        ];
      });
  }

  ngOnChange() {
    this.calculateManualDuration();
  }

  suiteChange(selectedSuite: TestSuite) {
    const url = `/project/${this.route.snapshot.params['projectId']}/tests`;
    this.router.navigate([url], { queryParams: { suite: selectedSuite ? selectedSuite.id : undefined} });
    this.getTestsInfo(selectedSuite ? selectedSuite.id : undefined);
  }

  getTestsInfo(id: number) {
    if (id) {
      this.testSuiteService.getTestSuiteWithChilds({ id: id }).then(testSuites => {
        this.testSuite = testSuites[0];
        this.calculateManualDuration();
        this.testRun = {
          test_suite: { id: this.testSuite.id }
        };
        this.testRunService.getTestRun(this.testRun).then(testRuns => {
          this.testRuns = testRuns;
        });
      });
    } else {
      this.testService.getTest({ project_id: this.route.snapshot.params['projectId'] }).subscribe(res => {
        this.testSuite = { project_id: this.route.snapshot.params['projectId'] };
        this.testSuite.tests = res;
        this.calculateManualDuration();
      });
    }
  }

  ExportToCSV() {
    let stat: TestSuiteStat[];
    this.testSuiteService.getTestSuiteStat(this.testSuite).subscribe(res => {
      stat = res;
      let data, filename, link;
      let csv = this.listTocsv.generateTestCsvString(stat, this.users);
      if (csv === null) { return; }

      filename = `tests_statatistic_${this.testSuite.name}_${new Date().getTime()}.csv`;

      if (!csv.match(/^data:text\/csv/i)) {
        csv = 'data:text/csv;charset=utf-8,' + csv;
      }
      data = encodeURI(csv);

      link = document.createElement('a');
      document.body.appendChild(link);
      link.setAttribute('type', 'hidden');
      link.setAttribute('href', data);
      link.setAttribute('download', filename);
      link.click();
    });
  }

  calculateManualDuration() {
    let duration = 0;
    for (const test of this.testSuite.tests) {
      if (test.manual_duration) {
        duration += test.manual_duration;
      }
    }
    this.totalManualDuration = this.transformationsService.msToDurationString(duration);
  }

  getLatestFinishedTestRun(): TestRun {
    if (this.testRuns && this.testRuns.length > 0) {
      this.testRuns = this.testRuns.sort((a, b) => new Date(b.finish_time).getTime() - new Date(a.finish_time).getTime());
      return this.testRuns.find(x => x.finish_time !== undefined && x.start_time !== undefined);
    }
  }

  getLatestAutomationDuration() {
    const testRun: TestRun = this.getLatestFinishedTestRun();
    if (testRun) {
      const start_time = new Date(testRun.start_time);
      const finish_time = new Date(testRun.finish_time);
      return this.transformationsService.msToDurationString(finish_time.getTime() - start_time.getTime());
    }
  }

  rowClicked($event: { id: string; }) {
    this.router.navigate([`/project/${this.route.snapshot.params['projectId']}/test/${$event.id}`]);
  }

  openTestCreation() {
    this.router.navigate([`/project/${this.route.snapshot.params['projectId']}/create/test`],
      { queryParams: { testSuite: this.testSuite.id } });
  }

  getUserById(id: number) {
    return this.users.find(x => x.user.id === id);
  }

  testUpdate($event: Test) {
    this.calculateManualDuration();
    if ($event.developer) {
      $event.developer_id = $event.developer.user_id;
    }
    this.testService.createTest($event).subscribe(() => { }, () => {
      this.testService.getTest({ test_suite_id: this.testSuite.id }).subscribe(res => this.testSuite.tests = res);
    });
  }

  bulkUpdate(tests: Test[]) {
    tests.forEach(test => {
      test.developer_id = test.developer ? test.developer.user_id : undefined;
    });
    this.testService.bulkUpdate(tests).subscribe();
    this.calculateManualDuration();
  }

  updateSuite() {
    const updTemplate: TestSuite = {
      name: this.testSuite.name,
      id: this.testSuite.id,
      project_id: this.testSuite.project_id
    };

    this.testSuiteService.createTestSuite(updTemplate).then();
  }

  handleAction($event: { action: string; entity: Test; }) {
    if ($event.action === 'remove') {
      this.removeTest($event.entity);
    }
  }

  removeTest(test: Test) {
    this.testToRemove = test;
    this.removeModalTitle = `Remove Test: ${test.name}`;
    this.removeModalMessage = `Are you sure that you want to delete the '${test.name}' test? This action cannot be undone.`;
    this.hideModal = false;
  }

  execute($event: any) {
    if ($event) {
      this.testService.removeTest(this.testToRemove).subscribe();
      this.testSuite.tests = this.testSuite.tests.filter(x => x !== this.testToRemove);
    }
    this.hideModal = true;
  }

  wasClosed($event) {
    this.hideModal = $event;
  }

  moveTestOpen() {
    this.hideMoveModal = false;
  }

  moveToExecute($event) {
    if ($event) {
      this.testSuiteService.getTestSuiteWithChilds({ id: this.route.snapshot.params['testsuiteId'] }).then(testSuites => {
        this.testSuite = testSuites[0];
        this.child.data = this.testSuite.tests;
        this.child.applyFilters();
        this.calculateManualDuration();
        this.testRun = {
          test_suite_id: this.testSuite.id
        };
        this.testRunService.getTestRun(this.testRun).then(testRuns => {
          this.testRuns = testRuns;
        });
      });
    }
  }

  nameError($event) {
    this.testService.handleSimpleError('Name is invalid', 'Test Suite name can\'t be empty or less than 4 symbols!');
  }

  moveToWasClosed($event) {
    this.hideMoveModal = true;
  }
}
