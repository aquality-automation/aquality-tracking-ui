import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TestResult } from '../../../../shared/models/test-result';
import { TestRun } from '../../../../shared/models/testrun';
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
  testResultTemplate: TestResult;
  testResults: TestResult[];
  testrun: TestRun;
  milestones: Milestone[];
  nextTR: number;
  prevTR: number;
  latestTR: number;
  testruns: TestRun[];
  showTableResults: boolean;
  canEdit: boolean;
  canSendEmail: boolean;
  icons = { faPlay, faStop, faPaperPlane, faFilePdf };

  constructor(
    private milestoneService: MilestoneService,
    private testrunService: TestRunService,
    private route: ActivatedRoute,
    public userService: UserService,
    private emailSettingService: EmailSettingsService,
    private router: Router,
    private permissions: PermissionsService
  ) { }

  async ngOnInit() {
    this.projectId = this.route.snapshot.params.projectId;
    const testrunId = this.route.snapshot.params.testrunId;
    let isEmailEnabled: boolean;
    let testruns: TestRun[];

    [ isEmailEnabled, this.canEdit, testruns, this.milestones ] = await Promise.all([
      this.emailSettingService.getEmailsStatus(),
      this.permissions.hasProjectPermissions(this.projectId,
        [EGlobalPermissions.manager], [ELocalPermissions.manager, ELocalPermissions.admin, ELocalPermissions.engineer]),
      this.testrunService.getTestRun({ id: testrunId }),
      this.milestoneService.getMilestone({ project_id: this.projectId, active: 1 })
    ]);

    this.canSendEmail = isEmailEnabled && this.canEdit;
    this.testrun = testruns[0];
    this.testResultTemplate = { test_run_id: testrunId };
    await this.setTestRunsToCompare();
  }

  assigneResults(testResults: TestResult[]) {
    this.testResults = testResults;
  }

  async setTestRunsToCompare() {
    this.testruns = await this.testrunService.getTestRun({
      project_id: this.projectId,
      test_suite: { id: this.testrun.test_suite.id }
    });
    const currentTR = this.testruns.findIndex(x => x.id === this.testrun.id);
    this.nextTR = this.testruns[currentTR - 1] ? this.testruns[currentTR - 1].id : undefined;
    this.prevTR = this.testruns[currentTR + 1] ? this.testruns[currentTR + 1].id : undefined;
    this.latestTR = currentTR !== 0 ? this.testruns[0].id : undefined;
  }

  calculateDuration(): string {
    const start_time = new Date(this.testrun.start_time);
    const finish_time = new Date(this.testrun.finish_time);
    const duration = (finish_time.getTime() - start_time.getTime()) / 1000;
    const hours = (duration - duration % 3600) / 3600;
    const minutes = (duration - hours * 3600 - (duration - hours * 3600) % 60) / 60;
    const seconds = duration - (hours * 3600 + minutes * 60);
    return hours + 'h:' + minutes + 'm:' + seconds + 's';
  }

  changeDebugState(input: HTMLInputElement) {
    let testrunUpdateTemplate: TestRun;
    testrunUpdateTemplate = {
      debug: input.checked === true ? 1 : 0,
      id: this.testrun.id,
      build_name: this.testrun.build_name,
      start_time: this.testrun.start_time,
      project_id: this.testrun.project_id
    };
    this.testrunService.createTestRun(testrunUpdateTemplate).then();
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

  async testrunUpdate() {
    let testUpdatedTestRun = { ...this.testrun };
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
    testUpdatedTestRun = await this.testrunService.createTestRun(testUpdatedTestRun);
  }

  createMilestone($event) {
    this.milestoneService.createMilestone({ name: $event, project_id: this.testrun.project_id }).then(() => {
      this.milestoneService.getMilestone({ project_id: this.testrun.project_id, active: 1 }).then(milestones => {
        this.milestones = milestones;
        this.testrun.milestone = this.milestones.find(x => x.name === $event);
        this.testrunUpdate();
      });
    });
  }

  finalResultChartClick(result: FinalResult) {
    this.router.navigate(
      [`/project/${this.projectId}/testrun/${this.testrun.id}`],
      { queryParams: { f_final_result_opt: result.id } });
  }

  resolutionChartClick(resolution: ResultResolution) {
    const queryParams = resolution.id === 1
      ? { 'f_issue_opt': 0 }
      : { 'f_issue.resolution_opt': resolution.id };

    this.router.navigate(
      [`/project/${this.projectId}/testrun/${this.testrun.id}`],
      { queryParams });
  }

  canFinish() {
    return this.testrun.label_id === 2;
  }

  isFinished() {
    return this.testrun.finish_time
      ? this.testrun.start_time !== this.testrun.finish_time
      : false;
  }

  async reopenTestRun() {
    this.updateFinishTime(this.testrun.start_time);
  }

  async finishTestRun() {
    this.updateFinishTime(new Date());
  }

  async updateFinishTime(finish_time: Date | string) {
    this.testrun.finish_time = (await this.testrunService.createTestRun({
      id: this.testrun.id,
      finish_time: finish_time,
      project_id: this.testrun.project_id
    })).finish_time;
  }
}
