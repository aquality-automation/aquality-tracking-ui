import { elements, names, columns } from './constants';
import { BasePage } from '../../base.po';

class MilestoneList extends BasePage {
    constructor() {
        super(elements.uniqueElement, names.pageName);
    }

    async createMilestone(name: string) {
        await this.openCreationRow();
        await this.setCreationName(name);
        await this.acceptCreation();
        return this.notification.isSuccess();
    }

    isMilestonePresent(name: string): any {
        return elements.milestonesTable.isRowExists(name, columns.name);
    }

    clickMilestone(name: string) {
        return elements.milestonesTable.clickRow(name, columns.name);
    }

    clickRemoveMilestoneButton(name: string) {
        return elements.milestonesTable.clickAction(name, columns.name);
    }

    openCreationRow() {
        return elements.milestonesTable.openCreation();
    }

    setCreationName(name: string) {
        return elements.milestonesTable.fillCreation(name, columns.name);
    }

    acceptCreation() {
        return elements.milestonesTable.clickCreateAction();
    }

    getCreationError() {
        return elements.milestonesTable.getCreationError();
    }

    updateMilestoneName(newName: string, oldName: string) {
        return elements.milestonesTable.editRow(newName, columns.name, oldName, columns.name);
    }

    async isTableEditable(): Promise<boolean> {
        const isActionColumnExist = await elements.milestonesTable.isColumnExist(columns.action);
        const isRowContainEditableElements = await elements.milestonesTable.isRowEditableByIndex(0);
        return isActionColumnExist || isRowContainEditableElements;
    }
}

export const milestoneList = new MilestoneList();
