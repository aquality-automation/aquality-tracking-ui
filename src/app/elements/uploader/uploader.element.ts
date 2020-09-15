import { Component, Input, EventEmitter, Output, OnInit } from '@angular/core';
import { FileUploader } from 'ng2-file-upload';
import { faTrash, faUpload, faPlus } from '@fortawesome/free-solid-svg-icons';
import { CookieService } from 'ngx-cookie-service';
import { BaseHttpService } from 'src/app/services/base-http/base-http.service';
import { GlobalDataService } from 'src/app/services/globaldata.service';

@Component({
  selector: 'file-uploader',
  templateUrl: './uploader.element.html',
  styleUrls: ['./uploader.element.scss']
})
export class UploaderComponent implements OnInit {
  @Input() URL: string;
  @Output() uploaded = new EventEmitter();
  public uploader: FileUploader;
  public hasBaseDropZoneOver = false;
  public hasAnotherDropZoneOver = false;
  icons = { faTrash, faUpload, faPlus };

  constructor(
    private cookieService: CookieService,
    private baseHttpService: BaseHttpService,
    private globaldata: GlobalDataService
  ) { }

  ngOnInit() {
    const URL = this.globaldata.getApiUrl() + `${this.URL}`;
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
      this.baseHttpService.handleSuccess(`'${item._file.name}' file was uploaded!`);
    };
    this.uploader.onWhenAddingFileFailed = (item, filter) => {
      if (filter.name === 'fileSize') {
        this.baseHttpService.handleSimpleError(`${item.name} is blocked!`,
          `Maximum upload size exceeded (${(item.size / 1024 / 1024).toFixed(2)} MB of 10 MB allowed`);
      }
      if (filter.name === 'mimeType') {
        this.baseHttpService.handleSimpleError(`${item.name} is blocked!`,
          `The '${item.type}' format of file is not allowed!`);
      }
    };
  }

  triggerFile(fileInput: HTMLElement) {
    fileInput.click();
  }
}
