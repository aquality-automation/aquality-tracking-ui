import { by, element } from 'protractor';

export const baseUrl = '/create/test';

export const elements = {
    uniqueElement: element(by.id('test-page')),
    suiteLink: (suiteName: string) => element(by.xpath(`//a[contains(@class, 'suite-links') and text()='${suiteName}']`))
};

export const names = {
    pageName: 'Test Page'
};
