import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'simple-popup',
  templateUrl: './basePopup.component.html',
  providers: [
  ]
})
export class BasePopupComponent {
  @Input() isHidden: boolean;
  @Input() title: string;
  @Input() message: string;
  @Input() type = '';
  @Input() buttons: { name: String, execute: String | boolean }[];
  @Output() closed = new EventEmitter();
  @Output() execute = new EventEmitter();

  hideModal() {
    this.isHidden = true;
    this.closed.emit(this.isHidden);
  }

  onClick(event: boolean) {
    this.handleAnswer(event);
  }

  async handleAnswer(value: String | boolean) {
    this.hideModal();
    this.execute.emit(value);
  }
}

