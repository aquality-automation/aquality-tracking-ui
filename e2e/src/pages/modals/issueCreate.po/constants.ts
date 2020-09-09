import { by, element } from 'protractor';
import { Autocomplete } from '../../../elements/autocomplete.element';
import { Input } from '../../../elements/input.element';
import { Lookup } from '../../../elements/lookup.element';
import { SmartTable } from '../../../elements/smartTable.element';
import { UiSwitch } from '../../../elements/ui-switch';
import { InlineEditor } from '../../../elements/inlineEditor.element';

const baseElement = element(by.tagName('issue-create-modal'));

export const elements = {
    uniqueElement: baseElement,
    title: new Input(baseElement.element(by.id('title'))),
    resolution: new Lookup(baseElement.element(by.id('issue-resolution'))),
    assignee: new Autocomplete(baseElement.element(by.id('issue-assignee'))),
    save: baseElement.element(by.css('issue-create-modal button.btn-success')),
    cancel: baseElement.element(by.css('div.modal-buttons-form > button.btn-secondary')),
    matchExample: baseElement.element(by.css('.regexp-tester > .text-base')),
    overlappedIssues: new SmartTable(baseElement.element(by.id('overlapped-issues-table'))),
    expressionError: baseElement.element(by.css('#issue-expression + div.invalid-feedback')),
    expression: new Input(baseElement.element(by.id('issue-expression'))),
    externalIssue: new InlineEditor(baseElement.element(by.id('issue-external-url'))),
    addToResults: new UiSwitch(baseElement.element(by.css('#update-results'))),
    description: new Input(baseElement.element(by.id('issue-description'))),
};

export const names = {
    pageName: 'Create Issue Modal'
};

export const overlappedIssuesColumns = {
    title: 'Title'
};
