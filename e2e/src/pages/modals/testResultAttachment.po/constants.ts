import { by, element } from 'protractor';

export const names = {
    pageName: 'Test Result Attachment'
};

export const fileButton = (name: string) =>
    element(by.xpath(`//button[contains(@class,'btn-group-item') and contains(.,'${name}')]`));

export const elements = {
    uniqueElement: element(by.tagName('attachment-modal')),
    titleElement: element(by.xpath('//attachment-modal//h4[contains(@class,"modal-title")]')),
    subTitleElement: element(by.xpath('//attachment-modal//h4[contains(@class,"modal-sub-title")]')),
    downloadElement: element(by.xpath('//attachment-modal//button[contains(@class,"btn-success")]')),
    closeElement: element(by.xpath('//attachment-modal//button[contains(@class,"btn-secondary")]')),
    frameElement: element(by.xpath('//attachment-modal//iframe')),
    imageElement: element(by.xpath('//attachment-modal//img'))
};
