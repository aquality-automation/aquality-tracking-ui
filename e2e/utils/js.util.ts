import { browser, WebElement } from 'protractor';

const scrollIntoView = (webElement: WebElement) => {
    return browser.executeScript('arguments[0].scrollIntoView();', webElement);
};

export { scrollIntoView };
