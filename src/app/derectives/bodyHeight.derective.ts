import {
  Directive, ElementRef, AfterViewChecked, Input, HostListener
} from '@angular/core';

@Directive({
  selector: '[calcheight]'
})
export class CalcHeightsDirective implements AfterViewChecked {

  innerHeight: any;
  constructor(private el: ElementRef) {
    this.innerHeight = (window.screen.height) + 'px';
  }

  ngAfterViewChecked() {
    this.calculateHeight(this.el.nativeElement);
  }

  @HostListener('window:resize')
  onResize() {
    this.calculateHeight(this.el.nativeElement);
  }

  calculateHeight(el: HTMLElement) {
    this.innerHeight = (window.screen.height) + 'px';
    let parent: HTMLElement = document.documentElement;
    const headerHeight =  parent.getElementsByTagName('nav')[0].getBoundingClientRect().height;
    parent = parent.getElementsByTagName('body')[0];
    parent.style.paddingTop = `${headerHeight - 50}px`;
    if (parent.offsetHeight > +innerHeight && parent.offsetHeight < +innerHeight + 4) {
      if (!parent.classList.contains('additionalHeight')) {
        parent.classList.add('additionalHeight"');
        parent.setAttribute('style', `height:${+parent.offsetHeight + 10}`);
      }
    } else if (parent.offsetHeight < +innerHeight + 7 && parent.offsetHeight > +innerHeight + 13) {
      parent.classList.remove('additionalHeight"');
      parent.setAttribute('style', ``);
    }
  }
}
