import { Component, OnInit } from '@angular/core';
import { TestRunService } from '../../../../services/testRun.service';
import { TestSuiteService } from '../../../../services/testSuite.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SimpleRequester } from '../../../../services/simple-requester';
import { TestSuite } from '../../../../shared/models/testSuite';
import { TestRun } from '../../../../shared/models/testRun';
import { Test } from '../../../../shared/models/test';
import { TestService } from '../../../../services/test.service';
import { TestResult } from '../../../../shared/models/test-result';
import { TestResultService } from '../../../../services/test-result.service';
import { ResultResolution } from '../../../../shared/models/result_resolution';
import { FinalResult } from '../../../../shared/models/final-result';
import { ResultResolutionService } from '../../../../services/result-resolution.service';
import { FinalResultService } from '../../../../services/final_results.service';
import { LocalPermissions } from '../../../../shared/models/LocalPermissions';
import { UserService } from '../../../../services/user.services';

@Component({
    templateUrl: 'testrun-compare.component.html',
    styleUrls: ['testrun-compare.component.css'],
    providers: [
        TestRunService,
        SimpleRequester,
        TestSuiteService,
        TestService,
        ResultResolutionService,
        FinalResultService,
        TestResultService
    ]
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
    tbCols: any[];
    tbHiddenCols: any[];
    diffs: Test[];
    onlyDiffs = true;
    sortBy = { property: 'name', order: 'desc' };
    lookupSortBy = { property: 'start_time', order: 'desc' };

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
        this.suites = await this.testSuiteService.getTestSuite({ project_id: this.route.snapshot.params['projectId'] });
        this.testRuns = await this.testrunService.getTestRun({ project_id: this.route.snapshot.params['projectId'] });
        this.finalResults = await this.finalResultService.getFinalResult({});
        await this.resultResolutionService.getResolution().toPromise().then(resolutions => {
            this.listOfResolutions = resolutions;
            this.userService.getProjectUsers(this.route.snapshot.params['projectId']).subscribe(projectUsers => {
                this.users = projectUsers.filter(x => x.admin === 1 || x.manager === 1 || x.engineer === 1);
            });
            this.route.queryParams.subscribe(params => {
                this.selectedSuite = params['suite'] ? this.suites.find(x => x.id === +params['suite']) : undefined;
                this.testRunFirst = params['first_tr'] ? this.testRuns.find(x => x.id === +params['first_tr']) : undefined;
                this.testRunSecond = params['second_tr'] ? this.testRuns.find(x => x.id === +params['second_tr']) : undefined;
                this.fitTestRuns();
            });
            if (this.selectedSuite && this.testRunFirst && this.testRunSecond) { this.compare(); }
        });
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
        }).toPromise();
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
            { name: 'Test Name', property: 'name', filter: true, sorting: true, type: 'text', editable: false, class: 'ft-width-180' },
            {
                name: 'First Fail Reason',
                property: 'f_result.fail_reason',
                filter: true,
                sorting: true,
                type: 'long-text',
                editable: false,
                listeners: ['contextmenu'],
                class: 'ft-width-250'
            },
            {
                name: 'First Result',
                property: 'f_result.final_result.name',
                filter: true,
                sorting: true,
                type: 'lookup-colored',
                entity: 'f_result.final_result',
                values: this.finalResults,
                editable: false,
                class: 'fit width100'
            },
            {
                name: 'First Resolution',
                property: 'f_result.test_resolution.name',
                filter: true,
                sorting: true,
                type: 'lookup-colored',
                entity: 'f_result.test_resolution',
                allowEmpty: false,
                values: this.listOfResolutions,
                editable: false,
                class: 'fit'
            },
            {
                name: 'Second Fail Reason',
                property: 's_result.fail_reason',
                filter: true,
                sorting: true,
                type: 'long-text',
                editable: false,
                listeners: ['contextmenu'],
                class: 'ft-width-250'
            },
            {
                name: 'Second Result',
                property: 's_result.final_result.name',
                filter: true,
                sorting: true,
                type: 'lookup-colored',
                entity: 's_result.final_result',
                values: this.finalResults,
                editable: false,
                class: 'fit width100'
            },
            {
                name: 'Second Resolution',
                property: 's_result.test_resolution.name',
                filter: true,
                sorting: true,
                type: 'lookup-colored',
                entity: 's_result.test_resolution',
                allowEmpty: false,
                values: this.listOfResolutions,
                editable: false,
                class: 'fit'
            }
        ];

        this.tbHiddenCols = [
            {
                name: 'First Assignee',
                property: 'f_result.assigned_user.user',
                filter: true,
                sorting: true,
                type: 'lookup-autocomplete',
                propToShow: ['user.first_name', 'user.second_name'],
                entity: 'f_result.assigned_user',
                allowEmpty: true,
                placeholder: 'Unassinged',
                objectWithId: 'f_result.assigned_user.user',
                values: this.users,
                editable: false,
                class: 'fit'
            },
            {
                name: 'First Comment',
                property: 'f_result.comment',
                filter: true,
                sorting: false,
                type: 'textarea',
                editable: false,
                class: 'ft-width-250'
            },
            {
                name: 'Second Assignee',
                property: 's_result.assigned_user.user',
                filter: true,
                sorting: true,
                type: 'lookup-autocomplete',
                propToShow: ['user.first_name', 'user.second_name'],
                entity: 's_result.assigned_user',
                allowEmpty: true,
                placeholder: 'Unassinged',
                objectWithId: 's_result.assigned_user.user',
                values: this.users,
                editable: false,
                class: 'fit'
            },
            {
                name: 'Second Comment',
                property: 's_result.comment',
                filter: true,
                sorting: false,
                type: 'textarea',
                editable: false,
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
        if (entity.f_result && (property === 'f_result.test_resolution.name') && entity.f_result.final_result.color === 5) {
            return true;
        }
        if (entity.s_result && (property === 's_result.test_resolution.name') && entity.s_result.final_result.color === 5) {
            return true;
        }
        return false;
    }

    rowClicked($event) {
        const win = window.open(`#/project/${this.route.snapshot.params['projectId']}/test/${$event.id}`);
    }
}
