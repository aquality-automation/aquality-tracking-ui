import { Component, OnInit } from '@angular/core';
import { SimpleRequester } from '../../../../services/simple-requester';
import { TestResultService } from '../../../../services/test-result.service';
import { TestResult } from '../../../../shared/models/test-result';
import { FinalResult } from '../../../../shared/models/final-result';
import { ResultResolution } from '../../../../shared/models/result_resolution';
import { ResultResolutionService } from '../../../../services/result-resolution.service';
import { FinalResultService } from '../../../../services/final_results.service';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../../../services/user.services';
import { LocalPermissions } from '../../../../shared/models/LocalPermissions';
import { TransformationsService } from '../../../../services/transformations.service';
import { NotificationsService } from 'angular2-notifications';
import { StepsService } from '../../../../services/steps.service';
import { StepType, StepResult } from '../../../../shared/models/steps';
import { $ } from 'protractor';
import { TFColumnType, TFColumn } from '../../../../elements/table/tfColumn';

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
  canEdit: boolean;
  public types: StepType[];
  public tbCols: TFColumn[];

  constructor(
    private route: ActivatedRoute,
    public userService: UserService,
    private notificationsService: NotificationsService,
    private resultResolutionService: ResultResolutionService,
    private finalResultService: FinalResultService,
    private testResultService: TestResultService,
    private stepService: StepsService
  ) { }

  async ngOnInit() {
    this.projectId = this.route.snapshot.params.projectId;
    this.listOfResolutions = await this.resultResolutionService.getResolution().toPromise();
    this.listOfFinalResults = await this.finalResultService.getFinalResult({});
    this.users = await this.userService.getProjectUsers(this.projectId).toPromise();
    this.users = this.users.filter(x => x.admin === 1 || x.manager === 1 || x.engineer === 1);
    this.types = await this.stepService.getStepTypes({});
    this.canEdit = this.userService.IsLocalManager() || this.userService.IsManager() || this.userService.IsEngineer();
    await this.refreshResult();
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

  wasClosed() {
    this.hideModal = true;
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
    await this.refreshResult();
    this.notificationsService.success(
      `Successful`,
      'Result was updated.'
    );
  }

  stepResultUpdate($event: StepResult) {
    $event.project_id = this.projectId;
    $event.final_result_id = $event.final_result.id;
    return this.stepService.updateStepResult($event);
  }

  bulkUpdateStepResults($event: StepResult[]) {
    const updates = [];
    $event.forEach(result => updates.push(this.stepResultUpdate(result)));
    return Promise.all(updates);
  }

  private fillStepResults(steps: StepResult[]): StepResult[] {
    steps.forEach(step => step = this.fillStepResult(step));
    return steps;
  }

  private fillStepResult(step: StepResult): StepResult {
    step.type = this.types.find(type => type.id === step.type_id);
    step.final_result = this.listOfFinalResults.find(finalResult => finalResult.id === step.final_result_id);
    return step;
  }

  private async refreshResult() {
    const results = await this.testResultService.getTestResult({ id: this.route.snapshot.params.testresultId });
    this.currentState = results[0];
    if (this.currentState.steps) {
      this.fillStepResults(this.currentState.steps);
      this.createColumns();
    }
    Object.assign(this.savedState, this.currentState);
  }

  private createColumns() {
    this.tbCols = [
      { name: 'Type', property: 'type.name', type: TFColumnType.text,  class: 'fit' },
      { name: 'Step', property: 'name', type: TFColumnType.text },
      {
        name: 'Fail Reason',
        property: 'log',
        type: TFColumnType.longtext,
        class: 'ft-width-250'
      },
      {
        name: 'Result',
        property: 'final_result.name',
        type: TFColumnType.colored,
        lookup: {
          entity: 'final_result',
          values: this.listOfFinalResults,
          propToShow: ['name']
        },
        editable: this.canEdit,
        bulkEdit: true,
        class: 'fit'
      },
      {
        name: 'Comment',
        property: 'comment',
        type: TFColumnType.textarea,
        editable: this.canEdit,
        bulkEdit: true,
        class: 'ft-width-250'
      },
      {
        name: 'Attachment',
        property: 'attachment',
        type: TFColumnType.file,
        editable: this.canEdit,
        class: 'fit'
      }
    ];
  }
}
