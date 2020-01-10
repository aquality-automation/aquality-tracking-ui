import { browser } from 'protractor';
import { baseUrl, elements, names, regexps, columns } from './constants';
import { BasePage } from '../../base.po';
import { convertHoursTo24HourFormat, padYear } from './helpers';

class TestRunView extends BasePage {
  constructor() {
    super(elements.uniqueElement, names.pageName);
  }

  public resultSearcher = elements.resultSearcher;

  navigateTo(projectId: number, testRunId: number) {
    return browser.get(baseUrl(projectId, testRunId));
  }

  async getBuildName() {
    return elements.buildNameLink.getText();
  }

  async getMilestone() {
    return elements.milestoneField.getAttribute('value');
  }

  async getTestSuite() {
    return elements.testSuiteLink.getText();
  }

  getResultsCount(): any {
    return elements.resultsTable.getTotalRows();
  }

  async setResolution(resolution: string, testName: string) {
    return elements.resultsTable.editRow(resolution, columns.resolution, testName, columns.testName);
  }

  async getResolution(testName: string) {
    return (await elements.resultsTable.getRowValues(testName, columns.testName))[columns.resolution];
  }

  async getComment(testName: string): Promise<string> {
    return (await elements.resultsTable.getRowValues(testName, columns.testName))[columns.comment];
  }

  setComment(comment: string, testName: string) {
    return elements.resultsTable.editRow(comment, columns.comment, testName, columns.testName);
  }

  async isResolutionPresent(resolutionName: string, testName: string) {
    const lookup = await elements.resultsTable.getCellLookup(columns.resolution, testName, columns.testName);
    return lookup.isOptionPresent(resolutionName);
  }

  async openResult(testName: string) {
    await elements.resultsTable.clickCell(columns.testName, testName, columns.testName);
    const handles = await browser.getAllWindowHandles();
    await browser.switchTo().window(handles[handles.length - 1]);
    await browser.waitForAngular();
  }

  async rightClickFailReason(failReason: string) {
    return elements.resultsTable.rightClickCell(columns.failReason, failReason, columns.failReason);
  }

  async clickResultPassedChartSection() {
    return elements.resultsChart.clickPassed();
  }

  async clickResolutionTestIssueChartSection() {
    return elements.resolutionsChart.clickTestIssue();
  }

  async getStartTime() {
    const startTimeValue = await elements.startTimeLabel.getText();
    const startDateRegex = new RegExp(regexps.startDateRegexp);
    const year = padYear(startDateRegex.exec(startTimeValue)['groups'].year);
    const month = startDateRegex.exec(startTimeValue)['groups'].month - 1;
    const day = startDateRegex.exec(startTimeValue)['groups'].day;
    const hours = convertHoursTo24HourFormat(startDateRegex.exec(startTimeValue)
    ['groups'].hours, startDateRegex.exec(startTimeValue)['groups'].period);
    const minutes = startDateRegex.exec(startTimeValue)['groups'].minutes;
    return new Date(year, month, day, hours, minutes);
  }

  setResultFilter(value: string) {
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

  sortResultsByName() {
    return elements.resultsTable.clickSorter(columns.testName);
  }

  async getId(): Promise<number> {
    const url = `${await browser.getCurrentUrl()}/`;
    const regexp = /\/testrun\/(\d+)/;
    return +(url.match(regexp)[1]);
  }

  checkIfTableEqualToCSv(path: string) {
    return elements.resultsTable.checkIfTableEqualToCSv(path);
  }
}

export const testRunView = new TestRunView();