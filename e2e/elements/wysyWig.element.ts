import { by, Locator, browser, Key } from 'protractor';
import { BaseElement } from './base.element';

export class WysyWig extends BaseElement {
    constructor(locator: Locator) {
        super(locator);
    }
    editor = this.element.element(by.css('.ngx-editor-textarea'));

    getText() {
        return this.editor.getText();
    }

    setText(summary: string) {
        return browser.actions()
            .click(this.editor)
            .sendKeys(Key.chord(Key.CONTROL, 'a'), summary)
            .perform();
    }
}
