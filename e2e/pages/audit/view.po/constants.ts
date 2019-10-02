import { by, element } from 'protractor';
import { Lookup } from '../../../elements/lookup.element';
import { Multiselect } from '../../../elements/multiselect.element';
import { DatePicker } from '../../../elements/datepicker.element';
import { InlineEditor } from '../../../elements/inlineEditor.element';
import { WysyWig } from '../../../elements/wysyWig.element';
import { Attachments } from '../../../elements/attachments.element';
import { Comments } from '../../../elements/comments.element';
export const baseUrl = (projectId: number, id: number) => `/audit/${projectId}/info/${id}`;

export const elements = {
    uniqueElement: element(by.id('audit-info-page')),
    startProgress: element(by.id('audit-start')),
    cancelAudit: element(by.id('audit-cancel')),
    finishProgress: element(by.id('audit-finish')),
    submit: element(by.id('audit-submit')),
    duedate: new DatePicker(by.id('due-date')),
    created: new DatePicker(by.id('created-date')),
    started: new DatePicker(by.id('started-date')),
    finished: new DatePicker(by.id('progress_finished-date')),
    submitted: new DatePicker(by.id('submitteddate')),
    service: new Lookup(by.id('service')),
    auditors: new Multiselect(by.id('auditors')),
    result: new InlineEditor(by.id('result')),
    summary: new WysyWig(by.id('summary-editor')),
    summarySave: element(by.id('save-summary')),
    attachments: new Attachments(by.id('attachments')),
    comments: new Comments(by.id('comments')),
    status: element(by.id('status'))
};

export const names = {
    pageName: 'Audit Info'
};

export const statuses = {
    open: 'Open',
    inProgress: 'In Progress'
};
