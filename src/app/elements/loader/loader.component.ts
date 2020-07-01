import { Component, Input } from '@angular/core';

@Component({
    selector: 'loader-component',
    templateUrl: './loader.component.html',
    styleUrls: ['./loader.component.scss']
})

export class LoaderComponent {
    @Input() show: boolean;
    @Input() full = false;
}
