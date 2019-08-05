import { Component } from '@angular/core';

@Component({
  template: `
  <div class="panel-body">
    <div class="jumbotron text-center">
      <h1>404 Not Found</h1>
      <p>Are you sure you have permissions to see this page?</p>
      <p>You may be lost. Follow the breadcrumbs back <a routerLink="/">home</a>.</p>
    </div>
  </div>
  `
})
export class NotFoundComponent {}
