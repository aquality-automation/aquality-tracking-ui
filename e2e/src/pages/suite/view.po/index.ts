import { browser } from 'protractor';
import { BasePage } from '../../base.po';
import { elements, baseUrl, names, columns } from './constants';
import { moveTest } from '../../modals/moveTest.po';

class SuiteView extends BasePage {
  constructor() {
    super(elements.uniqueElement, names.pageName);
  }

  moveTestmodal = moveTest;

  navigateTo(id: number, item: number) {
    return browser.get(baseUrl(id, item));
  }

  isAutomationDurationLabel() {
    return elements.automationDurationLabel.isPresent();
  }

  getNameOfLabelTestSuite() {
    return elements.selectedSuiteLookup.getValue();
  }

  getNameOfTestSuite() {
    return elements.nameOfTestSuite.getValue();
  }

  getManualDurationeTestSuite() {
    return elements.totalManualDurationLabel.getText();
  }

  getTotalTestsSuite() {
    return elements.totalTestsLabel.getText();
  }

  async clickMoveTest() {
    return elements.moveTestBtn.click();
  }

  async clickSync() {
    return elements.syncBtn.click();
  }

  async isSyncButtonPresent() {
    return elements.syncBtn.isPresent();
  }

  openTest(testName: string) {
    return elements.testsTable.clickRow(testName, columns.name);
  }

  removeSuite(suiteName: string, testName: string) {
    return elements.testsTable.removeValueFromMultiselect(suiteName, columns.suites, testName, columns.name);
  }

  addSuite(suiteName: string, testName: string) {
    return elements.testsTable.addValueFromMultiselect(suiteName, columns.suites, testName, columns.name);
  }

  getTestSuites(testName: string): Promise<string[]|string> {
       return elements.testsTable.getCellValue(columns.suites, testName, columns.name);
  }

  isTableEditable(): Promise<boolean> {
    return elements.testsTable.isRowEditableByIndex(0);
  }

  isTestPresent(name: string): Promise<boolean> {
    return elements.testsTable.isRowExists(name, columns.name);
  }

  async getTestDotsCount(name: string): Promise<number> {
    return (await elements.testsTable.getCellDots(columns.lastResults, name, columns.name)).getDotsCount();
  }
}

export const suiteView = new SuiteView();
