import {
  Directive, ElementRef, AfterViewChecked, Input, HostListener
} from '@angular/core';

@Directive({
  selector: '[maxLength]'
})
export class MaxLength implements AfterViewChecked {

  @Input()
  maxLength: string;

  constructor(private el: ElementRef) {
  }

  ngAfterViewChecked() {
    this.setMaxLength(this.el.nativeElement);
  }

  setMaxLength(parent: HTMLElement) {
    const inputs = Array.from(parent.getElementsByTagName('input'));
    inputs.forEach((input: HTMLElement) => {
      if (!input.classList.contains('maxLenght')) {
        input.classList.add('maxLenght');
        input.setAttribute('maxlength', this.maxLength);
      }
    });
  }
}
