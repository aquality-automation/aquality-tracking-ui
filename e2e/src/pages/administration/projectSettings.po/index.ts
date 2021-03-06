import { browser } from 'protractor';
import { elements, baseUrl, names } from './constants';
import { AdministrationBase } from '../base.po';
import { Project } from '../../../../../src/app/shared/models/project';

class ProjectSettingsAdministration extends AdministrationBase {
  constructor() {
    super(elements.uniqueElement, names.pageName);
  }

  navigateTo() {
    return browser.get(baseUrl);
  }

  selectProject(value: string) {
    return elements.projectSelector.select(value);
  }

  setSteps(state: boolean) {
    return elements.stepsSwitcher.setState(state);
  }

  clickSave() {
    return elements.saveFeatures.click();
  }

  setImportCompareResultsPattern(pattern: string) {
    return elements.importCompareResultsPattern.typeText(pattern);
  }

  async setStepsForProject(project: Project, settings: ProjectSettings) {
    await this.selectProject(project.name);
    await this.setSteps(settings.stepsState);

    await this.clickSave();
    if (await this.modal.isVisible()) {
      return this.modal.clickYes();
    }
  }

  getNumberOfResultsToTrackStability() {
    return elements.stabilityResultsCount.getValue();
  }

  setNumberOfResultsToTrackStability(value: number) {
    return elements.stabilityResultsCount.typeText(`${value}`);
  }
}

export class ProjectSettings {
  stepsState: boolean;
  stabilityResultsCount?: number;
}

export const projectSettingsAdministration = new ProjectSettingsAdministration();
