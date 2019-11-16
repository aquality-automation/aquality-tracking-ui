import { by, Locator } from 'protractor';
import { BaseElement } from './../base.element';

export class Paginator extends BaseElement {
    constructor(locator: Locator) {
        super(locator);
    }
    private paginator = this.element.element(by.css('.paginator-bottom .pagination:not(.pull-right)'));
    private paginatorLast = this.paginator.element(by.css('.page-item:last-child'));
    private paginatorNext = this.paginator.element(by.css('.page-item.active + .page-item > a'));

    public async isPresent(): Promise<boolean> {
        return await this.paginator.isPresent();
    }

    public async next(): Promise<void> {
        return await this.paginatorNext.click();
    }

    public async isNextExist(): Promise<boolean> {
        return await this.paginatorLast.isEnabled();
    }
}
