import { browser } from 'protractor';
import { baseUrl, elements, names } from './constants';
import { BasePage } from '../../base.po';

export class ProjectView extends BasePage {
    constructor() {
        super(elements.uniqueElement, names.pageName);
    }

    navigateTo(id: number) {
        return browser.get(baseUrl(id));
    }

    async getProjectTitle() {
        return elements.projectTitleLabel.getText();
    }

    async isEmpty(){
        return elements.emptyProjectMessage.isDisplayed();
    }
}
