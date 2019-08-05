import {
  Directive, ElementRef, AfterViewChecked,
  Input, HostListener
} from '@angular/core';

@Directive({
  selector: '[showHtml]'
})
export class SetHTMLDirective implements AfterViewChecked {

  @Input() showHtml: string;

  constructor(private el: ElementRef) {
  }

  ngAfterViewChecked() {
    this.SetHtml(this.el.nativeElement);
  }

  SetHtml(el: HTMLElement) {
      this.el.nativeElement.innerHTML = this.showHtml;
  }
}
