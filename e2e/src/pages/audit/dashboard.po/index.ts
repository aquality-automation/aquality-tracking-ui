import { elements, names } from './constants';
import { BasePage } from '../../base.po';

class AuditsDashboard extends BasePage {
    constructor() {
        super(elements.uniqueElement, names.pageName);
    }

    async exportAllSubmittedAudits(): Promise<void> {
        await elements.exportToExcel.click();
        return elements.allSubmittedAudits.click();
    }

    async exportLastSubmittedAudits(): Promise<void> {
        await elements.exportToExcel.click();
        return elements.lastSubmittedAudits.click();
    }
}

export const auditsDashboardPage = new AuditsDashboard();
