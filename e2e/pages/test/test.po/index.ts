import { elements, names, baseUrl } from './constants';
import { BasePage } from '../../base.po';
import { browser } from 'protractor';
import { Steps } from './steps.component';

class TestView extends BasePage {
    constructor() {
        super(elements.uniqueElement, names.pageName);
    }

    steps = new Steps();

    navigateTo(projectId: number, testId: number) {
        return browser.get(baseUrl(projectId, testId));
    }

    isSuiteLinkExists(suitename: string) {
        return elements.suiteLink(suitename).isPresent();
    }

    clickSuiteLink(suitename: string) {
        return elements.suiteLink(suitename).click();
    }

    copyScenario() {
        return elements.copyScenario.click();
    }
}

export const testView = new TestView();