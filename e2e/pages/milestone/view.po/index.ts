import { elements, names, columns } from './constants';
import { BasePage } from '../../base.po';

class MilestoneView extends BasePage {
    constructor() {
        super(elements.uniqueElement, names.pageName);
    }

    isEmpty(): Promise<boolean> {
        return elements.milestonesTable.hasNoData();
    }

    getCSV() {
        return elements.milestonesTable.getCSV();
    }

    removeFinishedColumn() {
        return elements.milestonesTable.manageColumns.removeColumn(columns.finished);
    }

    setDistinctTest(state: boolean) {
        return elements.distinctTest.setState(state);
    }
}

export const milestoneView = new MilestoneView();
