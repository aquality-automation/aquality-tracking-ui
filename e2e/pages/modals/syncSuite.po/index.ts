import { BasePage } from '../../base.po';
import { elements, names, columns } from './constants';
import { moveTest } from '../../modals/moveTest.po';
import { waiter } from '../../../utils/wait.util';

class SyncSuiteModalView extends BasePage {
  constructor() {
    super(elements.uniqueElement, names.pageName);
  }

  moveTestmodal = moveTest;

  async getSelectedSuite(): Promise<string> {
    return elements.selectSuiteAutocomplete.getValue();
  }

  async selectSuite(suite: string): Promise<void> {
    return elements.selectSuiteAutocomplete.select(suite);
  }

  async isSyncButtonEnabled(): Promise<boolean> {
    return elements.syncBtn.isEnabled();
  }

  async sync(): Promise<void> {
    return elements.syncBtn.click();
  }

  async isFindTestsButtonEnabled(): Promise<boolean> {
    return elements.findTestsBtn.isEnabled();
  }

  async isRemoveResultsSelected(): Promise<boolean> {
    return elements.removeResultsCheckbox.isSelected();
  }

  async setRemoveResultsState(state: boolean): Promise<void> {
    return elements.removeResultsCheckbox.setState(state);
  }

  async setNumberOfTestRuns(numberOfTestRuns: string): Promise<void> {
    return elements.numberOfTestRunsInput.typeText(numberOfTestRuns);
  }

  async getNumberOfTestRuns(): Promise<string> {
    return elements.numberOfTestRunsInput.element.getAttribute('ng-reflect-model');
  }

  async findTests(): Promise<void> {
    return elements.findTestsBtn.click();
  }

  async selectTest(testName: string): Promise<void> {
    return elements.testsTable.selectRow(testName, columns.name);
  }

  async cancel(): Promise<void> {
    return elements.cancelBtn.click();
  }

  async getTestsForSync(): Promise<string[]> {
    await this.waitForTests();
    return elements.testsTable.getColumValues(columns.name);
  }

  async waitForTests(): Promise<boolean> {
    const isTableEmpty = () => {
      return elements.testsTable.hasNoData();
    };
    return waiter.forFalse(isTableEmpty, 5, 500);
  }
}

export const syncSuite = new SyncSuiteModalView();
