import { BasePage } from '../../base.po';
import { elements, names } from './constants';
import { promise } from 'protractor';

class IssueCreateModal extends BasePage {
    constructor() {
        super(elements.uniqueElement, names.pageName);
    }

    isResolutionPresent(name: string): Promise<boolean> {
        return elements.resolution.isOptionPresent(name);
    }

    save(): promise.Promise<void> {
        return elements.save.click();
    }

    cancel(): promise.Promise<void> {
        return elements.cancel.click();
    }

    setTitle(title: string): Promise<void> {
        return elements.title.typeText(title);
    }

    setResolution(name: string): Promise<void> {
        return elements.resolution.select(name);
    }
}

export const issueCreateModal = new IssueCreateModal();
