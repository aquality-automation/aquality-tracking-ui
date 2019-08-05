import { elements, names } from './constants';
import { BasePage } from '../../base.po';
import { Test } from '../../../../src/app/shared/models/test';

export class TestCreate extends BasePage {
    constructor() {
        super(elements.uniqueElement, names.pageName);
    }
    public setName(value: string) {
        return elements.nameField.typeText(value);
    }
    public setSuite(value: string) {
        return elements.suiteField.select(value);
    }
    public setDescription(value: string) {
        return elements.descriptionField.typeText(value);
    }
    public clickCreate() {
        return elements.createButton.click();
    }

    public async createTest(test: Test, suiteName: string) {
        await Promise.all([
            this.setName(test.name),
            this.setSuite(suiteName),
            this.setDescription(test.body)
        ]);

        return this.clickCreate();
    }
}
