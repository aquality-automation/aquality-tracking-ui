import { browser, element } from 'protractor';
import { elements, baseUrl, importResultColumns, names, importTypes, testNameTypes } from './constants';
import { BasePage } from '../base.po';
import { waiter } from '../../utils/wait.util';
import { importHelper } from './helpers';

class Import extends BasePage {
  constructor() {
    super(elements.selectImportTypeLookup.element, names.pageName);
  }

  importTypes = importTypes;
  testNameTypes = testNameTypes;

  navigateTo(id: number) {
    return browser.get(baseUrl(id));
  }

  clickImportAll() {
    return elements.importAll.click();
  }

  getSelectedImportType() {
    return elements.selectImportTypeLookup.getSelectedValue();
  }

  async getLatestImportedTestRunDate(): Promise<Date> {
    let date: Date;
    try {
      date = new Date(await elements.importResultsTable.getCellTextUsingRowIndex(importResultColumns.started, 0));
    } catch (error) {
      date = new Date();
      date.setDate(date.getDate() - 1);
    }
    return new Date(date);
  }

  async isLatestImportFinished(): Promise<boolean> {
    const status = await elements.importResultsTable.getCellTextUsingRowIndex(importResultColumns.status, 0);
    return status === 'Finished';
  }

  getLogs(testRunId: number) {
    return elements.importResultsTable.getCellText(importResultColumns.logs, testRunId, importResultColumns.testRunId);
  }

  getTestSuiteName() {
    return elements.testSuiteNameLookup.getValue();
  }

  isImportFileBtnEnabled() {
    return elements.importAll.isEnabled();
  }

  isImportFileBtnPresent() {
    return elements.importAll.isDisplayed();
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

  createAndSelectTestSuite(testSuite: string) {
    return elements.testSuiteNameLookup.createAndSelect(testSuite);
  }

  selectImportType(importType: string) {
    return elements.selectImportTypeLookup.select(importType);
  }

  switchOnUnitTestDescription() {
    return elements.unitTestDescriptionSwitch.switchOn();
  }

  switchOnIntoLastTestRun() {
    return elements.lastTestRunSwitch.switchOn();
  }

  uploadFile(absolutePath: string) {
    return elements.fileUpload.sendKeys(absolutePath);
  }

  selectTestNameType(testNameType: string) {
    return importHelper.getTestNameSwitcher(testNameType).switchOn();
  }

  isTestNameTypeSelected(testNameType: string) {
    return importHelper.getTestNameSwitcher(testNameType).isOn();
  }

  isTestNameTypeVisible(testNameType: string) {
    return importHelper.getTestNameSwitcher(testNameType).isVisible();
  }

  setBuilName(value: string) {
    return elements.buildName.typeText(value);
  }

  async getTestRunIdFromImportRow(rowIndex: number) {
    return +(await elements.importResultsTable.getCellTextUsingRowIndex(importResultColumns.testRunId, rowIndex));
  }

  async isFileUploaded(filePath: string) {
    const filename = filePath.split('/').pop();
    return elements.uploadedFile(filename).isDisplayed();
  }

  async waitForNewImportResult(lastTestRunDate: Date) {
    return waiter.forTrue(async () => {
      await elements.importResultsTable.clickRefresh();
      try {
        const actualLatestTestRundate = await this.getLatestImportedTestRunDate();
        const isFinished = await this.isLatestImportFinished();
        return lastTestRunDate < actualLatestTestRundate && isFinished;
      } catch (error) {
        return false;
      }
    }, 5, 3000);
  }
}

export const importPage = new Import();