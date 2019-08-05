import { by, element } from 'protractor';
import { Lookup } from '../elements/lookup.element';

export const baseUrl = function (projectId, testresultId) {
    return `/project/${projectId}/testresult/${testresultId}`;
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

export const elements = {
    uniqueElement: element(by.id('test-result-view')),
    resolutionSelector: new Lookup(by.id('testResolutionSelector')),
    saveButton: element(by.id('save-test-result')),
};
