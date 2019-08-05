import { elements, names, columns } from './constants';
import { BasePage } from '../../base.po';

export class SuiteList extends BasePage {
    constructor() {
        super(elements.uniqueElement, names.pageName);
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
}
