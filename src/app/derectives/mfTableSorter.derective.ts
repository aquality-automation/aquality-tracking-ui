import {
  Directive, ElementRef, AfterViewChecked,
  Input, Output, Renderer, EventEmitter
} from '@angular/core';
import { TFSorting, TFOrder } from '../elements/table/tfColumn';
import { faArrowUp, faArrowDown} from '@fortawesome/free-solid-svg-icons';

@Directive({
  selector: '[sorter]'
})
export class TableSorterDerective implements AfterViewChecked {
  @Input()
  sorter: TFSorting;
  @Output()
  sorted = new EventEmitter();

  constructor(private el: ElementRef, private renderer: Renderer) {
  }

  ngAfterViewChecked() {
    const element: HTMLElement = this.el.nativeElement;
    if (this.sorter) {
      this.addSorter(element);
    }
  }

  addSorter(column: HTMLElement) {
    if (!column.classList.contains('custom_sorter')) {
      column.addEventListener('click', () => this.sendSort(column), false);
      column.classList.add('custom_sorter');
    }
  }

  sendSort(element: HTMLElement) {
    const columns: HTMLElement[] = Array.prototype.slice.call(element.parentElement.getElementsByTagName('th'), 0);
    columns.forEach(column => {
      if (!column.classList.contains(this.sorter.property)) {
        this.hide(column);
      }
    });

    const up: Element = element.getElementsByClassName('up')[0];
    const down: Element = element.getElementsByClassName('down')[0];
    this.hide(element);

    switch (this.sorter.order) {
      case TFOrder.asc:
        this.sorter.order = TFOrder.desc;
        this.show(down);
        break;
      case TFOrder.desc:
        this.show(up);
        this.sorter.order = TFOrder.asc;
        break;
    }

    this.sorted.emit(this.sorter);
  }

  show(element: Element) {
    element.setAttribute('style', 'display: inline-table');
  }

  hide(column: HTMLElement) {
    const up: Element = column.getElementsByClassName('up')[0];
    const down: Element = column.getElementsByClassName('down')[0];
    up.setAttribute('style', 'display: none');
    down.setAttribute('style', 'display: none');
  }
}
