import { elements, names, regexps } from './constants';
import { BasePage } from '../../base.po';
import { TestRun } from '../../../../src/app/shared/models/testRun';

export class TestRunCreate extends BasePage {
    constructor() {
        super(elements.uniqueElement, names.pageName);
    }

    async creteTestRun(testRun: TestRun, testSuite: string) {
        await this.fillBuildNameField(testRun.build_name);
        await this.selectTestSuite(testSuite);
        return this.clickCreateButton();
    }

    async clickCreateButton() {
        await elements.createButton.click();
    }

    async isCreateButtonEnabled() {
        return await elements.createButton.isEnabled();
    }

    async fillBuildNameField(buildName: string) {
        elements.buildNameField.sendKeys(buildName);
    }

    async selectTestSuite(suiteName: string) {
        await elements.testSuiteCombobox.click();
        await elements.testSuiteComboboxOption(suiteName).click();
    }

    async selectMilestone(suiteName: string) {
        await elements.milestoneCombobox.click();
        await elements.milestoneComboboxOption(suiteName).click();
    }

    async getStartDate() {
        const startDateValue = await elements.startDateField.getAttribute('value');
        const startDateRegex = new RegExp(regexps.startDateRegexp);
      return new Date(
        // @ts-ignore
            startDateRegex.exec(startDateValue).groups.year,
        // @ts-ignore
            startDateRegex.exec(startDateValue).groups.month - 1,
        // @ts-ignore
            startDateRegex.exec(startDateValue).groups.day,
        // @ts-ignore
            startDateRegex.exec(startDateValue).groups.hours,
        // @ts-ignore
            startDateRegex.exec(startDateValue).groups.minutes
        );
    }
}
