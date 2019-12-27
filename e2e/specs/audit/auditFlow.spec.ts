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
import { testData } from '../../utils/testData.util';

const editorExamples = {
    auditAdmin: usersTestData.auditAdmin,
    assignedAuditor: usersTestData.assignedAuditor
};

const auditAdmin = editorExamples.auditAdmin;
const assignedAuditor = editorExamples.assignedAuditor;

const attachName = 'attach.docx';

describe('Audit:', () => {
    const logInPage: LogIn = new LogIn();
    const projectsList: ProjectList = new ProjectList();
    const projectAudits: ProjectAudits = new ProjectAudits();
    const createAudit: CreateAudit = new CreateAudit();
    const audit: AuditInfo = new AuditInfo();

    const project: Project = projects.customerOnly;
    project.name = new Date().getTime().toString();

    beforeAll(async () => {
        await logInPage.logInAs(usersTestData.admin.user_name, usersTestData.admin.password);
        await prepareProject(project);
        return projectsList.menuBar.clickLogOut();
    });

    afterAll(async () => {
        await logInPage.logInAs(usersTestData.admin.user_name, usersTestData.admin.password);
        await projectsList.isOpened();
        await projectsList.removeProject(project.name);
    });

    using(editorExamples, (user, description) => {
        describe(`Permissions: ${description} role:`, () => {
            beforeAll(async () => {
                await logInPage.logInAs(auditAdmin.user_name, auditAdmin.password);
                await projectsList.openProject(project.name);
                await (await projectsList.menuBar.audits()).project();
                await projectAudits.clickCreate();
                await createAudit.create(createAudit.services.auto, assignedAuditor);
                await createAudit.menuBar.clickLogo();
                if (user.user_name !== auditAdmin.user_name) {
                    await projectsList.menuBar.clickLogOut();
                    await logInPage.logInAs(user.user_name, user.password);
                }
            });

            describe(`In Progress:`, () => {
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
                    await audit.modal.clickYes();
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

                it('Can add attachments', async () => {
                    await audit.attachDocument(testData.getFullPath(`/attachments/${attachName}`));
                    return expect(audit.isAttachAdded(attachName)).toBe(true, `${attachName} is not added`);
                });

                it('Can upload attachments', async () => {
                    await audit.uploadAttachment(attachName);
                    await expect(audit.notification.isSuccess()).toBe(true, 'Success message is not shown!');
                    await expect(audit.notification.getContent()).toBe(`'${attachName}' file was uploaded!`, 'Message is wrong!');
                    await audit.notification.close();
                    await expect(audit.isAttachUploaded(attachName)).toBe(true, `${attachName} is not uploaded!`);
                    return expect(audit.isFinishProgressEnabled()).toBe(true, 'Finish progress should be availabe!');
                });
            });

            describe(`In Review:`, () => {
                it('Can finish progress when all data is passed', async () => {
                    await audit.finishAudit();
                    await expect(audit.modal.isVisible()).toBe(true, 'No Confirmation modal for Finish Audit action!');
                    await audit.modal.clickYes();
                    await expect(audit.getStatus()).toBe(audit.statuses.inReview, 'Audit is not In Review status!');
                    await expect(audit.notification.isSuccess()).toBe(true, 'Success message is not shown!');
                    await audit.notification.close();
                });

                it('Can add changes to in review audit', async () => {
                    const summary = 'Some New Text';
                    await audit.setSummary(summary);
                    await audit.clickSaveSummary();
                    await audit.notification.close();
                    await expect(audit.getSummary()).toBe(summary, 'Summary is not updatet');
                });

                it('Submit button is available for only Audit Admin', async () => {
                    expect(await audit.isSubmitButtonPresent())
                        .toBe(user.user_name === auditAdmin.user_name, `Submit button availabilty is wrong for ${user.user_name}`);
                });
            });

            describe(`Submitted:`, () => {
                it('Can submit audit', async () => {
                    if (user.user_name !== auditAdmin.user_name) {
                        await projectsList.menuBar.clickLogOut();
                        await logInPage.logInAs(auditAdmin.user_name, auditAdmin.password);
                        await audit.open(project.name, audit.statuses.inReview);
                    }
                    await audit.submitAudit();
                    await expect(audit.modal.isVisible()).toBe(true, 'No Confirmation modal for Submit Audit action!');
                    await audit.modal.clickYes();
                    await expect(audit.getStatus()).toBe(audit.statuses.submitted, 'Audit is not Submitted status!');
                    await expect(audit.notification.isSuccess()).toBe(true, 'Success message is not shown!');
                    await audit.notification.close();

                    if (user.user_name !== auditAdmin.user_name) {
                        await projectsList.menuBar.clickLogOut();
                        await logInPage.logInAs(user.user_name, user.password);
                        await audit.open(project.name, audit.statuses.submitted);
                    }
                });
            });
        });
    });
});

