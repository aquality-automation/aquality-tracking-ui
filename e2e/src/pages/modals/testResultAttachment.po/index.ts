import { BasePage } from '../../base.po';
import { elements, names, fileButton } from './constants';
import {browser, ExpectedConditions} from 'protractor';

class TestResultAttachmentModalView extends BasePage {
  constructor() {
    super(elements.uniqueElement, names.pageName);
  }

  waitForFileNameTimeoutMs : number = 20000;

  async getTitle(): Promise<string> {
    return elements.titleElement.getText();
  }

  async isSubTitleIsdisplayed(): Promise<boolean> {
    return elements.subTitleElement.isDisplayed();
  }

  async getSubTitle(): Promise<string> {
    return elements.subTitleElement.getText();
  }

  async isFileAttached(file: string): Promise<boolean> {
    return browser.wait(ExpectedConditions.elementToBeClickable(fileButton(file)), this.waitForFileNameTimeoutMs);
  }

  async selectFile(file: string): Promise<void> {
    return fileButton(file).click();
  }

  async isFileSelected(file: string): Promise<boolean> {
    return browser.wait(fileButton(file).getAttribute('class').then(attr => attr.includes('selected')), this.waitForFileNameTimeoutMs);
  }

  async isImageDisplayed(): Promise<boolean> {
    return elements.imageElement.isDisplayed();
  }

  async clickImage(): Promise<void> {
    return elements.imageElement.click();
  }

  async close(): Promise<void> {
    return elements.closeElement.click();
  }

  async downloadFile(): Promise<void> {
    return elements.downloadElement.click();
  }

  async isFrameDisplayed(): Promise<boolean> {
    return elements.frameElement.isDisplayed();
  }
}

export const testResultAttachmentModal = new TestResultAttachmentModalView();
