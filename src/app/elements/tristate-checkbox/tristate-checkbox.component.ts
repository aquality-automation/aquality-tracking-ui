import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { faCheckSquare, faSquare, faMinusSquare, IconDefinition } from '@fortawesome/free-regular-svg-icons';

@Component({
  selector: 'tristate-checkbox',
  templateUrl: './tristate-checkbox.component.html',
  styleUrls: ['./tristate-checkbox.component.css']
})
export class TristateCheckboxComponent implements OnInit {
  public icon: IconDefinition;
  @Input() model: number;
  @Output() modelChange: EventEmitter<number> = new EventEmitter();

  ngOnInit() {
    this.setIcon();
  }

  toggleState() {
    if (this.model === 1) {
      this.model = 2;
    } else if (this.model === 2) {
      this.model = 3;
    } else if (this.model === 3) {
      this.model = 1;
    }
    this.setIcon();
    this.modelChange.emit(this.model);
  }

  setIcon() {
    if (this.model === 1) {
      this.icon = faCheckSquare;
    } else if (this.model === 2) {
      this.icon = faSquare;
    } else if (this.model === 3) {
      this.icon = faMinusSquare;
    }
  }
}
