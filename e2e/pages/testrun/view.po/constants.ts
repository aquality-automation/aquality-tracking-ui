import { by, element } from 'protractor';
import { SmartTable } from '../../../elements/smartTable.element';
import { ResultSearcher } from '../../../elements/searcher';
import { ResolutionPieChart } from '../../../elements/charts/resolution.Pie.element';
import { ResultPieChart } from '../../../elements/charts/resultPie.element';
import { InlineEditor } from '../../../elements/inlineEditor.element';
import { Autocomplete } from '../../../elements/autocomplete.element';
import { Checkbox } from '../../../elements/checkbox.element';

export const baseUrl = function (projectId: number, testRunId: number) {
    return `#/project/${projectId}/testrun/${testRunId}`;
};

export const names = {
    pageName: 'Test Run View Page',
    buildNameLabel: 'Build Name:',
    milestoneLabel: 'Milestone:',
    testSuiteLabel: 'Test Suite:',
    startTimeLabel: 'Start Time:'
};

export const elements = {
    uniqueElement: element(by.id('test-run-view')),
    buildName: new InlineEditor(by.id(`build_name`)),
    milestoneField: new Autocomplete(by.id(`milestone`)),
    executor: new InlineEditor(by.id(`executor`)),
    executionEnvironment: new InlineEditor(by.id(`execution_environment`)),
    testSuiteLink: element(by.id(`suite_link`)),
    startTimeLabel: element(by.id(`start-time`)),
    resultsTable: new SmartTable(by.css('#testRunViewResultsGrid #resultsGridMain')),
    resultSearcher: new ResultSearcher(by.id('resultSearcher')),
    resultsChart: new ResultPieChart(by.id('finalResultsChart')),
    resolutionsChart: new ResolutionPieChart(by.id('resultResolutionsChart')),
    ciBuildContainer: element(by.id('ci_build_container')),
    finish: element(by.id('finish')),
    reopen: element(by.id('reopen')),
    duration: element(by.id('duration')),
    debug: new Checkbox(by.id('debug'))
};

export const columns = {
    testName: 'Test Name',
    failReason: 'Fail Reason',
    result: 'Result',
    resolution: 'Resolution',
    issue: 'Issue'
};
