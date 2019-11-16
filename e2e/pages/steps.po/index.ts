import { elements, names, columns, stepTypes } from './constants';
import { BasePage } from '../base.po';

export class StepsList extends BasePage {
    constructor() {
        super(elements.uniqueElement, names.pageName);
    }

    types = stepTypes;

    async createStep(type: string, name: string) {
        await this.openCreationRow();
        await this.setCreationName(name);
        await this.setCreationType(type);
        await this.acceptCreation();
        return this.notification.isSuccess();
    }

    isStepPresent(name: string): any {
        return elements.stepsTable.isRowExists(name, columns.name);
    }

    clickStep(name: string) {
        return elements.stepsTable.clickRow(name, columns.name);
    }

    clickRemoveStepButton(name: string) {
        return elements.stepsTable.clickAction(name, columns.name);
    }

    openCreationRow() {
        return elements.stepsTable.openCreation();
    }

    setCreationName(name: string) {
        return elements.stepsTable.fillCreation(name, columns.name);
    }

    setCreationType(type: string) {
        return elements.stepsTable.fillCreation(type, columns.type);
    }

    acceptCreation() {
        return elements.stepsTable.clickCreateAction();
    }

    getCreationError() {
        return elements.stepsTable.getCreationError();
    }

    updateStepName(newName: string, oldName: string) {
        return elements.stepsTable.editRow(newName, columns.name, oldName, columns.name);
    }

    updateStepType(name: string, newType: string) {
        return elements.stepsTable.editRow(newType, columns.type, name, columns.name);
    }

    async isTableEditable(): Promise<boolean> {
        const isActionColumnExist = await elements.stepsTable.isColumnExist(columns.action);
        const isRowContainEditableElements = await elements.stepsTable.isRowEditableByIndex(0);
        return isActionColumnExist || isRowContainEditableElements;
    }

    async hasNoData() {
        const totalRowsNumber = await elements.stepsTable.getTotalRows();
        return totalRowsNumber === 0;
    }
}
