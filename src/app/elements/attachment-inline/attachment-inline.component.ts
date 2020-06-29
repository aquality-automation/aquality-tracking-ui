import { Component, Input, Output, EventEmitter, SimpleChanges, OnChanges } from '@angular/core';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { NotificationsService } from 'angular2-notifications';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';


@Component({
  selector: 'attachment-inline',
  templateUrl: './attachment-inline.component.html',
  styleUrls: ['./attachment-inline.component.scss']
})
export class AttachmentInlineComponent implements OnChanges {
  @Input() name: string;
  @Input() model: string | ArrayBuffer;
  @Input() editable: boolean;

  @Output() modelChange = new EventEmitter();

  fileToUpload: File = null;
  src: string | ArrayBuffer;
  showPreview = false;
  faTimes = faTimes;
  fileUrl: SafeResourceUrl;
  filename: string;

  constructor(
    private notificationsService: NotificationsService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if(this.model){
      this.prepareLink();
    }
  }

  handleFileInput(files: FileList) {
    this.fileToUpload = files.item(0);
    if (this.fileToUpload.size > 1500000) {
      this.notificationsService.error('File too big!', 'File size should be less than 1 mb!');
      this.fileToUpload = null;
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(this.fileToUpload);
    reader.onloadend = () => {
      this.model = reader.result;
      this.modelChange.emit(this.model);
    };
  }

  remove() {
    this.modelChange.emit('$blank');
    this.model = undefined;
  }

  toggleShow() {
    this.showPreview = !this.showPreview;
  }

  isModelExists() {
    return this.model && this.model !== '$blank';
  }

  isModelImage() {
    return this.model ? (<string>this.model).startsWith('data:image/') : false;
  }

  prepareLink() {
    let data: string = (<string>this.model);

    this.filename = `attachment${Date.now()}`;
    data = encodeURI(data);
    this.fileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(data);
  }
}
