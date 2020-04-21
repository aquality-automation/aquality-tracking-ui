import { elements, names, columns } from './constants';
import { BasePage } from '../../base.po';
import { browser } from 'protractor';

class Matrix extends BasePage {
    constructor() {
        super(elements.uniqueElement, names.pageName);
    }

    isShowButtonAvailable() {
        return elements.showButton.isPresent();
    }

    selectSuite(suiteName: string) {
        return elements.suiteAutocomplete.select(suiteName);
    }

    getResultsNumberLookupValue() {
        return elements.resultsNumberLookup.getValue();
    }

    setLabelLookupValue(value: string) {
        return elements.labelLookup.select(value);
    }

    setResultsNumberLookupValue(value: string) {
        return elements.resultsNumberLookup.select(value);
    }

    clickShow() {
        return elements.showButton.click();
    }

    isShowResolutionSelected() {
        return elements.resolutionSwitch.isOn();
    }

    swithOffShowResolution() {
        return elements.resolutionSwitch.switchOff();
    }

    checkIfTableEqualToCSv(path: string) {
        return elements.testRunsTable.checkIfTableEqualToCSv(path);
    }

    async rightClickTestRunHeader(columnName: string) {
        await elements.testRunsTable.rightClickSorter(columnName);
        const handles = await browser.getAllWindowHandles();
        await browser.switchTo().window(handles[handles.length - 1]);
        await browser.waitForAngular();
    }

    getFirstHeader() {
        return elements.testRunsTable.getColumnName(1);
    }

    getTestRunIdFromColumnName(columnName: string): number {
        return +columnName.split(' | ')[0];
    }
}

export const matrix = new Matrix();
