import { Component, OnInit } from '@angular/core';
import { SimpleRequester } from '../../../services/simple-requester';
import { TestResultService } from '../../../services/test-result.service';
import { TestResult } from '../../../shared/models/test-result';
import { FinalResult } from '../../../shared/models/final-result';
import { ResultResolution } from '../../../shared/models/result_resolution';
import { ResultResolutionService } from '../../../services/result-resolution.service';
import { FinalResultService } from '../../../services/final_results.service';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../../services/user.services';
import { LocalPermissions } from '../../../shared/models/LocalPermissions';
import { TransformationsService } from '../../../services/transformations.service';
import { NotificationsService } from 'angular2-notifications';

@Component({
  templateUrl: './testresult.view.component.html',
  providers: [
    TransformationsService,
    SimpleRequester,
    TestResultService,
    ResultResolutionService,
    FinalResultService
  ]
})
export class TestResultViewComponent implements OnInit {
  projectId: number;
  listOfResolutions: ResultResolution[];
  listOfFinalResults: FinalResult[];
  currentState: TestResult;
  editableText: string;
  debugState: number;
  users: LocalPermissions[];
  savedState: TestResult = {};
  hideModal = true;
  canClose: Promise<boolean>;

  constructor(
    private route: ActivatedRoute,
    public userService: UserService,
    private notificationsService: NotificationsService,
    private resultResolutionService: ResultResolutionService,
    private finalResultService: FinalResultService,
    private testResultService: TestResultService
  ) { }

  async ngOnInit() {
    await this.resultResolutionService.getResolution().subscribe(result => {
      this.listOfResolutions = result;
    }, error => console.log(error));
    this.listOfFinalResults = await this.finalResultService.getFinalResult({});
    await this.userService.getProjectUsers(this.route.snapshot.params['projectId']).subscribe(res => {
      this.users = res.filter(x => x.admin === 1 || x.manager === 1 || x.engineer === 1);
    });

    this.projectId = this.route.snapshot.params['projectId'];
    const testResultTemplate: TestResult = { id: this.route.snapshot.params['testresultId'] };
    const testResult = await this.testResultService.getTestResult(testResultTemplate);
    this.currentState = testResult[0];
    Object.assign(this.savedState, this.currentState);
  }

  calculateDuration(): string {
    const start_time = new Date(this.currentState.start_date);
    const finish_time = new Date(this.currentState.finish_date);
    const duration = (finish_time.getTime() - start_time.getTime()) / 1000;
    const hours = (duration - duration % 3600) / 3600;
    const minutes = (duration - hours * 3600 - (duration - hours * 3600) % 60) / 60;
    const seconds = duration - (hours * 3600 + minutes * 60);
    return hours + 'h:' + minutes + 'm:' + seconds + 's';
  }

  testAssigneeUpdate(assigned_user: LocalPermissions) {
    if (assigned_user) {
      this.currentState.assigned_user = assigned_user;
      this.currentState.assignee = assigned_user.user_id;
    }
  }

  setNewResult(finalResult: FinalResult) {
    if (finalResult) {
      this.currentState.final_result = finalResult;
      this.currentState.final_result_id = finalResult.id;
    }
  }

  resolutionUpdate(test_resolution: ResultResolution) {
    if (test_resolution) {
      this.currentState.test_resolution = test_resolution;
      this.currentState.test_resolution_id = test_resolution.id;
    }
  }

  changeDebugState(input: HTMLInputElement, testResult: TestResult) {
    this.currentState.debug = input.checked === true ? 1 : 0;
  }

  async canDeactivate() {
    if (this.currentState && this.savedState) {
      if (JSON.stringify(this.currentState) === JSON.stringify(this.savedState)) {
        return true;
      }

      this.hideModal = false;
      await this.timeout(0);
      return await this.canClose;
    }
    return true;
  }

  wasExecuted($event) {
    this.canClose = $event;
  }

  wasClosed($event) {
    this.hideModal = $event;
  }

  timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async Update() {
    const testResultUpdateTemplate: TestResult = {
      id: this.currentState.id,
      test_id: this.currentState.test.id,
      final_result_id: this.currentState.final_result_id,
      test_resolution_id: this.currentState.test_resolution_id,
      comment: this.currentState.comment,
      debug: this.currentState.debug,
      assignee: this.currentState.assignee
    };
    await this.testResultService.createTestResult(testResultUpdateTemplate);
    this.notificationsService.success(
      `Successful`,
      'Result was updated.'
    );
  }
}
