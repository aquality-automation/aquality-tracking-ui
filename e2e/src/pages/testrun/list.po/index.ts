import { elements, names, columns } from './constants';
import { BasePage } from '../../base.po';
import { waiter } from '../../../utils/wait.util';
import { promise } from 'protractor';

class TestRunList extends BasePage {
    constructor() {
        super(elements.uniqueElement, names.pageName);
    }

    clickTestRunRemoveButton(buildName: string) {
        return elements.testRunsTable.clickAction(buildName, columns.build);
    }

    async areAllTestRunsDisplayed(...buildNames: string[]) {
        for (let i = 0; i < buildNames.length; i++) {
            const buildName = buildNames[i];
            const displayed = await elements.testRunsTable.isRowExists(buildName, columns.build);
            if (!displayed) {
                return false;
            }
        }

        return true;
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
            const isDisplayed = await this.areAllTestRunsDisplayed(buildName);
            if (isDisplayed) {
                return true;
            }
            await this.menuBar.import();
            await this.menuBar.testRuns();
            return this.areAllTestRunsDisplayed(buildName);
        }, 5, 3000);
    }

    async doesMilestonePresentInEdit(name: string, build_name: string): Promise<boolean> {
        const cellElements = await elements.testRunsTable.getElementsForCell(columns.milestone, build_name, columns.build);
        return cellElements.autocomplete().hasOption(name);
    }

    setMilestone(name: string, build_name: string): Promise<void> {
        return elements.testRunsTable.editRow(name, columns.milestone, build_name, columns.build);
    }

    isTableEditable(): Promise<boolean> {
        return elements.testRunsTable.isRowEditableByIndex(0);
    }

    clickDeleteAll(): promise.Promise<void> {
        return elements.testRunsTable.deleteAll();
    }

    async selectTestRun(...build_names: string[]): Promise<void> {
        for (let i = 0; i < build_names.length; i++) {
            const build_name = build_names[i];
            await elements.testRunsTable.selectRow(build_name, columns.build);
        }
    }

    isSelectorAvailable(): Promise<boolean> {
        return elements.testRunsTable.isSelectorAvailable();
    }
}

export const testRunList = new TestRunList();
