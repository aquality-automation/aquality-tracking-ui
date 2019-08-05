import { by, element } from 'protractor';
import { SmartTable } from '../../elements/smartTable.element';

export const elements = {
    uniqueElement: element(by.css('testrun-result-timeline canvas')),
    testRunsTable: new SmartTable(by.id('datatable'))
};

export const names = {
    pageName: 'Test Run List Page'
};
