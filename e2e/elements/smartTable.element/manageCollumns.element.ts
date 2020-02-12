import { by, Locator } from 'protractor';
import { BaseElement } from './../base.element';

export class ManageColumns extends BaseElement {
    constructor(tableLocator: Locator) {
        super(tableLocator);
    }

    private manageColumnsButton = new BaseElement(this.element.element(by.css('.manage-columns-opener')));
    private applyButton = this.element.element(by.xpath(`.//manage-columns-modal//button[text()='Apply']`));
    private cancelButton = this.element.element(by.xpath(`.//manage-columns-modal//button[text()='Cancel']`));
    private hideBucket = new BaseElement(this.element.element(by.css(`#hidden-columns .me-droppable`)));
    private showBucket = new BaseElement(this.element.element(by.css(`#shown-columns .me-droppable`)));

    private hiddenColumn = (columnName: string) =>
        new BaseElement(this.element.element(by.xpath(`.//*[@id='hidden-columns']//li[text()='${columnName}']`)))
    private shownColumn = (columnName: string) =>
        new BaseElement(this.element.element(by.xpath(`.//*[@id='shown-columns']//li[text()='${columnName}']`)))

    isColumnShown(columnName: string) {
        const column = this.shownColumn(columnName);
        return column.isPresent();
    }

    isColumnHidden(columnName: string) {
        const column = this.hiddenColumn(columnName);
        return column.isPresent();
    }

    hideColumn(columnName: string) {
        const column = this.shownColumn(columnName);
        return column.dragAndDrop(this.hideBucket);
    }

    showColumn(columnName: string) {
        const column = this.hiddenColumn(columnName);
        return column.dragAndDrop(this.showBucket);
    }

    apply() {
        return this.applyButton.click();
    }

    cancel() {
        return this.cancelButton.click();
    }

    async openManageColumns() {
        const ismanageColumnsButtonExist = await this.manageColumnsButton.isPresent();
        if (ismanageColumnsButtonExist) {
            return this.manageColumnsButton.click();
        }

        throw new Error('The table does not configured to have Columns Management!');
    }

    async removeColumn(columnName: string) {
        await this.openManageColumns();
        await this.hideColumn(columnName);
        return this.apply();
    }
}
