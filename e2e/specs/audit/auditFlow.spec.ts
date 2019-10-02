import { LogIn } from '../../pages/login.po';
import { ProjectList } from '../../pages/project/list.po';
import { ProjectAudits } from '../../pages/audit/project.list.po';
import { Project } from '../../../src/app/shared/models/project';
import { prepareProject } from '../project.hooks';

import using from 'jasmine-data-provider';
import usersTestData from '../../data/users.json';
import projects from '../../data/projects.json';
import { CreateAudit } from '../../pages/audit/create.po';
import { AuditInfo } from '../../pages/audit/view.po';
import { browser } from 'protractor';

const editorExamples = {
    auditAdmin: usersTestData.auditAdmin,
    assignedAuditor: usersTestData.assignedAuditor
};

const auditAdmin = editorExamples.auditAdmin;
const assignedAuditor = editorExamples.assignedAuditor;

fdescribe('Audit:', () => {
    const logInPage: LogIn = new LogIn();
    const projectsList: ProjectList = new ProjectList();
    const projectAudits: ProjectAudits = new ProjectAudits();
    const createAudit: CreateAudit = new CreateAudit();
    const audit: AuditInfo = new AuditInfo();

    const project: Project = projects.customerOnly;
    project.name = new Date().getTime().toString();

    beforeAll(async () => {
        await logInPage.logIn(usersTestData.admin.user_name, usersTestData.admin.password);
        await prepareProject(project);
        return projectsList.menuBar.clickLogOut();
    });

    afterAll(async () => {
        await logInPage.logIn(usersTestData.admin.user_name, usersTestData.admin.password);
        await projectsList.isOpened();
        await projectsList.removeProject(project.name);
    });

    using(editorExamples, (user, description) => {
        describe(`Permissions: ${description} role:`, () => {
            beforeAll(async () => {
                await logInPage.logIn(auditAdmin.user_name, auditAdmin.password);
                await projectsList.openProject(project.name);
                await (await projectsList.menuBar.audits()).project();
                await projectAudits.clickCreate();
                await createAudit.create(createAudit.services.auto, assignedAuditor);
                await createAudit.menuBar.clickLogo();
                if (user.user_name !== auditAdmin.user_name) {
                    await projectsList.menuBar.clickLogOut();
                    await logInPage.logIn(user.user_name, user.password);
                }
            });

            it('Can open Audit from Project Audits', async () => {
                await projectsList.openProject(project.name);
                await (await projectsList.menuBar.audits()).project();
                await expect(projectAudits.isOpened()).toBe(true, 'Project Audits page is not opened!');
                await projectAudits.openAudit(projectAudits.statuses.open);
                return expect(audit.isOpened()).toBe(true, 'Audit is not opened!');
            });

            it('Can start Audit', async () => {
                await audit.startAudit();
                await expect(audit.modal.isVisible()).toBe(true, 'No Confirmation modal for start Audit action!');
                await audit.modal.clickActionBtn('yes');
                await expect(audit.getStatus()).toBe(audit.statuses.inProgress, 'Audit is not In Progress status!');
                await expect(audit.isFinishProgressEnabled()).toBe(false, 'Finish progress should not be availabe!');
                await expect(audit.notification.isSuccess()).toBe(true, 'Success message is not shown!');
                await audit.notification.close();
            });

            it('Can set Result', async () => {
                const result = '58';
                await audit.setResult(result);
                await expect(audit.notification.isSuccess()).toBe(true, 'Success message is not shown!');
                await audit.notification.close();
                await expect(audit.isFinishProgressEnabled()).toBe(false, 'Finish progress should not be availabe!');
                await browser.refresh();
                await expect(audit.getResult()).toBe(result, 'Result is not updatet');
            });

            it('Can set Summary', async () => {
                const summary = 'Some Text';
                await audit.setSummary(summary);
                await audit.clickSaveSummary();
                await expect(audit.notification.isSuccess()).toBe(true, 'Success message is not shown!');
                await audit.notification.close();
                await expect(audit.isFinishProgressEnabled()).toBe(false, 'Finish progress should not be availabe!');
                await browser.refresh();
                await expect(audit.getSummary()).toBe(summary, 'Summary is not updatet');
            });

            it('Can upload attachments', async () => {
            });
        });
    });
});

