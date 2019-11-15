import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { NG_VALUE_ACCESSOR, NgModel } from '@angular/forms';
import { ValueAccessorBase } from '../ValueAccessorBase';
let identifier = 0;

@Component({
  selector: 'labeled-switch',
  templateUrl: './labeled-switch.component.html',
  styleUrls: ['./labeled-switch.component.css'],
  providers: [
    {provide: NG_VALUE_ACCESSOR, useExisting: LabeledSwitchComponent, multi: true}
  ],
})
export class LabeledSwitchComponent extends ValueAccessorBase<boolean> implements OnInit {
  @Input() public label: string;
  @Input() public placeholder: string;
  @Input() public size = 'small';
  @ViewChild(NgModel) model: NgModel;
  public identifier = `labeled-switch-${identifier++}`;

  constructor() {
    super();
  }

  ngOnInit() {
  }
}
