import { by, element } from 'protractor';
import { Autocomplete } from '../../elements/autocomplete.element';

export const baseUrl = (id, item) => `#/project/${id}/testsuite/${item}`;

export const names = {
    pageName: 'Test Suite'
};

export const elements = {
    uniqueElement: element(by.id('suite-view')),
    selectedSuiteLookup: new Autocomplete(by.id('page-label-lookup')),
    nameOfTestSuite: element(by.id('name')),
    totalManualDurationLabel: element(by.id('totalManualDuration')),
    totalTestsLabel: element(by.id('testsNumber')),
    automationDurationLabel: element(by.id('latestAutomationDuration')),
    moveTestBtn: element(by.id('move-test-btn'))
};
