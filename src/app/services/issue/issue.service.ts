import { Injectable } from '@angular/core';
import { BaseHttpService } from '../base-http/base-http.service';
import { Issue } from 'src/app/shared/models/issue';
import { DefaultProperties } from 'src/app/shared/utils/property.utils';
import { Label } from 'src/app/shared/models/general';

@Injectable()
export class IssueService extends BaseHttpService {

    endpoints = {
        issues: '/issues',
        statuses: '/issue/status'
    };

    getIssues(issue: Issue): Promise<Issue[]> {
        return this.http.get<Issue[]>(this.endpoints.issues, { params: this.convertToParams(issue) }).toPromise();
    }

    async createIssue(issue: Issue, updateResults: boolean = false): Promise<Issue> {
        if (!issue.expression) {
            updateResults = false;
        }

        if (issue.description === '') {
            issue.description = DefaultProperties.blank;
        }

        if (issue.external_url === '') {
            issue.external_url = DefaultProperties.blank;
        }

        const result = await this.http.post<Issue>(this.endpoints.issues, issue, {params: { assign: String(updateResults) }}).toPromise();
        issue.id
                ? this.handleSuccess(`The issue '${issue.title}' was updated.`)
                : this.handleSuccess(`The issue '${issue.title}' was created.`);

        return result;
    }

    getIssueStatuses(): Promise<Label[]> {
        return this.http.get<Label[]>(this.endpoints.statuses).toPromise();
    }
}
