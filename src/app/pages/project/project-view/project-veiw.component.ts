import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TestRun } from '../../../shared/models/testRun';
import { Project } from '../../../shared/models/project';
import { TestRunService } from '../../../services/testRun.service';
import { ProjectService } from '../../../services/project.service';
import { TestRunStat } from '../../../shared/models/testrunStats';
import { AuditService } from '../../../services/audits.service';
import { Audit } from '../../../shared/models/audit';
import { GlobalDataService } from '../../../services/globaldata.service';
import { TFColumn, TFColumnType } from '../../../elements/table/tfColumn';
import { IssueService } from '../../../services/issue.service';
import { Issue } from '../../../shared/models/issue';
import { SingleLineBarChartData } from '../../../elements/single-line-bar-chart/single-line-bar-chart.component';
import { TestSuiteService } from '../../../services/testSuite.service';
import { TestSuite } from '../../../shared/models/testSuite';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

@Component({
  templateUrl: './project-view.component.html',
  styleUrls: ['./project-view.component.css']
})
export class ProjectViewComponent implements OnInit {
  icons = { faExclamationTriangle };
  activateParts: number[] = [];
  audits: Audit[];
  suites: TestSuite[];
  project: Project;
  testRuns: TestRun[];
  testRun: TestRun;
  testRunStats: TestRunStat[];
  hideAll = true;
  notification: string;
  testRunColumns: TFColumn[] = [
    { name: 'Build Name', property: 'build_name', type: TFColumnType.text },
    { name: 'Execution Environment', property: 'execution_environment', type: TFColumnType.text },
    { name: 'Suite', property: 'test_suite.name', type: TFColumnType.text },
    { name: 'Start Time', property: 'start_time', type: TFColumnType.date, class: 'fit' },
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

    this.project = (await this.projectService.getProjects(this.project).toPromise())[0];

    [this.allIssues,this.suites, this.testRuns, this.testRunStats] = await Promise.all([
      this.issueService.getIssues({ project_id: projectId }),
      this.testSuiteService.getTestSuite({ project_id: projectId }),
      this.testrunService.getTestRun(this.testRun, 5),
      this.testrunService.getTestsRunStats(this.testRun)
    ])

    this.myIssues = this.allIssues.filter(x => x.status_id != 4 && x.status_id != 2 && x.assignee_id === this.globaldata.currentUser.id);

    if (this.globaldata.auditModule) {
      this.audits = await this.auditService.getAudits({ project: { id: this.project.id } }).toPromise();
      this.notification = this.generateAuditNotification(this.audits);
    }

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

  openTestRun(testRun: TestRun) {
    this.router.navigate([`/project/${testRun.project_id}/testrun/${testRun.id}`]);
  }

  openIssue(issue: Issue) {
    this.router.navigate([`/project/${issue.project_id}/issue/${issue.id}`]);
  }

  generateAuditNotification(audits: Audit[]): string {
    if (!audits || audits.length === 0) {
      return `This project has no audits! Please contact your audit administrator to schedule a new Audit for your project.`
    }
    const lastSubmitted: Audit = this.audits.filter(x => x.submitted).length > 0
      ? this.audits.sort(function (a, b) { return new Date(b.submitted).getTime() - new Date(a.submitted).getTime(); })[0]
      : undefined;
    if (lastSubmitted) {
      const lastSubmittedDate = new Date(lastSubmitted.submitted);
      const nextDueDate = new Date(lastSubmittedDate).setMonth(lastSubmittedDate.getMonth() + 6);
      if (nextDueDate < new Date().getTime()) {
        return `Over half a year has passed since last submitted Audit. Please make sure the process of the new Audit is going well.`
      }
    }
  }

  showMeaningful() {
    this.activateParts = [0, 1];
  };

  hideMeaningful() {
    this.activateParts = [];
  };

  IsHideAll() {
    if (this.testRunStats) {
      this.hideAll = this.testRunStats.length === 0;
    } else {
      this.hideAll = true;
    }
    return this.hideAll;
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
