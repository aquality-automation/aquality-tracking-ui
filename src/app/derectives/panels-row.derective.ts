import {
  Directive, ElementRef, AfterViewChecked,
  Input, HostListener
} from '@angular/core';

@Directive({
  selector: '[panelsRow]'
})
export class PanelsRowDirective implements AfterViewChecked {
  panels;

  constructor(private el: ElementRef) {
  }

  ngAfterViewChecked() {
    this.matchHeight(this.el.nativeElement);
  }

  @HostListener('window:resize')
  onResize() {
    this.matchHeight(this.el.nativeElement);
  }

  matchHeight(parent: HTMLElement) {
    this.panels = Array.from(parent.getElementsByClassName('panel'));
    const maxHeight = this.getMaxHeight();
    this.panels.forEach((x: HTMLElement) => x.style.height = `${maxHeight}px`);
  }

  getMaxHeight() {
    const itemHeights = this.panels.map(x => x.getBoundingClientRect().height);
    const maxHeight = itemHeights.reduce((prev, curr) => {
      return curr > prev ? curr : prev;
    }, 0);
    return maxHeight;
  }
}

