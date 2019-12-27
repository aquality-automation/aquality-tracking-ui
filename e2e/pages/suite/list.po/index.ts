import { elements, names, columns } from './constants';
import { BasePage } from '../../base.po';

class SuiteList extends BasePage {
    constructor() {
        super(elements.uniqueElement, names.pageName);
    }

    async createSuite(name: string) {
        await this.openCreationRow();
        await this.setCreationName(name);
        await this.acceptCreation();
        return this.notification.isSuccess();
    }

    isTestSuitePresent(name: string): any {
        return elements.testSuiteTable.isRowExists(name, columns.name);
    }

    clickTestSuite(name: string) {
        return elements.testSuiteTable.clickRow(name, columns.name);
    }

    clickRemoveSuiteButton(name: string) {
        return elements.testSuiteTable.clickAction(name, columns.name);
    }

    openCreationRow() {
        return elements.testSuiteTable.openCreation();
    }

    setCreationName(name: string) {
        return elements.testSuiteTable.fillCreation(name, columns.name);
    }

    acceptCreation() {
        return elements.testSuiteTable.clickCreateAction();
    }

    getCreationError() {
        return elements.testSuiteTable.getCreationError();
    }

    updateSuiteName(newName: string, oldName: string) {
        return elements.testSuiteTable.editRow(newName, columns.name, oldName, columns.name);
    }
}

export const suiteList = new SuiteList();