import { browser, promise } from 'protractor';
import { elements, baseUrl, names, columns } from './constants';
import { AdministrationBase } from '../base.po';

class PredefinedResolutions extends AdministrationBase {
  constructor() {
    super(elements.uniqueElement, names.pageName);
  }

  public columns = columns;

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

  selectResolution(value: string) {
    return elements.resolutionsTable.fillCreation(value, columns.resolution);
  }

  fillComment(value: string) {
    return elements.resolutionsTable.fillCreation(value, columns.comment);
  }

  fillExpression(value: string) {
    return elements.resolutionsTable.fillCreation(value, columns.expression);
  }

  selectAssignee(value: string) {
    return elements.resolutionsTable.fillCreation(value, columns.assignee);
  }

  clickCreate() {
    return elements.resolutionsTable.clickCreateAction();
  }

  clickRemoveResolution(expression: string) {
    return elements.resolutionsTable.clickAction(expression, columns.expression);
  }

  isResolutionPresent(expression: string) {
    return elements.resolutionsTable.isRowExists(expression, columns.expression);
  }

  updateResolution(newValue: string, columnName: string, searchValue: string, searchColumn: string) {
    return elements.resolutionsTable.editRow(newValue, columnName, searchValue, searchColumn);
  }

  isResolutionEditable(expression: string): Promise<boolean> {
    return elements.resolutionsTable.isRowEditableByValue(expression, columns.expression);
  }

  isCreateEnabled(): promise.Promise<boolean> {
    return elements.resolutionsTable.isCreateActionEnabled();
  }
}

export const predefinedResolutions = new PredefinedResolutions();
