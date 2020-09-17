import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
import {TestResult} from '../../../../shared/models/test-result';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import {TestRun} from '../../../../shared/models/testrun';
import {TestRunStat} from 'src/app/shared/models/testrun-stats';
import {ProjectService} from 'src/app/services/project/project.service';
import {TestRunService} from 'src/app/services/testrun/testrun.service';
import {ModalComponent} from 'src/app/elements/modals/modal.component';
import {Milestone} from '../../../../shared/models/milestones/milestone';
import {TestSuite} from '../../../../shared/models/test-suite';
import {Test} from '../../../../shared/models/test';
import {ReportToggle} from '../../../../shared/models/milestones/report-toggle';
import {ReportOptions} from '../../../../shared/models/milestones/report-options';
import PdfDocUtils from 'src/app/shared/utils/pdf-doc.utils';

@Component({
  selector: 'print-milestone-modal',
  templateUrl: 'print-milestone.component.html',
  styleUrls: ['print-milestone.component.scss']
})
export class PrintMilestoneComponent extends ModalComponent implements OnInit {
  @Input() isHidden: boolean;
  @Input() title = 'PDF Report';
  @Input() type = '';
  @Input() buttons: any[];
  @Input() testResults: TestResult[];
  @Input() testrun: TestRun;
  @Input() milestone: Milestone;
  @Input() viewData: ViewData[];
  @Output() closed = new EventEmitter();
  @Output() execute = new EventEmitter();
  testrunStats: TestRunStat[];
  testrunsToShow = 15;
  testResultsToPrint: TestResult[] = [];
  pdf: any;
  resultRows: { name: String, final_result_name: String, test_resolution_name: String, issue: String }[] = [];
  issueRows: { issueKey: String, resolutionKey: String, statusKey: String, assigneeKey: String }[] = [];
  doc: any;
  text = '';
  failed = 0;
  passed = 0;
  appIssues = 0;
  total = 0;
  orAnd = new ReportToggle(ReportOptions.results_or_resolutions, true);
  results_toggles: ReportToggle[] = [
    new ReportToggle(ReportOptions.results_failed, true),
    new ReportToggle(ReportOptions.results_passed, false),
    new ReportToggle(ReportOptions.results_other, true)];
  resolutions_toggles: ReportToggle[] = [
    new ReportToggle(ReportOptions.resolutions_app_issue, true),
    new ReportToggle(ReportOptions.resolutions_test_issue, true),
    new ReportToggle(ReportOptions.resolutions_other, true),
    new ReportToggle(ReportOptions.resolutions_not_executed, false)];
  other_toggles: ReportToggle[] = [
    new ReportToggle(ReportOptions.issues_list, true),
    new ReportToggle(ReportOptions.trend_chart_show, true)];
  showChart = this.other_toggles.find(t => t.option === ReportOptions.trend_chart_show).state;


  constructor(
    private projectService: ProjectService,
    private testrunService: TestRunService
  ) {
    super();
  }

  async ngOnInit() {
    this.testResultsToPrint = this.testResults;
    this.testrunStats = await this.testrunService.getTestsRunStats({});

    this.regenerate();
  }

  regenerate() {
    this.calculateStats();
    this.filterResults();
    this.generatePDF();
  }

  calculateStats() {
    if (this.testResults) {
      this.total = this.testResults.length;
      this.failed = this.testResults.filter(x => x.final_result.color === 1).length;
      this.passed = this.testResults.filter(x => x.final_result.color === 5).length;
      this.appIssues = this.testResults.filter(x => x.issue && x.issue.resolution.color === 1).length;
    }
  }

  generatePDF() {
    this.transferResults();
    this.transferIssues();

    this.doc = PdfDocUtils.getPdfDoc();

    this.addMilestoneInfo();

    this.addStats();

    let optionalHeightPosition = 84;

    if (this.other_toggles.find(t => t.option === ReportOptions.trend_chart_show).state && this.testrunStats.length > 1) {
      optionalHeightPosition += this.addChart(optionalHeightPosition);
    }

    const textheight = this.addSummary();

    if (this.other_toggles.find(t => t.option === ReportOptions.issues_list).state) {
      optionalHeightPosition += this.addIssuesList(textheight, optionalHeightPosition);
    }

    this.addTable(textheight, optionalHeightPosition);

    this.pdf = this.doc.output('datauristring');
  }

  addSummary() {
    const maxLineWidth = 185,
      fontSize = 10,
      lineHeight = 0.45;
    const textLines = this.doc
      .setTextColor(0, 0, 0)
      .setFont('helvetica')
      .setFontType('normal')
      .setFontSize(fontSize)
      .splitTextToSize(this.text, maxLineWidth);
    this.doc.text(textLines, 15, (this.other_toggles.find(t => t.option === ReportOptions.trend_chart_show).state ? 134 : 84));
    return textLines.length * fontSize * lineHeight;
  }

