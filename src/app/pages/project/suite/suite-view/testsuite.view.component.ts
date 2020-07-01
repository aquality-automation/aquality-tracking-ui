import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TestRun } from '../../../../shared/models/testrun';
import { ListToCsvService } from '../../../../services/listToCsv.service';
import { TransformationsService } from '../../../../services/transformations.service';
import { Test } from 'src/app/shared/models/test';
import { TestSuite, TestSuiteStat } from 'src/app/shared/models/test-suite';
import { LocalPermissions } from 'src/app/shared/models/local-permissions';
import { TFColumn, TFSorting, TFOrder, TFColumnType } from 'src/app/elements/table-filter/tfColumn';
import { TestRunService } from 'src/app/services/testrun/testrun.service';
import { TestService } from 'src/app/services/test/test.service';
import { TestSuiteService } from 'src/app/services/test-suite/test-suite.service';
import { UserService } from 'src/app/services/user/user.services';
import { PermissionsService, EGlobalPermissions, ELocalPermissions } from 'src/app/services/permissions/current-permissions.service';
import { TableFilterComponent } from 'src/app/elements/table-filter/table-filter.component';
import { GlobalDataService } from 'src/app/services/globaldata.service';

@Component({
  templateUrl: './testsuite.view.component.html',
  styleUrls: ['./testsuite.view.component.scss']
})
export class TestSuiteViewComponent implements OnInit {
  hideMoveModal = true;
  syncTestsModal = false;
  MoveModalTitle = 'Move Test';
  hideModal = true;
  removeModalTitle: string;
  removeModalMessage: string;
  testToRemove: Test;
  testSuite: TestSuite;
  testSuites: TestSuite[];
  selectedTestSuite: TestSuite;
  test: Test;
  testruns: TestRun[];
  testrun: TestRun;
  totalManualDuration: string;
  users: LocalPermissions[];
  tbCols: TFColumn[];
  allowEdit: boolean;
  projectId: number;
  allowCreation: boolean;
  allowMove: boolean;
  sortBy: TFSorting;

  constructor(
    private testrunService: TestRunService,
    private testService: TestService,
    private testSuiteService: TestSuiteService,
    private route: ActivatedRoute,
    private router: Router,
    public userService: UserService,
    private listTocsv: ListToCsvService,
    private transformationsService: TransformationsService,
    private permissions: PermissionsService,
    private globalData: GlobalDataService
  ) { }

  @ViewChild('table')
  private child: TableFilterComponent;

  async ngOnInit() {
    this.sortBy = { property: 'combinedLastResults', order: TFOrder.asc, weights: this.testService.getResultWeights() };
    const suiteId = +this.route.snapshot.queryParams.suite;
    const isProjectDefined = new Promise(resolve => {
      this.globalData.currentProject$.subscribe(async (project) => {
        this.projectId = project.id;
        if (this.projectId) {
          resolve();
        }
      });
    });

    await isProjectDefined;

    this.testSuites = await this.testSuiteService.getTestSuite({ project_id: this.projectId });
    await this.getTestsInfo(suiteId);
    if (suiteId) {
      this.selectedTestSuite = this.testSuites.find(x => x.id === suiteId);
    }

    this.allowEdit = await this.permissions.hasProjectPermissions(this.projectId,
      [EGlobalPermissions.manager], [ELocalPermissions.manager, ELocalPermissions.engineer]);

    this.allowCreation = await this.permissions.hasProjectPermissions(this.projectId,
      [EGlobalPermissions.manager], [ELocalPermissions.manager, ELocalPermissions.engineer, ELocalPermissions.admin]);

    this.allowMove = await this.permissions.hasProjectPermissions(this.projectId,
      [EGlobalPermissions.manager], [ELocalPermissions.manager, ELocalPermissions.admin]);

    this.users = await this.userService.getProjectUsers(this.projectId);

    this.createColumns();
  }

  suiteChange(selectedSuite: TestSuite) {
    const url = `/project/${this.projectId}/tests`;
    this.router.navigate([url], { queryParams: { suite: selectedSuite ? selectedSuite.id : undefined } });
    this.getTestsInfo(selectedSuite ? selectedSuite.id : undefined);
  }

  async getTestsInfo(suiteId: number) {
    if (suiteId) {
      const testSuites = await this.testSuiteService.getTestSuiteWithChilds({ id: suiteId });
      this.testSuite = testSuites[0];
      this.calculateManualDuration();
      this.testrun = {
        test_suite: { id: this.testSuite.id }
      };
      this.testruns = await this.testrunService.getTestRun(this.testrun);
    } else {
      this.testSuite = { project_id: this.projectId };
      this.testSuite.tests = await this.testService.getTest({ project_id: this.projectId });
      this.calculateManualDuration();
    }

    this.testSuite.tests.forEach(test => {
      test['combinedLastResults'] = this.testService.combineLastResults(test);
      test['entitiesId'] = this.testService.getLastResultsId(test);
    });
  }

