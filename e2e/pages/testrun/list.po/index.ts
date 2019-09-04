import { elements, names, columns } from './constants';
import { BasePage } from '../../base.po';
import { waiter } from '../../../utils/wait.util';

export class TestRunList extends BasePage {
    constructor() {
        super(elements.uniqueElement, names.pageName);
    }

    async clickTestRunRemoveButton(buildName: string) {
        await elements.testRunsTable.clickAction(buildName, columns.build);
    }

    async isTestRunRowDisplayed(buildName: string) {
        return elements.testRunsTable.isRowExists(buildName, columns.build);
    }

    async openTestRun(buildName: string) {
        return elements.testRunsTable.clickRow(buildName, columns.build);
    }

    async getTestRunsCount() {
        return elements.testRunsTable.getShownRows();
    }

    async filterByBuildName(buildName: string) {
        return elements.testRunsTable.setFilter(buildName, columns.build);
    }

    async waitForTestRun(buildName: string) {
        return waiter.forTrue(async () => {
            const isDisplayed = await this.isTestRunRowDisplayed(buildName);
            if (isDisplayed) {
                return true;
            }
            await this.menuBar.import();
            await this.menuBar.testRuns();
            return await this.isTestRunRowDisplayed(buildName);
        }, 5, 3000);
    }
}
