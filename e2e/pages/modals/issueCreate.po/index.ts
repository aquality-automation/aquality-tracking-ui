import { BasePage } from '../../base.po';
import { elements, names, overlappedIssuesColumns } from './constants';
import { promise } from 'protractor';

class IssueCreateModal extends BasePage {
    constructor() {
        super(elements.uniqueElement, names.pageName);
    }

    isResolutionPresent(name: string): Promise<boolean> {
        return elements.resolution.isOptionPresent(name);
    }

    save(): promise.Promise<void> {
        return elements.save.click();
    }

    cancel(): promise.Promise<void> {
        return elements.cancel.click();
    }

    setTitle(title: string): Promise<void> {
        return elements.title.typeText(title);
    }

    setResolution(name: string): Promise<void> {
        return elements.resolution.select(name);
    }

    isIssueInOverlappedTable(title: string): Promise<boolean> {
        return elements.overlappedIssues.isRowExists(title, overlappedIssuesColumns.title);
    }

    isOverlappedIssuesTableExist(): Promise<boolean> {
        return elements.overlappedIssues.isPresent();
    }

    getExpressionError(): promise.Promise<string> {
        return elements.expressionError.getText();
    }

    setExpression(expression: string): Promise<void> {
        return elements.expression.typeText(expression);
    }

    getExternalIssue(): promise.Promise<string> {
        return elements.externalIssue.getValue();
    }

    setExternalIssue(external_url: string): Promise<void> {
        return elements.externalIssue.typeText(external_url);
    }

    getAssignee(): Promise<string> {
        return elements.assignee.getValue();
    }

    setAssignee(assignee: string): Promise<void> {
        return elements.assignee.select(assignee);
    }

    getResolution(): Promise<string> {
        return elements.resolution.getValue();
    }
}

export const issueCreateModal = new IssueCreateModal();
