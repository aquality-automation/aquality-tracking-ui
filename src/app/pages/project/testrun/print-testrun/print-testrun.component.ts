import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { BasePopupComponent } from '../../../../elements/modals/basePopup.component';
import { TestResult } from '../../../../shared/models/test-result';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { TestRun } from '../../../../shared/models/testRun';
import { TestRunService } from '../../../../services/testRun.service';
import { TestRunStat } from '../../../../shared/models/testrunStats';
import { ProjectService } from '../../../../services/project.service';
import { Project } from '../../../../shared/models/project';

@Component({
    selector: 'print-testrun-modal',
    templateUrl: 'print-testrun.component.html',
    styleUrls: ['print-testrun.component.css']
})
export class PrintTestrunComponent extends BasePopupComponent implements OnInit {
    @Input() isHidden: boolean;
    @Input() title = 'PDF Report';
    @Input() type = '';
    @Input() buttons: any[];
    @Input() testResults: TestResult[];
    @Input() testRun: TestRun;
    @Output() closed = new EventEmitter();
    @Output() execute = new EventEmitter();
    project: Project;
    testRunStats: TestRunStat[];
    testRunsToShow = 15;
    showOther = true;
    showFailed = true;
    showPassed = false;
    showAppIssue = true;
    showTestIssue = true;
    showOtherResolutions = true;
    testResultsToPrint: TestResult[] = [];
    pdf: any;
    rows: { name: String, final_result_name: String, test_resolution_name: String, issue: String }[] = [];
    doc: any;
    orAnd = true;
    text = '';
    failed = 0;
    passed = 0;
    appIssues = 0;
    total = 0;
    showChart = true;

    constructor(
        private projectService: ProjectService,
        private testRunService: TestRunService
    ) {
        super();
    }

    ngOnInit() {
        this.testResultsToPrint = this.testResults;
        this.projectService.getProjects({ id: this.testRun.project_id }).subscribe(projects => {
            this.project = projects[0];
            this.testRunService.getTestsRunStats({
                project_id: this.testRun.project_id,
                test_suite: this.testRun.test_suite
            }).then(testRuns => {
                this.testRunStats = testRuns;
                this.regenerate();
            });
        });
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
        /* tslint:disable:max-line-length */
        const imgData = 'data:image/png;base64,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';
        /* tslint:enable:max-line-length */
        this.doc = new jsPDF();

        this.doc.addImage(imgData, 'JPEG', 15, 15, 25, 25);
        this.doc.setFontSize(20);
        this.doc.text(38, 28, this.cutText(this.project.name, 35));
        this.doc.setFontSize(10);
        this.doc.setTextColor(168, 168, 168);
        this.doc.text(42, 33, 'Aquality Tracking');
        this.doc.setTextColor(0, 0, 0);

        this.doc.setDrawColor(168, 168, 168);
        this.doc.setLineWidth(0.1);
        this.doc.line(72, 30, 72, 62);

        this.doc.setFontSize(10);
        this.doc.text(170, 15, new Date().toDateString());

        this.addTestrunInfo();

        this.addStats();

        if (this.showChart && this.testRunStats.length > 1) {
            this.addChart();
        }

        const textheight = this.addSummary();

        this.addTable(textheight);

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
        this.doc.text(textLines, 15, (this.showChart ? 134 : 84));
        return textLines.length * fontSize * lineHeight;
    }

