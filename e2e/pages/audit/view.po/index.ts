import { browser } from 'protractor';
import { elements, baseUrl, names, statuses } from './constants';
import { BasePage } from '../../base.po';
import { User } from '../../../../src/app/shared/models/user';

export class AuditInfo extends BasePage {
    constructor() {
        super(elements.uniqueElement, names.pageName);
    }

    statuses = statuses;

    navigateTo(projectId: number, id: number) {
        return browser.get(baseUrl(projectId, id));
    }

    selectService(name: string) {
        return elements.service.select(name);
    }

    selectAuditor(user: User) {
        return elements.auditors.select(`${user.first_name} ${user.second_name}`);
    }

    setDueDate(date: Date) {
        return elements.duedate.select(date);
    }

    getStatus() {
        return elements.status.getText();
    }

    startAudit() {
        return elements.startProgress.click();
    }

    getSummary() {
        return elements.summary.getText();
    }

    setSummary(summary: string) {
        return elements.summary.setText(summary);
    }

    getResult() {
        return elements.result.getValue();
    }

    setResult(result: string) {
        return elements.result.changeAndSetValue(result);
    }

    isFinishProgressEnabled() {
        return elements.finishProgress.isEnabled();
    }

    clickSaveSummary() {
        return elements.summarySave.click();
    }
}
