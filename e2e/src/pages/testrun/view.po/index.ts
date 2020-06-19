import { browser, promise } from 'protractor';
import { baseUrl, elements, names, columns } from './constants';
import { BasePage } from '../../base.po';

class TestRunView extends BasePage {
  constructor() {
    super(elements.uniqueElement, names.pageName);
  }

  public resultSearcher = elements.resultSearcher;

  navigateTo(projectId: number, testrunId: number) {
    return browser.get(baseUrl(projectId, testrunId));
  }

  getBuildName(): Promise<string> {
    return elements.buildName.getValue();
  }

  setBuildName(build_name: string): Promise<void> {
    return elements.buildName.changeAndSetValue(build_name);
  }

  getBuildNameErrorMessage(): Promise<string> {
    return elements.buildName.getError();
  }

  cancelBuilNameEditor(): Promise<void> {
    return elements.buildName.cancel();
  }

  getMilestone(): Promise<string> {
    return elements.milestoneField.getValue();
  }

  setMilestone(name: string): Promise<void> {
    return elements.milestoneField.select(name);
  }

  getExecutor(): Promise<string> {
    return elements.executor.getValue();
  }

  setExecutor(author: string): Promise<void> {
    return elements.executor.changeAndSetValue(author);
  }

  getExecutionEnvironment(): Promise<string> {
    return elements.executionEnvironment.getValue();
  }

  setExecutionEnvironment(execution_environment: string): Promise<void> {
    return elements.executionEnvironment.changeAndSetValue(execution_environment);
  }

  isCILinkPresent(): promise.Promise<boolean> {
    return elements.ciBuildContainer.isPresent();
  }

  getTestSuite(): promise.Promise<string> {
    return elements.testSuiteLink.getText();
  }

  getResultsCount(): Promise<number> {
    return elements.resultsTable.getTotalRows();
  }

  clickSuiteLink(): promise.Promise<void> {
    return elements.testSuiteLink.click();
  }

  clickFinish(): promise.Promise<void> {
    return elements.finish.click();
  }

  clickReopen() {
    return elements.reopen.click();
  }

  getDuration(): promise.Promise<string> {
    return elements.duration.getText();
  }

  getDebugState(): promise.Promise<boolean> {
    return elements.debug.isSelected();
  }

  setDebug(state: boolean): Promise<void> {
    return elements.debug.setState(state);
  }

  isDebugEditable(): promise.Promise<boolean> {
    return elements.debug.isEnabled();
  }

  isExecutionEnvironmentEditable(): Promise<boolean> {
    return elements.executionEnvironment.isEnabled();
  }

  isExecutorEditable(): Promise<boolean> {
    return elements.executor.isEnabled();
  }

  isMilestoneEditable(): Promise<boolean> {
    return elements.milestoneField.isEnabled();
  }

  isBuildNameEditable(): Promise<boolean> {
    return elements.buildName.isEnabled();
  }

  async setIssue(title: string, testName: string): Promise<void> {
    return elements.resultsTable.editRow(title, columns.issue, testName, columns.testName);
  }

  async getIssue(testName: string): Promise<string> {
    return (await elements.resultsTable.getElementsForCell(columns.issue, testName, columns.testName)).autocomplete().getValue();
  }

  async getResolution(testName: string): Promise<string> {
    return (await elements.resultsTable.getRowValues(testName, columns.testName))[columns.resolution];
  }

  async isResolutionPresent(resolutionName: string, testName: string): Promise<boolean> {
    const lookup = await elements.resultsTable.getCellLookup(columns.resolution, testName, columns.testName);
    return lookup.isOptionPresent(resolutionName);
  }

  async openResult(testName: string): Promise<void> {
    await elements.resultsTable.clickCellLink(columns.testName, testName, columns.testName);
    const handles = await browser.getAllWindowHandles();
    await browser.switchTo().window(handles[handles.length - 1]);
    await browser.waitForAngular();
  }

  async rightClickFailReason(failReason: string): Promise<void> {
    return elements.resultsTable.rightClickCell(columns.failReason, failReason, columns.failReason);
  }

  async clickResultPassedChartSection(): Promise<string> {
    return elements.resultsChart.clickPassed();
  }

  async clickResolutionTestIssueChartSection(): Promise<string> {
    return elements.resolutionsChart.clickTestIssue();
  }

  async getStartTime(): Promise<Date> {
    const startTimeValue = await elements.startTimeLabel.getText();
    return new Date(startTimeValue);
  }

  setResultFilter(value: string): Promise<void> {
    return elements.resultsTable.setFilter(value, columns.result);
  }

  async resultsAreFilteredByResult(result: string): Promise<boolean> {
    return this.resultsAreFiltered(columns.result, result);
  }

  async resultsAreFilteredByResolution(resolution: string): Promise<boolean> {
    return this.resultsAreFiltered(columns.resolution, resolution);
  }

  async resultsAreFiltered(column: string, value: string): Promise<boolean> {
    const isSelected = await elements.resultsTable.isFilterSelected(column, value);
    const isFiltered = await elements.resultsTable.isContainOnlyRowsWith(column, value);
    return isSelected && isFiltered;
  }

  sortResultsByName(): Promise<void> {
    return elements.resultsTable.clickSorter(columns.testName);
  }

  async getId(): Promise<number> {
    const url = `${await browser.getCurrentUrl()}/`;
    const regexp = /\/testrun\/(\d+)/;
    return +(url.match(regexp)[1]);
  }

  checkIfTableEqualToCSV(path: string): Promise<{ result: boolean, message: string }> {
    return elements.resultsTable.checkIfTableEqualToCSv(path);
  }

  async addIssue(title: string, testName: string): Promise<void> {
    return (await elements.resultsTable
      .getElementsForCell(columns.issue, testName, columns.testName)).autocomplete().clickAddOption(title);
  }

  async openNotSelectedIssue(title: string, testName: string): Promise<void> {
    return (await elements.resultsTable
      .getElementsForCell(columns.issue, testName, columns.testName)).autocomplete().clickActionForOption(title);
  }

  async openSelectedIssue(testName: string): Promise<void> {
    return (await elements.resultsTable
      .getElementsForCell(columns.issue, testName, columns.testName)).autocomplete().clickActionForSelected();
  }

  async isIssuePresent(title: string, testName: string): Promise<boolean> {
    return (await elements.resultsTable
      .getElementsForCell(columns.issue, testName, columns.testName)).autocomplete().hasOption(title);
  }
}

export const testrunView = new TestRunView();
