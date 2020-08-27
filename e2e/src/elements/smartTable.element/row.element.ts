import { by, Locator, ElementFinder, promise } from 'protractor';
import { BaseElement } from './../base.element';
import { Input } from '../input.element';
import { Checkbox } from '../checkbox.element';
import { Lookup } from '../lookup.element';
import { Autocomplete } from '../autocomplete.element';
import { InlineEditor } from '../inlineEditor.element';
import { logger } from '../../utils/log.util';
import { InlineAttach } from '../inlineAttach.element';
import { Multiselect } from '../multiselect.element';
import { Dots } from '../dots.element';
import { DatePicker } from '../datepicker.element';
import { Icon } from '../icon.element';

export class Row extends BaseElement {
    constructor(locator: ElementFinder | Locator) {
        super(locator);
    }

    public clickAction(): promise.Promise<void> {
        return this.getActionButton().click();
    }

    public isActionEnabled(): promise.Promise<boolean> {
        return this.getActionButton().isEnabled();
    }

    public async selectRow() {
        return this.editRowCellValueByColumnIndex(true, 0);
    }

    public async getCellFromRow(index: number): Promise<ElementFinder> {
        const cells = await this.getColumns();
        return cells[index] as ElementFinder;
    }

    public async getRowValues() {
        const result: any = {};
        const columnsNumber = await this.getColumnsNumber();
        for (let i = 0; i < columnsNumber; i++) {
            result[i]  = await this.getRowCellValue(i);
        }
        return result;
    }

    public async getRowElements(columnIndex: number): Promise<CellElements> {
        const cell = await this.getCellFromRow(columnIndex);
        return {
            confirmPassword: () =>
                new Input(cell.element(by.xpath(`.//input[contains(@class,'ft-confirm-password')]`))),
            password: (): Input =>
                new Input(cell.element(by.xpath(`.//input[contains(@class,'ft-password')]`))),
            input: (): Input =>
                new Input(cell.element(by.xpath(`.//input[@type="text"]`))),
            checkbox: (): Checkbox =>
                new Checkbox(cell.element(by.xpath(`.//input[@type="checkbox"]`))),
            coloredLookup: (): Lookup =>
                new Lookup(cell.element(by.xpath(`.//lookup-colored`))),
            autocomplete: (): Autocomplete =>
                new Autocomplete(cell.element(by.xpath(`.//lookup-autocomplete`))),
            inlineEditor: () => new InlineEditor(cell.element(by.tagName('inline-editor'))),
            lookup: () => new Lookup(cell.element(by.xpath('.//lookup-colored'))),
            inlineAttachment: () => new InlineAttach(cell.element(by.xpath('.//attachment-inline'))),
            multiselect: () => new Multiselect(cell.element(by.xpath('.//lookup-autocomplete-multiselect'))),
            date: () => new DatePicker(cell.element(by.xpath('.//app-datepicker'))),
            dots: () => new Dots(cell.element(by.xpath('.//app-color-dots'))),
            attachIcon: () => new Icon(cell.element(by.xpath('.//fa-icon')))
        };
    }

    public async editRowCellValueByColumnIndex(value: string | boolean | number | Date, columnIndex: number) {
        const rowElements = await this.getRowElements(columnIndex);
        if (await this.isCellContainsEditableElement(columnIndex)) {
            if (await rowElements.date().element.isPresent()) {
                return rowElements.date().select(new Date(value as Date));
            }
            if (await rowElements.inlineEditor().element.isPresent()) {
                return rowElements.inlineEditor().changeAndSetValue(value as string);
            }
            if (await rowElements.checkbox().element.isPresent()) {
                return rowElements.checkbox().setState(!!value as boolean);
            }
            if (await rowElements.lookup().element.isPresent()) {
                return rowElements.lookup().select(value as string);
            }
            if (await rowElements.input().element.isPresent()) {
                return rowElements.input().typeText(value as string);
            }
            if (await rowElements.autocomplete().element.isPresent()) {
                return rowElements.autocomplete().select(value as string);
            }
            if (await rowElements.coloredLookup().element.isPresent()) {
                return rowElements.coloredLookup().select(value as string);
            }
            if (await rowElements.multiselect().element.isPresent()) {
                return rowElements.multiselect().select(value as string);
            }
        }

        throw new Error(`You are trying to edit not editable ${columnIndex} column!`);
    }

