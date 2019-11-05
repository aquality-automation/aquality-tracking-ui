import { browser, WebElement, element } from 'protractor';
import { By, Key } from 'selenium-webdriver';

const scrollIntoView = (webElement: WebElement) => {
    return browser.executeScript('arguments[0].scrollIntoView();', webElement);
};

const getClipboardText = async () => {
    await browser.executeScript(`(function(){
        var node = document.createElement("textarea");
        node.setAttribute("id", "temp-for-paste");
        document.getElementsByTagName('body')[0].appendChild(node);
        })()`
    );

    const tempTextArea = element(By.id('temp-for-paste'));
    await tempTextArea.click();
    await tempTextArea.sendKeys(Key.chord(Key.CONTROL, 'v'));
    const result = await tempTextArea.getAttribute('value');
    await browser.executeScript(`(function(){
        const el = document.getElementById('temp-for-paste');
        el.parentNode.removeChild(el);
        })()`
    );

    return result;
};

export { scrollIntoView, getClipboardText };
