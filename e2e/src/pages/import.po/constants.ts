import { by, element } from 'protractor';
import { Autocomplete } from '../../elements/autocomplete.element';
import { Lookup } from '../../elements/lookup.element';
import { SmartTable } from '../../elements/smartTable.element';
import { Input } from '../../elements/input.element';
import { MatRadioButton } from '../../elements/mat-radio.element';

export const baseUrl = (id: number) => `/project/${id}/import`;

export const elements = {
    testSuiteNameLookup: new Autocomplete(by.id('suite')),
    selectImportTypeLookup: new Lookup(by.id('select-import-type')),
    fileUpload: element(by.id('file-upload')),
    importAll: element(by.id('import-all')),
    unitTestDescriptionSwitch: new MatRadioButton(by.id('testDescription')),
    lastTestRunSwitch: new MatRadioButton(by.id('addToLastTestRun')),
    importResultsTable: new SmartTable(by.id('datatable')),
    importResultOptionsForm: element(by.id('import-results-options')),
    featureTestNameSwitch: new MatRadioButton(by.id('featureName')),
    classNameSwitch: new MatRadioButton(by.id('testClassName')),
    testNameSwitch: new MatRadioButton(by.id('testName')),
    testDescriptionSwitch: new MatRadioButton(by.id('testDescription')),
    advancedSettingsButton: new Input(by.css('div[id="advanced-settings"] button')),
    buildName: new Input(by.id('build')),
    uploadedFile: (filename: string) => element(by.xpath(`//tbody[@id='filesToImport']//td[text()='${filename}']`))
};

export const testNameTypes = {
    featureTestName: 'featureTestName',
    className: 'className',
    testName: 'testName',
    testDescription: 'testDescription'
};

export const importResultColumns = {
    status: 'Status',
    testrunId: 'Test Run ID',
    started: 'Started',
    finished: 'Finished',
    logs: 'Logs'
};

export const names = {
    pageName: 'Import'
};

export const importTypes = {
    cucumber: 'Cucumber (json)',
    msTest: 'MSTest (trx)',
    nunitV3: 'NUnit_v3 (xml)'
};
