import { ElementFinder, Locator, by, browser, protractor, element } from 'protractor';
import { BaseElement } from './base.element';
import { Input } from './input.element';
const EC = protractor.ExpectedConditions;

export class DatePicker extends BaseElement {
    constructor(locatorOrElement: Locator | ElementFinder) {
        super(locatorOrElement);
    }
    monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
        'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
    ];

    formField = this.element.element(by.tagName('mat-form-field'));
    linkInput = new Input(this.element.element(by.css('.mat-datepicker-toggle')));
    topBarTitle = element(by.css('mat-datepicker-content .mat-calendar-period-button span'));
    prevButton = element(by.css('mat-datepicker-content .mat-calendar-previous-button'));
    nextButton = element(by.css('mat-datepicker-content .mat-calendar-next-button'));
    yearButton = (year: number) =>
        element(by.xpath(
            `//mat-datepicker-content//*[contains(@class, 'mat-calendar-table')]//*[contains(@class, 'mat-calendar-body-cell-content') and normalize-space(text())='${year}']`))
    dayButton = (day: number) =>
        element(by.xpath(
            `//mat-datepicker-content//*[contains(@class, 'mat-calendar-table')]//*[contains(@class, 'mat-calendar-body-cell-content') and normalize-space(text())='${day}']`))

    async openCalendar() {
        await this.linkInput.click();
        return browser.wait(EC.visibilityOf(this.topBarTitle), 5000, `Date picker was not opened`);
    }

    async select(date: Date) {
        const selectDate = new Date(date);
        const month = this.monthNames[selectDate.getMonth()];
        const year = selectDate.getFullYear();
        const day = selectDate.getDate();

        await this.openCalendar();
        await this.selectYear(year);
        await this.selectMonth(month);
        return this.dayButton(day).click();
    }

    async isEditable(): Promise<boolean> {
        return !(await this.formField.getAttribute('class')).includes('mat-form-field-disabled');
    }

    private async selectMonth(month: string): Promise<void> {
        for (let i = 0; i < this.monthNames.length; i++) {
            const currentMonth = await this.getCurrentMonth();
            if (currentMonth !== month) {
                if (this.monthNames.indexOf(currentMonth) < this.monthNames.indexOf(month)) {
                    await this.nextButton.click();
                }
                if (this.monthNames.indexOf(currentMonth) > this.monthNames.indexOf(month)) {
                    await this.prevButton.click();
                }
            } else {
                return;
            }
        }
    }

    private async selectYear(year: number): Promise<void> {
        const currentYear = await this.getCurrentYear();
        if (currentYear !== year) {
            await this.topBarTitle.click();
            await (await this.getYearButton(year)).click();
            return this.topBarTitle.click();
        }
    }

    private async getCurrentMonth(): Promise<string> {
        const currentMonthYear = await this.topBarTitle.getText();
        return currentMonthYear.split(' ')[0];
    }

    private async getYearButton(year: number): Promise<ElementFinder> {
        let button: ElementFinder;
        let shownYears: (string | number)[];
        do {
            shownYears = (await this.topBarTitle.getText()).split(' – ');
            if (year < +shownYears[0]) {
                this.prevButton.click();
            } else if (year > +shownYears[1]) {
                this.nextButton.click();
            } else {
                return button;
            }

            button = this.yearButton(year);
        } while (year < +shownYears[0] || year > +shownYears[1]);
    }

    private async getCurrentYear(): Promise<number> {
        const currentMonthYear = await this.topBarTitle.getText();
        return +currentMonthYear.split(' ')[1];
    }
}