  addIssuesList(textHeight: number, startHeight: number) {
    const columns = [
      {header: 'Issue', dataKey: 'issueKey'},
      {header: 'Resolution', dataKey: 'resolutionKey'},
      {header: 'Status', dataKey: 'statusKey'},
      {header: 'Assignee', dataKey: 'assigneeKey'}
    ];

    const options = {
      columns,
      body: this.issueRows,
      startY: startHeight + textHeight,
      styles: {overflow: 'linebreak'},
      columnStyles: {
        issueKey: {cellWidth: 'auto'},
        resolutionKey: {cellWidth: 40},
        statusKey: {cellWidth: 20},
        assigneeKey: {cellWidth: 20},
      }
    };
    if (this.issueRows.length > 0) {
      this.doc.autoTable(options);
    }
    return 30;
  }

  addTable(textHeight: number, startTableHeight: number) {
    const columns = [
      {header: 'Test Name', dataKey: 'name'},
      {header: 'Result', dataKey: 'final_result_name'},
      {header: 'Resolution', dataKey: 'test_resolution_name'},
      {header: 'Issue', dataKey: 'issue'},
    ];

    const options = {
      columns,
      body: this.resultRows,
      startY: startTableHeight + textHeight,
      styles: {overflow: 'linebreak'},
      columnStyles: {
        name: {cellWidth: 'auto'},
        final_result_name: {cellWidth: 20},
        test_resolution_name: {cellWidth: 25},
        comment: {cellWidth: 45},
        issue: {cellWidth: 20}
      }
    };
    if (this.resultRows.length > 0) {
      this.doc.autoTable(options);
    }
  }

  addStats() {
    const startHeight = 72;
    this.doc.setFontSize(20);
    this.doc.setFontType('normal');
    this.doc.text(22, startHeight, 'Total:');
    this.doc.text(42, startHeight, `${this.total}`);
    this.doc.setTextColor(204, 21, 0);
    this.doc.text(78, startHeight, 'Failed:');
    this.doc.text(102, startHeight, `${this.failed}`);
    this.doc.setTextColor(0, 153, 0);
    this.doc.text(138, startHeight, 'Passed:');
    this.doc.text(166, startHeight, `${this.passed}`);

    this.doc.setTextColor(204, 21, 0);
    this.doc.setFontSize(12);
    this.doc.text(115, startHeight + 2, `/${(this.failed / this.total * 100).toFixed(2)}%`);
    this.doc.text(90, startHeight + 6, `${this.appIssues} App Issues`);

    this.doc.setTextColor(0, 153, 0);
    this.doc.setFontSize(12);
    this.doc.text(184, startHeight + 2, `/${(this.passed / this.total * 100).toFixed(2)}%`);
  }

  addMilestoneInfo() {
    const height = 37;
    const textsize = 40;
    if (this.milestone) {
      this.doc.text(95, height + 10, this.cutText(this.milestone.name, textsize));
    }
    if (this.milestone) {
      this.doc.text(75, height + 10, 'milestones:');
    }
  }

  addChart(startHeight: number) {
    const trsNumber = this.testrunsToShow < this.testrunStats.length ? this.testrunsToShow : this.testrunStats.length;
    const step = (200 / trsNumber);
    const testValue = 40 / (this.testrunStats[0].total ? this.testrunStats[0].total : 0 + 10);
    const failedPoints = this.getPoints(step, testValue, 'failed', startHeight + 40);
    const passedPoints = this.getPoints(step, testValue, 'passed', startHeight + 40);
    const totalPoints = this.getPoints(step, testValue, 'total', startHeight + 40);

    this.doc.setDrawColor(219, 219, 219);
    this.doc.setLineWidth(0.2);
    this.doc.line(18, startHeight + 10, 202, startHeight + 10);
    this.doc.line(18, startHeight + 20, 202, startHeight + 20);
    this.doc.line(18, startHeight + 30, 202, startHeight + 30);

    failedPoints.forEach(point => {
      this.doc.setDrawColor(219, 219, 219);
      this.doc.setLineWidth(0.2);
      this.doc.line(point[0], startHeight + 42, point[0], startHeight - 2);
    });

    this.doc.setDrawColor(0, 0, 0);
    this.doc.setLineWidth(0.5);
    this.doc.line(18, startHeight + 42, 202, startHeight + 42);
    this.doc.line(18, startHeight - 2, 202, startHeight - 2);


    this.doc.setFontSize(10);
    this.doc.setFontType('normal');
    this.doc.setTextColor(0, 0, 0);
    this.doc.text(16, startHeight + 9, `${((this.testrunStats[0].total + 10) * 3 / 4).toFixed(0)}`);
    this.doc.text(16, startHeight + 19, `${((this.testrunStats[0].total + 10) * 2 / 4).toFixed(0)}`);
    this.doc.text(16, startHeight + 29, `${((this.testrunStats[0].total + 10) * 1 / 4).toFixed(0)}`);

    this.doc.setFontSize(10);
    this.doc.setFontType('bold');
    this.doc.setTextColor(219, 219, 219);
    this.doc.text(24, startHeight + 4, `Last ${trsNumber} Test Runs trend chart`);

    failedPoints.forEach((point, index) => {
      this.doc.setDrawColor(204, 21, 0);
      this.doc.setLineWidth(0.5);
      if (index !== 0) {
        this.doc.line(failedPoints[index - 1][0], failedPoints[index - 1][1], point[0], point[1]);
      }
    });

    passedPoints.forEach((point, index) => {
      this.doc.setDrawColor(0, 153, 0);
      this.doc.setLineWidth(0.5);
      if (index !== 0) {
        this.doc.line(passedPoints[index - 1][0], passedPoints[index - 1][1], point[0], point[1]);
      }
    });

    totalPoints.forEach((point, index) => {
      this.doc.setDrawColor(76, 76, 76);
      this.doc.setLineWidth(0.5);
      if (index !== 0) {
        this.doc.line(totalPoints[index - 1][0], totalPoints[index - 1][1], point[0], point[1]);
      }
    });

    return 50;
  }

