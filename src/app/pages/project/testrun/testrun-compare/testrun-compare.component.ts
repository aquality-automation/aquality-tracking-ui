import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TestRun } from '../../../../shared/models/testRun';
import { Test } from '../../../../shared/models/test';
import { TestResult } from '../../../../shared/models/test-result';
import { FinalResult } from '../../../../shared/models/final-result';
import { TestSuite } from 'src/app/shared/models/test-suite';
import { LocalPermissions } from 'src/app/shared/models/local-permissions';
import { ResultResolution } from 'src/app/shared/models/result-resolution';
import { TFColumn, TFOrder, TFColumnType } from 'src/app/elements/table-filter/tfColumn';
import { ResultResolutionService } from 'src/app/services/result-resolution/result-resolution.service';
import { FinalResultService } from 'src/app/services/final-result/final_results.service';
import { TestService } from 'src/app/services/test/test.service';
import { TestRunService } from 'src/app/services/testrun/testrun.service';
import { TestSuiteService } from 'src/app/services/test-suite/test-suite.service';
import { UserService } from 'src/app/services/user/user.services';

@Component({
    templateUrl: 'testrun-compare.component.html',
    styleUrls: ['testrun-compare.component.scss']
})
export class TestrunCompareComponent implements OnInit {
    suites: TestSuite[];
    tests: Test[];
    users: LocalPermissions[];
    testRuns: TestRun[];
    testRunsAvailable: TestRun[];
    selectedSuite: TestSuite;
    testRunFirst: TestRun;
    testRunSecond: TestRun;
    shownTestRunFirst: TestRun;
    shownTestRunSecond: TestRun;
    shownSuite: TestSuite;
    resultsFirst: TestResult[];
    resultsSecond: TestResult[];
    listOfResolutions: ResultResolution[];
    finalResults: FinalResult[];
    tbCols: TFColumn[];
    tbHiddenCols: TFColumn[];
    diffs: Test[];
    onlyDiffs = true;
    sortBy = { property: 'name', order: TFOrder.desc };
    lookupSortBy = { property: 'start_time', order: TFOrder.desc };
    projectId: number;

    constructor(
        private resultResolutionService: ResultResolutionService,
        private finalResultService: FinalResultService,
        private testService: TestService,
        private testrunService: TestRunService,
        private testSuiteService: TestSuiteService,
        private userService: UserService,
        private route: ActivatedRoute,
        private router: Router
    ) { }

    async ngOnInit() {
        this.projectId = this.route.snapshot.params['projectId'];
        this.suites = await this.testSuiteService.getTestSuite({ project_id: this.projectId });
        this.testRuns = await this.testrunService.getTestRun({ project_id: this.projectId });
        this.finalResults = await this.finalResultService.getFinalResult({});
        this.listOfResolutions = await this.resultResolutionService.getResolution();
        const projectUsers = await this.userService.getProjectUsers(this.projectId);
        this.users = projectUsers.filter(x => x.admin === 1 || x.manager === 1 || x.engineer === 1);
        this.route.queryParams.subscribe(params => {
            this.selectedSuite = params.suite ? this.suites.find(x => x.id === +params.suite) : undefined;
            this.testRunFirst = params.first_tr ? this.testRuns.find(x => x.id === +params.first_tr) : undefined;
            this.testRunSecond = params.second_tr ? this.testRuns.find(x => x.id === +params.second_tr) : undefined;
            this.fitTestRuns();
        });
        if (this.selectedSuite && this.testRunFirst && this.testRunSecond) { this.compare(); }
    }

    async compare() {
        this.shownTestRunFirst = this.testRunFirst;
        this.shownTestRunSecond = this.testRunSecond;
        this.shownSuite = this.selectedSuite;
        await this.getTests();
        await this.getResult(this.testRunFirst.id, 'resultsFirst');
        await this.getResult(this.testRunSecond.id, 'resultsSecond');
        await this.completeTests();
    }

    async getTests() {
        this.tests = await this.testService.getTest({
            test_suite_id: this.selectedSuite.id,
            project_id: this.selectedSuite.project_id
        });
    }

    resultsHaveDiffs(result1: TestResult, result2: TestResult): boolean {
        if ((!result1 && result2) || (result1 && !result2)) { return true; }
        if (!result1 && !result2) { return false; }
        return result1.fail_reason !== result2.fail_reason || result1.final_result.id !== result2.final_result.id;
    }

    getDiffs() {
        this.diffs = this.tests.filter(x => {
            return this.resultsHaveDiffs(x['f_result'], x['s_result']);
        });
    }

    toggleDiffs() {
        this.onlyDiffs = !this.onlyDiffs;
    }

