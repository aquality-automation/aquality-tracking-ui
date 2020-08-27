import { Component, Input, Output, EventEmitter } from '@angular/core';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import * as mime from 'mime-types';
import { BaseHttpService } from 'src/app/services/base-http/base-http.service';

@Component({
  selector: 'attachment-inline',
  templateUrl: './attachment-inline.component.html',
  styleUrls: ['./attachment-inline.component.scss']
})
export class AttachmentInlineComponent {
  @Input() name: string;
  @Input() model: string | ArrayBuffer;
  @Input() editable: boolean;

  @Output() modelChange = new EventEmitter();

  fileToUpload: File = null;
  src: string | ArrayBuffer;
  showPreview = false;
  faTimes = faTimes;

  constructor(
    private requester: BaseHttpService
  ) { }

  handleFileInput(files: FileList) {
    this.fileToUpload = files.item(0);
    if (this.fileToUpload.size > 1500000) {
      this.requester.handleSimpleError('File too big!', 'File size should be less than 1 mb!');
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

  download() {
    let data: string = (<string>this.model);
    let filename: string;
    let link: HTMLAnchorElement;

    filename = `attachment${Date.now()}.${mime.extension(/:(.*);/.exec(data)[1])}`;
    data = encodeURI(data);

    link = document.createElement('a');
    document.body.appendChild(link);
    link.setAttribute('type', 'hidden');
    link.setAttribute('href', data);
    link.setAttribute('download', filename);
    link.click();
  }
}
