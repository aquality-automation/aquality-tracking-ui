import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import BlobUtils from '../../../shared/utils/blob.utils';
import { TestResultAttachment } from 'src/app/shared/models/test-result';
import { TransformationsService } from 'src/app/services/transformations.service';

@Component({
  selector: 'attachment-modal',
  templateUrl: './attachment-modal.component.html',
  styleUrls: ['./attachment-modal.component.scss']
})
export class AttachmentModalComponent implements OnInit {

  @Input() isHidden: boolean;
  @Input() testResultAttachment: TestResultAttachment;
  @Output() attachModalClosed = new EventEmitter();

  constructor(private transformationsService: TransformationsService, private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
  }

  hideModal() {
    this.isHidden = true;
    this.testResultAttachment = null;
    this.attachModalClosed.emit();
  }

  generateData() {
    return this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(this.getBlob()));
  }

  getTitle() {
    return this.transformationsService.getFileNameFromPath(this.testResultAttachment.path);
  }

  download() {
    BlobUtils.download(this.getBlob(), this.getTitle());
  }

  private getBlob(): Blob {
    return BlobUtils.b64toBlob(this.testResultAttachment.attachment, this.testResultAttachment.mimeType);
  }
}