    async getResult(id: number, results: string) {
        this[results] = (await this.testrunService.getTestRunWithChilds({ id: id }))[0].testResults;
    }

    completeTests() {
        this.tests.forEach(test => {
            test['f_result'] = this.resultsFirst.find(result => result.test.id === test.id);
            test['s_result'] = this.resultsSecond.find(result => result.test.id === test.id);
        });

        this.getDiffs();

        this.tbCols = [
            { name: 'Test Name', property: 'name', filter: true, sorting: true, type: TFColumnType.text, class: 'ft-width-180' },
            {
                name: 'First Fail Reason',
                property: 'f_result.fail_reason',
                filter: true,
                sorting: true,
                type: TFColumnType.longtext,
                listeners: ['contextmenu'],
                class: 'ft-width-250'
            },
            {
                name: 'First Result',
                property: 'f_result.final_result',
                filter: true,
                sorting: true,
                type: TFColumnType.colored,
                lookup: {
                    values: this.finalResults,
                    propToShow: ['name']
                },
                class: 'fit width100'
            },
            {
                name: 'First Resolution',
                property: 'f_result.issue.resolution',
                filter: true,
                sorting: true,
                type: TFColumnType.colored,
                lookup: {
                    values: this.listOfResolutions,
                    propToShow: ['name']
                },
                class: 'fit'
            },
            {
                name: 'Second Fail Reason',
                property: 's_result.fail_reason',
                filter: true,
                sorting: true,
                type: TFColumnType.longtext,
                editable: false,
                listeners: ['contextmenu'],
                class: 'ft-width-250'
            },
            {
                name: 'Second Result',
                property: 's_result.final_result',
                filter: true,
                sorting: true,
                type: TFColumnType.colored,
                lookup: {
                    values: this.finalResults,
                    propToShow: ['name']
                },
                editable: false,
                class: 'fit width100'
            },
            {
                name: 'Second Resolution',
                property: 's_result.issue.resolution',
                filter: true,
                sorting: true,
                type: TFColumnType.colored,
                lookup: {
                    values: this.listOfResolutions,
                    propToShow: ['name']
                },
                class: 'fit'
            }
        ];

        this.tbHiddenCols = [
            {
                name: 'First Assignee',
                property: 'f_result.issue.assignee',
                filter: true,
                sorting: true,
                type: TFColumnType.autocomplete,
                lookup: {
                    propToShow: ['first_name', 'second_name'],
                    placeholder: 'Unassinged',
                    objectWithId: 'f_result.issue.assignee',
                    values: this.users,
                },
                class: 'fit'
            },
            {
                name: 'First Comment',
                property: 'f_result.issue.title',
                filter: true,
                type: TFColumnType.textarea,
                class: 'ft-width-250'
            },
            {
                name: 'Second Assignee',
                property: 's_result.issue.assignee',
                filter: true,
                sorting: true,
                type: TFColumnType.autocomplete,
                lookup: {
                    values: this.users,
                    propToShow: ['first_name', 'second_name'],
                    objectWithId: 's_result.issue.assignee',
                },
                class: 'fit'
            },
            {
                name: 'Second Comment',
                property: 's_result.issue.title',
                filter: true,
                type: TFColumnType.textarea,
                class: 'ft-width-250'
            },
        ];
    }

    setParams() {
        if (this.selectedSuite) {
            const queryParam = {};
            queryParam['first_tr'] = this.testRunFirst ? this.testRunFirst.id : '';
            queryParam['second_tr'] = this.testRunSecond ? this.testRunSecond.id : '';
            queryParam['suite'] = this.selectedSuite ? this.selectedSuite.id : '';
            this.router.navigate([], { queryParams: queryParam, queryParamsHandling: 'merge' });
        }
    }

    fitTestRuns() {
        if (this.testRunFirst && this.testRunFirst.test_suite.id !== this.selectedSuite.id) { this.testRunFirst = undefined; }
        if (this.testRunSecond && this.testRunSecond.test_suite.id !== this.selectedSuite.id) { this.testRunSecond = undefined; }
        if (this.selectedSuite) { this.testRunsAvailable = this.testRuns.filter(tr => tr.test_suite_id === this.selectedSuite.id); }
        this.setParams();
    }

    hideVal(entity, property: string) {
        if (entity.f_result && (property === 'f_result.issue.resolution.name') && entity.f_result.final_result.color === 5) {
            return true;
        }
        if (entity.s_result && (property === 's_result.issue.resolution.name') && entity.s_result.final_result.color === 5) {
            return true;
        }
        return false;
    }

    rowClicked($event) {
        const win = window.open(`/project/${this.projectId}/test/${$event.id}`);
    }
}
