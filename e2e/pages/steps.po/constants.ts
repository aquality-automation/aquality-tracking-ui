import { by, element } from 'protractor';
import { SmartTable } from '../../elements/smartTable.element';

export const baseUrl = (projectId: number) => `project/${projectId}/steps`;

export const elements = {
    uniqueElement: element(by.id('steps-list')),
    stepsTable: new SmartTable(by.id('steps-table'))
};

export const names = {
    pageName: 'Steps Page'
};

export const stepTypes = {
    then: 'Then',
    when: 'When',
    given: 'Given'
};

export const columns = {
    type: 'Type',
    name: 'Name',
    action: 'Action'
};
