import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import BlobUtils from '../../../shared/utils/blob.utils';
import { TestResultAttachment } from '../../../shared/models/test-result';
import { TestResultService } from '../../../services/test-result/test-result.service';
import { faFile } from '@fortawesome/free-solid-svg-icons';

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
  supportedPreviewTypes = ['text', 'image', 'message'];
  icon = faFile;

  constructor(private sanitizer: DomSanitizer, private testResultService: TestResultService) {
  }

  ngOnChanges() {
    if (this.isHidden === this.isFirstOpen) {
      this.showAttachment(this.testResultAttachments[0]);
      this.isFirstOpen = true;
    }
  }

  isSupportedPreviewFileType(): boolean {
    let isSupported = false;
    this.supportedPreviewTypes.forEach(type => {
      if (isSupported === true) {
        return true;
      }
      isSupported = this.isFileType(type);
    });

    return isSupported;
  }

  isSupportedPreviewFileSize(): boolean {
    return this.testResultAttachment.attachment.toString().length / 1024 / 1024 < 5;
  }

  getNotSupportedMessage(): string {
    let message = '';
    if (!this.isSupportedPreviewFileType()) {
      message = 'Preview is not available for this file type.';
    }
    if (!this.isSupportedPreviewFileSize()) {
      message = 'Preview is not available, the file size should be less than 5Mb.';
    } else { message = 'Preview is not available for the file.'; }
    return `${message} You can download the file.`;
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
    return this.isFileType('image');
  }

  isFileType(type: string): boolean {
    try {
      return this.testResultAttachment['mimeType'].toString().includes(type);
    } catch (error) {
      return false;
    }
  }

  private getBlob(): Blob {
    return BlobUtils.b64toBlob(this.testResultAttachment.attachment, this.testResultAttachment.mimeType);
  }
}
