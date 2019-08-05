import { elements, names } from './constants';
import { BasePage } from '../../base.po';

export class TestRunList extends BasePage {
    constructor() {
        super(elements.uniqueElement, names.pageName);
    }

    async clickTestRunRemoveButton(buildName: string) {
        await elements.testRunsTable.clickAction(buildName, 'Build');
    }

    async isTestRunRowDisplayed(buildName: string) {
        return elements.testRunsTable.isRowExists(buildName, 'Build');
    }

    async openTestRun(buildName: string) {
        return elements.testRunsTable.clickRow(buildName, 'Build');
    }
}
