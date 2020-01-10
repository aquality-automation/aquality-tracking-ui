import { by, element } from 'protractor';
import { SmartTable } from '../../../elements/smartTable.element';
import { UiSwitch } from '../../../elements/ui-switch';
import { ResultPieChart } from '../../../elements/charts/resultPie.element';
import { ResolutionPieChart } from '../../../elements/charts/resolution.Pie.element';

export const baseUrl = (projectId: number, milestoneId: number) => `/project/${projectId}/milestone/${milestoneId}`;

export const elements = {
    uniqueElement: element(by.id('milestone-view')),
    milestonesTable: new SmartTable(by.id('suite-results')),
    distinctTest: new UiSwitch(by.css('#stack-suites ui-switch')),
    resultsChart: new ResultPieChart(by.id('finalResultsChart')),
    resolutionsChart: new ResolutionPieChart(by.id('resultResolutionsChart'))
};

export const names = {
    pageName: 'Milestone View Page'
};

export const columns = {
    test: 'Test',
    finished: 'Finished',
    result: 'Result',
    resolution: 'Resolution'
};
