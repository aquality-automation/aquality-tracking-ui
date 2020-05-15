import { Component, OnInit, Input, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { NG_VALUE_ACCESSOR, NgModel, FormControl, Validators, FormGroup } from '@angular/forms';
import { ValueAccessorBase } from '../ValueAccessorBase';
import { faMarker, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { InlineEditorConfig, InlineEditorType, InlineEditorSize } from './inline-editor.config';
let identifier = 0;

@Component({
  selector: 'inline-editor',
  templateUrl: './inline-editor.component.html',
  styleUrls: ['./inline-editor.component.css'],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: InlineEditorComponent, multi: true }
  ],
})
export class InlineEditorComponent extends ValueAccessorBase<string> implements OnInit {
  public identifier = `labeled-input-${identifier++}`;
  @Input() placeholder: string;
  @Input() config: InlineEditorConfig = { type: InlineEditorType.text, size: InlineEditorSize.sm, saveOnEnter: true };
  @Input() saveOnEnter: InlineEditorConfig;
  @Input() maxlength: number;
  @Input() minlength: number;
  @Input() disabled: boolean;
  @Input() required: boolean;
  @Output() onSave = new EventEmitter();
  @ViewChild(NgModel) model: NgModel;
  @ViewChild('valueViewer') valueViewer: ElementRef;
  @ViewChild('name') input: NgModel;
  icons = { faMarker, faCheck, faTimes };
  editMode = false;
  editValue: any;
  inputForm: FormGroup;

  constructor(private element: ElementRef) {
    super();
  }

  ngOnInit() {
    const validators = [];
    if(this.maxlength) { validators.push(Validators.maxLength(this.maxlength)) };
    if(this.minlength) { validators.push(Validators.minLength(this.minlength)) };
    if(this.required) { validators.push(Validators.required) };
    if(this.config.type === InlineEditorType.number) {validators.push(Validators.pattern(/^\d*$/))}
    this.inputForm = new FormGroup({
      inputControl: new FormControl('', validators)
    })
  }

  toggleEditMode() {
    this.editMode = !this.editMode;
    this.editValue = this.editMode ? this.value : undefined;
    if (this.editMode) {
      setTimeout(() => {
        const element = this.element.nativeElement as HTMLElement;
        const editor = element.getElementsByClassName('ie-editor').item(0) as HTMLElement;
        editor.focus();
      }, 0)

    }
  }

  save() {
    this.value = this.editValue;
    this.toggleEditMode();
    this.onSave.emit(this.value);
  }

  onEnter() {
    if (this.config.saveOnEnter) {
      this.save();
    }
  }

  onBlur() {
    if (this.config.saveOnBlur && !this.input.errors) {
      console.log(this.input)
      this.save();
    }
  }

  cancel() {
    this.toggleEditMode()
  }
}