  getPoints(step, value, property, startValue): { startStep: number, startValue: number }[] {
    let reversed = [];
    reversed = reversed.concat(this.testrunStats);
    if (reversed.length > this.testrunsToShow) {
      reversed = reversed.slice(0, this.testrunsToShow);
    }
    reversed = reversed.reverse();
    let startStep = 20 - step;
    const points = [];
    reversed.forEach(element => {
      startStep = startStep + step;
      const endValue = element[property] ? element[property] : 0;
      points.push([startStep, startValue - endValue * value]);
    });

    return points;
  }

  doAction(button) {
    if (button.name === 'Download') {
      this.doc.save(`Report_${this.milestone.name}_${new Date().toDateString()}.pdf`);
    } else if (button.name === 'Cancel') {
      this.execute.emit(false);
    }
  }

  filterResults() {
    this.testResultsToPrint = this.testResults;
    const notExecuted = this.viewData.filter(t => {
      return t.result.final_result.name === 'Not Executed';
    });
    this.testResultsToPrint = this.testResultsToPrint.filter(t => t.test !== undefined);
    this.testResultsToPrint = this.testResultsToPrint.filter(x => {
      const result = (x.final_result.color === 1 && this.results_toggles.find(t => t.option === ReportOptions.results_failed).state)
        || (x.final_result.color === 5 && this.results_toggles.find(t => t.option === ReportOptions.results_passed).state)
        || (x.final_result.color !== 5 && x.final_result.color !== 1 && this.results_toggles.find(t => t.option === ReportOptions.results_other).state);
      let resolution = (this.resolutions_toggles.find(t => t.option === ReportOptions.resolutions_app_issue).state
        && this.resolutions_toggles.find(t => t.option === ReportOptions.resolutions_test_issue).state
        && this.resolutions_toggles.find(t => t.option === ReportOptions.resolutions_other).state) || (!this.resolutions_toggles.find(t => t.option === ReportOptions.resolutions_app_issue).state
        && !this.resolutions_toggles.find(t => t.option === ReportOptions.resolutions_test_issue).state
        && !this.resolutions_toggles.find(t => t.option === ReportOptions.resolutions_other).state);
      if (x.issue) {
        resolution = (x.issue.resolution.color === 1 && this.resolutions_toggles.find(t => t.option === ReportOptions.resolutions_app_issue).state)
          || (x.issue.resolution.color === 2 && this.resolutions_toggles.find(t => t.option === ReportOptions.resolutions_test_issue).state)
          || (x.issue.resolution.color !== 2 && x.issue.resolution.color !== 1 && this.resolutions_toggles.find(t => t.option === ReportOptions.resolutions_other).state);
      }
      return this.orAnd.state ? result && resolution : result || resolution;
    });
    if (this.resolutions_toggles.find(t => t.option === ReportOptions.resolutions_not_executed).state) {
      notExecuted.forEach(notExResult => {
        this.testResultsToPrint.push(<TestResult>{
          final_result: notExResult.result.final_result,
          test: <Test>{
            name: notExResult.testName
          }
        });
      });
    }
  }

  transferResults() {
    this.resultRows = [];
    this.testResultsToPrint.forEach(result => {
      this.resultRows.push({
        name: result.test.name,
        test_resolution_name: result.issue ? result.issue.resolution.name : '',
        final_result_name: result.final_result ? result.final_result.name : '',
        issue: result.issue ? result.issue.title : ''
      });
    });
  }

  transferIssues() {
    this.issueRows = [];
    const issueMap = this.testResultsToPrint.filter(t => t.issue !== undefined).map(t => t.issue);
    const uniqueIssues = Array.from(new Set(issueMap.map(t => t.title))).map(title => {
      return issueMap.find(issue => issue.title === title);
    });

    uniqueIssues.forEach(t => this.issueRows.push({
      issueKey: t.title,
      assigneeKey: t.assignee !== undefined ? `${t.assignee.first_name} ${t.assignee.second_name}` : '',
      resolutionKey: t.resolution !== undefined ? t.resolution.name : '',
      statusKey: t.status !== undefined ? t.status.name : ''
    }));
  }

  cutText(text: string, size: number) {
    const dots = text.length > size ? '...' : '';
    return `${text.substring(0, size)}${dots}`;
  }
}

interface ViewData {
  testName: string;
  suite: TestSuite;
  result: TestResult;
}
