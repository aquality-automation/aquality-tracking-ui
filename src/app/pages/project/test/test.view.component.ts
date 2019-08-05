import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SimpleRequester } from '../../../services/simple-requester';
import { TestService } from '../../../services/test.service';
import { TestResultService } from '../../../services/test-result.service';
import { UserService } from '../../../services/user.services';
import { TestResult } from '../../../shared/models/test-result';
import { Test } from '../../../shared/models/test';
import { LocalPermissions } from '../../../shared/models/LocalPermissions';
import { TransformationsService } from '../../../services/transformations.service';
import { TestSuiteService } from '../../../services/testSuite.service';
import { TestSuite } from '../../../shared/models/testSuite';

@Component({
  templateUrl: './test.view.component.html',
  providers: [
    SimpleRequester,
    TestService,
    TestResultService,
    TransformationsService,
    TestSuiteService
  ],
  styleUrls: ['./test.view.component.css']
})
export class TestViewComponent implements OnInit {
  descriptionHeight = 40;
  hideMoveModal = true;
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

  constructor(
    private testSuiteService: TestSuiteService,
    private route: ActivatedRoute,
    private router: Router,
    private testService: TestService,
    public userService: UserService,
    public transformation: TransformationsService
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.test = {
        project_id: params['projectId'],
        id: params['testId']
      };

      this.testService.getTest(this.test, true).subscribe(result => {
        this.userService.getProjectUsers(this.route.snapshot.params['projectId'])
          .subscribe(res => {
            this.users = res;
            this.selectedDeveloper = this.test.developer;
          });
        this.testSuiteService.getTestSuite({id: this.test.test_suite_id}).then(res => {
          this.suite = res[0];
        });
        this.test = result[0];
        this.testResultTempalte = { test_id: this.test.id };
        this.testResults = this.test.results;
      }, error => console.log(error));
    });
  }

  saveManualDuration(event) {
    const strings = event.target.value.split(':');
    const duration = ((+strings[0] * 3600) + (+strings[1] * 60) + (+strings[2])) * 1000;
    if (duration !== NaN) {
      this.test.manual_duration = duration;
      this.testService.createTest(this.test).subscribe();
    }
  }

  setNewDeveloper($event: LocalPermissions) {
    this.test.developer = $event;
    this.test.developer_id = $event.user_id;
    this.testService.createTest(this.test).subscribe();
  }

  moveTestOpen() {
    this.testService.getTest({ project_id: this.test.project_id }).subscribe(res => {
      this.tests = res;
      this.hideMoveModal = false;
    });
  }

  movedTo($event) {
    this.testMovedTo = $event;
  }

  async execute($event) {
    if (await $event) {
      this.router.navigate([`/project/${this.test.project_id}/test/${this.testMovedTo.id}`]);
      this.testMovedTo = undefined;
    }
  }

  wasClosed($event) {
    this.hideMoveModal = true;
  }

  descriptionClicked() {
    this.descriptionHeight = this.descriptionHeight === 40 ? 500 : 40;
  }

  nameError($event) {
    this.testService.handleSimpleError('Name is invalid', 'Test name can\'t be empty or less than 3 symbols!');
  }

  testUpdate() {
    this.testService.createTest(this.test).subscribe();
  }
}
