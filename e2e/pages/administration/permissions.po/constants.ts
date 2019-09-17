import { by, element } from 'protractor';
import { SmartTable } from '../../../elements/smartTable.element';
import { Autocomplete } from '../../../elements/autocomplete.element';

export const baseUrl = '#/administration/project/permissions';

export const elements = {
    uniqueElement: element(by.css('#permissions-administration.active')),
    projectSelector: new Autocomplete(by.id('project-selector')),
    permissionsTable: new SmartTable(by.id('permissions-table'))
};

export const names = {
    pageName: 'Permissions Page'
};

export const columns = {
    username: 'Username',
    admin: 'Admin',
    manager: 'Manager',
    engineer: 'Engineer'
};


