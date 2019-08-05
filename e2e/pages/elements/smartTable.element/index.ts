import { by, Locator, ElementFinder, browser, protractor, ElementArrayFinder } from 'protractor';
import { BaseElement } from '../base.element';
import { logger } from '../../../utils/log.util';
import { Checkbox } from '../checkbox.element';
import { InlineEditor } from '../inlineEditor.element';
import { Lookup } from '../lookup.element';
import { Input } from '../input.element';

const EC = protractor.ExpectedConditions;

export class SmartTable extends BaseElement {
    constructor(locator: Locator) {
        super(locator);
    }

    private creationRow = this.element.element(by.css('.ft-creation-row'));
    private creationToggler = this.element.element(by.css('.ft-create-toggler'));
    private creationError = this.element.element(by.css('.ft-create-error'));
    private refreshButton = this.element.element(by.css('.actions-header .ft-refresh'));

    private createRowElements = {
        confirmPassword: (columnIndex: number) =>
            new Input(this.creationRow.element(by.xpath(`./td[${columnIndex + 1}]/input[contains(@class,'ft-confirm-password')]`))),
        password: (columnIndex: number): Input =>
            new Input(this.creationRow.element(by.xpath(`./td[${columnIndex + 1}]/input[contains(@class,'ft-password')]`))),
        input: (columnIndex: number): Input =>
            new Input(this.creationRow.element(by.xpath(`./td[${columnIndex + 1}]/input[@type="text"]`))),
        checkbox: (columnIndex: number): Checkbox =>
            new Checkbox(this.creationRow.element(by.xpath(`./td[${columnIndex + 1}]/input[@type="checkbox"]`))),
        coloredLookup: (columnIndex: number): Lookup =>
            new Lookup(this.creationRow.element(by.xpath(`./td[${columnIndex + 1}]/lookup-colored`))),
    };

    private rowElements = {
        inlineEditor: (cell: ElementFinder) => new InlineEditor(cell.element(by.tagName('inline-editor'))),
        checkbox: (cell: ElementFinder) => new Checkbox(cell.element(by.xpath('.//input[@type="checkbox"]'))),
        lookup: (cell: ElementFinder) => new Lookup(cell.element(by.xpath('.//lookup-colored'))),
    };

    public async openCreation() {
        if (!(await this.isCreationOpened())) {
            await this.creationToggler.click();
            return browser.wait(EC.visibilityOf(this.creationRow), 2000, 'Table Creation row was not opened');
        }
    }

    public async closeCreation() {
        if (await this.isCreationOpened()) {
            await this.creationToggler.click();
            return browser.wait(EC.invisibilityOf(this.creationRow), 2000, 'Table Creation row was not closed');
        }
    }

    public async getCreationError() {
        if (await this.creationError.isPresent()) {
            return this.creationError.getText();
        }
        return '';
    }

    public async fillCreation(value: string | boolean | number, columnName: string) {
        const columnIndex = await this.getColumnIndex(columnName);
        if (await this.isCreationOpened()) {
            if (await this.createRowElements.input(columnIndex).element.isPresent()) {
                return this.createRowElements.input(columnIndex).typeText(value as string);
            } if (await this.createRowElements.checkbox(columnIndex).element.isPresent()) {
                return this.createRowElements.checkbox(columnIndex).setState(value as boolean);
            } if (await this.createRowElements.coloredLookup(columnIndex).element.isPresent()) {
                return this.createRowElements.coloredLookup(columnIndex).select(value as string);
            }
        }
        throw Error('Creation Row is not opened');
    }

    public async fillCreationPassword(value: string | boolean | number, columnName: string) {
        const columnIndex = await this.getColumnIndex(columnName);
        if (await this.isCreationOpened()) {
            return this.createRowElements.password(columnIndex).typeText(value as string);
        }
        throw Error('Creation Row is not opened');
    }

    public async fillCreationConfirmPassword(value: string | boolean | number, columnName: string) {
        const columnIndex = await this.getColumnIndex(columnName);
        if (await this.isCreationOpened()) {
            return this.createRowElements.confirmPassword(columnIndex).typeText(value as string);
        }
        throw Error('Creation Row is not opened');
    }

    public async clickCreateAction() {
        return this.creationRow.element(by.css('.row-action-button')).click();
    }

    public async getCreationTextFieldValue(columnName: string) {
        const columnIndex = await this.getColumnIndex(columnName);
        if (await this.isCreationOpened()) {
            return new Input(this.creationRow.element(by.xpath(`./td[${columnIndex + 1}]/input`))).getValue();
        }

        throw Error('Creation Row is not opened');
    }

    public async getRowValues(value: string, columnName: string) {
        const result: any = {};
        const row = await this.getRow(value, columnName);
        const columns = await this.getColumns();
        for (let i = 0; i < columns.length; i++) {
            const cell = await this.getCellFromRow(row, i);
            const checkbox = cell.element(by.xpath('.//input[@type="checkbox"]'));
            if (await checkbox.isPresent()) {
                result[await columns[i].getText()] = await checkbox.isSelected();
            } else {
                result[await columns[i].getText()] = await cell.getText();
            }
        }
        return result;
    }

    public async clickAction(value: string, columnName: string) {
        const row: ElementFinder = await this.getRow(value, columnName);
        return row.element(by.css('.row-action-button')).click();
    }

    public async isRowExists(value: string, columnName: string) {
        const rows = await this.getRows(value, columnName);
        return rows.length > 0;
    }

