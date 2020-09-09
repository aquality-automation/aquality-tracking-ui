import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  providers: [
  ]
})
export class ModalComponent implements OnInit {
  @Input() isHidden: boolean;
  @Input() title: string;
  @Input() message: string;
  @Input() type = '';
  @Input() buttons: { name: String, execute: String | boolean, id: String }[];
  @Output() closed = new EventEmitter();
  @Output() execute = new EventEmitter();
  answer: Promise<String | boolean>;
  private _resolve: any;

  ngOnInit(): void {
    this.answer =  new Promise<String | boolean>(resolve => {
      this._resolve = resolve;
    });
    this.execute.emit(this.answer);
  }

  hideModal() {
    this.isHidden = true;
    this.closed.emit();
  }

  onClick(event: boolean) {
    this._resolve(event);
    this.hideModal();
  }
}

