import { Component, OnInit, Input, Output, EventEmitter, OnChanges, OnDestroy } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import BlobUtils from '../../../shared/utils/blob.utils';
import { TestResultAttachment } from 'src/app/shared/models/test-result';
import { TestResultService } from 'src/app/services/test-result/test-result.service';

@Component({
  selector: 'attachment-modal',
  templateUrl: './attachment-modal.component.html',
  styleUrls: ['./attachment-modal.component.scss']
})
export class AttachmentModalComponent implements OnInit {

  @Input() isHidden: boolean;
  @Input() title: string;
  @Input() testResultAttachments: TestResultAttachment[];
  @Output() attachModalClosed = new EventEmitter();
  src: any = null;
  testResultAttachment: TestResultAttachment = null;
  cachedTestResultAttachment: TestResultAttachment[] = [];

  constructor(private sanitizer: DomSanitizer, private testResultService: TestResultService) { }

  async ngOnInit() {
  }

  hideModal() {
    this.src = null;
    this.attachModalClosed.emit();
  }

  download() {
    BlobUtils.download(this.getBlob(), this.testResultAttachment.name);
  }

  async showAttachment(testResultAttachment: TestResultAttachment) {
    const attachment = this.cachedTestResultAttachment.find(result => result.id === testResultAttachment.id);
    if (attachment === undefined) {
      this.testResultAttachment = await this.testResultService.getAttachment(testResultAttachment);
      this.cachedTestResultAttachment.push(testResultAttachment);
    }

    this.src = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(this.getBlob()));
  }

  private getBlob(): Blob {
    return BlobUtils.b64toBlob(this.testResultAttachment.attachment, this.testResultAttachment.mimeType);
  }
}