    addTable(textHeight) {
        const columns = [
            { title: 'Test Name', dataKey: 'name' },
            { title: 'Result', dataKey: 'final_result_name' },
            { title: 'Resolution', dataKey: 'test_resolution_name' },
            { title: 'Issue', dataKey: 'issue' },
        ];

        const options = {
            startY: (this.showChart ? 134 : 84) + textHeight,
            styles: { overflow: 'linebreak' },
            columnStyles: {
                name: { columnWidth: 100 },
                final_result_name: { columnWidth: 20 },
                test_resolution_name: { columnWidth: 25 },
                comment: { columnWidth: 45 },
            }
        };
        if (this.rows.length > 0) {
            this.doc.autoTable(columns, this.rows, options);
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

    addTestrunInfo() {
        const height = 37;
        const textsize = 40;
        if (this.testRun.test_suite) {
            this.doc.text(95, height, this.cutText(this.testRun.test_suite.name, textsize));
        }
        this.doc.text(95, height + 5, this.cutText(this.testRun.build_name, textsize));
        if (this.testRun.milestone) { this.doc.text(95, height + 10, this.cutText(this.testRun.milestone.name, textsize)); }
        this.doc.text(95, height + 15, new Date(this.testRun.start_time).toLocaleString());
        this.doc.text(95, height + 20, new Date(this.testRun.finish_time).toLocaleString());

        this.doc.setFontType('bold');
        this.doc.text(75, height, 'Suite:');
        this.doc.text(75, height + 5, 'Build:');
        if (this.testRun.milestone) { this.doc.text(75, height + 10, 'Milestone:'); }
        this.doc.text(75, height + 15, 'Started:');
        this.doc.text(75, height + 20, 'Finished:');
    }

    addChart() {
        const startHeight = 84;
        const trsNumber = this.testRunsToShow < this.testRunStats.length ? this.testRunsToShow : this.testRunStats.length;
        const step = (200 / trsNumber);
        const testValue = 40 / (this.testRunStats[0].total + 10);
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
        this.doc.text(16, startHeight + 9, `${((this.testRunStats[0].total + 10) * 3 / 4).toFixed(0)}`);
        this.doc.text(16, startHeight + 19, `${((this.testRunStats[0].total + 10) * 2 / 4).toFixed(0)}`);
        this.doc.text(16, startHeight + 29, `${((this.testRunStats[0].total + 10) * 1 / 4).toFixed(0)}`);

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
    }

    getPoints(step, value, property, startValue): {startStep: number, startValue: number}[] {
        let reversed = [];
        reversed = reversed.concat(this.testRunStats);
        if (reversed.length > this.testRunsToShow) {
            reversed = reversed.slice(0, this.testRunsToShow);
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
        if (button.execute) {
            this.doc.save(`Report_${this.testRun.build_name}_${this.testRun.test_suite.name}_${new Date().toDateString()}.pdf`);
        } else {
            this.execute.emit(false);
        }
    }

    filterResults() {
        this.testResultsToPrint = this.testResults;
        this.testResultsToPrint = this.testResultsToPrint.filter(x => {
            const result = (x.final_result.color === 1 && this.showFailed)
                || (x.final_result.color === 5 && this.showPassed)
                || (x.final_result.color !== 5 && x.final_result.color !== 1 && this.showOther);
            let resolution = (this.showAppIssue
                && this.showTestIssue
                && this.showOtherResolutions) || (!this.showAppIssue
                    && !this.showTestIssue
                    && !this.showOtherResolutions);
            if (x.issue) {
                resolution = (x.issue.resolution.color === 1 && this.showAppIssue)
                    || (x.issue.resolution.color === 2 && this.showTestIssue)
                    || (x.issue.resolution.color !== 2 && x.issue.resolution.color !== 1 && this.showOtherResolutions);
            }

            return this.orAnd ? result && resolution : result || resolution;
        });
    }

    transferResults() {
        this.rows = [];
        this.testResultsToPrint.forEach(result => {
            this.rows.push({
                name: result.test.name,
                test_resolution_name: result.issue ? result.issue.resolution.name : '',
                final_result_name: result.final_result ? result.final_result.name : '',
                issue: result.issue ? result.issue.title : ''
            });
        });
    }

    cutText(text: string, size: number) {
        const dots = text.length > size ? '...' : '';
        return `${text.substring(0, size)}${dots}`;
    }
}
