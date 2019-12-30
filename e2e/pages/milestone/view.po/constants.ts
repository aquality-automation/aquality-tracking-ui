import { by, element } from 'protractor';
import { SmartTable } from '../../../elements/smartTable.element';

export const baseUrl = (projectId: number, milestoneId: number) => `/project/${projectId}/milestone/${milestoneId}`;

export const elements = {
    uniqueElement: element(by.id('milestone-view')),
    milestonesTable: new SmartTable(by.id('suite-results'))
};

export const names = {
    pageName: 'Milestone View Page'
};

export const columns = {
    test: 'Test'
};
