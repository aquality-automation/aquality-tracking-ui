import { by, element } from 'protractor';
import { SmartTable } from '../../../elements/smartTable.element';

export const elements = {
    uniqueElement: element(by.id('issues-list')),
    issuesTable: new SmartTable(by.id('issues-table')),
    createButton: element(by.id('create-issue-button'))
};

export const names = {
    pageName: 'Issues List Page'
};

export const columns = {
    id: 'Id',
    resolution: 'Resolution',
    status: 'Status',
    title: 'Title',
    assignee: 'Assignee',
    externalIssue: 'External Issue'
};
