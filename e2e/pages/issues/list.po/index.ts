import { elements, names, columns } from './constants';
import { BasePage } from '../../base.po';
import { promise } from 'protractor';

class IssuesList extends BasePage {
    constructor() {
        super(elements.uniqueElement, names.pageName);
    }

    clickCreate(): promise.Promise<void> {
        return elements.createButton.click();
    }

    openIssue(title: string): Promise<void> {
        return elements.issuesTable.clickCell(columns.id, title, columns.title);
    }

    setResolution(resolution: string, title: string): Promise<void> {
        return elements.issuesTable.editRow(resolution, columns.resolution, title, columns.title);
    }

    async getResolution(title: string): Promise<string | string[]> {
        return elements.issuesTable.getCellValue(columns.resolution, title, columns.title);
    }

    isTableEditable(): Promise<boolean> {
        return elements.issuesTable.isRowEditableByIndex(0);
    }

    isCreateButtonExist(): promise.Promise<boolean> {
        return elements.createButton.isPresent();
    }

    getAssignee(title: string): any {
        return elements.issuesTable.getCellValue(columns.assignee, title, columns.title);
    }

    setAssignee(assignee: string, title: string) {
        return elements.issuesTable.editRow(assignee, columns.assignee, title, columns.title);
    }

    getTitle(id: string): any {
        return elements.issuesTable.getCellValue(columns.title, id, columns.id);
    }

    setTitle(title: string, id: string) {
        return elements.issuesTable.editRow(title, columns.title, id, columns.id);
    }

    getStatus(title: string): any {
        return elements.issuesTable.getCellValue(columns.status, title, columns.title);
    }

    setStatus(status: string, title: string) {
        return elements.issuesTable.editRow(status, columns.status, title, columns.title);
    }

    isIssuePresent(title: string): any {
        return elements.issuesTable.isRowExists(title, columns.title);
    }

    openExternalIssueLink(title: string) {
        return elements.issuesTable.clickCellLink(columns.externalIssue, title, columns.title)
    }
}

export const issuesList = new IssuesList();
