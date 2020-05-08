import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TestRun } from '../../../shared/models/testRun';
import { Project } from '../../../shared/models/project';
import { TestRunService } from '../../../services/testRun.service';
import { ProjectService } from '../../../services/project.service';
import { TestRunStat } from '../../../shared/models/testrunStats';
import { AuditService } from '../../../services/audits.service';
import { Audit, AuditNotification } from '../../../shared/models/audit';
import { GlobalDataService } from '../../../services/globaldata.service';
import { TFColumn, TFColumnType } from '../../../elements/table/tfColumn';
import { IssueService } from '../../../services/issue.service';
import { Issue } from '../../../shared/models/issue';
import { SingleLineBarChartData } from '../../../elements/single-line-bar-chart/single-line-bar-chart.component';
import { TestSuiteService } from '../../../services/testSuite.service';
import { TestSuite } from '../../../shared/models/testSuite';

@Component({
  templateUrl: './project-view.component.html',
  styleUrls: ['./project-view.component.css']
})
export class ProjectViewComponent implements OnInit {
  audits: Audit[];
  suites: TestSuite[];
  project: Project;
  testRuns: TestRun[];
  testRun: TestRun;
  testRunStats: TestRunStat[];
  hideAll = true;
  auditNotification: AuditNotification;
  notification: { text: string, type: string };
  testRunColumns: TFColumn[] = [
    { name: 'Build Name', property: 'build_name', type: TFColumnType.text },
    { name: 'Execution Environment', property: 'execution_environment', type: TFColumnType.text },
    { name: 'Start Time', property: 'start_time', type: TFColumnType.date, class: 'fit' },
    { name: 'Finish Time', property: 'finish_time', type: TFColumnType.date, class: 'fit' },
    { name: 'Pass Rate', property: 'failed', type: TFColumnType.percent, class: 'fit' },
  ];
  issueColumns: TFColumn[] = [{ name: 'Id', property: 'id', type: TFColumnType.text, class: 'fit' },
  { name: 'Title', property: 'title', type: TFColumnType.text },
  {
    name: 'Status', property: 'status', type: TFColumnType.colored,
    lookup: {
      values: [],
      propToShow: ['name']
    }, class: 'fit'
  }, {
    name: 'Resolution', property: 'resolution', type: TFColumnType.colored,
    lookup: {
      values: [],
      propToShow: ['name']
    }, class: 'fit'
  }];
  allIssues: Issue[];
  myIssues: Issue[];
  quality: { current: { quality: number, NA: number, testIssue: number, other: number, appIssue: number, passed: number, total: number }, average: number };
  chartData: SingleLineBarChartData[];
  issueStat: { open: number, openApp: number, total: number, totalApp: number };

