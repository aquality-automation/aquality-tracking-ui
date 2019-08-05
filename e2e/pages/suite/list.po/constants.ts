import { by, element } from 'protractor';
import { SmartTable } from '../../elements/smartTable.element';

export const baseUrl = '/project';

export const elements = {
    uniqueElement: element(by.id('test-suites-list')),
    testSuiteTable: new SmartTable(by.id('suites-table'))
};

export const names = {
    pageName: 'Suite List Page'
};

export const columns = {
    name: 'Name'
};
