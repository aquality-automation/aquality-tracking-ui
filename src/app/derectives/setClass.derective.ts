import {
  Directive, ElementRef, AfterViewChecked,
  Input, HostListener
} from '@angular/core';

@Directive({
  selector: '[setClass]'
})
export class SetClassDirective implements AfterViewChecked {

  @Input() setClass: string;

  constructor(private el: ElementRef) {
  }

  ngAfterViewChecked() {
    this.SetClasses(this.el.nativeElement);
  }

  SetClasses(el: HTMLElement) {
    if (this.setClass) {
      const classes = this.setClass.toString().split(' ');
      if (classes) {
        classes.forEach(newClass => {
          el.classList.remove(newClass);
          el.classList.add(newClass);
        });
      }
    }
  }
}
