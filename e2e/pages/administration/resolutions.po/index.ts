import { browser } from 'protractor';
import { elements, baseUrl, names, columns, colors } from './constants';
import { AdministrationBase } from '../base.po';

export class ResolutionAdministration extends AdministrationBase {
  constructor() {
    super(elements.uniqueElement, names.pageName);
  }

  public columns = columns;
  public colors = colors;

  navigateTo() {
    return browser.get(baseUrl);
  }

  selectProject(value: string) {
    return elements.projectSelector.select(value);
  }

  openCreation() {
    return elements.resolutionsTable.openCreation();
  }

  getCreationError() {
    return elements.resolutionsTable.getCreationError();
  }

  fillName(value: string) {
    return elements.resolutionsTable.fillCreation(value, columns.name);
  }

  selectColor(value: string) {
    return elements.resolutionsTable.fillCreation(value, columns.color);
  }

  clickCreate() {
    return elements.resolutionsTable.clickCreateAction();
  }

  clickRemoveResolution(name: string) {
    return elements.resolutionsTable.clickAction(name, columns.name);
  }

  isResolutionPresent(name: string) {
    return elements.resolutionsTable.isRowExists(name, columns.name);
  }

  async getResolutionColor(name: string) {
    const values = await elements.resolutionsTable.getRowValues(name, columns.name);
    return values[columns.color];
  }

  updateResolution(newValue: string, columnName: string, searchValue: string, searchColumn: string) {
    return elements.resolutionsTable.editRow(newValue, columnName, searchValue, searchColumn);
  }

  isResolutionEditable(name: string): Promise<boolean> {
    return elements.resolutionsTable.isRowEditable(name, columns.name);
  }
}
