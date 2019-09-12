import { elements, names, columns } from './constants';
import { BasePage } from '../../base.po';
import { waiter } from '../../../utils/wait.util';

export class TestRunList extends BasePage {
    constructor() {
        super(elements.uniqueElement, names.pageName);
    }

    clickTestRunRemoveButton(buildName: string) {
        return elements.testRunsTable.clickAction(buildName, columns.build);
    }

    isTestRunRowDisplayed(buildName: string) {
        return elements.testRunsTable.isRowExists(buildName, columns.build);
    }

    openTestRun(buildName: string) {
        return elements.testRunsTable.clickRow(buildName, columns.build);
    }

    getTestRunsCount() {
        return elements.testRunsTable.getShownRows();
    }

    filterByBuildName(buildName: string) {
        return elements.testRunsTable.setFilter(buildName, columns.build);
    }

    clickSuiteMatrix() {
        return elements.matrixButton.click();
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
