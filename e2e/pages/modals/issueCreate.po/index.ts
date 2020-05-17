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
        return elements.externalIssue.changeAndSetValue(external_url);
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

    getMatchExample(): promise.Promise<string> {
        return elements.matchExample.getText();
    }

    getTitle(): promise.Promise<string> {
        return elements.title.getValue();
    }

    isAddToResultsSelected(): Promise<boolean> {
        return elements.addToResults.isOn();
    }

    setAddToResults(state: boolean): Promise<void> {
        return elements.addToResults.setState(state);
    }
    
    async isEditable(): Promise<boolean> {
        const title = await elements.title.isEnabled();
        const description = await elements.description.isEnabled();
        const resolution = await elements.resolution.isEnabled();
        const assignee = await elements.assignee.isEnabled();
        const extarnalIssue = await elements.externalIssue.isEnabled();
        const expression = await elements.expression.isEnabled();
        const saveAndAssign = await elements.save.isPresent();

        return title || description || resolution || assignee || extarnalIssue || expression || saveAndAssign;
    }
}

export const issueCreateModal = new IssueCreateModal();
