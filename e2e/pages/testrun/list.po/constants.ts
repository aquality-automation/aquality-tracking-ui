import { by, element } from 'protractor';
import { SmartTable } from '../../../elements/smartTable.element';

export const elements = {
    uniqueElement: element(by.css('testrun-result-timeline canvas')),
    testRunsTable: new SmartTable(by.id('datatable')),
    matrixButton: element(by.id('suiteMatrix'))
};

export const names = {
    pageName: 'Test Run List Page'
};

export const columns = {
    build: 'Build',
    milestone: 'Milestone'
};

