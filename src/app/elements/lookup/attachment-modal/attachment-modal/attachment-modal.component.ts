import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import FileSaver from 'file-saver';
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
    this.attachModalClosed.emit();
  }

  generateData() {
    const blob = new Blob([atob(this.testResultAttachment.attachment.toString())], {type: this.testResultAttachment.mimeType});
    return this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(blob));
  }

  getTitle() {
    return this.transformationsService.getFileNameFromPath(this.testResultAttachment.path);
  }

  download() {
    const blob = new Blob([atob(this.testResultAttachment.attachment.toString())], {type: this.testResultAttachment.mimeType});
    FileSaver.saveAs(blob, this.getTitle());
  }
}
