import { browser } from 'protractor';
import { elements, baseUrl, names, services } from './constants';
import { BasePage } from '../../base.po';
import { User } from '../../../../src/app/shared/models/user';

export class CreateAudit extends BasePage {
    constructor() {
        super(elements.uniqueElement, names.pageName);
    }

    services = services;

    navigateTo(id: number) {
        return browser.get(baseUrl(id));
    }

    selectService(name: string) {
        return elements.service.select(name);
    }

    selectAuditor(user: User) {
        return elements.auditors.select(`${user.first_name} ${user.second_name}`);
    }

    setDueDate(date: Date) {
        return elements.duedate.select(date);
    }

    clickCreate() {
        return elements.create.click();
    }

    async create(service: string, auditor: User, date?: Date) {
        await this.selectService(service);
        await this.selectAuditor(auditor);
        if (date) {
            await this.setDueDate(date);
        }
        return this.clickCreate();
    }
}

export const createAudit = new CreateAudit();