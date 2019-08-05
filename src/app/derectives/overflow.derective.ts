import {
  Directive, ElementRef, AfterViewChecked,
  Input, HostListener
} from '@angular/core';

@Directive({
  selector: '[overflowParent]'
})
export class OverflowDirective implements AfterViewChecked {
  table;

  constructor(private el: ElementRef) {
  }

  ngAfterViewChecked() {
    this.matchSize(this.el.nativeElement);
  }

  @HostListener('window:resize')
  onResize() {
    this.matchSize(this.el.nativeElement);
  }

  matchSize(parent: HTMLElement) {
    this.table = Array.from(parent.getElementsByClassName('table'))[0];
    const tableWidht = this.table.getBoundingClientRect().width ;
    const parentWidht = parent.getBoundingClientRect().width ;
    if (tableWidht > parentWidht) {
      if (!parent.classList.contains('tf-overflow')) { parent.classList.add('tf-overflow'); }
    } else {
      parent.classList.remove('tf-overflow');
    }
  }
}

