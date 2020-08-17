import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TestResult } from '../../../../shared/models/test-result';
import { Test } from '../../../../shared/models/test';
import { TransformationsService } from '../../../../services/transformations.service';
import { copyToClipboard } from '../../../../shared/utils/clipboard.utils';
import { GlobalDataService } from '../../../../services/globaldata.service';
import { TestSuite } from 'src/app/shared/models/test-suite';
import { LocalPermissions } from 'src/app/shared/models/local-permissions';
import { TFSorting, TFOrder } from 'src/app/elements/table-filter/tfColumn';
import { TestSuiteService } from 'src/app/services/test-suite/test-suite.service';
import { TestService } from 'src/app/services/test/test.service';
import { UserService } from 'src/app/services/user/user.services';
import { PermissionsService, EGlobalPermissions, ELocalPermissions } from 'src/app/services/permissions/current-permissions.service';
import { StepsContainerComponent } from '../steps-container/steps-container.component';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
  templateUrl: './test-view.component.html',
  styleUrls: ['./test-view.component.scss']
})
export class TestViewComponent implements OnInit, OnDestroy {
  @ViewChild('steps') steps: StepsContainerComponent;
  descriptionHeight = 40;
  hideMoveModal = true;
  hideLeavePageModal = true;
  MoveModalTitle = 'Move Test';
  suite: TestSuite;
  test: Test;
  columns: string[] = ['Started', 'Build Name', 'Execution Environment', 'Fail Reason', 'Result', 'Resolution', 'Assignee', 'Issue'];
  testMoveFrom: Test;
  testResults: TestResult[];
  public testResultTemplate: TestResult;
  showTableResults: boolean;
  users: LocalPermissions[];
  selectedDeveloper: LocalPermissions;
  public tests: Test[];
  public testMovedTo: Test;
  canleavePage: Promise<boolean>;
  showSteps: boolean;
  projectSubscription: Subscription;
  public canEdit: boolean;
  projectId: number;
  resultSorter: TFSorting = { property: 'start_date', order: TFOrder.asc };

  constructor(
    private testSuiteService: TestSuiteService,
    private route: ActivatedRoute,
    private router: Router,
    private testService: TestService,
    private globalData: GlobalDataService,
    public userService: UserService,
    public transformation: TransformationsService,
    private permissions: PermissionsService
  ) { }

  async ngOnInit() {
    this.projectId = this.route.snapshot.params.projectId;
    this.canEdit = await this.permissions.hasProjectPermissions(this.projectId,
      [EGlobalPermissions.manager], [ELocalPermissions.manager, ELocalPermissions.engineer]);

    this.test = {
      project_id: this.projectId,
      id: this.route.snapshot.params.testId
    };

    this.testResultTemplate = { test_id: this.test.id };
    this.test = (await this.testService.getTest(this.test))[0];
    this.selectedDeveloper = this.test.developer;
    this.users = await this.userService.getProjectUsers(this.projectId);
    this.suite = (await this.testSuiteService.getTestSuite({ id: this.test.test_suite_id }))[0];
    this.projectSubscription = this.globalData.currentProject$.subscribe(project => {
      this.showSteps = project ? !!project.steps : false;
    });
  }

  async grabResults(results: TestResult[]) {
    this.testResults = results;
  }

  ngOnDestroy(): void {
    if (this.projectSubscription) {
      this.projectSubscription.unsubscribe();
    }
  }

  async saveManualDuration(event) {
    console.log(event);
    const strings = event.target.value.split(':');
    const duration = ((+strings[0] * 3600) + (+strings[1] * 60) + (+strings[2])) * 1000;
    if (duration !== NaN) {
      this.test.manual_duration = duration;
      await this.testService.createTest(this.test);
    }
  }

  async setNewDeveloper($event: LocalPermissions) {
    this.test.developer = $event;
    this.test.developer_id = $event.user_id;
    await this.testService.createTest(this.test);
  }

  moveTestOpen() {
    this.testService.getTest({ project_id: this.test.project_id }).then(res => {
      this.tests = res;
      this.hideMoveModal = false;
    });
  }

  movedTo($event) {
    this.testMovedTo = $event;
  }

  async execute($event: Promise<boolean>) {
    if (await $event) {
      this.router.navigate([`/project/${this.test.project_id}/test/${this.testMovedTo.id}`]);
      this.testMovedTo = undefined;
    }
  }

  leavePage($event: Promise<boolean>) {
    this.canleavePage = $event;
  }

  wasClosed() {
    this.hideMoveModal = true;
  }

  leavePageWasClosed() {
    this.hideLeavePageModal = true;
  }

  descriptionClicked() {
    this.descriptionHeight = this.descriptionHeight === 40 ? 500 : 40;
  }

  nameError($event) {
    this.testService.handleSimpleError('Name is invalid', 'Test name can\'t be empty or less than 3 symbols!');
  }

  async testUpdate() {
    await this.testService.createTest(this.test);
  }

  copyScenario() {
    copyToClipboard(`Scenario: ${this.test.name}\n${this.steps.getGherkinTestCase()}`);
    this.testService.handleSuccess(`'${this.test.name}' scenario was copied!`);
  }

  async canDeactivate() {
    if (!this.showSteps) {
      return true;
    }
    if (this.steps.isOrderChanged()) {
      this.hideLeavePageModal = false;
      await new Promise(resolve => setTimeout(resolve, 0));
      return this.canleavePage;
    }
    return true;
  }
}
