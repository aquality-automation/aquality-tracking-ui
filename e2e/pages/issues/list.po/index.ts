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

    async getResolution(title: string): Promise<string|string[]> {
        return elements.issuesTable.getCellValue(columns.resolution, title, columns.title);
    }

    isTableEditable(): Promise<boolean> {
        return elements.issuesTable.isRowEditableByIndex(0);
    }
}

export const issuesList = new IssuesList();
