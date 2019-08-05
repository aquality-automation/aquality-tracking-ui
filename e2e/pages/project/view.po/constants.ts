import { by, element } from 'protractor';

export const baseUrl = function (projectId) {
    return `/project/${projectId}`;
};

export const elements = {
    uniqueElement: element(by.id('project-view')),
    projectTitleLabel: element(by.id('project-title')),
    emptyProjectMessage: element(by.id('empty'))
};

export const names = {
    pageName: 'Product View Page'
};
