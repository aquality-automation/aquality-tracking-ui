import { by, element } from 'protractor';
import { Autocomplete } from '../../../elements/autocomplete.element';
import { Input } from '../../../elements/input.element';

export const baseUrl = (projectId: number) => `#/project/${projectId}/create/testrun`;

export const elements = {
    uniqueElement: element(by.id('create-test-run')),
    createButton: element(by.id('create-test-run-button')),
    buildNameField: new Input(by.id('build_name')),
    testSuiteCombobox: new Autocomplete(by.id('suite_selector')),
    milestoneCombobox: new Autocomplete(by.id('milestone_selector')),
};

export const names = {
    pageName: 'Create Test Run Page'
};
