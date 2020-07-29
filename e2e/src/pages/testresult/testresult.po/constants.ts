import { by, element } from 'protractor';
import { Lookup } from '../../../elements/lookup.element';
import { SmartTable } from '../../../elements/smartTable.element';

export const baseUrl = function (projectId: number, testresultId: number) {
    return `project/${projectId}/testresult/${testresultId}`;
};

export const names = {
    pageName: 'Test Result Page',
    buildNameLabel: 'Test:',
    milestoneLabel: 'Test Run:',
    testSuiteLabel: 'Duration:',
    startTimeLabel: 'Debug Result:',
    result: 'Result:',
    resolution: 'Resolution:',
    assingee: 'Assignee:'
};

export const stepColumns = {
    type: 'Type',
    step: 'Step',
    failReason: 'Fail Reason',
    result: 'Result',
    comment: 'Comment',
    attachment: 'Attachment'
};

export const elements = {
    uniqueElement: element(by.id('test-result-view')),
    resolutionSelector: new Lookup(by.id('testResolutionSelector')),
    saveButton: element(by.id('save-test-result')),
    stepsTable: new SmartTable(by.id('steps-grid'))
};
