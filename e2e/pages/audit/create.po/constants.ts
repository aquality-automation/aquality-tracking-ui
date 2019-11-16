import { by, element } from 'protractor';
import { Lookup } from '../../../elements/lookup.element';
import { Multiselect } from '../../../elements/multiselect.element';
import { DatePicker } from '../../../elements/datepicker.element';
export const baseUrl = (id: number) => `/audit/${id}/create`;

export const elements = {
    uniqueElement: element(by.id('audit-create-page')),
    service: new Lookup(by.id('service')),
    auditors: new Multiselect(by.id('auditors')),
    duedate: new DatePicker(by.id('due-date')),
    create: element(by.id('create'))
};

export const names = {
    pageName: 'Create Audit'
};

export const services = {
    auto: 'Auto'
};
