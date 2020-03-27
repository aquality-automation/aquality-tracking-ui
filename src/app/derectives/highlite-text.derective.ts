import {
    Directive, ElementRef, AfterViewChecked, Input, HostListener
} from '@angular/core';

@Directive({
    selector: '[highliteText]'
})
export class HighliteTextDirective implements AfterViewChecked {

    @Input() highliteText: string;
    @Input() exampleText: string;
    oldExpression: string;
    oldExampleText: string;

    constructor(private el: ElementRef) {
    }

    ngAfterViewChecked() {
        if (this.highliteText && (this.highliteText !== this.oldExpression || this.exampleText !== this.oldExampleText)) {
            this.highlite(this.el.nativeElement);
            this.oldExpression = this.highliteText.slice();
            this.oldExampleText = this.exampleText.slice();
        } else if (!this.highliteText) {
            this.showBaseText(this.el.nativeElement);
            this.oldExpression = undefined;
            this.oldExampleText = this.exampleText.slice();
        }
    }

    highlite(parent: HTMLElement) {
        const expression = this.highliteText.slice();
        const textBaseElement = parent.getElementsByClassName('text-base')[0];
        textBaseElement.setAttribute('style', 'display:none;');
        const text = this.exampleText.slice();
        const regexp = new RegExp(expression, 'gs');
        const newText = text.replace(regexp, (str) => this.getWrappedString(str));

        const viewers = parent.getElementsByClassName('regex-viewer');
        let viewer: Element;
        if (viewers.length < 1) {
            viewer = document.createElement('div');
            viewer.classList.add('regex-viewer');
            parent.appendChild(viewer);
        } else {
            viewer = viewers[0];
            viewer.innerHTML = undefined;
        }

        if (regexp.test(text)) {
            viewer.removeAttribute('style');
        } else {
            viewer.setAttribute('style', 'background-color: lavenderblush;');
            viewer.setAttribute('title', 'No matches!');
        }
        viewer.innerHTML = newText;
    }

    showBaseText(parent: HTMLElement) {
        const viewers = parent.getElementsByClassName('regex-viewer');
        if (viewers.length > 0) {
            for (let i = 0; i < viewers.length; i++) {
                const viewer = viewers[i];
                viewer.remove();
            }
        }
        const textBaseElement = parent.getElementsByClassName('text-base')[0];
        textBaseElement.removeAttribute('style');
    }

    getWrappedString = (str: string) => `<b style="
    margin: 0 1px;
    background-color: #b0d0e9;
    font-weight: normal;">${str}</b>`
}