  constructor(
    public globaldata: GlobalDataService,
    private projectService: ProjectService,
    private testrunService: TestRunService,
    private issueService: IssueService,
    private auditService: AuditService,
    private testSuiteService: TestSuiteService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  async ngOnInit() {
    const projectId = this.route.snapshot.params.projectId;
    this.testRun = { project_id: projectId, debug: 0 };
    this.project = { id: projectId };

    this.allIssues = await this.issueService.getIssues({
      project_id: projectId
    });

    this.myIssues = this.allIssues.filter(x => x.status_id != 4 && x.status_id != 2 && x.assignee_id === this.globaldata.currentUser.id);

    this.suites = await this.testSuiteService.getTestSuite({ project_id: projectId });
    this.project = (await this.projectService.getProjects(this.project).toPromise())[0];

    if (this.globaldata.auditModule) {
      this.auditService.getAudits({ project: { id: this.project.id } }).subscribe(audits => {
        this.audits = audits;
        this.generateAuditNotification();
        this.setAuditNotification();
      });
    }

    this.testRuns = await this.testrunService.getTestRun(this.testRun, 5);
    this.testRunStats = await this.testrunService.getTestsRunStats(this.testRun);
    this.testRuns.forEach(testrun => {
      testrun['failed'] = this.getNumberOfFails(testrun.id);
    });
    this.quality = this.getQualityInfo(this.suites, this.testRunStats);
    this.chartData = this.createChartData(this.quality.current);
    this.issueStat = this.getIssuesStat(this.allIssues);
  }

  getIssuesStat(issues: Issue[]): { open: number, openApp: number, total: number, totalApp: number } {
    return {
      open: issues.filter(x => x.status_id != 4 && x.status_id != 2).length,
      openApp: issues.filter(x => x.status_id != 4 && x.status_id != 2 && x.resolution.color === 1).length,
      total: issues.length,
      totalApp: issues.filter(x => x.resolution.color === 1).length
    }
  }

  getNumberOfFails(id: number) {
    const stats: TestRunStat = this.testRunStats.filter(x => x.id === id)[0];
    return this.testrunService.getPassRate(stats);
  }

  openTestRun(testRunId: number) {
    this.router.navigate(['/project/' + this.project.id + '/testrun/' + testRunId]);
  }

  generateAuditNotification() {
    const latest: Audit = this.audits.filter(x => x.submitted).length > 0
      ? this.audits.sort(function (a, b) { return new Date(b.submitted).getTime() - new Date(a.submitted).getTime(); })[0]
      : undefined;
    const opened: Audit = this.audits.find(x => x.status.id !== 4);
    this.auditNotification = {
      last_submitted: latest,
      has_opened_audit: opened !== undefined,
      next_due_date: opened
        ? opened.due_date
        : latest
          ? this.auditService.createDueDate(new Date(new Date(latest.submitted).setHours(0, 0, 0, 0)))
          : this.auditService.createDueDate(new Date(new Date(this.project.created).setHours(0, 0, 0, 0)))
    };
  }

  setAuditNotification() {
    if (new Date(this.auditNotification.next_due_date)
      < new Date(new Date(new Date().setDate(new Date().getDate())).setHours(0, 0, 0, 0))) {
      this.notification = {
        text: `Next Audit should have been submitted on ${
          new Date(this.auditNotification.next_due_date).toDateString()
          } and is now overdue! Please contact your audit administrator to get more details on next audit progress.`,
        type: 'danger'
      };
    } else if (!this.auditNotification.has_opened_audit
      && new Date(this.auditNotification.next_due_date.toString()) >= new Date(new Date().setHours(0, 0, 0, 0))
      && new Date(this.auditNotification.next_due_date.toString()) <= new Date(new Date().setDate(new Date().getDate() + 14))) {
      const days = this.daysdifference(new Date(new Date().setHours(0, 0, 0, 0)),
        new Date(this.auditNotification.next_due_date.toString()));
      this.notification = {
        text: `Next Audit should be submitted ${
          days === 0 ? 'today' : `in ${days} ${days > 1 ? 'days' : 'day'}`
          } but is still not created in the system. Please contact your audit administrator to schedule a new Audit for your project.`,
        type: 'warning'
      };
    } else if (this.auditNotification.has_opened_audit && this.audits.length > 0) {
      this.notification = {
        text: `New Audit is created and planned to be finished by ${new Date(this.auditNotification.next_due_date).toDateString()}`,
        type: 'success'
      };
    }

    if (this.auditNotification.last_submitted && this.audits.length > 0) {
      const message = `Last project Audit was submitted on ${
        new Date(this.auditNotification.last_submitted.submitted).toDateString()
        } with a result of ${this.auditNotification.last_submitted.result}%`;

      if (!this.notification) { this.notification = { text: undefined, type: undefined }; }
      this.notification.text = this.notification.text
        ? `${this.notification.text} \r\n ${message}`
        : message;

      this.notification.type = this.notification.type ? this.notification.type : this.notification.type = 'success';
    }

    if (!this.notification || !this.notification.text) {
      this.notification = {
        text: `This project has no audits! Please contact your audit administrator to schedule a new Audit for your project.`,
        type: 'warning'
      };
    }
  }

  getDateAsText(date: Date) {
    return date.toDateString();
  }

  IsHideAll() {
    if (this.testRunStats) {
      this.hideAll = this.testRunStats.length === 0;
    } else {
      this.hideAll = true;
    }
    return this.hideAll;
  }

  daysdifference(date1, date2) {
    const ONEDAY = 1000 * 60 * 60 * 24;
    const date1_ms = date1.getTime();
    const date2_ms = date2.getTime();
    const difference_ms = Math.abs(date1_ms - date2_ms);
    return Math.round(difference_ms / ONEDAY);
  }

  getQualityInfo(suites: TestSuite[], testRunStats: TestRunStat[]): { current: { quality: number, NA: number, testIssue: number, other: number, appIssue: number, passed: number, total: number }, average: number } {
    const testRunStatsBySuite = [];
    for (const suite of suites) {
      const teStats: TestRunStat[] = testRunStats.filter(stat => stat.test_suite_id === suite.id);
      testRunStatsBySuite.push({ suite: suite, stats: teStats });
    }

    return {
      current: this.calculateAutomationQuality(testRunStatsBySuite),
      average: this.calculateAverageAutomationQuality(testRunStatsBySuite)
    };
  }

  calculateAutomationQuality(testRunStatsBySuites: { suite: TestSuite, stats: TestRunStat[] }[]): { quality: number, NA: number, testIssue: number, other: number, appIssue: number, passed: number, total: number } {
    let stat = { quality: 0, NA: 0, testIssue: 0, other: 0, appIssue: 0, passed: 0, total: 0 }

    for (const suiteStat of testRunStatsBySuites) {
      if (suiteStat.stats[0]) {
        stat.NA += suiteStat.stats[0].not_assigned;
        stat.appIssue += suiteStat.stats[0].app_issue;
        stat.passed += suiteStat.stats[0].passed;
        stat.testIssue += suiteStat.stats[0].warning;
        stat.other += suiteStat.stats[0].other;
        stat.total += suiteStat.stats[0].total;
      }
    }

    stat.quality = stat.total > 0 ? (1 - ((stat.NA * 1 + stat.testIssue * 0.75 + stat.other * 0.5) / (stat.total))) * 100 : 0;
    if (stat.quality < 0) {
      stat.quality = 0;
    }

    return stat;
  }

  calculateAverageAutomationQuality(testRunStatsBySuite: { suite: TestSuite, stats: TestRunStat[] }[]): number {
    let ttlNA = 0;
    let ttltestIssue = 0;
    let ttlOther = 0;
    let ttl = 0;
    let averageAutomationQuality: number;

    for (const suiteStat of testRunStatsBySuite) {
      for (const stat of suiteStat.stats) {
        if (Math.floor(new Date().getTime() - new Date(stat.finish_time).getTime()) / (1000 * 60 * 60 * 24) < 90) {
          ttlNA += stat.not_assigned;
          ttltestIssue += stat.warning;
          ttlOther += stat.other;
          ttl += stat.total;
        }
      }
    }
    averageAutomationQuality = ttl > 0 ? (1 - ((ttlNA * 1 + ttltestIssue * 0.75 + ttlOther * 0.5) / (ttl))) * 100 : 0;
    if (averageAutomationQuality < 0) {
      averageAutomationQuality = 0;
    }

    return averageAutomationQuality;
  }

  createChartData(data: { quality: number, NA: number, testIssue: number, other: number, appIssue: number, passed: number }) {
    return [{
      value: data.passed,
      color: '#28A745',
      label: 'Passed'
    }, {
      value: data.appIssue,
      color: '#DC3545',
      label: 'Application Issue'
    }, {
      value: data.testIssue,
      color: '#FFC107',
      label: 'Test Issue'
    }, {
      value: data.other,
      color: '#17A2B8',
      label: 'Other'
    }, {
      value: data.NA,
      color: '#007BFF',
      label: 'Not Assigned'
    }];
  }
}