  async ExportToCSV() {
    let stat: TestSuiteStat[];
    stat = await this.testSuiteService.getTestSuiteStat(this.testSuite);
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
    if (this.testruns && this.testruns.length > 0) {
      this.testruns = this.testruns.sort((a, b) => new Date(b.finish_time).getTime() - new Date(a.finish_time).getTime());
      return this.testruns.find(x => x.finish_time !== undefined && x.start_time !== undefined);
    }
  }

  getLatestAutomationDuration() {
    const testrun: TestRun = this.getLatestFinishedTestRun();
    if (testrun) {
      const start_time = new Date(testrun.start_time);
      const finish_time = new Date(testrun.finish_time);
      return this.transformationsService.msToDurationString(finish_time.getTime() - start_time.getTime());
    }
  }

  rowClicked($event: { id: string; }) {
    this.router.navigate([`/project/${this.projectId}/test/${$event.id}`]);
  }

  openTestCreation() {
    this.router.navigate([`/project/${this.projectId}/create/test`],
      { queryParams: { testSuite: this.testSuite.id } });
  }

  getUserById(id: number) {
    return this.users.find(x => x.user.id === id);
  }

  async testUpdate($event: Test) {
    this.calculateManualDuration();
    if ($event.developer) {
      $event.developer_id = $event.developer.user_id;
    }
    try {
      await this.testService.createTest($event);
    } catch (e) {
      await this.getTestsInfo(this.testSuite.id);
    }
  }

  async bulkUpdate(tests: Test[]) {
    tests.forEach(test => {
      test.developer_id = test.developer ? test.developer.user_id : undefined;
    });
    await this.testService.bulkUpdate(tests);
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

  async execute(answer: any) {
    if (await answer) {
      await this.testService.removeTest(this.testToRemove);
      this.testSuite.tests = this.testSuite.tests.filter(x => x !== this.testToRemove);
    }
    this.hideModal = true;
  }

  wasClosed() {
    this.hideModal = true;
  }

  moveTestOpen() {
    this.hideMoveModal = false;
  }

  moveToExecute(answer) {
    if (answer) {
      this.testSuiteService.getTestSuiteWithChilds({ id: this.route.snapshot.params['testsuiteId'] }).then(testSuites => {
        this.testSuite = testSuites[0];
        this.child.data = this.testSuite.tests;
        this.child.applyFilters();
        this.calculateManualDuration();
        this.testrun = {
          test_suite_id: this.testSuite.id
        };
        this.testrunService.getTestRun(this.testrun).then(testruns => {
          this.testruns = testruns;
        });
      });
    }
  }

  nameError($event) {
    this.testService.handleSimpleError('Name is invalid', 'Test Suite name can\'t be empty or less than 4 symbols!');
  }

  moveTowasClosed() {
    this.hideMoveModal = true;
  }

  syncSuiteClosed() {
    this.syncTestsModal = false;
  }

  syncSuite() {
    this.syncTestsModal = true;
  }

  async syncTests(answer) {
    await answer;
    this.syncSuiteClosed();
  }

  private createColumns() {
    this.tbCols = [
      {
        name: 'Name',
        property: 'name',
        filter: true,
        sorting: true,
        type: TFColumnType.text,
        editable: this.allowEdit,
        creation: {
          required: true,
          creationLength: 500
        }
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
        entitiesIdproperty: 'entitiesId',
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
        name: 'Developer',
        property: 'developer',
        filter: true,
        type: TFColumnType.autocomplete,
        lookup: {
          propToShow: ['user.first_name', 'user.second_name'],
          allowEmpty: true,
          values: this.users,
          objectWithId: 'developer.user'
        },
        nullFilter: true,
        editable: this.allowEdit,
        bulkEdit: true,
        class: 'fit'
      },
      {
        name: 'Suites',
        property: 'suites',
        filter: true,
        type: TFColumnType.multiselect,
        lookup: {
          propToShow: ['name'],
          values: this.testSuites,
        },
        editable: this.allowEdit,
        bulkEdit: true,
        class: 'ft-width-250'
      },
      {
        name: 'Manual Duration',
        property: 'manual_duration',
        sorting: true,
        type: TFColumnType.time,
        editable: this.allowEdit,
        bulkEdit: true,
        class: 'fit'
      }
    ];
  }
}
