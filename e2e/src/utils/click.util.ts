import { browser, protractor, ElementFinder } from 'protractor';

export const rightClick = async (element: ElementFinder) => {
    return browser.actions().click(element, protractor.Button.RIGHT).perform();
};
