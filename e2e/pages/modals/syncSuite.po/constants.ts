import { by, element } from 'protractor';
import { Autocomplete } from '../../../elements/autocomplete.element';
import { SmartTable } from '../../../elements/smartTable.element';
import { Input } from '../../../elements/input.element';
import { Checkbox } from '../../../elements/checkbox.element';

export const names = {
    pageName: 'Sync suite'
};

export const elements = {
    uniqueElement: element(by.tagName('sync-suite-modal')),
    selectSuiteAutocomplete: new Autocomplete(by.id('sync-suite-selector')),
    syncBtn: element(by.id('Sync')),
    cancelBtn: element(by.id('Cancel')),
    findTestsBtn: element(by.id('find-tests-to-sync')),
    numberOfTestRunsInput: new Input(by.id('not-executed-for')),
    testsTable: new SmartTable(by.xpath('//table-filter[@id="sync-test-table"]//table[@id="datatable"]')),
    removeResultsCheckbox: new Checkbox(by.id('remove-not-executed'))
};

export const columns = {
    name: 'Name'
};
