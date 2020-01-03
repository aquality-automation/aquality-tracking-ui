import { Locator, ElementFinder } from 'protractor';
import { PieChartBase, PieChartSections } from './pieBase.element';
import allResolutions from '../../data/resolutions.json';

const resolutions: PieChartSections = allResolutions.global;

export class ResolutionPieChart extends PieChartBase {
    constructor(locator: Locator | ElementFinder) {
        super(locator);
    }

    public clickNotAssigned() {
        return this.clickChartSection(resolutions.notAssigned);
    }

    public clickTestIssue() {
        return this.clickChartSection(resolutions.testIssue);
    }
}
