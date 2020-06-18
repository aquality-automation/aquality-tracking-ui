import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Test } from '../../../../shared/models/test';
import { TestRun, TestRunLabel } from '../../../../shared/models/testrun';
import { FinalResult } from '../../../../shared/models/final-result';
import { DatePipe } from '@angular/common';
import { TestSuite } from 'src/app/shared/models/test-suite';
import { TFColumn, TFColumnType } from 'src/app/elements/table-filter/tfColumn';
import { ResultResolution } from 'src/app/shared/models/result-resolution';
import { ResultResolutionService } from 'src/app/services/result-resolution/result-resolution.service';
import { FinalResultService } from 'src/app/services/final-result/final_results.service';
import { TestService } from 'src/app/services/test/test.service';
import { TestRunService } from 'src/app/services/testrun/testrun.service';
import { TestSuiteService } from 'src/app/services/test-suite/test-suite.service';

@Component({
    templateUrl: 'testrun-matrix.component.html',
    styleUrls: ['testrun-matrix.component.scss']
})
export class TestrunMatrixComponent implements OnInit {
    suites: TestSuite[];
    selectedSuite: TestSuite;
    resultsNumber = '20';
    resultNumbers: string[] = ['5', '10', '20', '30', 'All'];
    tests: Test[];
    tbCols: TFColumn[] = [];
    dataToshow: any[] = [];
    testruns: TestRun[];
    finalResults: FinalResult[];
    labels: TestRunLabel[];
    label: TestRunLabel;
    filterValues: any[] = [];
    listOfResolutions: ResultResolution[];
    showResolutions = true;
    projectId: number;

    constructor(
        private resultResolutionService: ResultResolutionService,
        private finalResultService: FinalResultService,
        private testService: TestService,
        private testrunService: TestRunService,
        private testSuiteService: TestSuiteService,
        private route: ActivatedRoute,
        private router: Router,
        public datepipe: DatePipe
    ) { }

    async ngOnInit() {
        this.projectId = this.route.snapshot.params['projectId'];
        this.suites = await this.testSuiteService.getTestSuite({ project_id: this.projectId });
        this.finalResults = await this.finalResultService.getFinalResult({});
        this.labels = await this.testrunService.getTestsRunLabels();
        this.listOfResolutions = await this.resultResolutionService.getResolution(this.projectId);
        const frFilter = this.finalResults.find(x => x.id === 2);
        frFilter.id = 100000;
        this.listOfResolutions.push(frFilter);
        this.filterValues = this.listOfResolutions;

        this.route.queryParams.subscribe(params => {
            this.selectedSuite = params['suite'] ? this.suites.find(x => x.id === +params['suite']) : undefined;
            this.resultsNumber = params['limit'] ? this.resultNumbers.find(x => x === params['limit']) : '20';
            this.label = params['label'] ? this.labels.find(x => x.id === +params['label']) : undefined;
        });
    }

    async getMatrix() {
        this.testruns = await this.testrunService.getTestRunWithChilds(
            this.getTestRunSearchTemplate(),
            this.getResultsNumber()
        );
        this.tests = await this.testService.getTest({
            test_suite_id: this.selectedSuite.id,
            project_id: this.selectedSuite.project_id
        });
        this.refreshDataToShow();
        this.refreshTable(this.showResolutions);
    }

    refreshDataToShow() {
        this.dataToshow = [];
        this.tests.forEach(test => {
            const dataEntity = { id: test.id, testName: test.name };
            this.testruns.forEach(testrun => {
                if (testrun.testResults) {
                    const result = testrun.testResults.find(x => x.test.id === test.id);
                    if (result) {
                        if (result.final_result.id !== 2) {
                            dataEntity[`${testrun.id}_resolution`] = result.issue ? result.issue.resolution : undefined;
                            dataEntity[`${testrun.id}_result`] = result.final_result;
                        } else {
                            const frFilter = result.final_result;
                            if (frFilter.id === 2) { frFilter.id = 100000; }
                            dataEntity[`${testrun.id}_resolution`] = frFilter;
                            dataEntity[`${testrun.id}_result`] = result.final_result;
                        }
                        dataEntity[`${testrun.id}_result`]['comment'] = result.issue ? result.issue.title : '';
                    } else {
                        dataEntity[`${testrun.id}_result`] = { name: 'Not Implemented' };
                        dataEntity[`${testrun.id}_resolution`] = { name: 'Not Implemented' };
                    }
                }
            });
            this.dataToshow.push(dataEntity);
        });
    }

    getTestRunSearchTemplate(): TestRun {
        const searchTemplate: TestRun = {
            test_suite_id: this.selectedSuite.id
        };

        if (this.label) {
            searchTemplate.label_id = this.label.id;
        }

        return searchTemplate;
    }

    getResultsNumber(): number {
        return this.resultsNumber === 'All' ? 0 : +this.resultsNumber;
    }

    setParams() {
        if (this.selectedSuite) {
            const queryParams = {};
            queryParams['suite'] = this.selectedSuite ? this.selectedSuite.id : '';
            queryParams['limit'] = this.resultsNumber ? this.resultsNumber : '';
            queryParams['label'] = this.label ? this.label.id : '';
            this.router.navigate([], { queryParams, queryParamsHandling: 'merge' });
        }
    }

    toggleShowResolutions() {
        this.showResolutions = !this.showResolutions;
        this.refreshTable(this.showResolutions);
    }

    refreshTable(state: boolean) {
        this.showResolutions = state;
        this.filterValues = state ? this.listOfResolutions : this.finalResults;
        this.tbCols = [];
        this.tbCols.push({
            name: 'Test Name',
            property: 'testName',
            filter: true,
            sorting: true,
            type: TFColumnType.text,
            editable: false,
            class: 'ft-width-180',
            link: { template: `/project/${this.projectId}/test/{id}`, properties: ['id'] }
        });
        this.testruns.forEach(testrun => {
            this.tbCols.push({
                name: `${testrun.id} | ${testrun.label.name} | ${this.datepipe.transform(new Date(testrun.start_time), 'MM/dd/yy')}`,
                title: `${testrun.id}_result.comment`,
                property: state ? `${testrun.id}_resolution` : `${testrun.id}_result`,
                filter: true,
                sorting: true,
                type: TFColumnType.colored,
                lookup: {
                    values: this.filterValues,
                    propToShow: ['name']
                },
                class: 'fit',
                headerlink: `/project/${this.projectId}/testrun/${testrun.id}`
            });
        });
    }
}
