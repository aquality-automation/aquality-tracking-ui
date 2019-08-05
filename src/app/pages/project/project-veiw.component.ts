import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SimpleRequester } from '../../services/simple-requester';
import { TestRun } from '../../shared/models/testRun';
import { Project } from '../../shared/models/project';
import { TestRunService } from '../../services/testRun.service';
import { ProjectService } from '../../services/project.service';
import { TestSuiteService } from '../../services/testSuite.service';
import { TestRunStat } from '../../shared/models/testrunStats';
import { AuditService } from '../../services/audits.service';
import { Audit, AuditNotification } from '../../shared/models/audit';
import { GlobalDataService } from '../../services/globaldata.service';

@Component({
  templateUrl: './project-view.component.html',
  providers: [
    TestRunService,
    SimpleRequester,
    ProjectService,
    TestSuiteService,
    AuditService
  ]
})
export class ProjectViewComponent implements OnInit {
  audits: Audit[];
  project: Project;
  testRuns: TestRun[];
  testRun: TestRun;
  testRunStats: TestRunStat[];
  hideAll = true;
  auditNotification: AuditNotification;
  notification: { text: string, type: string };
  columns: any[];

  constructor(
    public globaldata: GlobalDataService,
    private projectService: ProjectService,
    private testrunService: TestRunService,
    private auditService: AuditService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  async ngOnInit() {
    this.testRun = { project_id: this.route.snapshot.params['projectId'], debug: 0 };
    this.project = { id: this.route.snapshot.params['projectId'] };

    this.projectService.getProjects(this.project).subscribe(async (projects) => {
      this.project = projects[0];
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
      this.columns = [
        { name: 'Build Name', property: 'build_name', type: 'text' },
        { name: 'Execution Environment', property: 'execution_environment', type: 'text' },
        { name: 'Start Time', property: 'start_time', type: 'date', class: 'fit' },
        { name: 'Finish Time', property: 'finish_time', type: 'date', class: 'fit' },
        { name: 'Failed Tests, %', property: 'failed', type: 'text', class: 'fit' },
      ];
    });
  }

  getNumberOfFails(id: number) {
    const stats: TestRunStat = this.testRunStats.filter(x => x.id === id)[0];
    return stats ? (stats.failed / stats.total * 100).toFixed(2) : 0;
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
}
