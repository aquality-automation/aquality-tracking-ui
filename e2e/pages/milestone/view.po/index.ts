import { elements, names, columns } from './constants';
import { BasePage } from '../../base.po';
import { promise, element } from 'protractor';

class MilestoneView extends BasePage {
    constructor() {
        super(elements.uniqueElement, names.pageName);
    }

    isEmpty(): Promise<boolean> {
        return elements.milestonesTable.hasNoData();
    }

    checkIfTableEqualToCSv(path: string) {
        return elements.milestonesTable.checkIfTableEqualToCSv(path);
    }

    removeGenericColumn() {
        return elements.milestonesTable.manageColumns.removeColumns([columns.finished, columns.testrun]);
    }

    setDistinctTest(state: boolean) {
        return elements.distinctTest.setState(state);
    }

    async clickResultPieChartPassedSection() {
        return elements.resultsChart.clickPassed();
    }

    async clickResolutionPieChartNotAssignedSection() {
        return elements.resolutionsChart.clickNotAssigned();
    }

    async resultsAreFilteredByResult(valueInFilter: string): Promise<boolean> {
        return this.resultsAreFiltered(columns.result, valueInFilter);
    }

    async resultsAreFilteredByIssue(valueInFilter: string, valueInRows?: string): Promise<boolean> {
        return this.resultsAreFiltered(columns.issue, valueInFilter, valueInRows);
    }

    async resultsAreFiltered(column: string, valueInFilter: string, valueInRows?: string): Promise<boolean> {
        const isSelected = await elements.milestonesTable.isFilterSelected(column, valueInFilter);
        const isFiltered = await elements.milestonesTable
            .isContainOnlyRowsWith(column, valueInRows !== undefined ? valueInRows : valueInFilter);
        return isSelected && isFiltered;
    }

    addSuite(name: string): Promise<void> {
        return elements.suites.select(name);
    }

    getNotExecutedSuites(): promise.Promise<string> {
        return elements.notExecutedSuites.getText();
    }

    isNotExecutedSuitesExist(): promise.Promise<boolean> {
        return elements.notExecutedSuites.isPresent();
    }

    removeSuite(name: string): Promise<void> {
        return elements.suites.remove(name);
    }

    setDueDate(date: Date): Promise<void> {
        return elements.dueDate.select(date);
    }

    isWarningPresent(): promise.Promise<boolean> {
        return elements.warning.isPresent();
    }

    getWarningTitle(): promise.Promise<string> {
        return elements.warningTitle.getText();
    }

    setActive(state: boolean): Promise<void> {
        return elements.activeSwitch.setState(state);
    }

    isSuitesEditable(): Promise<boolean> {
        return elements.suites.isEditable();
    }

    isDueDateEditable(): Promise<boolean> {
        return elements.dueDate.isEditable();
    }

    isActiveSwitcherEditable(): Promise<boolean> {
        return elements.activeSwitch.isEnabled();
    }
}

export const milestoneView = new MilestoneView();
