import { by, element } from 'protractor';
import { SmartTable } from '../../../elements/smartTable.element';
export const baseUrl = (id: number) => `/audit/${id}`;

export const elements = {
    uniqueElement: element(by.id('project-audits')),
    create: element(by.id('create')),
    auditsTable: new SmartTable(by.id('audits-list'))
};

export const names = {
    pageName: 'Project Audits'
};

export const columns = {
    service: 'Service',
    status: 'Status'
};
