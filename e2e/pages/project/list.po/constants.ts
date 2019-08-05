import { by, element } from 'protractor';
import { SmartTable } from '../../elements/smartTable.element';

export const baseUrl = '/project';

export const elements = {
  uniqueElement: element(by.id('datatable')),
  createButton: element(by.id('create-project-button')),
  projectsTable: new SmartTable(by.css('#datatable'))
};

export const names = {
  pageName: 'Product List Page'
};

export const columns = {
  name: 'Name'
};
