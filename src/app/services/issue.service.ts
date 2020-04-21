import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { SimpleRequester } from './simple-requester';
import { Issue } from '../shared/models/issue';
import { Label } from '../shared/models/general';
import { DefaultProperties } from '../shared/utils/property.util';

@Injectable()
export class IssueService extends SimpleRequester {

    endpoints = {
        issues: '/issues',
        statuses: '/issue/status'
    };

    getIssues(issue: Issue): Promise<Issue[]> {
        return this.doGet(this.endpoints.issues, issue).map(res => res.json()).toPromise();
    }

    createIssue(issue: Issue, updateResults: boolean = false): Promise<Issue> {
        if (!issue.expression) {
            updateResults = false;
        }

        if (issue.description === '') {
            issue.description = DefaultProperties.blank;
        }

        if (issue.external_url === '') {
            issue.external_url = DefaultProperties.blank;
        }

        return this.doPost(this.endpoints.issues, issue, { assign: updateResults }).map(res => {
            issue.id
                ? this.handleSuccess(`The issue '${issue.title}' was updated.`)
                : this.handleSuccess(`The issue '${issue.title}' was created.`);
            return res.json();
        }).toPromise();
    }

    getIssueStatuses(): Promise<Label[]> {
        return this.doGet(this.endpoints.statuses).map(res => res.json()).toPromise();
    }
}
