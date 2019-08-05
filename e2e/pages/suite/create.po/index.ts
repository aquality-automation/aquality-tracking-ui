import { elements, names } from './constants';
import { BasePage } from '../../base.po';
import { TestSuite } from '../../../../src/app/shared/models/testSuite';

export class SuiteCreate extends BasePage {
    constructor() {
        super(elements.uniqueElement, names.pageName);
    }

    async fillSuiteNameField(suiteName: string) {
        await elements.suiteNameField.sendKeys(suiteName);
    }

    async clickCreateButton() {
        await elements.createButton.click();
    }

    async createSuite(suite: TestSuite) {
        await this.fillSuiteNameField(suite.name);
        await this.clickCreateButton();
    }

    isCreateEnabled() {
        return elements.createButton.isEnabled();
    }
}
