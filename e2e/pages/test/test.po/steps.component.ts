import { browser, By, promise } from 'protractor';
import { BaseElement } from '../../../elements/base.element';
import { Autocomplete } from '../../../elements/autocomplete.element';
import { stepTypes } from '../../steps.po/constants';

export class Steps extends BaseElement {
    constructor() {
        super(By.tagName('steps-container'));
    }
    public stepTypes = stepTypes;
    private stepLocator = (step: string) => `.//li[text()[contains(.,"${step}")]]`;

    public setAddStepType(type: string) {
        return new Autocomplete(this.element.element(By.css('.type-selector'))).select(type);
    }

    public setAddStep(step: string) {
        return new Autocomplete(this.element.element(By.css('.step-selector'))).select(step);
    }

    public createAddStep(step: string) {
        return new Autocomplete(this.element.element(By.css('.step-selector'))).createAndSelect(step);
    }

    public acceptAddStep() {
        return this.element.element(By.id('add-step')).click();
    }

    public removeStep(step: string) {
        return this.element
            .element(By.xpath(`${this.stepLocator(step)}//*[contains(@class, "icon-remove")]`))
            .click();
    }

    public changeStepOrder(stepToMove: string, stepMoveTo: string) {
        const toMove = this.element.element(By.xpath(this.stepLocator(stepToMove)));
        const moveTo = this.element.element(By.xpath(this.stepLocator(stepMoveTo)));

        return browser.actions()
            .mouseDown(toMove)
            .mouseMove(moveTo)
            .mouseUp()
            .perform();
    }

    public saveChages() {
        return this.element.element(By.id('save-steps-changes')).click();
    }

    public discardChages() {
        return this.element.element(By.id('discard-steps-changes')).click();
    }

    public async isStepAdded(type: string, name: string): Promise<boolean> {
        const step = this.element.element(By.xpath(this.stepLocator(name)));
        if (await step.isPresent()) {
            const stepText = await step.getText();
            return stepText === `${type} ${name}`;
        }

        return false;
    }

    public isAddStepRowExist(): promise.Promise<boolean> {
        return this.element.element(By.css('.creator')).isPresent();
    }
}
