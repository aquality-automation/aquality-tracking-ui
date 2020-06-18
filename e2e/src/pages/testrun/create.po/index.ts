import { elements, names, baseUrl } from './constants';
import { BasePage } from '../../base.po';
import { TestRun } from '../../../../../src/app/shared/models/testRun';
import { browser } from 'protractor';

class TestRunCreate extends BasePage {
    constructor() {
        super(elements.uniqueElement, names.pageName);
    }

    navigateTo(projectId: number) {
        return browser.get(baseUrl(projectId));
    }

    async creteTestRun(testRun: TestRun, testSuite: string) {
        await this.fillBuildNameField(testRun.build_name);
        await this.selectTestSuite(testSuite);
        return this.clickCreateButton();
    }

    clickCreateButton() {
        return elements.createButton.click();
    }

    isCreateButtonEnabled() {
        return elements.createButton.isEnabled();
    }

    fillBuildNameField(buildName: string) {
        return elements.buildNameField.typeText(buildName);
    }

    selectTestSuite(suiteName: string) {
        return elements.testSuiteCombobox.select(suiteName);
    }

    selectMilestone(milestone: string) {
        return elements.milestoneCombobox.select(milestone);
    }
}

export const testRunCreate = new TestRunCreate();
