import { browser } from 'protractor';
import { baseUrl, elements, names, columns } from './constants';
import { BasePage } from '../../base.po';

export class ProjectList extends BasePage {
    constructor() {
        super(elements.uniqueElement, names.pageName);
    }

    navigateTo() {
        return browser.get(baseUrl);
    }

    isProjectInList(projectName: string) {
        return elements.projectsTable.isRowExists(projectName, columns.name);
    }

    openProject(projectName: string) {
        return elements.projectsTable.clickRow(projectName, columns.name);
    }

    isCreateProjectExists() {
        return elements.createButton.isPresent();
    }

    clickCreateProjectButton() {
        return elements.createButton.click();
    }

    clickRemoveProjectButton(projectName: string) {
        return elements.projectsTable.clickAction(projectName, columns.name);
    }

    async removeProject(projectName: string) {
        await this.navigateTo();
        await this.clickRemoveProjectButton(projectName);
        return this.modal.clickActionBtn('yes');
    }
}
