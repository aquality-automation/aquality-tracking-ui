import { Locator, By, browser, protractor } from 'protractor';
import { BaseElement } from '../base.element';
import { Input } from '../input.element';
import { SmartTable } from '../smartTable.element';

export class ResultSearcher extends BaseElement {
  constructor(locator: Locator) {
    super(locator);
  }

  private searcherInput = new Input(By.id('searchByFailReason'));
  private resultSearcherTable = new SmartTable(By.id('resultSearcherTable'));

  async hasNoResults() {
    return this.resultSearcherTable.hasNoData();
  }

  async openSearcher() {
    if (!(await this.isSearcherOpened())) {
      return this.clickSearchOpener();
    }
  }

  async closeSearcher() {
    if ((await this.isSearcherOpened())) {
      return this.clickSearchOpener();
    }
  }

  async search(value: string) {
    await this.setSearchValue(value);
    return this.clickSearch();
  }

  setSearchValue(value: string) {
    return this.searcherInput.typeText(value);
  }

  async getSearchValue(): Promise<string> {
    return await this.searcherInput.getValue();
  }

  async pressEnter() {
    await this.searcherInput.element.click();
    return browser.actions().sendKeys(protractor.Key.ENTER).perform();
  }

  clickSearch() {
    return this.element.element(By.id('startResultsSearch')).click();
  }

  clickSearchOpener() {
    return this.element.element(By.id('resultSearcherOpener')).click();
  }

  async isSearcherOpened() {
    const classValue = await this.element.element(By.css('#resultSearcherOpener svg')).getAttribute('data-icon');
    return classValue.includes('up');
  }

  disableRegexpSearch() {
    return this.setRegexpSearch(false);
  }

  enableRegexpSearch() {
    return this.setRegexpSearch(true);
  }

  getNumberOfResults() {
    return this.resultSearcherTable.getTotalRows();
  }

  setLimit(limit: string) {
    return new Input(By.id('limitResults')).typeText(limit);
  }

  async onlyContainsFailReasonWith(failReasonPart: string): Promise<string[]> {
    const values = await this.resultSearcherTable.getColumValues('Fail Reason');
    const incorrectValues: string[] = [];
    for (let i = 0; i < values.length; i++) {
      const value = values[i];
      if (!value.includes(failReasonPart)) {
        incorrectValues.push(value);
      }
    }

    return incorrectValues;
  }

  private async setRegexpSearch(state: boolean): Promise<void> {
    const regexpToggler = this.element.element(By.id('regexpSearch'));
    if ((await regexpToggler.getAttribute('class')).includes('btn-success') !== state) {
      return regexpToggler.click();
    }
    return;
  }
}
