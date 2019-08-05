import { by, element } from 'protractor';

export const baseUrl = '/create/testsuite';

export const elements = {
    uniqueElement: element(by.id('create-test-run')),
    createButton: element(by.id('create-test-run-button')),
    buildNameField: element(by.id('build_name')),
    testSuiteCombobox: element(by.id('testsuiteSelector')),
    testSuiteComboboxOption: function (text) {
        return element(by.xpath(`//select[@id='testsuiteSelector']//option[contains(text(), '${text}')]`));
    },
    milestoneCombobox: element(by.id('milestoneSelector')),
    milestoneComboboxOption: function (text) {
        return element(by.xpath(`//select[@id='milestoneSelector']//option[contains(text(), '${text}')]`));
    },
    startDateField: element(by.id('dateLabel'))
};

export const names = {
    pageName: 'Create Test Run Page'
};

export const regexps = {
  startDateRegexp: '(?<day>(\\d{2}))\\/(?<month>(\\d{2}))\\/(?<year>(\\d{4}))\\s(?<hours>(\\d{2})):(?<minutes>(\\d{2}))'
};
