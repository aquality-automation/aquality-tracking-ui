import { browser } from 'protractor';
import { elements, baseUrl, names, statuses } from './constants';
import { BasePage } from '../../base.po';
import { User } from '../../../../../src/app/shared/models/user';
import { projectList } from '../../project/list.po';
import { projectAudits } from '../project.list.po';

class AuditInfo extends BasePage {
    constructor() {
        super(elements.uniqueElement, names.pageName);
    }

    statuses = statuses;

    navigateTo(projectId: number, id: number) {
        return browser.get(baseUrl(projectId, id));
    }

    async open(projectName: string, status: string) {
        await this.menuBar.clickLogo();
        await projectList.openProject(projectName);
        await(await projectList.menuBar.audits()).project();
        return projectAudits.openAudit(status);
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

    isAttachUploaded(attachName: string) {
        return elements.uploadedAttachment(attachName).isPresent();
    }

    uploadAttachment(attachName: string) {
        return elements.attachments.upload(attachName);
    }

    isAttachAdded(attachName: string) {
        return elements.attachments.isAdded(attachName);
    }

    attachDocument(path: string) {
        return elements.attachments.add(path);
    }

    finishAudit() {
        return elements.finishProgress.click();
    }

    submitAudit() {
        return elements.submit.click();
    }

    isSubmitButtonPresent(): any {
        return elements.submit.isPresent();
    }
}

export const auditInfo = new AuditInfo();
