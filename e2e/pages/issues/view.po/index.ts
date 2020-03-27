import { elements, names } from './constants';
import { BasePage } from '../../base.po';
import { promise } from 'protractor';

class IssuesView extends BasePage {
    constructor() {
        super(elements.uniqueElement, names.pageName);
    }

    save(): promise.Promise<void> {
        return elements.save.click();
    }

    setResolution(name: string): Promise<void> {
        return elements.resolution.select(name);
    }
}

export const issueView = new IssuesView();
