import {
  Directive, ElementRef, AfterViewChecked,
  Input, Output, Renderer, EventEmitter
} from '@angular/core';

@Directive({
  selector: '[sorter], [defaultSorter]'
})
export class TableSorterDerective implements AfterViewChecked {
  @Input()
  sorter: {order: string, property: string};
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
      if (!element.classList.contains(this.sorter.property)) {
        const span = column.getElementsByTagName('span')[0];
        if (span) { span.remove(); }
      }
    });

    let icon: HTMLElement = element.getElementsByTagName('span')[0];
    if (!icon) { icon = this.renderer.createElement(element, 'span'); }
    icon.classList.remove('glyphicon-triangle-bottom');
    icon.classList.remove('glyphicon-triangle-top');
    icon.classList.remove('glyphicon');

    if (this.sorter.order === 'asc') {
      this.sorter = {order: 'desc', property: this.sorter.property};
      icon.classList.add('glyphicon');
      icon.classList.add('glyphicon-triangle-top');
    } else if (this.sorter.order === 'desc') {
      this.sorter = {order: 'asc', property: this.sorter.property};
      icon.classList.add('glyphicon');
      icon.classList.add('glyphicon-triangle-bottom');
    }
    this.sorted.emit(this.sorter);
  }
}
