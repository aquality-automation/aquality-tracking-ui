import { elements, baseUrl, names, columns } from './constants';
import { statuses } from '../view.po/constants';
import { BasePage } from '../../base.po';
import { browser } from 'protractor';

export class ProjectAudits extends BasePage {
    constructor() {
        super(elements.uniqueElement, names.pageName);
    }

    statuses = statuses;

    navigateTo(projectId: number) {
        return browser.navigate().to(baseUrl(projectId));
    }

    clickCreate() {
        return elements.create.click();
    }

    openAudit(status: string) {
        return elements.auditsTable.clickRow(status, columns.status);
    }
}

export const projectAudits = new ProjectAudits();