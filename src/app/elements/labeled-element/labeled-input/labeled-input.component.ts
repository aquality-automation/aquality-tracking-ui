import { Component, OnInit} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { LabeledBaseComponent } from '../labeled-base.component';
let identifier = 0;

@Component({
  selector: 'labeled-input',
  templateUrl: './labeled-input.component.html',
  styleUrls: ['./labeled-input.component.css'],
  providers: [
    {provide: NG_VALUE_ACCESSOR, useExisting: LabeledInputComponent, multi: true}
  ],
})
export class LabeledInputComponent extends LabeledBaseComponent<string> implements OnInit {
  public identifier = `labeled-input-${identifier++}`;

  constructor() {
    super();
  }

  ngOnInit() {
  }
}
