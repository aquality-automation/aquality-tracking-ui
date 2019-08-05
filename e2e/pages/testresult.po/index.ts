import { browser } from 'protractor';
import { BasePage } from '../base.po';
import { elements, names, baseUrl } from './constants';

export class TestResultView extends BasePage {
  constructor() {
    super(elements.uniqueElement, names.pageName);
  }

  navigateTo(projectId: number, testRunId: number) {
    return browser.get(baseUrl(projectId, testRunId));
  }

  async setResolution(name: string) {
    return elements.resolutionSelector.select(name);
  }

  async saveResult() {
    return elements.saveButton.click();
  }
}
