import { by, element, Locator, ElementFinder } from 'protractor';
import { BaseElement } from './base.element';

export class Attachments extends BaseElement {
    constructor(locator: Locator) {
        super(locator);
    }

    private input = this.element.element(by.tagName('input'));
    private attachedFileRow = (attachName: string) => this.element.element(
        by.xpath(`.//tr[./td[contains(@class, 'uploader-fileName') and text()='${attachName}']]`)
    )
    private fileUpload = (row: ElementFinder) => row.element(
        by.css(`.upload-single`))

    add(path: string) {
        return this.input.sendKeys(path);
    }

    isAdded(attachName: string) {
        return this.attachedFileRow(attachName).isPresent();
    }

    upload(attachName: string) {
        return this.fileUpload(this.attachedFileRow(attachName)).click();
    }
}
