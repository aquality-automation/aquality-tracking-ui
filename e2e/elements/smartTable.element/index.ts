import { by, Locator, ElementFinder, browser, protractor, ElementArrayFinder, element, promise } from 'protractor';
import { BaseElement } from '../base.element';
import { logger } from '../../utils/log.util';
import { Lookup } from '../lookup.element';
import { testData } from '../../utils/testData.util';
import { rightClick } from '../../utils/click.util';
import { Paginator } from './paginator.element';
import { Row, CellElements } from './row.element';
import { ManageColumns } from './manageCollumns.element';
import { compareCSVStrings } from '../../utils/csv.util';

const EC = protractor.ExpectedConditions;

export class SmartTable extends BaseElement {
    public manageColumns: ManageColumns;
    private paginator: Paginator;
    private creationRow = new Row(this.element.element(by.css('.ft-creation-row')));
    private bulkEditRow = new Row(this.element.element(by.css('.ft-bulk-edit-row')));
    private filterRow = new Row(this.element.element(by.css('.filter-header')));
    private creationToggler = this.element.element(by.css('.ft-create-toggler'));
    private creationError = this.element.element(by.css('.ft-create-error'));
    private refreshButton = this.element.element(by.css('.actions-header .ft-refresh'));
    private totalLabel = this.element.element(by.css('.ft-total-label'));
    private getCSVButton = this.element.element(by.id('getSCV'));

    constructor(locator: Locator) {
        super(locator);
        this.paginator = new Paginator(locator);
        this.manageColumns = new ManageColumns(locator);
    }

    public async checkIfTableEqualToCSv(pathToCSV: string): Promise<{ result: boolean, message: string }> {
        const result = {
            result: true,
            message: ''
        };
        const actualTableCSV = await this.getCSV();
        const expectedTableCSV = await testData.readAsString(pathToCSV);
        const comparisonResult = compareCSVStrings(actualTableCSV, expectedTableCSV, true);
        if (comparisonResult.missedFromActual.length > 0) {
            result.result = false;
            result.message = `Not all actual results are in expected list:\n${comparisonResult.missedFromActual.join('\n')}`;
        }
        if (comparisonResult.missedFromExpected.length > 0) {
            result.result = false;
            result.message = `Not all expected results are in actual list:\n${comparisonResult.missedFromExpected.join('\n')}`;
        }

        return result;
    }

    public async getRow(value: string | number, columnName: string): Promise<Row> {
        const rows = await this.getRows(value, columnName);
        if (rows.length < 1) {
            const isPaginatorPresent = await this.paginator.isPresent();
            const isOnLastPage = !(await this.paginator.isNextExist());
            if (isPaginatorPresent && !isOnLastPage) {
                await this.paginator.next();
                return new Row((await this.getRow(value, columnName)).element);
            }
            throw new Error(`No rows were found by '${value}' value in '${columnName}' column`);
        }

        if (rows.length > 1) {
            logger.warn(`Multiple rows were found by '${value}' value in '${columnName}' column, the first will be used`);
        }
        return new Row(rows[0]);
    }

    public async getElementsForCell(columnName: string, searchValue: string | number, searchName: string): Promise<CellElements> {
        const columnIndex = await this.getColumnIndex(columnName);
        return (await this.getRow(searchValue, searchName)).getRowElements(columnIndex);
    }

    public async getRowByIndex(index: number): Promise<Row> {
        const rows = await this.getAllRows();
        return new Row(rows[index]);
    }

    public async selectRow(value: string, columnName: string) {
        const row = await this.getRow(value, columnName);
        return row.editRowCellValueByColumnIndex(true, 0);
    }

    public async getTotalRows() {
        const totalLabel = await this.totalLabel.getText();
        return +totalLabel.match(/.*\((\d+)\)/)[1];
    }

