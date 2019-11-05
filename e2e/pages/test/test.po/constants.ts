import { by, element } from 'protractor';

export const baseUrl = (projectId: number, testId: number) => `#/project/${projectId}/test/${testId}`;

export const elements = {
    uniqueElement: element(by.id('test-page')),
    suiteLink: (suiteName: string) => element(by.xpath(`//a[contains(@class, 'suite-links') and text()='${suiteName}']`)),
    copyScenario: element(by.id('copy-scenario'))
};

export const names = {
    pageName: 'Test Page'
};
