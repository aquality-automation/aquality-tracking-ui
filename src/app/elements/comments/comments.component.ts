import { Component , OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { SimpleRequester } from '../../services/simple-requester';

@Component({
  selector: 'comments-block',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.css'],
  providers: [
    SimpleRequester
  ]
})

export class CommentsComponent implements OnInit, OnChanges {
  htmlContent: string;
  @Input() comments: any[] = [];
  @Input() height = 'auto';
  @Input() showInputOnTop = false;
  @Input() disabled = false;
  @Output() addComment = new EventEmitter();

  constructor(private simpleRequester: SimpleRequester) {}

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
    } else {
      this.simpleRequester.handleWarning('Add comment', 'You are trying to save empty comment.');
    }
  }

  showAll() {
    this.shownComments = this.comments;
  }
}
