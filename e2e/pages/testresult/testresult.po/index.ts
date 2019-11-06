import { browser } from 'protractor';
import { BasePage } from '../../base.po';
import { elements, names, baseUrl, stepColumns } from './constants';

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

  async setStepResult(stepName: string, result: string) {
    return elements.stepsTable.editRow(result, stepColumns.result, stepName, stepColumns.step);
  }

  async setStepComment(stepName: string, comment: string) {
    return elements.stepsTable.editRow(comment, stepColumns.comment, stepName, stepColumns.step);
  }
}
