import { by, element } from 'protractor';
import { Autocomplete } from '../elements/autocomplete.element';
import { Lookup } from '../elements/lookup.element';
import { UiSwitch } from '../elements/ui-switch';
import { SmartTable } from '../elements/smartTable.element';

export const baseUrl = (id: number) => `/project/${id}/import`;

export const elements = {
    testSuiteNameLookup: new Autocomplete(by.id('suite')),
    selectImportTypeLookup: new Lookup(by.id('select-import-type')),
    fileUpload: element(by.id('file-upload')),
    importFileBtn: element(by.id('import-file')),
    unitTestDescriptionSwitch: new UiSwitch(by.id('testDescription')),
    importResultsTable: new SmartTable(by.id('datatable')),
    importResultOptionsForm: element(by.id('import-results-options'))
};

export const importResultColumns = {
    status: 'Status',
    testRunId: 'Test Run ID',
    started: 'Started',
    finished: 'Finished',
    logs: 'Logs'
};

export const names = {
    pageName: 'Import'
};
