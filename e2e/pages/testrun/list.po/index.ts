import { elements, names } from './constants';
import { BasePage } from '../../base.po';
import { waiter } from '../../../utils/wait.util';

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

    async waitForTestRun(buildName: string) {
        return waiter.forTrue(async () => {
            const isDisplayed = await this.isTestRunRowDisplayed(buildName);
            if (isDisplayed) {
                return true;
            }
            await this.menuBar.import();
            await this.menuBar.testRuns();
            return false;
        }, 5, 3000);
    }
}
