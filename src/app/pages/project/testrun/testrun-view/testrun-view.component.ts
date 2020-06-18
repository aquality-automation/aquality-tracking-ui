import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TestResult } from '../../../../shared/models/test-result';
import { TestRun } from '../../../../shared/models/testRun';
import { Milestone } from '../../../../shared/models/milestone';
import { FinalResult } from '../../../../shared/models/final-result';
import { faPlay, faStop, faPaperPlane, faFilePdf } from '@fortawesome/free-solid-svg-icons';
import { LocalPermissions } from 'src/app/shared/models/local-permissions';
import { TestRunService } from 'src/app/services/testrun/testrun.service';
import { UserService } from 'src/app/services/user/user.services';
import { PermissionsService, EGlobalPermissions, ELocalPermissions } from 'src/app/services/permissions/current-permissions.service';
import { ResultResolution } from 'src/app/shared/models/result-resolution';
import { EmailSettingsService } from 'src/app/services/email-settings/email-settings.service';
import { MilestoneService } from 'src/app/services/milestone/milestones.service';
import { ResultResolutionsChartsComponent } from 'src/app/elements/charts/resultResolutions/resultResolutions.charts.component';
import { ResultGridComponent } from '../../results/results-grid/results-grid.component';

@Component({
  templateUrl: './testrun-view.component.html',
  styleUrls: ['testrun-view.component.scss']
})
export class TestRunViewComponent implements OnInit {
  @ViewChild(ResultResolutionsChartsComponent) resultResolutionsCharts: ResultResolutionsChartsComponent;
  @ViewChild(ResultGridComponent) resultGridComponent: ResultGridComponent;
  users: LocalPermissions[];
  projectId: number;
  hideNotifyModal = true;
  hidePrintModal = true;
  testResultTempalte: TestResult;
  testResults: TestResult[];
  testRun: TestRun;
  milestones: Milestone[];
  nextTR: number;
  prevTR: number;
  latestTR: number;
  testRuns: TestRun[];
  showTableResults: boolean;
  canEdit: boolean;
  canSendEmail: boolean;
  icons = { faPlay, faStop, faPaperPlane, faFilePdf };

  constructor(
    private milestoneService: MilestoneService,
    private testRunService: TestRunService,
    private route: ActivatedRoute,
    public userService: UserService,
    private emailSettingService: EmailSettingsService,
    private router: Router,
    private permissions: PermissionsService
  ) { }

  async ngOnInit() {
    this.projectId = this.route.snapshot.params.projectId;
    const testRunId = this.route.snapshot.params.testRunId;
    let isEmailEnabled: boolean;
    let testRuns: TestRun[];

    [ isEmailEnabled, this.canEdit, testRuns, this.milestones ] = await Promise.all([
      this.emailSettingService.getEmailsStatus(),
      this.permissions.hasProjectPermissions(this.projectId,
        [EGlobalPermissions.manager], [ELocalPermissions.manager, ELocalPermissions.admin, ELocalPermissions.engineer]),
      this.testRunService.getTestRun({ id: testRunId }),
      this.milestoneService.getMilestone({ project_id: this.projectId, active: 1 })
    ]);

    this.canSendEmail = isEmailEnabled && this.canEdit;
    this.testRun = testRuns[0];
    this.testResultTempalte = { test_run_id: testRunId };
    await this.setTestRunsToCompare();
  }

  assigneResults(testResults: TestResult[]) {
    this.testResults = testResults;
  }

  async setTestRunsToCompare() {
    this.testRuns = await this.testRunService.getTestRun({
      project_id: this.projectId,
      test_suite: { id: this.testRun.test_suite.id }
    });
    const currentTR = this.testRuns.findIndex(x => x.id === this.testRun.id);
    this.nextTR = this.testRuns[currentTR - 1] ? this.testRuns[currentTR - 1].id : undefined;
    this.prevTR = this.testRuns[currentTR + 1] ? this.testRuns[currentTR + 1].id : undefined;
    this.latestTR = currentTR !== 0 ? this.testRuns[0].id : undefined;
  }

