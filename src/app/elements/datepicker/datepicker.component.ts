import { Component, Input, Output, EventEmitter, SimpleChanges, OnChanges, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-datepicker',
  templateUrl: './datepicker.component.html',
  styleUrls: ['./datepicker.component.scss']
})
export class DatepickerComponent implements OnChanges {
  @Input() label: string;
  @Input() model: Date|number;
  @Input() disabled: boolean;
  @Input() width: number;
  @Output() modelChange = new EventEmitter<Date>();
  @ViewChild('datepicker') datepicker: ElementRef;

  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.model && typeof changes.model.currentValue === 'number') {
      this.model = new Date(changes.model.currentValue);
    }
  }

  onModelChange() {
    this.modelChange.emit(this.model as Date);
  }
}
