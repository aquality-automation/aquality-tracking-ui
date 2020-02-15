import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SimpleRequester } from '../../../../services/simple-requester';
import { TestService } from '../../../../services/test.service';
import { TestResultService } from '../../../../services/test-result.service';
import { UserService } from '../../../../services/user.services';
import { TestResult } from '../../../../shared/models/test-result';
import { Test } from '../../../../shared/models/test';
import { LocalPermissions } from '../../../../shared/models/LocalPermissions';
import { TransformationsService } from '../../../../services/transformations.service';
import { TestSuiteService } from '../../../../services/testSuite.service';
import { TestSuite } from '../../../../shared/models/testSuite';
import { StepsContainerComponent } from '../steps-container/steps-container.component';
import { copyToClipboard } from '../../../../shared/utils/clipboard.util';
import { GlobalDataService } from '../../../../services/globaldata.service';
// tslint:disable-next-line: import-blacklist
import { Subscription } from 'rxjs';
import { PermissionsService, EGlobalPermissions, ELocalPermissions } from '../../../../services/current-permissions.service';

@Component({
  templateUrl: './test.view.component.html',
  providers: [
    SimpleRequester,
    TestService,
    TestResultService,
    TransformationsService,
    TestSuiteService,
  ],
  styleUrls: ['./test.view.component.css']
})
export class TestViewComponent implements OnInit {
  @ViewChild('steps') steps: StepsContainerComponent;
  descriptionHeight = 40;
  hideMoveModal = true;
  hideLeavePageModal = true;
  MoveModalTitle = 'Move Test';
  suite: TestSuite;
  test: Test;
  columns: string[] = ['Started', 'Build Name', 'Fail Reason', 'Result', 'Resolution', 'Assignee', 'Comment'];
  testMoveFrom: Test;
  testResults: TestResult[];
  public testResultTempalte: TestResult;
  showTableResults: boolean;
  users: LocalPermissions[];
  selectedDeveloper: LocalPermissions;
  durationMask = [/\d/, /\d/, ':', /\d/, /\d/, ':', /\d/, /\d/];
  public tests: Test[];
  public testMovedTo: Test;
  canleavePage: Promise<boolean>;
  showSteps: boolean;
  projectSubscription: Subscription;
  public canEdit: boolean;
  projectId: number;

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

    this.testService.getTest(this.test, true).then(result => {
      this.userService.getProjectUsers(this.projectId)
        .subscribe(res => {
          this.users = res;
          this.selectedDeveloper = this.test.developer;
        });
      this.testSuiteService.getTestSuite({ id: this.test.test_suite_id }).then(res => {
        this.suite = res[0];
      });
      this.test = result[0];
      this.testResultTempalte = { test_id: this.test.id };
      this.testResults = this.test.results;
    }, error => console.log(error));

    this.projectSubscription = this.globalData.currentProject$.subscribe(project => {
      this.showSteps = project ? !!project.steps : false;
    });
  }

  async saveManualDuration(event) {
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