    public async clickRow(value: string, columnName: string) {
        return (await this.getRow(value, columnName)).click();
    }

    public async clickCell(columnToClick: string, searchValue: string, searchColumn: string) {
        const cell = await this.getCell(columnToClick, searchValue, searchColumn);
        return cell.click();
    }

    public async editRow(value: string | boolean, column: string, searchValue: string, searchColumn: string) {
        const cell = await this.getCell(column, searchValue, searchColumn);
        if (await this.rowElements.inlineEditor(cell).element.isPresent()) {
            return this.rowElements.inlineEditor(cell).changeAndSetValue(value as string);
        }
        if (await this.rowElements.checkbox(cell).element.isPresent()) {
            return this.rowElements.checkbox(cell).setState(value as boolean);
        }
        if (await this.rowElements.lookup(cell).element.isPresent()) {
            return this.rowElements.lookup(cell).select(value as string);
        }

        throw new Error('You are trying to edit not editable column!');
    }

    public async clickCellLink(columnWithLink: string, searchValue: string, searchColumn: string) {
        const cell = await this.getCell(columnWithLink, searchValue, searchColumn);
        const link: ElementFinder = cell.element(by.css('.ft-cell > a'));
        if (await link.isPresent()) {
            return link.click();
        }

        throw new Error('You are trying to click link in column without link!');
    }

    public async getCellText(columnWithText: string, searchValue: string | number, searchColumn: string) {
        const cell = await this.getCell(columnWithText, searchValue, searchColumn);
        return cell.getText();
    }

    public async getCellTextUsingRowIndex(columnWithText: string, rowIndex: number): Promise<string> {
        const cell = await this.getCellUsingRowIndex(columnWithText, rowIndex);
        return cell.getText();
    }

    public async getCellLookup(column: string, searchValue: string, searchColumn: string): Promise<Lookup> {
        const cell = await this.getCell(column, searchValue, searchColumn);
        return this.rowElements.lookup(cell);
    }

    public async isRowEditable(searchValue: string, searchColumn: string) {
        const row = await this.getRow(searchValue, searchColumn);
        const columns: ElementFinder[] = await this.getColumns();
        for (let i = 0; i < columns.length; i++) {
            const cell = await this.getCellFromRow(row, i);
            const result = await this.isCellContainsEditableElement(cell);
            if (result) {
                logger.info(`Row editable by ${await columns[i].getText()}`);
                return true;
            }
        }

        return false;
    }

    public async clickRefresh() {
        if (await this.refreshButton.isDisplayed()) {
            return this.refreshButton.click();
        }
        throw new Error('You are trying to Refresh table without refresh action');
    }

    private async isCellContainsEditableElement(cell: ElementFinder) {
        const inlineEditor = this.rowElements.inlineEditor(cell);
        const checkbox = this.rowElements.checkbox(cell);
        const lookup = this.rowElements.lookup(cell);
        if (await inlineEditor.element.isPresent()) {
            return true;
        }
        if (await checkbox.element.isPresent()) {
            return checkbox.element.isEnabled();
        }
        if (await lookup.element.isPresent()) {
            return lookup.isEnabled();
        }
        return false;
    }

    private isCreationOpened() {
        return this.creationRow.isPresent();
    }

    private getColumns(): ElementArrayFinder {
        return this.element.all(by.css('.names-header th'));
    }

    private async getColumnIndex(name: string): Promise<number> {
        const columns = await this.getColumns();
        for (let i = 0; i < columns.length; i++) {
            const currentName = await columns[i].getText();
            if (currentName === name) {
                return i;
            }
        }

        logger.warn(`Column ${name} was not found.`);
        return -1;
    }

    private async getCellFromRow(row: ElementFinder, index: number): Promise<ElementFinder> {
        const cells = await row.all(by.tagName('td'));
        return cells[index] as ElementFinder;
    }

    private async getCell(column: string, searchValue: string | number, searchColumn: string): Promise<ElementFinder> {
        const row = await this.getRow(searchValue, searchColumn);
        const columnIndex = await this.getColumnIndex(column);
        return this.getCellFromRow(row, columnIndex);
    }

    private async getCellUsingRowIndex(column: string, index: number): Promise<ElementFinder> {
        const row = await this.getRowByIndex(index);
        const columnIndex = await this.getColumnIndex(column);
        return this.getCellFromRow(row, columnIndex);
    }

    private async getRows(value: string | number, columnName: string) {
        const columnIndex = await this.getColumnIndex(columnName);
        const locator = `.//tbody/tr[td[${columnIndex + 1}]//*[contains(text(),'${value}')]]`;
        logger.info(`Looking for rows using ${locator} xpath`);
        return this.element.all(by.xpath(locator));
    }

    private async getAllRows() {
        return this.element.all(by.xpath(`.//tbody/tr`));
    }

    private async getRow(value: string | number, columnName: string): Promise<ElementFinder> {
        const rows = await this.getRows(value, columnName);
        if (rows.length < 1) {
            throw new Error(`No rows were found by ${value} value in ${columnName} column`);
        }

        if (rows.length > 1) {
            logger.warn(`Multiple rows were found by ${value} value in ${columnName} column, the first will be used`);
        }
        return rows[0];
    }

    private async getRowByIndex(index: number): Promise<ElementFinder> {
        const rows = await this.getAllRows();
        return rows[index];
    }
}
