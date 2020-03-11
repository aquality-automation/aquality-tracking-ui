import { by, element } from 'protractor';
import { SmartTable } from '../../../elements/smartTable.element';

export const elements = {
    uniqueElement: element(by.id('audits-dashboard-page')),
    exportToExcel: element(by.id('export')),
    allSubmittedAudits: element(by.xpath('//a[@class="dropdown-item"][text()="All submitted audits"]')),
    lastSubmittedAudits: element(by.xpath('//a[@class="dropdown-item"][text()="Last submitted audits"]')),
    auditsSmartTable: new SmartTable(by.id('datatable'))
};

export const names = {
    pageName: 'Audits Dashboard'
};
