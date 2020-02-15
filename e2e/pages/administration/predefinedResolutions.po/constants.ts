import { by, element } from 'protractor';
import { Autocomplete } from '../../../elements/autocomplete.element';
import { SmartTable } from '../../../elements/smartTable.element';

export const baseUrl = '#/administration/project/predefined-resolutions';

export const elements = {
    uniqueElement: element(by.css('#predefined-resolution.active')),
    resolutionsTable: new SmartTable(by.id('predefined-resolutions-table')),
    projectSelector: new Autocomplete(by.id('project-selector'))
};

export const names = {
    pageName: 'Predefined Resolutions Page'
};

export const columns = {
    resolution: 'Resolution',
    comment: 'Comment',
    expression : 'Expression',
    assignee : 'Assignee'
};
