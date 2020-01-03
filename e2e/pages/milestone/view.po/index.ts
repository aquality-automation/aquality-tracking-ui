import { elements, names, columns } from './constants';
import { BasePage } from '../../base.po';

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

    removeFinishedColumn() {
        return elements.milestonesTable.manageColumns.removeColumn(columns.finished);
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

    async resultsAreFilteredByResult(result: string): Promise<boolean> {
        return this.resultsAreFiltered(columns.result, result);
    }

    async resultsAreFilteredByResolution(result: string): Promise<boolean> {
        return this.resultsAreFiltered(columns.resolution, result);
    }

    async resultsAreFiltered(column: string, value: string): Promise<boolean> {
        const isSelected = await elements.milestonesTable.isFilterSelected(column, value);
        const isFiltered = await elements.milestonesTable.isContainOnlyRowsWith(column, value);
        return isSelected && isFiltered;
    }
}

export const milestoneView = new MilestoneView();
