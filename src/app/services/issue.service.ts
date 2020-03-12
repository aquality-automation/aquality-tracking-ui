import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { SimpleRequester } from './simple-requester';
import { Issue } from '../shared/models/issue';

@Injectable()
export class IssueService extends SimpleRequester {

    endpoint = '/issues';

    getIssues(issue: Issue): Promise<Issue[]> {
        return this.doGet(this.endpoint, issue).map(res => res.json()).toPromise();
    }

    createIssue(issue: Issue): Promise<Issue> {
        return this.doPost(this.endpoint, issue).map(res => {
        issue.id
            ? this.handleSuccess(`The issue '${issue.title}' was updated.`)
            : this.handleSuccess(`The issue '${issue.title}' was created.`);
        return res.json();
        }).toPromise();
    }
}
