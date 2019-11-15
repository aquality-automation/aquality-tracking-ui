import {
  Directive, ElementRef, AfterViewChecked,
  Input, Output, Renderer2, EventEmitter
} from '@angular/core';

@Directive({
  selector: '[customListener]'
})
export class CustomEventListener implements AfterViewChecked {
  @Input()
  customListener: string[];
  @Output()
  customEvent = new EventEmitter();

  constructor(private el: ElementRef, private renderer: Renderer2) {
  }

  ngAfterViewChecked() {
    const element: HTMLElement = this.el.nativeElement;
    if (this.customListener) {
      this.createListener(element);
    }
  }

  createListener(element: HTMLElement) {
    if (!element.classList.contains('custom-listener')) {
      this.customListener.forEach(listener => {
        if (listener === 'contextmenu') {
            element.oncontextmenu = () => false;
          }
        element.addEventListener(listener, () => this.emitChange(listener, element.innerText));
        });
      element.classList.add('custom-listener');
    }
  }

  emitChange(listener: string, value: string) {
    this.customEvent.emit({ listener: listener, value: value });
  }
}
