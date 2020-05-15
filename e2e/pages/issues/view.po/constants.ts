import { by, element } from 'protractor';
import { Lookup } from '../../../elements/lookup.element';
import { Input } from '../../../elements/input.element';
import { Autocomplete } from '../../../elements/autocomplete.element';
import { SmartTable } from '../../../elements/smartTable.element';
import { InlineEditor } from '../../../elements/inlineEditor.element';

export const elements = {
    uniqueElement: element(by.id('issue-view')),
    resolution: new Lookup(by.id('issue-resolution')),
    save: element(by.id('save')),
    title: new Input(by.id('issue-title')),
    assignee: new Autocomplete(by.id('issue-assignee')),
    extarnalIssue: new InlineEditor(by.id('issue-external-url')),
    description: new Input(by.id('issue-description')),
    expressionError: element(by.css('#issue-expression + .invalid-feedback')),
    overlappedIssues: new SmartTable(by.id('overlapped-issues-table')),
    flowButtons: element(by.id('flow-buttons')).all(by.tagName('button')),
    regexpTestText: new Input(by.id('regexpTestText')),
    expression: new Input(by.id('issue-expression')),
    regexpTesterResult: element(by.css('regexp-tester .regex-viewer')),
    saveAndAssign: element(by.id('save-and-assign')),
    affectedTests: new SmartTable(by.id('affected-tests')),
    statusBadge: element(by.id('status-badge')),
    startProgress: element(by.id('start-progress')),
    cannotReproduce: element(by.id('cannot-reproduce')),
    reopen: element(by.id('reopen')),
    close: element(by.id('close')),
    done: element(by.id('done')),
};

export const names = {
    pageName: 'Issue View Page'
};

export const overlappedIsssueColumns = {
    title: 'Title'
};

export const affectedTestsColumns = {
    name: 'Affected Test Name'
};

