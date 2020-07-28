import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FormGroup, FormControl, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';

@Component({
  selector: 'number-range',
  templateUrl: './number-range.component.html',
  styleUrls: ['./number-range.component.scss']
})
export class NumberRangeComponent implements OnInit {
  @Input() small = false;
  @Input() from: number;
  @Input() to: number;
  @Input() max: number;

  @Output() fromChange = new EventEmitter<number>();
  @Output() toChange = new EventEmitter<number>();
  @Output() cleared = new EventEmitter();

  rangeForm: FormGroup;

  icons = {
    faTimes
  };

  ngOnInit() {
    this.rangeForm = new FormGroup({
      fromInput: new FormControl('', [this.fromValidator()]),
      toInput: new FormControl('', [this.toValidator()])
    });
  }

  fromChanged(value: number) {
    this.from = value;
    if (this.rangeForm.controls.fromInput.valid) {
      this.rangeForm.controls.toInput.updateValueAndValidity();
      this.fromChange.emit(value);
    }
  }

  toChanged(value: number) {
    this.to = value;
    if (this.rangeForm.controls.toInput.valid) {
      this.rangeForm.controls.fromInput.updateValueAndValidity();
      this.toChange.emit(value);
    }
  }

  toValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const isInvalid = this.from && control.value ? control.value < this.from : false;
      return isInvalid ? { 'invalidRange': true } : null;
    };
  }

  fromValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const isInvalid = this.to && control.value ? control.value > this.to : false;
      return isInvalid ? { 'invalidRange': true } : null;
    };
  }

  clear() {
    this.rangeForm.controls.fromInput.setValue(undefined);
    this.rangeForm.controls.toInput.setValue(undefined);
    this.cleared.emit();
  }
}
