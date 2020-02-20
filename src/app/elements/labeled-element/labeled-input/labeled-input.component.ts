import { Component, OnInit, Input } from '@angular/core';
import { NG_VALUE_ACCESSOR, FormControl, Validators, ValidatorFn } from '@angular/forms';
import { LabeledBaseComponent } from '../labeled-base.component';
let identifier = 0;

@Component({
  selector: 'labeled-input',
  templateUrl: './labeled-input.component.html',
  styleUrls: ['./labeled-input.component.css'],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: LabeledInputComponent, multi: true }
  ],
})
export class LabeledInputComponent extends LabeledBaseComponent<string> implements OnInit {
  public identifier = `labeled-input-${identifier++}`;
  public rateControl = new FormControl();
  @Input() public type: string;
  @Input() public max: string;
  @Input() public min: string;

  constructor() {
    super();
  }

  ngOnInit() {
    const validators: ValidatorFn[] = []
    if (this.min) {
      validators.push(Validators.min(+this.min));
    }
    if (this.max) {
      validators.push(Validators.max(+this.max));
    }

    this.rateControl.setValidators(validators);
  }
}
