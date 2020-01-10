import { by, element } from 'protractor';
import { SmartTable } from '../../../elements/smartTable.element';

export const baseUrl = (projectId: number) => `/project/${projectId}/milestone`;

export const elements = {
    uniqueElement: element(by.id('milestones-list')),
    milestonesTable: new SmartTable(by.id('milestones-table'))
};

export const names = {
    pageName: 'Milestone List Page'
};

export const columns = {
    name: 'Name',
    action: 'Action'
};
