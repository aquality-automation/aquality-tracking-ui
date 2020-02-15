import { Locator, ElementFinder } from 'protractor';
import { PieChartBase, PieChartSections } from './pieBase.element';
import allResults from '../../data/results.json';

const results: PieChartSections = allResults;

export class ResultPieChart extends PieChartBase {
    constructor(locator: Locator | ElementFinder) {
        super(locator);
    }

    public clickPassed(): Promise<string> {
        return this.clickChartSection(results.passed);
    }
}
