import { by, element } from 'protractor';
import { SmartTable } from '../../../elements/smartTable.element';
import { UiSwitch } from '../../../elements/ui-switch';
import { ResultPieChart } from '../../../elements/charts/resultPie.element';
import { ResolutionPieChart } from '../../../elements/charts/resolution.Pie.element';
import { Multiselect } from '../../../elements/multiselect.element';
import { DatePicker } from '../../../elements/datepicker.element';

export const baseUrl = (projectId: number, milestoneId: number) => `/project/${projectId}/milestone/${milestoneId}`;

export const elements = {
    uniqueElement: element(by.id('milestone-view')),
    milestonesTable: new SmartTable(by.id('suite-results')),
    distinctTest: new UiSwitch(by.css('#stack-suites ui-switch')),
    resultsChart: new ResultPieChart(by.id('finalResultsChart')),
    resolutionsChart: new ResolutionPieChart(by.id('resultResolutionsChart')),
    suites: new Multiselect(by.id('suites')),
    notExecutedSuites: element(by.id('not-executed-suites')),
    dueDate: new DatePicker(by.id('milestone-due-date')),
    warning: element(by.css('#milestone-view fa-icon.warning-icon')),
    warningTitle: element(by.css('#milestone-view fa-icon.warning-icon title')),
    activeSwitch: new UiSwitch(by.css('#active-switch ui-switch'))
};

export const names = {
    pageName: 'Milestone View Page'
};

export const columns = {
    test: 'Test',
    finished: 'Finished',
    result: 'Result',
    resolution: 'Resolution',
    testrun: 'Test Run'
};
