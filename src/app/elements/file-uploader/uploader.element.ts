import { Component, Input, EventEmitter, Output, OnInit } from '@angular/core';
import { FileUploader } from 'ng2-file-upload';
import { CookieService } from 'angular2-cookie/core';
import { SimpleRequester } from '../../services/simple-requester';

@Component({
  selector: 'file-uploader',
  templateUrl: './uploader.element.html',
  styleUrls: ['./uploader.element.css'],
  providers: [
    CookieService,
    SimpleRequester
  ]
})
export class UploaderComponent implements OnInit {
  @Input() URL: string;
  @Output() uploaded = new EventEmitter();
  public uploader: FileUploader;
  public hasBaseDropZoneOver = false;
  public hasAnotherDropZoneOver = false;

  constructor(
    protected cookieService: CookieService,
    private simpleRequester: SimpleRequester
  ) { }

  ngOnInit() {
    const URL = this.simpleRequester.api + this.URL;
    const authToken = 'Basic ' + this.cookieService.get('iio78');
    this.uploader = new FileUploader({
      url: URL,
      authToken: authToken,
      removeAfterUpload: true,
      maxFileSize: 10485760,
      allowedMimeType: [
        'image/png',
        'image/jpg',
        'application/x-zip-compressed',
        'image/jpeg',
        'text/plain',
        'text/csv',
        'application/zip',
        'application/octet-stream',
        'application/pdf',
        'application/msword',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.template',
        'application/vnd.ms-excel.sheet.macroEnabled.12',
        'application/vnd.ms-excel.template.macroEnabled.12',
        'application/vnd.ms-excel.addin.macroEnabled.12',
        'application/vnd.ms-excel.sheet.binary.macroEnabled.12'
      ]

    });
    this.uploader.onBeforeUploadItem = (item) => {
      item.withCredentials = false;
    };
    this.uploader.onSuccessItem = (item) => {
      this.uploaded.emit(item);
      this.simpleRequester.handleSuccess(`'${item._file.name}' file was uploaded!`);
    };
    this.uploader.onWhenAddingFileFailed = (item, filter) => {
      if (filter.name === 'fileSize') {
        this.simpleRequester.handleSimpleError(`${item.name} is blocked!`,
          `Maximum upload size exceeded (${(item.size / 1024 / 1024).toFixed(2)} MB of 10 MB allowed`);
      }
      if (filter.name === 'mimeType') {
        this.simpleRequester.handleSimpleError(`${item.name} is blocked!`,
          `The '${filter.item.type}' format of file is not allowed!`);
      }
    };
  }

  triggerFile(fileInput: HTMLElement) {
    fileInput.click();
  }
}
