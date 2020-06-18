import { Component, OnInit } from '@angular/core';
import { TestResult } from '../../../../shared/models/test-result';
import { FinalResult } from '../../../../shared/models/final-result';
import { ActivatedRoute } from '@angular/router';
import { NotificationsService } from 'angular2-notifications';
import { StepType, StepResult } from '../../../../shared/models/steps';
import { Issue } from '../../../../shared/models/issue';
import { User } from '../../../../shared/models/user';
import { ResultResolution } from 'src/app/shared/models/result-resolution';
import { TFColumn, TFColumnType } from 'src/app/elements/table-filter/tfColumn';
import { UserService } from 'src/app/services/user/user.services';
import { ResultResolutionService } from 'src/app/services/result-resolution/result-resolution.service';
import { FinalResultService } from 'src/app/services/final-result/final_results.service';
import { TestResultService } from 'src/app/services/test-result/test-result.service';
import { IssueService } from 'src/app/services/issue/issue.service';
import { PermissionsService, EGlobalPermissions, ELocalPermissions } from 'src/app/services/permissions/current-permissions.service';
import { LocalPermissions } from 'src/app/shared/models/local-permissions';
import { StepsService } from 'src/app/services/steps/steps.service';

@Component({
  templateUrl: './testresult-view.component.html',
  styleUrls: ['./testresult-view.component.scss']
})
export class TestResultViewComponent implements OnInit {
  projectId: number;
  listOfResolutions: ResultResolution[];
  listOfFinalResults: FinalResult[];
  issues: Issue[];
  currentState: TestResult;
  editableText: string;
  debugState: number;
  users: User[];
  savedState: TestResult = {};
  hideModal = true;
  hideCreateIssueModal = true;
  newIssueTitle: string;
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
    private stepService: StepsService,
    private issueService: IssueService,
    private permissions: PermissionsService
  ) { }

  async ngOnInit() {
    this.projectId = this.route.snapshot.params.projectId;
    this.listOfResolutions = await this.resultResolutionService.getResolution();
    this.listOfFinalResults = await this.finalResultService.getFinalResult({});
    this.issues = (await this.issueService.getIssues({project_id: this.projectId})).filter(x => x.status_id !== 4);
    let projectUsers: LocalPermissions[] = await this.userService.getProjectUsers(this.projectId);
    projectUsers = projectUsers.filter(x => x.admin === 1 || x.manager === 1 || x.engineer === 1);
    this.users = projectUsers.map(x => x.user);
    this.types = await this.stepService.getStepTypes({});
    this.canEdit = await this.permissions.hasProjectPermissions(this.projectId,
      [EGlobalPermissions.manager], [ELocalPermissions.manager, ELocalPermissions.engineer]);
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

  setNewResult(finalResult: FinalResult) {
    if (finalResult) {
      this.currentState.final_result = finalResult;
      this.currentState.final_result_id = finalResult.id;
    }
  }

  issueUpdate(issue: Issue) {
    if (issue) {
      this.currentState.issue = issue;
      this.currentState.issue_id = issue.id;
    }
  }

  changeDebugState(input: HTMLInputElement) {
    this.currentState.debug = input.checked === true ? 1 : 0;
  }

  async canDeactivate() {
    if (this.currentState && this.savedState) {
      if (JSON.stringify(this.currentState) === JSON.stringify(this.savedState)) {
        return true;
      }

      this.hideModal = false;
      await this.timeout(0);
      return this.canClose;
    }
    return true;
  }

  wasExecuted($event) {
    this.canClose = $event;
  }

  async executeIssueCreation(result: { executed: boolean, result?: Issue }) {
    this.hideCreateIssueModal = true;
    if (result.executed) {
      this.issues = await this.issueService.getIssues({ project_id: this.projectId });
      this.currentState.issue = this.issues.find(x => x.id === result.result.id);
    }
  }
  startIssueCreation(title: string) {
    this.newIssueTitle = title;
    this.hideCreateIssueModal = false;
  }

  wasClosed() {
    this.hideModal = true;
    this.hideCreateIssueModal = true;
  }

  timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async Update() {
    const testResultUpdateTemplate: TestResult = {
      id: this.currentState.id,
      test_id: this.currentState.test.id,
      final_result_id: this.currentState.final_result_id,
      issue_id: this.currentState.issue ? this.currentState.issue.id : 0,
      debug: this.currentState.debug
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
        property: 'final_result',
        type: TFColumnType.colored,
        lookup: {
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