    public async getShownRows() {
        const totalLabel = await this.totalLabel.getText();
        return +totalLabel.match(/.*: (\d+) \(/)[1];
    }

    public async openCreation() {
        if (!(await this.isCreationOpened())) {
            await this.creationToggler.click();
            return browser.wait(EC.visibilityOf(this.creationRow.element), 2000, 'Table Creation row was not opened');
        }
    }

    public async closeCreation() {
        if (await this.isCreationOpened()) {
            await this.creationToggler.click();
            return browser.wait(EC.invisibilityOf(this.creationRow.element), 2000, 'Table Creation row was not closed');
        }
    }

    public async getCreationError() {
        if (await this.creationError.isPresent()) {
            return this.creationError.getText();
        }
        return '';
    }

    public async setFilter(value: string | boolean | number, columnName: string) {
        if (await this.filterRow.isVisible()) {
            const columnIndex = await this.getColumnIndex(columnName);
            return this.filterRow.editRowCellValueByColumnIndex(value, columnIndex);
        }
        throw Error('Filter is not available for selected table');
    }

    public async fillCreation(value: string | boolean | number, columnName: string) {
        const columnIndex = await this.getColumnIndex(columnName);
        return this.creationRow.editRowCellValueByColumnIndex(value, columnIndex);
    }

    public async fillBulkRow(value: string | boolean | number, columnName: string) {
        if (await this.isBulkEditOpened()) {
            const columnIndex = await this.getColumnIndex(columnName);
            return this.bulkEditRow.editRowCellValueByColumnIndex(value, columnIndex);
        }
        throw Error('Bulk edit row is not opened');
    }

    public async fillCreationPassword(value: string | boolean | number, columnName: string) {
        if (await this.isCreationOpened()) {
            const columnIndex = await this.getColumnIndex(columnName);
            return (await this.creationRow.getRowElements(columnIndex))
                .password().typeText(value as string);
        }
        throw Error('Creation Row is not opened');
    }

    public async fillCreationConfirmPassword(value: string | boolean | number, columnName: string) {
        if (await this.isCreationOpened()) {
            const columnIndex = await this.getColumnIndex(columnName);
            return (await this.creationRow.getRowElements(columnIndex))
                .confirmPassword().typeText(value as string);
        }
        throw Error('Creation Row is not opened');
    }

    public clickCreateAction(): promise.Promise<void> {
        return this.creationRow.clickAction();
    }

    public isCreateActionEnabled(): promise.Promise<boolean> {
        return this.creationRow.isActionEnabled();
    }

    public clickBulkAction() {
        return this.bulkEditRow.clickAction();
    }

    public async getCreationTextFieldValue(columnName: string) {
        const columnIndex = await this.getColumnIndex(columnName);
        if (await this.isCreationOpened()) {
            return this.creationRow.getRowCellValue(columnIndex);
        }

        throw Error('Creation Row is not opened');
    }

    public async getRowValues(value: string, columnName: string) {
        const columns = await this.getColumns();
        const row = await this.getRow(value, columnName);
        const result = await row.getRowValues();
        for (let i = 0; i < columns.length; i++) {
            result[await columns[i].getText()] = result[`${i}`];
        }
        return result;
    }

    public async clickAction(value: string, columnName: string) {
        const row = await this.getRow(value, columnName);
        return row.clickAction();
    }

    public async isRowExists(value: string, columnName: string) {
        const rows = await this.getRows(value, columnName);
        return rows.length > 0;
    }

    public async clickRow(value: string, columnName: string) {
        return (await this.getRow(value, columnName)).element.click();
    }

    public async clickCell(columnToClick: string, searchValue: string, searchColumn: string) {
        const cell = await this.getCell(columnToClick, searchValue, searchColumn);
        return cell.click();
    }

    public async rightClickCell(columnToClick: string, searchValue: string, searchColumn: string) {
        const cell = await this.getCell(columnToClick, searchValue, searchColumn);
        return rightClick(cell);
    }

    public async editRow(value: string | boolean, column: string, searchValue: string, searchColumn: string) {
        const row = await this.getRow(searchValue, searchColumn);
        const columnIndex = await this.getColumnIndex(column);
        return row.editRowCellValueByColumnIndex(value, columnIndex);
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

    public async getCellValue(column: string, searchValue: string | number, searchColumn: string): Promise<string | string[]> {
        const columnIndex = await this.getColumnIndex(column);
        const row = await this.getRow(searchValue, searchColumn);
        return row.getRowCellValue(columnIndex);
    }

    public async getCellTextUsingRowIndex(columnWithText: string, rowIndex: number): Promise<string> {
        const cell = await this.getCellUsingRowIndex(columnWithText, rowIndex);
        return cell.getText();
    }

    public async getCellLookup(column: string, searchValue: string, searchColumn: string): Promise<Lookup> {
        const columnIndex = await this.getColumnIndex(column);
        const row = await this.getRow(searchValue, searchColumn);
        const rowElements = await row.getRowElements(columnIndex);
        return rowElements.lookup();
    }

    public async isRowEditableByValue(searchValue: string, searchColumn: string) {
        const row = await this.getRow(searchValue, searchColumn);
        return row.isRowEditable();
    }

    public async isRowEditableByIndex(index: number) {
        const row = await this.getRowByIndex(index);
        return row.isRowEditable();
    }

    public async clickRefresh() {
        if (await this.refreshButton.isDisplayed()) {
            return this.refreshButton.click();
        }
        throw new Error('You are trying to Refresh table without refresh action');
    }

    public async hasNoData() {
        return this.element.element(by.id('noDataRow')).isPresent();
    }

    public async getColumValues(columnName: string): Promise<string[]> {
        const columnIndex = await this.getColumnIndex(columnName);
        const rows = await this.getAllRows();
        const values: string[] = [];
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const cell: ElementFinder = await this.getCellFromRow(row, columnIndex);
            try {
                values.push(await cell.getText());
            } catch (error) {
                logger.warn('Cell was not found to get value. Possibly your table is empty!');
            }
        }

        return values;
    }

    public async isContainOnlyRowsWith(column: string, value: string): Promise<boolean> {
        const values = await this.getColumValues(column);
        values.forEach(columnValue => {
            if (value !== columnValue) {
                return false;
            }
        });

        return true;
    }

    public async isFilterSelected(columnName: string, value: string) {
        if (await this.filterRow.element.isDisplayed()) {
            const columnIndex = await this.getColumnIndex(columnName);
            return value === await this.filterRow.getRowCellValue(columnIndex);
        }
        throw Error('Filter is not available for selected table');
    }

    public async getCSV(): Promise<string> {
        const csvExtension = '.csv';
        await this.getCSVButton.click();
        await new Promise((resolve) => {
            setTimeout(() => resolve(), 500);
        });
        await element(by.id('getSCV-Download')).click();
        await testData.waitUntilFileExists(testData.getSimpleDownloadsFolderPath(), csvExtension);
        const files = testData.findFilesInDir(testData.getSimpleDownloadsFolderPath(), csvExtension);

        if (files && files.length > 0) {
            const csvResult = await testData.readAsStringFromRoot(files[0]);
            await testData.cleanUpDownloadsData();
            return csvResult;
        }

        throw new Error('Table CSV file was not downloaded!');
    }


    public async clickSorter(columnName: string): Promise<void> {
        const columns = await this.getColumns();
        const columnIndex = await this.getColumnIndex(columnName);
        return columns[columnIndex].click();
    }

    public async rightClickSorter(columnName: string): Promise<void> {
        const columns = await this.getColumns();
        const columnIndex = await this.getColumnIndex(columnName);
        return rightClick(columns[columnIndex]);
    }

    public async getColumnName(index: number): Promise<string> {
        const columns = await this.getColumns();
        return columns[index].getText();
    }

    public async isColumnExist(columnName: string): Promise<boolean> {
        const index = await this.getColumnIndex(columnName);
        return index >= 0;
    }

    public async addValueFromMultiselect(value: string, column: string, searchValue: string, searchColumn: string) {
        const index = await this.getColumnIndex(column);
        const row = await this.getRow(searchValue, searchColumn);
        return row.addMultiselectValueByColumnIndex(value, index);
    }

    public async removeValueFromMultiselect(value: string, column: string, searchValue: string, searchColumn: string) {
        const index = await this.getColumnIndex(column);
        const row = await this.getRow(searchValue, searchColumn);
        return row.removeMultiselectValueByColumnIndex(value, index);
    }

    private isCreationOpened() {
        return this.creationRow.isPresent();
    }

    private isBulkEditOpened() {
        return this.bulkEditRow.isPresent();
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
        return row.getCellFromRow(columnIndex);
    }

    private async getCellUsingRowIndex(column: string, index: number): Promise<ElementFinder> {
        const row = await this.getRowByIndex(index);
        const columnIndex = await this.getColumnIndex(column);
        return row.getCellFromRow(columnIndex);
    }

    private async getRows(value: string | number, columnName: string) {
        const columnIndex = await this.getColumnIndex(columnName);
        const locator = `.//tbody/tr[contains(@class,'ft-row') and td[${columnIndex + 1}]//*[contains(text(),'${value}')]]`;
        logger.info(`Looking for rows using ${locator} xpath`);
        return this.element.all(by.xpath(locator));
    }

    private async getAllRows() {
        return this.element.all(by.xpath(`.//tbody/tr`));
    }
}
