import { BasePage } from '../../base.po';
import { elements, names } from './constants';

class MoveTest extends BasePage {
    constructor() {
        super(elements.uniqueElement, names.pageName);
    }

    selectTestFrom(name: string) {
        return elements.fromLookup.select(name);
    }

    selectTestTo(name: string) {
        return elements.toLookup.select(name);
    }

    clickMove() {
        return elements.moveBtn.click();
    }
}

export const moveTest = new MoveTest();