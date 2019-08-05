import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SimpleRequester } from '../../../services/simple-requester';
import { TestRunService } from '../../../services/testRun.service';
import { TestResult } from '../../../shared/models/test-result';
import { TestResultService } from '../../../services/test-result.service';
import { TestRun } from '../../../shared/models/testRun';
import { UserService } from '../../../services/user.services';
import { LocalPermissions } from '../../../shared/models/LocalPermissions';
import { Milestone } from '../../../shared/models/milestone';
import { MilestoneService } from '../../../services/milestones.service';
import { ResultResolutionsChartsComponent } from '../../../elements/charts/resultResolutions/resultResolutions.charts.component';
import { EmailSettingsService } from '../../../services/emailSettings.service';

@Component({
  templateUrl: './testrun.view.component.html',
  providers: [
    SimpleRequester,
    TestRunService,
    TestResultService,
    MilestoneService,
    EmailSettingsService
  ],
  styleUrls: ['testrun.view.component.css']
})
export class TestRunViewComponent implements OnInit {
  @ViewChild(ResultResolutionsChartsComponent) resultResolutionsCharts: ResultResolutionsChartsComponent;
  users: LocalPermissions[];
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

  constructor(
    private milestoneService: MilestoneService,
    private testRunService: TestRunService,
    private route: ActivatedRoute,
    public userService: UserService,
    private emailSettingService: EmailSettingsService
  ) {
  }

  ngOnInit() {
    this.emailSettingService.getEmailsStatus().subscribe(res => {
      this.canSendEmail = res.enabled;
    });
    this.userService.HaveAnyLocalPermissionsExceptViewer(this.route.snapshot.params['projectId']).then(resolve =>
      this.canEdit = this.userService.IsManager() || resolve);
    this.testRunService.getTestRunWithChilds({ id: this.route.snapshot.params['testRunId'] }).then(result => {
      this.testRun = result[0];
      this.milestoneService.getMilestone({ project_id: this.route.snapshot.params['projectId'] }).then(res => {
        this.milestones = res;
      });
      this.testResultTempalte = { test_run_id: this.testRun.id };
      this.testResults = this.testRun.testResults;
      if (this.testRun.test_suite) {
        this.testRunService.getTestRun({
          project_id: this.route.snapshot.params['projectId'],
          test_suite: { id: this.testRun.test_suite.id }
        }).then(testRuns => {
          this.testRuns = testRuns;
          const curTR = this.testRuns.findIndex(x => x.id === this.testRun.id);
          this.nextTR = this.testRuns[curTR - 1] ? this.testRuns[curTR - 1].id : undefined;
          this.prevTR = this.testRuns[curTR + 1] ? this.testRuns[curTR + 1].id : undefined;
          this.latestTR = curTR !== 0 ? this.testRuns[0].id : undefined;
        });
      }
    });
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

  sendReport() {
    this.userService.getProjectUsers(this.route.snapshot.params['projectId']).subscribe(res => {
      this.users = res;
      this.hideNotifyModal = false;
    });
  }

  generatePDFReport() {
    this.hidePrintModal = false;
  }

  execute($event) {
    this.hideNotifyModal = true;
    this.hidePrintModal = true;
  }

  wasClosed($event) {
    this.hideNotifyModal = true;
    this.hidePrintModal = true;
  }

  testRunUpdate() {
    if (!this.testRun.ci_build) {
      this.testRun.ci_build = '$blank';
    }
    if (!this.testRun.execution_environment) {
      this.testRun.execution_environment = '$blank';
    }
    if (this.testRun.milestone) {
      this.testRun.milestone_id = this.testRun.milestone.id;
    }
    this.testRunService.createTestRun(this.testRun).then(() => {
      if (this.testRun.ci_build === '$blank') {
        this.testRun.ci_build = '';
      }
      if (this.testRun.execution_environment === '$blank') {
        this.testRun.execution_environment = '';
      }
    });
  }

  updateResult($event: TestResult) {
    this.testResults[this.testResults.findIndex(x => x.id === $event.id)] = $event;
    this.resultResolutionsCharts.ngOnChanges();
  }

  createMilestone($event) {
    this.milestoneService.createMilestone({ name: $event, project_id: this.testRun.project_id }).then(() => {
      this.milestoneService.getMilestone({ project_id: this.testRun.project_id }).then(milestones => {
        this.milestones = milestones;
        this.testRun.milestone = this.milestones.find(x => x.name === $event);
        this.testRunUpdate();
      });
    });
  }
}
