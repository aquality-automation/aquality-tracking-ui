import { elements, names, columns } from './constants';
import { BasePage } from '../../base.po';
import { waiter } from '../../../utils/wait.util';

class TestRunList extends BasePage {
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
        return elements.testRunsTable.clickCell(columns.build, buildName, columns.build);
    }

    getTestRunsCount() {
        return elements.testRunsTable.getShownRows();
    }

    filterByBuildName(buildName: string) {
        return elements.testRunsTable.setFilter(buildName, columns.build);
    }

    filterByMilestone(name: string) {
        return elements.testRunsTable.setFilter(name, columns.milestone);
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

    async doesMilestonePresentInEdit(name: string, build_name: string): Promise<boolean> {
        const cellElements = await elements.testRunsTable.getElementsForCell(columns.milestone, build_name, columns.build);
        return cellElements.autocomplete().hasOption(name);
    }

    setMilestone(name: string, build_name: string): Promise<void> {
        return elements.testRunsTable.editRow(name, columns.milestone, build_name, columns.build);
    }

    isTableEditable(): any {
        return elements.testRunsTable.isRowEditableByIndex(0);
    }
}

export const testRunList = new TestRunList();
