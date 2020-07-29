import { by, ElementFinder, Locator, browser } from 'protractor';
import { BaseElement } from './base.element';
import { Input } from './input.element';
import { logger } from '../utils/log.util';

export class InlineEditor extends BaseElement {

    constructor(locatorOrElement: Locator | ElementFinder) {
        super(locatorOrElement);
    }

    private inlineForm: ElementFinder = this.element.element(by.css('.ie-value-holder'));
    private inlineLinkForm: ElementFinder = this.element.element(by.css('.link-holder'));
    private inlineFormPlaceholder: ElementFinder = this.element.element(by.css('.placeholder'));
    private editFormOpener: ElementFinder = this.element.element(by.css('.ie-edit'));
    private editorFormSave: ElementFinder = this.element.element(by.css('.ie-save'));
    private editorFormCancel: ElementFinder = this.element.element(by.css('.ie-cancel'));
    private editorInput: Input = new Input(this.element.element(by.css('.ie-editor')));
    private error: ElementFinder = this.element.element(by.css('.invalid-feedback'));

    public async openEditor() {
        logger.info('Opening Inline Editor');
        if (await this.inlineForm.isDisplayed()) {
            await browser.actions().mouseMove(this.inlineForm).perform();
            return this.editFormOpener.click();
        }
        logger.warn('Inline Editor is not displayed or already opened!');
    }

    public async accept() {
        logger.info('Saving Inline Editor');
        if (await this.editorInput.isDisplayed()) {
            return this.editorFormSave.click();
        }
        logger.warn('Inline Editor is not displayed or not opened!');
    }

    public async cancel() {
        logger.info('Cancel Inline Editor');
        if (await this.editorInput.isDisplayed()) {
            return this.editorFormCancel.click();
        }
        logger.warn('Inline Editor is not displayed or not opened!');
    }

    public async typeText(value: string) {
        logger.info('Typing into Inline Editor');
        if (await this.editorInput.isDisplayed()) {
            return this.editorInput.typeText(value);
        }
        logger.warn('Inline Editor is not displayed or not opened!');
    }

    public async isEnabled(): Promise<boolean> {
        if (await this.inlineForm.isDisplayed()) {
            await browser.actions().mouseMove(this.inlineForm).perform();
            return this.editFormOpener.isPresent();
        }
        logger.warn('Inline Editor is not displayed or opened!');
    }

    public async changeAndSetValue(value: string) {
        await this.openEditor();
        await this.typeText(value);
        return this.accept();
    }

    public async getError() {
        return this.error.getText();
    }

    public async getValue() {
        logger.warn('Getting Inline Editor value!');
        if (await this.inlineFormPlaceholder.isPresent()) {
            logger.warn('Inline Editor value is empty!');
            return '';
        }

        if (await this.inlineLinkForm.isPresent()) {
            logger.warn('Inline Editor value is a link!');
            return this.inlineLinkForm.getAttribute('href');
        }

        logger.warn('Inline Editor value is a text!');
        return this.inlineForm.getText();
    }
}
