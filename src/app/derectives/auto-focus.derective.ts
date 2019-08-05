import { Directive, ElementRef, Input, OnInit } from '@angular/core';

@Directive({
    selector: '[autofocus]'
})
export class AutofocusDirective implements OnInit {
    private _autofocus;
    constructor(private el: ElementRef) {
    }

    ngOnInit() {
      if (this._autofocus || typeof this._autofocus === 'undefined') {
        this.el.nativeElement.focus();
        this._autofocus = false;
      }
    }
}
