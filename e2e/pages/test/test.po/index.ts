import { elements, names } from './constants';
import { BasePage } from '../../base.po';

export class TestView extends BasePage {
    constructor() {
        super(elements.uniqueElement, names.pageName);
    }

    isSuiteLinkExists(suitename: string) {
        return elements.suiteLink(suitename).isPresent();
    }

    clickSuiteLink(suitename: string) {
        return elements.suiteLink(suitename).click();
    }
}
