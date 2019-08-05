import { browser } from 'protractor';
import { BasePage } from '../../base.po';
import { baseUrl, elements, names } from './constants';
import { Project } from '../../../../src/app/shared/models/project';

export class ProjectCreate extends BasePage {
    constructor() {
        super(elements.uniqueElement, names.pageName);
    }

    navigateTo() {
        return browser.get(baseUrl);
    }

    async fillProjectNameField(projectName: string) {
        await elements.projectNameField.sendKeys(projectName);
    }

    async selectCustomer(customerName: string) {
        await elements.customerField.select(customerName);
    }

    async clickCreateButton() {
        await elements.createButton.click();
    }

    isCreateButtonEnabled() {
        return elements.createButton.isEnabled();
    }

    async createProject(project: Project){
        await this.fillProjectNameField(project.name);
        await this.selectCustomer(project.customer.name);
        await this.clickCreateButton();
    }
}
