import { elements, names } from './constants';
import { BasePage } from '../../base.po';
import { Milestone } from '../../../../src/app/shared/models/milestone';

export class MilestoneCreate extends BasePage {
    constructor() {
        super(elements.uniqueElement, names.pageName);
    }

    async createMilestone(milestone: Milestone) {
        await this.fillNameField(milestone.name);
        await this.clickCreateButton();
    }

    async fillNameField(name: string) {
        await elements.nameField.sendKeys(name);
    }

    async clickCreateButton() {
        await elements.createButton.click();
    }
}
