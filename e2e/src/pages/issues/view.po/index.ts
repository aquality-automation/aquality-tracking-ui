import { elements, names, overlappedIsssueColumns, affectedTestsColumns } from './constants';
import { BasePage } from '../../base.po';
import { promise } from 'protractor';
import { removeNewLines } from '../../../utils/string.util';

class IssuesView extends BasePage {
    constructor() {
        super(elements.uniqueElement, names.pageName);
    }

    save(): promise.Promise<void> {
        return elements.save
            .click();
    }

    setResolution(name: string): Promise<void> {
        return elements.resolution.select(name);
    }

    setDescription(value: string): Promise<void> {
        return elements.description.typeText(value);
    }

    setExternalIssue(value: string): Promise<void> {
        return elements.extarnalIssue.changeAndSetValue(value);
    }

    setAssignee(fullName: string): Promise<void> {
        return elements.assignee.select(fullName);
    }

    setTitle(value: string): Promise<void> {
        return elements.title.typeText(value);
    }

    getTitle(): promise.Promise<string> {
        return elements.title.getValue();
    }

    getResolution(): promise.Promise<string> {
        return elements.resolution.getValue();
    }

    getAssignee(): promise.Promise<string> {
        return elements.assignee.getValue();
    }

    getExternalIssue(): promise.Promise<string> {
        return elements.extarnalIssue.getValue();
    }

    getDescription(): promise.Promise<string> {
        return elements.description.getValue();
    }

    getExpressionError(): promise.Promise<string> {
        return elements.expressionError.getText();
    }

    async isFlowButtonsDisabled(): Promise<boolean> {
        let disabled = true;
        const buttons = elements.flowButtons;
        for (let i = 0; i < buttons.length; i++) {
            const button = buttons.get(i);
            if (await button.isEnabled()) {
                disabled = false;
            }
        }
        return disabled;
    }

    async areFlowButtonsPresent(): Promise<boolean> {
        const buttons = elements.flowButtons;
        for (let i = 0; i < buttons.length; i++) {
            const button = buttons.get(i);
            if (await button.isPresent()) {
                return true;
            }
        }
        return false;
    }

    async isIssueOverlappedWith(title: string): Promise<boolean> {
        if (await elements.overlappedIssues.isPresent()) {
            return elements.overlappedIssues.isRowExists(title, overlappedIsssueColumns.title);
        }
        return false;
    }

    setFailReasonExample(value: string): Promise<void> {
        return elements.regexpTestText.typeText(value);
    }

    setExpression(expression: string) {
        return elements.expression.typeText(expression);
    }

    async getRegexpTesterHtml(): Promise<string> {
        return removeNewLines(await elements.regexpTesterResult.getAttribute('innerHTML'));
    }

    isSaveAndAssignAvailable(): promise.Promise<boolean> {
        return elements.saveAndAssign.isPresent();
    }

    clickSaveAndAssigne(): promise.Promise<void> {
        return elements.saveAndAssign.click();
    }

    isTestInAffectedTestsTable(name: string): any {
        return elements.affectedTests.isRowExists(name, affectedTestsColumns.name);
    }

    done(): promise.Promise<void> {
        return elements.done.click();
    }

    close(): promise.Promise<void> {
        return elements.close.click();
    }

    cannotReproduce(): promise.Promise<void> {
        return elements.cannotReproduce.click();
    }

    reopen(): promise.Promise<void> {
        return elements.reopen.click();
    }

    getStatusBadge(): promise.Promise<string> {
        return elements.statusBadge.getText();
    }

    startProgress(): promise.Promise<void> {
        return elements.startProgress.click();
    }

    async isPageEditable(): Promise<boolean> {
        const title = await elements.title.isEnabled();
        const description = await elements.description.isEnabled();
        const resolution = await elements.resolution.isEnabled();
        const assignee = await elements.assignee.isEnabled();
        const extarnalIssue = await elements.extarnalIssue.isEnabled();
        const expression = await elements.expression.isEnabled();
        const saveAndAssign = await elements.saveAndAssign.isPresent();

        return title || description || resolution || assignee || extarnalIssue || expression || saveAndAssign;
    }
}

export const issueView = new IssuesView();
