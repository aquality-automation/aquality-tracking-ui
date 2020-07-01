import { by, ElementFinder, Locator } from 'protractor';
import { BaseElement } from './base.element';

export class InlineAttach extends BaseElement {

    constructor(locatorOrElement: Locator | ElementFinder) {
        super(locatorOrElement);
    }

    private file = this.element.element(by.css('.file'));
    private add = this.element.element(by.css('.add_btn'));
    private show = this.element.element(by.css('.show_btn'));
    private download = this.element.element(by.css('.download_btn'));
    private change = this.element.element(by.css('.change_btn'));
    private remove = this.element.element(by.css('.remove_btn'));
    private viwer = this.element.element(by.css('.viwer'));
    private closeViewer = this.element.element(by.css('.close'));

    public isAddExists() {
        return this.add.isPresent();
    }

    public isShowExists() {
        return this.show.isPresent();
    }

    public isDownloadExists() {
        return this.download.isPresent();
    }

    public isChangeExists() {
        return this.change.isPresent();
    }

    public isRemoveExists() {
        return this.remove.isPresent();
    }

    public async isViewerExists() {
        return (await this.viwer.getAttribute('hidden')) === null;
    }

    public addFile(path: string) {
        return this.file.sendKeys(path);
    }

    public showImage() {
        return this.show.click();
    }

    public closeImage() {
        return this.closeViewer.click();
    }

    public removeAttach() {
        return this.remove.click();
    }

    public downloadAttach() {
        return this.download.click();
    }

    public async isAttacmentExist() {
        const isAddExists = await this.isAddExists();
        const isShowExists = await this.isShowExists();
        const isDownloadExists = await this.isDownloadExists();
        const isChangeExists = await this.isChangeExists();
        const isRemoveExists = await this.isRemoveExists();
        return !isAddExists && (isShowExists || isDownloadExists) && isChangeExists && isRemoveExists;
    }

    public async isEditable() {
        const isAddExists = await this.isAddExists();
        const isChangeExists = await this.isChangeExists();
        const isRemoveExists = await this.isRemoveExists();
        return isAddExists || isChangeExists || isRemoveExists;
    }
}
