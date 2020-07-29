import { Component , OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';

@Component({
  selector: 'comments-block',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss']
})

export class CommentsComponent implements OnInit, OnChanges {
  htmlContent: string;
  editorContent: object;
  @Input() comments: any[] = [];
  @Input() height = 'auto';
  @Input() showInputOnTop = false;
  @Input() disabled = false;
  @Output() addComment = new EventEmitter();

  constructor() {}

  public shownComments: any[] = [];

  ngOnInit() {
    this.shownComments = this.comments.slice(0, 4);
  }

  ngOnChanges() {
    this.shownComments = this.comments.slice(0, 4);
  }

  add() {
    let htmlString: string = this.htmlContent ? this.htmlContent : '';
    htmlString = htmlString.replace(new RegExp('&nbsp;', 'g'), '');
    htmlString = htmlString.replace(new RegExp(' ', 'g'), '');
    htmlString = htmlString.replace(new RegExp('<div><br></div>', 'g'), '');
    htmlString = htmlString.replace(new RegExp('<div></div>', 'g'), '');
    if (htmlString.trim() !== '') {
      this.addComment.emit({body: this.htmlContent});
      this.htmlContent = '';
    }
  }

  showAll() {
    this.shownComments = this.comments;
  }

  editorContentChange(event) {
    console.log(event);
  }
}
