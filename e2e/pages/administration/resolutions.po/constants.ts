import { by, element } from 'protractor';
import { Autocomplete } from '../../elements/autocomplete.element';
import { SmartTable } from '../../elements/smartTable.element';

export const baseUrl = '/administration/global/users';

export const elements = {
    uniqueElement: element(by.css('#resolutions-administration.active')),
    resolutionsTable: new SmartTable(by.id('ft-resolutions')),
    projectSelector: new Autocomplete(by.id('project-selector'))
};

export const names = {
    pageName: 'Resolutions Page'
};

export const columns = {
    name: 'Name',
    color: 'Color'
};

export const colors = {
    warning: 'Warning',
    primary: 'Primary'
};


