import { browser } from 'protractor';
import { elements, baseUrl, importResultColumns, names } from './constants';
import { BasePage } from '../base.po';

export class Import extends BasePage {

  constructor() {
    super(elements.selectImportTypeLookup.element, names.pageName);
  }

  navigateTo(id: number) {
    return browser.get(baseUrl(id));
  }

  clickImport() {
    return elements.importFileBtn.click();
  }

  getSelectedImportType() {
    return elements.selectImportTypeLookup.getSelectedValue();
  }

  async getLatestImportedTestRunId(): Promise<number> {
    const id = await elements.importResultsTable.getCellTextUsingRowIndex(importResultColumns.testRunId, 0);
    return +id;
  }

  async isLatestImportFinished(): Promise<boolean> {
    const status = await elements.importResultsTable.getCellTextUsingRowIndex(importResultColumns.finished, 0);
    return status === 'Finished';
  }

  getLogs(testRunId: number) {
    return elements.importResultsTable.getCellText(importResultColumns.logs, testRunId, importResultColumns.testRunId);
  }

  getTestSuiteName() {
    return elements.testSuiteNameLookup.getValue();
  }

  isImportFileBtnEnabled() {
    return elements.importFileBtn.isEnabled();
  }

  isImportFileBtnPresent() {
    return elements.importFileBtn.isDisplayed();
  }

  isSelectImportType() {
    return elements.selectImportTypeLookup.element.isDisplayed();
  }

  isTestResultOptionsFormPresent() {
    return elements.importResultOptionsForm.isDisplayed();
  }

  isUnitTestDescriptionOn() {
    return elements.unitTestDescriptionSwitch.isOn();
  }

  selectTestSuite(testSuite: string) {
    return elements.testSuiteNameLookup.select(testSuite);
  }

  selectImportType(importType: string) {
    return elements.selectImportTypeLookup.select(importType);
  }

  switchOnUnitTestDescription() {
    return elements.unitTestDescriptionSwitch.switchOn();
  }

  uploadFile(absolutePath: string) {
    return elements.fileUpload.sendKeys(absolutePath);
  }

  async waitForImportResultsCountToBe(count: number) {
    const oldLatestTestRunId: number = await this.getLatestImportedTestRunId();
    return browser.wait(async () => {
      await elements.importResultsTable.clickRefresh();
      const actualLatestTestRunId = await this.getLatestImportedTestRunId();
      const isFinished = await this.isLatestImportFinished();
      return oldLatestTestRunId !== actualLatestTestRunId && isFinished;
    }, browser.allScriptsTimeout).catch(() => false);
  }
}
