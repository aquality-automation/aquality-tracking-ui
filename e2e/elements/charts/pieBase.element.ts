import { Locator, ElementFinder, browser } from 'protractor';
import { BaseElement } from '../base.element';
import { logger } from '../../utils/log.util';

export class PieChartBase extends BaseElement {
    private clickSectionScript = `
    (function clickChart(el, etype, eventActiveProperty) {
    if (el.fireEvent) {
        el.fireEvent('on' + etype);
    } else {
        var evObj = document.createEvent('Events');
        evObj.initEvent(etype, true, false);
        evObj['active'] = eventActiveProperty;
        el.dispatchEvent(evObj);
    }
    })(arguments[0], 'chartClick', [{_index: arguments[1]}])
    `;

    constructor(locator: Locator | ElementFinder) {
        super(locator);
    }

    protected async clickChartSection(section: PieChartSection): Promise<string> {
        await browser.executeScript(this.clickSectionScript, this.element, section.index);
        logger.info(`${section.name} section of Pie Chart was clicked.`);
        return section.name;
    }
}

export interface PieChartSections {
    [key: string]: PieChartSection;
}

export class PieChartSection {
    name: string;
    index: number;
    color?: string;
}
