import { ElementFinder, Locator, by } from 'protractor';
import { BaseElement } from './base.element';
import { Input } from './input.element';

export class DatePicker extends BaseElement {
    constructor(locatorOrElement: Locator | ElementFinder) {
        super(locatorOrElement);
    }
    monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    linkInput = new Input(this.element.element(by.css('.ngx-datepicker-input')));
    topBarTitle = this.element.element(by.css('.topbar-title'));
    prevMonth = this.element.element(by.id('prevMonth'));
    nextMonth = this.element.element(by.id('nextMonth'));
    yearButton = (year: number) => this.element
        .element(by.xpath(
            `.//*[contains(@class, 'main-calendar-years')]//*[contains(@class, 'year-unit') and normalize-space(text())='${year}']`))
    dayButton = (day: number) => this.element
        .element(by.xpath(
            `.//*[contains(@class, 'main-calendar-days')]//*[contains(@class, 'day-unit') and not(contains(@class, 'is-prev-month')) and normalize-space(text())='${day}']`))

    openCalendar() {
        return this.linkInput.click();
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

    isEditable(): Promise<boolean> {
        return this.linkInput.isPresent();
    }

    private async selectMonth(month: string): Promise<void> {
        for (let i = 0; i < this.monthNames.length; i++) {
            const currentMonth = await this.getCurrentMonth();
            if (currentMonth !== month) {
                if (this.monthNames.indexOf(currentMonth) < this.monthNames.indexOf(month)) {
                    await this.nextMonth.click();
                }
                if (this.monthNames.indexOf(currentMonth) > this.monthNames.indexOf(month)) {
                    await this.prevMonth.click();
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
            return this.yearButton(year).click();
        }
    }

    private async getCurrentMonth(): Promise<string> {
        const currentMonthYear = await this.topBarTitle.getText();
        return currentMonthYear.split(' ')[0];
    }

    private async getCurrentYear(): Promise<number> {
        const currentMonthYear = await this.topBarTitle.getText();
        return +currentMonthYear.split(' ')[1];
    }
}