  calculateDuration(): string {
    const start_time = new Date(this.testRun.start_time);
    const finish_time = new Date(this.testRun.finish_time);
    const duration = (finish_time.getTime() - start_time.getTime()) / 1000;
    const hours = (duration - duration % 3600) / 3600;
    const minutes = (duration - hours * 3600 - (duration - hours * 3600) % 60) / 60;
    const seconds = duration - (hours * 3600 + minutes * 60);
    return hours + 'h:' + minutes + 'm:' + seconds + 's';
  }

  changeDebugState(input: HTMLInputElement) {
    let testRunUpdateTemplate: TestRun;
    testRunUpdateTemplate = {
      debug: input.checked === true ? 1 : 0,
      id: this.testRun.id,
      build_name: this.testRun.build_name,
      start_time: this.testRun.start_time,
      project_id: this.testRun.project_id
    };
    this.testRunService.createTestRun(testRunUpdateTemplate).then();
  }

  async sendReport() {
    this.users = await this.userService.getProjectUsers(this.projectId);
    this.hideNotifyModal = false;
  }

  generatePDFReport() {
    this.hidePrintModal = false;
  }

  execute($event) {
    this.hideNotifyModal = true;
    this.hidePrintModal = true;
  }

  wasClosed() {
    this.hideNotifyModal = true;
    this.hidePrintModal = true;
  }

  async testRunUpdate() {
    let testUpdatedTestRun = { ...this.testRun };
    if (!testUpdatedTestRun.author) {
      testUpdatedTestRun.author = '$blank';
    }
    if (!testUpdatedTestRun.ci_build) {
      testUpdatedTestRun.ci_build = '$blank';
    }
    if (!testUpdatedTestRun.execution_environment) {
      testUpdatedTestRun.execution_environment = '$blank';
    }
    if (testUpdatedTestRun.milestone) {
      testUpdatedTestRun.milestone_id = testUpdatedTestRun.milestone.id;
    } else {
      testUpdatedTestRun.milestone_id = 0;
    }
    testUpdatedTestRun = await this.testRunService.createTestRun(testUpdatedTestRun);
  }

  createMilestone($event) {
    this.milestoneService.createMilestone({ name: $event, project_id: this.testRun.project_id }).then(() => {
      this.milestoneService.getMilestone({ project_id: this.testRun.project_id, active: 1 }).then(milestones => {
        this.milestones = milestones;
        this.testRun.milestone = this.milestones.find(x => x.name === $event);
        this.testRunUpdate();
      });
    });
  }

  finalResultChartClick(result: FinalResult) {
    this.router.navigate(
      [`/project/${this.projectId}/testrun/${this.testRun.id}`],
      { queryParams: { f_final_result_opt: result.id } });
  }

  resolutionChartClick(resolution: ResultResolution) {
    const queryParams = resolution.id === 1
      ? { 'f_issue_opt': 0 }
      : { 'f_issue.resolution_opt': resolution.id };

    this.router.navigate(
      [`/project/${this.projectId}/testrun/${this.testRun.id}`],
      { queryParams });
  }

  canFinish() {
    return this.testRun.label_id === 2;
  }

  isFinished() {
    return this.testRun.finish_time
      ? this.testRun.start_time !== this.testRun.finish_time
      : false;
  }

  async reopenTestRun() {
    this.updateFinishTime(this.testRun.start_time);
  }

  async finishTestRun() {
    this.updateFinishTime(new Date());
  }

  async updateFinishTime(finish_time: Date | string) {
    this.testRun.finish_time = (await this.testRunService.createTestRun({
      id: this.testRun.id,
      finish_time: finish_time,
      project_id: this.testRun.project_id
    })).finish_time;
  }
}
