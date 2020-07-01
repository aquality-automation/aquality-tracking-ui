import { Locator, ElementFinder } from 'protractor';
import { PieChartBase, PieChartSections } from './pieBase.element';
import allLookupOptions from '../../data/lookupOptions.json';

const lookupOptions: PieChartSections = allLookupOptions.global;

export class ResolutionPieChart extends PieChartBase {
    constructor(locator: Locator | ElementFinder) {
        super(locator);
    }

    public clickNotAssigned(): Promise<string> {
        return this.clickChartSection(lookupOptions.notAssigned);
    }

    public clickTestIssue(): Promise<string> {
        return this.clickChartSection(lookupOptions.testIssue);
    }
}
