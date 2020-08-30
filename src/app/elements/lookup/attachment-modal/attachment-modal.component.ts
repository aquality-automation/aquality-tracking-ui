import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import BlobUtils from '../../../shared/utils/blob.utils';
import { TestResultAttachment } from 'src/app/shared/models/test-result';
import { TestResultService } from 'src/app/services/test-result/test-result.service';

@Component({
  selector: 'attachment-modal',
  templateUrl: './attachment-modal.component.html',
  styleUrls: ['./attachment-modal.component.scss']
})

export class AttachmentModalComponent implements OnChanges {
  @Input() isHidden: boolean;
  @Input() title: string;
  @Input() testResultAttachments: TestResultAttachment[];
  @Output() attachModalClosed = new EventEmitter();
  isFirstOpen = false;
  src: any = null;
  subTitle: string = null;
  testResultAttachment: TestResultAttachment = null;
  cachedTestResultAttachment: TestResultAttachment[] = [];
  selectedTestResultAttachment: TestResultAttachment;

  constructor(private sanitizer: DomSanitizer, private testResultService: TestResultService) {
  }

  ngOnChanges() {
    if (this.isHidden === this.isFirstOpen) {
      this.showAttachment(this.testResultAttachments[0]);
      this.isFirstOpen = true;
    }
  }

  hideModal() {
    this.subTitle = null;
    this.src = null;
    this.isFirstOpen = false;
    this.attachModalClosed.emit();
  }

  download() {
    BlobUtils.download(this.getBlob(), this.testResultAttachment.name);
  }

  showInNewTab() {
    const win = window.open(URL.createObjectURL(this.getBlob()), '_blank');
    win.focus();
  }

  async showAttachment(testResultAttachment: TestResultAttachment) {
    let attachment = this.cachedTestResultAttachment.find(result => result.id === testResultAttachment.id);
    if (attachment === undefined) {
      attachment = await this.testResultService.getAttachment(testResultAttachment);
      this.cachedTestResultAttachment.push(attachment);
    }

    this.testResultAttachment = attachment;
    this.subTitle = attachment.name;
    this.selectedTestResultAttachment = testResultAttachment;
    this.src = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(this.getBlob()));
  }

  isImage(): boolean {
    try {
      return this.testResultAttachment['mimeType'].toString().includes('image');
    } catch (error) {
      return false;
    }
  }

  private getBlob(): Blob {
    return BlobUtils.b64toBlob(this.testResultAttachment.attachment, this.testResultAttachment.mimeType);
  }
}
