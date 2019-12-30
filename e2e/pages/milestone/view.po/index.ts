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
}

export const milestoneView = new MilestoneView();
