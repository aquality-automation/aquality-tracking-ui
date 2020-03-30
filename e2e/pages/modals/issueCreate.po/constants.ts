import { by, element } from 'protractor';
import { Autocomplete } from '../../../elements/autocomplete.element';
import { Input } from '../../../elements/input.element';
import { Lookup } from '../../../elements/lookup.element';
import { SmartTable } from '../../../elements/smartTable.element';

export const elements = {
    uniqueElement: element(by.tagName('issue-create-modal')),
    title: new Input(by.id('title')),
    resolution: new Lookup(by.id('issue-resolution')),
    assignee: new Autocomplete(by.id('issue-assignee')),
    save: element(by.css('issue-create-modal  div.modal-buttons-form > button.btn-success')),
    cancel: element(by.css('issue-create-modal  div.modal-buttons-form > button.btn-secondary')),
    overlappedIssues: new SmartTable(by.id('overlapped-issues-table')),
    expressionError: element(by.css('#issue-expression + div.invalid-feedback')),
    expression: new Input(by.id('issue-expression')),
    externalIssue: new Input(by.id('issue-external-url')),
};

export const names = {
    pageName: 'Create Issue Modal'
};

export const overlappedIssuesColumns = {
    title: 'Title'
};
