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
    @Input() finalResultsChart;
    @Input() resultResolutionsChart;
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
    rows: { name: string, final_result_name: string, test_resolution_name: string, comment: string }[] = [];
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
        private testRunService: TestRunService,
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
            this.appIssues = this.testResults.filter(x => x.test_resolution && x.test_resolution.color === 1).length;
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
        this.doc.text(42, 33, 'Reporting Portal');
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
            { title: 'Comment', dataKey: 'comment' },
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

    getPoints(step, value, property, startValue) {
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
            points.push([startStep, startValue - element[property] * value]);
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
            if (x.test_resolution) {
                resolution = (x.test_resolution.color === 1 && this.showAppIssue)
                    || (x.test_resolution.color === 2 && this.showTestIssue)
                    || (x.test_resolution.color !== 2 && x.test_resolution.color !== 1 && this.showOtherResolutions);
            }

            return this.orAnd ? result && resolution : result || resolution;
        });
    }

    transferResults() {
        this.rows = [];
        this.testResultsToPrint.forEach(result => {
            this.rows.push({
                name: result.test.name,
                test_resolution_name: result.test_resolution ? result.test_resolution.name : '',
                final_result_name: result.final_result ? result.final_result.name : '',
                comment: result.comment ? result.comment : ''
            });
        });
    }

    cutText(text: string, size: number) {
        const dots = text.length > size ? '...' : '';
        return `${text.substring(0, size)}${dots}`;
    }
}
