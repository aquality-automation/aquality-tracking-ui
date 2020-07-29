import {
  Directive, ElementRef, AfterViewChecked, Input, HostListener
} from '@angular/core';

@Directive({
  selector: '[clickableLinks]'
})
export class ClickableLinks implements AfterViewChecked {

  constructor(private el: ElementRef) {
  }

  ngAfterViewChecked() {
    this.addEvent(this.el.nativeElement);
  }

  addEvent(parent: HTMLElement) {
    const links = Array.from(parent.getElementsByTagName('a'));
    links.forEach((link: HTMLElement) => {
      if (!link.classList.contains('clickableLink')) {
        link.classList.add('clickableLink');
        link.addEventListener('click', (event) => {
          if (event.ctrlKey) {
            const win = window.open(link.getAttribute('href'), '_blank');
            win.focus();
          }
        });
        link.title = 'Ctrl+click to open';
      }
    });
  }
}
