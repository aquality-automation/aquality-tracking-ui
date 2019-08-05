import { MenuBar } from './elements/menuBar.element';
import { Notification } from './elements/notification.element';
import { ElementFinder, browser, protractor } from 'protractor';
import { logger } from '../utils/log.util';
import { Modal } from './elements/modal.element';

const EC = protractor.ExpectedConditions;

export class BasePage {
    private uniqueElement: ElementFinder;
    private pageName: string;
    public menuBar: MenuBar = new MenuBar();
    public notification: Notification = new Notification();
    public modal: Modal = new Modal();

    constructor(uniqueElement: ElementFinder, pageName: string) {
        this.uniqueElement = uniqueElement;
        this.pageName = pageName;
    }

    async isOpened() {
        logger.info(`Checking if page ${this.pageName} is opened`);
        await browser.waitForAngular();
        return await this.uniqueElement.isPresent();
    }

    async waitForIsOpened() {
        await browser.waitForAngular();
        return browser.wait(EC.visibilityOf(this.uniqueElement), 5000, `Page ${this.pageName} was not opened`);
    }

    async refresh() {
        await browser.refresh();
    }
}
