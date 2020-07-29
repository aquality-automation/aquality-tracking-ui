import { Component, Input, ViewChild } from '@angular/core';
import { NG_VALUE_ACCESSOR, NgModel } from '@angular/forms';
import { ValueAccessorBase } from '../value-accessor-base';

@Component({
  template: '',
  providers: [
    {provide: NG_VALUE_ACCESSOR, useExisting: LabeledBaseComponent, multi: true}
  ],
})
export class LabeledBaseComponent<T> extends ValueAccessorBase<T> {
  @Input() public label: string;
  @Input() public placeholder: string;
  @Input() public size = 'small';
  @ViewChild(NgModel) model: NgModel;

  constructor() {
    super();
  }
}