    public async addMultiselectValueByColumnIndex(value: string, columnIndex: number) {
        const rowElements = await this.getRowElements(columnIndex);
        if (await this.isCellContainsEditableElement(columnIndex)) {
            if (await rowElements.multiselect().element.isPresent()) {
                return rowElements.multiselect().select(value);
            }
            throw new Error(`Column ${columnIndex} does not contain multiselect!`);
        }

        throw new Error(`You are trying to edit not editable ${columnIndex} column!`);
    }

    public async removeMultiselectValueByColumnIndex(value: string, columnIndex: number) {
        const rowElements = await this.getRowElements(columnIndex);
        if (await this.isCellContainsEditableElement(columnIndex)) {
            if (await rowElements.multiselect().element.isPresent()) {
                return rowElements.multiselect().remove(value);
            }
            throw new Error(`Column ${columnIndex} does not contain multiselect!`);
        }

        throw new Error(`You are trying to edit not editable ${columnIndex} column!`);
    }

    public async isCellContainsEditableElement(columnIndex: number) {
        const rowElements = await this.getRowElements(columnIndex);
        if (await rowElements.date().element.isPresent()) {
            return true;
        }
        if (await rowElements.inlineEditor().element.isPresent()) {
            return true;
        }
        if (await rowElements.checkbox().element.isPresent()) {
            return rowElements.checkbox().element.isEnabled();
        }
        if (await rowElements.lookup().element.isPresent()) {
            return rowElements.lookup().isEnabled();
        }
        if (await rowElements.autocomplete().element.isPresent()) {
            return rowElements.autocomplete().isEnabled();
        }
        if (await rowElements.coloredLookup().element.isPresent()) {
            return rowElements.coloredLookup().isEnabled();
        }
        if (await rowElements.input().element.isPresent()) {
            return rowElements.input().element.isEnabled();
        }
        if (await rowElements.inlineAttachment().element.isPresent()) {
            return rowElements.inlineAttachment().isEditable();
        }
        if (await rowElements.multiselect().element.isPresent()) {
            return rowElements.multiselect().isEditable();
        }
        return false;
    }

    public async getRowCellValue(columnIndex: number) {
        const rowElements = await this.getRowElements(columnIndex);
        if (await rowElements.input().element.isPresent()) {
            return rowElements.input().getValue();
        } else if (await rowElements.coloredLookup().element.isPresent()) {
            return rowElements.coloredLookup().getValue();
        } else if (await rowElements.lookup().element.isPresent()) {
            return rowElements.lookup().getValue();
        } else if (await rowElements.checkbox().element.isPresent()) {
            return rowElements.checkbox().isSelected();
        } else if (await rowElements.multiselect().element.isPresent()) {
            return rowElements.multiselect().getValue();
        } else if (await rowElements.autocomplete().element.isPresent()) {
            return rowElements.autocomplete().getValue();
        } else {
            return (await this.getCellFromRow(columnIndex)).getText();
        }
    }

    public async isRowEditable() {
        const columnsNumber = await this.getColumnsNumber();
        for (let i = 0; i < columnsNumber; i++) {
            const result = await this.isCellContainsEditableElement(i);
            if (result) {
                logger.info(`Row editable by column ${i}`);
                return true;
            }
        }

        return false;
    }

    private async getColumnsNumber(): Promise<number> {
        const cells = await this.getColumns();
        return cells.length;
    }

    private getColumns() {
        return this.element.all(by.tagName('td'));
    }

    private getActionButton(): ElementFinder {
        return this.element.element(by.css('.row-action-button'));
    }
}

export class CellElements {
    confirmPassword?: () => Input;
    password?: () => Input;
    input: () => Input;
    checkbox: () => Checkbox;
    coloredLookup: () => Lookup;
    autocomplete: () => Autocomplete;
    inlineEditor: () => InlineEditor;
    lookup: () => Lookup;
    inlineAttachment: () => InlineAttach;
    multiselect: () => Multiselect;
    dots: () => Dots;
    date: () => DatePicker;
    attachIcon: () => Icon;
}
