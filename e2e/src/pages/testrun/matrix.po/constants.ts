import { by, element } from 'protractor';
import { SmartTable } from '../../../elements/smartTable.element';
import { Autocomplete } from '../../../elements/autocomplete.element';
import { Lookup } from '../../../elements/lookup.element';
import { UiSwitch } from '../../../elements/ui-switch';

export const elements = {
    uniqueElement: element(by.id('matrix-page')),
    testrunsTable: new SmartTable(by.id('matrix-table')),
    suiteAutocomplete: new Autocomplete(by.id('matrix-suite')),
    resultsNumberLookup: new Lookup(by.id('matrix-results-number')),
    labelLookup: new Lookup(by.id('matrix-label')),
    showButton: element(by.id('matrix-show')),
    resolutionSwitch: new UiSwitch(by.id('matrix-resolution-toggler')),
};

export const names = {
    pageName: 'Test Run List Page'
};

export const columns = {
    build: 'Build'
};

