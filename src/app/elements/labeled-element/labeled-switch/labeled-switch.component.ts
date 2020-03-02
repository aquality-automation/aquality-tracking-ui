import { Component, OnInit, Input} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { LabeledBaseComponent } from '../labeled-base.component';
let identifier = 0;

@Component({
  selector: 'labeled-switch',
  templateUrl: './labeled-switch.component.html',
  styleUrls: ['./labeled-switch.component.css'],
  providers: [
    {provide: NG_VALUE_ACCESSOR, useExisting: LabeledSwitchComponent, multi: true}
  ],
})
export class LabeledSwitchComponent extends LabeledBaseComponent<boolean> implements OnInit {
  public identifier = `labeled-switch-${identifier++}`;
  @Input() disabled = false;

  constructor() {
    super();
  }

  ngOnInit() {
  }
}
