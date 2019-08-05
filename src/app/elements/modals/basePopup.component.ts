import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'simple-popup',
  templateUrl: './basePopup.component.html',
  providers: [
  ]
})
export class BasePopupComponent implements OnInit {
  @Input() isHidden: boolean;
  @Input() title: string;
  @Input() message: string;
  @Input() type = '';
  @Input() buttons: any[];
  @Output() closed = new EventEmitter();
  @Output() execute = new EventEmitter();

  private okOperation = new Subject();
  public answer: Promise<boolean>;

  ngOnInit() {
    this.answer = new Promise((resolve) => {
      this.okOperation.subscribe((success: boolean) => {
        this.hideModal();
        resolve(success);
      });
    });
    this.execute.emit(this.answer);
  }

  hideModal() {
    this.isHidden = true;
    this.closed.emit(this.isHidden);
  }

  onClick(event: boolean) {
    this.okOperation.next(event);
  }
}

