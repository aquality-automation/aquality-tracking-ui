import { browser } from 'protractor';
import { BasePage } from '../../base.po';
import { elements, names, baseUrl, stepColumns } from './constants';
import { testData } from '../../../utils/testData.util';

class TestResultView extends BasePage {
  constructor() {
    super(elements.uniqueElement, names.pageName);
  }

  private attachCell = (stepName: string) =>  elements.stepsTable.getElementsForCell(stepColumns.attachment, stepName, stepColumns.step);

  navigateTo(projectId: number, testrunId: number) {
    return browser.get(baseUrl(projectId, testrunId));
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

  isStepsSectionExists(): Promise<boolean> {
    return elements.stepsTable.isVisible();
  }

  isStepsTableEditable(): any {
    return elements.stepsTable.isRowEditableByIndex(0);
  }

  getStepResult(name: string): any {
    return elements.stepsTable.getCellText(stepColumns.result, name, stepColumns.step);
  }

  getStepComment(name: string): any {
    return elements.stepsTable.getCellText(stepColumns.comment, name, stepColumns.step);
  }

  acceptBulkStepEdit() {
    return elements.stepsTable.clickBulkAction();
  }

  setBulkStepComment(comment: string) {
    return elements.stepsTable.fillBulkRow(comment, stepColumns.comment);
  }

  setBulkStepResult(result: string) {
    return elements.stepsTable.fillBulkRow(result, stepColumns.result);
  }

  selectStep(stepName: string) {
    return elements.stepsTable.selectRow(stepName, stepColumns.step);
  }

  async addAttachToStep(attachPath: string, name: string) {
    return (await this.attachCell(name)).inlineAttachment().addFile(attachPath);
  }

  async isAttachAddedToStep(name: string): Promise<boolean> {
    return (await this.attachCell(name)).inlineAttachment().isAttacmentExist();
  }

  async openImageAttachmentFromStep(name: string) {
    return (await this.attachCell(name)).inlineAttachment().showImage();
  }

  async isAttachmentOpened(name: string): Promise<boolean> {
    return (await this.attachCell(name)).inlineAttachment().isViewerExists();
  }

  async closeImageAttachment(name: string) {
    return (await this.attachCell(name)).inlineAttachment().closeImage();
  }

  async isChangeAttachExistsForStep(name: string): Promise<boolean> {
    return (await this.attachCell(name)).inlineAttachment().isChangeExists();
  }

  async isDownloadAttachExistsForStep(name: string): Promise<boolean> {
    return (await this.attachCell(name)).inlineAttachment().isDownloadExists();
  }

  async downloadAttachForStep(name: string) {
    return (await this.attachCell(name)).inlineAttachment().downloadAttach();
  }

  async attachIsDownloaded(extension: string, startsWith: string): Promise<boolean> {
    return testData.isFileDownloadedAndRemove(extension, startsWith);
  }

  async removeAttachForStep(name: string) {
    return (await this.attachCell(name)).inlineAttachment().removeAttach();
  }
}

export const testResultView = new TestResultView();
