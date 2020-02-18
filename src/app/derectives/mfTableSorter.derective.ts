import {
  Directive, ElementRef, AfterViewChecked,
  Input, Output, Renderer, EventEmitter
} from '@angular/core';
import { TFSorting, TFOrder } from '../elements/table/tfColumn';

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
        const span = column.getElementsByTagName('span')[0];
        if (span) {
          span.remove();
        }
      }
    });

    let icon: HTMLElement = element.getElementsByTagName('span')[0];
    if (!icon) { icon = this.renderer.createElement(element, 'span'); }
    icon.classList.remove('glyphicon-triangle-bottom');
    icon.classList.remove('glyphicon-triangle-top');
    icon.classList.remove('glyphicon');

    switch (this.sorter.order) {
      case TFOrder.asc:
        this.sorter.order = TFOrder.desc;
        break;
      case TFOrder.desc:
        this.sorter.order = TFOrder.asc;
        break;
    }

    icon.classList.add('glyphicon');
    icon.classList.add('glyphicon-triangle-bottom');
    this.sorted.emit(this.sorter);
  }
}
