import { Component, OnInit, Input, Output, EventEmitter, OnChanges, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import BlobUtils from '../../../shared/utils/blob.utils';
import { TestResultAttachment } from 'src/app/shared/models/test-result';

@Component({
  selector: 'attachment-modal',
  templateUrl: './attachment-modal.component.html',
  styleUrls: ['./attachment-modal.component.scss']
})
export class AttachmentModalComponent implements OnInit {

  @Input() isHidden: boolean;
  @Input() testResultAttachment: TestResultAttachment;
  @Output() attachModalClosed = new EventEmitter();
  src: any;

  constructor(private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
  }

  generateSrc(): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(this.getBlob()));
  }

  hideModal() {
    this.attachModalClosed.emit();
  }

  download() {
    BlobUtils.download(this.getBlob(), this.testResultAttachment.name);
  }

  private getBlob(): Blob {
    return BlobUtils.b64toBlob(this.testResultAttachment.attachment, this.testResultAttachment.mimeType);
  }
}
