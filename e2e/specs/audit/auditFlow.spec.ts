import { logIn } from '../../pages/login.po';
import { projectList } from '../../pages/project/list.po';
import { projectAudits } from '../../pages/audit/project.list.po';
import { createAudit } from '../../pages/audit/create.po';
import { auditInfo } from '../../pages/audit/view.po';
import { testData } from '../../utils/testData.util';
import { ProjectHelper } from '../../helpers/project.helper';

import using from 'jasmine-data-provider';
import usersTestData from '../../data/users.json';

const editorExamples = {
    auditAdmin: usersTestData.auditAdmin,
    assignedAuditor: usersTestData.assignedAuditor
};

const auditAdmin = editorExamples.auditAdmin;
const assignedAuditor = editorExamples.assignedAuditor;

const attachName = 'attach.docx';

describe('Audit:', () => {
    const projectHelper: ProjectHelper = new ProjectHelper();

    beforeAll(async () => {
        return projectHelper.init({
            auditAdmin: usersTestData.auditAdmin,
            assignedAuditor: usersTestData.assignedAuditor
        });
    });

    afterAll(async () => {
        return projectHelper.dispose();
    });

    using(editorExamples, (user, description) => {
        describe(`Permissions: ${description} role:`, () => {
            beforeAll(async () => {
                await logIn.logInAs(auditAdmin.user_name, auditAdmin.password);
                await projectHelper.openProject();
                await (await projectList.menuBar.audits()).project();
                await projectAudits.clickCreate();
                await createAudit.create(createAudit.services.auto, assignedAuditor);
                await createAudit.menuBar.clickLogo();
                if (user.user_name !== auditAdmin.user_name) {
                    await projectList.menuBar.clickLogOut();
                    await logIn.logInAs(user.user_name, user.password);
                }
            });

            describe(`In Progress:`, () => {
                it('Can open Audit from Project Audits', async () => {
                    await projectHelper.openProject();
                    await (await projectList.menuBar.audits()).project();
                    await expect(projectAudits.isOpened()).toBe(true, 'Project Audits page is not opened!');
                    await projectAudits.openAudit(projectAudits.statuses.open);
                    return expect(auditInfo.isOpened()).toBe(true, 'Audit is not opened!');
                });

                it('Can start Audit', async () => {
                    await auditInfo.startAudit();
                    await expect(auditInfo.modal.isVisible()).toBe(true, 'No Confirmation modal for start Audit action!');
                    await auditInfo.modal.clickYes();
                    await expect(auditInfo.getStatus()).toBe(auditInfo.statuses.inProgress, 'Audit is not In Progress status!');
                    await expect(auditInfo.isFinishProgressEnabled()).toBe(false, 'Finish progress should not be availabe!');
                    return auditInfo.notification.assertIsSuccess();
                });

                it('Can set Result', async () => {
                    const result = '58';
                    await auditInfo.setResult(result);
                    await auditInfo.notification.assertIsSuccess();
                    await expect(auditInfo.isFinishProgressEnabled()).toBe(false, 'Finish progress should not be availabe!');
                    await auditInfo.refresh();
                    await expect(auditInfo.getResult()).toBe(result, 'Result is not updatet');
                });

                it('Can set Summary', async () => {
                    const summary = 'Some Text';
                    await auditInfo.setSummary(summary);
                    await auditInfo.clickSaveSummary();
                    await auditInfo.notification.assertIsSuccess();
                    await expect(auditInfo.isFinishProgressEnabled()).toBe(false, 'Finish progress should not be availabe!');
                    await auditInfo.refresh();
                    await expect(auditInfo.getSummary()).toBe(summary, 'Summary is not updatet');
                });

                it('Can add attachments', async () => {
                    await auditInfo.attachDocument(testData.getFullPath(`/attachments/${attachName}`));
                    return expect(auditInfo.isAttachAdded(attachName)).toBe(true, `${attachName} is not added`);
                });

                it('Can upload attachments', async () => {
                    await auditInfo.uploadAttachment(attachName);
                    await auditInfo.notification.assertIsSuccess(`'${attachName}' file was uploaded!`);
                    await expect(auditInfo.isAttachUploaded(attachName)).toBe(true, `${attachName} is not uploaded!`);
                    return expect(auditInfo.isFinishProgressEnabled()).toBe(true, 'Finish progress should be availabe!');
                });
            });

            describe(`In Review:`, () => {
                it('Can finish progress when all data is passed', async () => {
                    await auditInfo.finishAudit();
                    await expect(auditInfo.modal.isVisible()).toBe(true, 'No Confirmation modal for Finish Audit action!');
                    await auditInfo.modal.clickYes();
                    await expect(auditInfo.getStatus()).toBe(auditInfo.statuses.inReview, 'Audit is not In Review status!');
                    return auditInfo.notification.assertIsSuccess();
                });

                it('Can add changes to in review audit', async () => {
                    const summary = 'Some New Text';
                    await auditInfo.setSummary(summary);
                    await auditInfo.clickSaveSummary();
                    await auditInfo.notification.close();
                    await expect(auditInfo.getSummary()).toBe(summary, 'Summary is not updatet');
                });

                it('Submit button is available for only Audit Admin', async () => {
                    expect(await auditInfo.isSubmitButtonPresent())
                        .toBe(user.user_name === auditAdmin.user_name, `Submit button availabilty is wrong for ${user.user_name}`);
                });
            });

            describe(`Submitted:`, () => {
                it('Can submit audit', async () => {
                    if (user.user_name !== auditAdmin.user_name) {
                        await projectList.menuBar.clickLogOut();
                        await logIn.logInAs(auditAdmin.user_name, auditAdmin.password);
                        await auditInfo.open(projectHelper.project.name, auditInfo.statuses.inReview);
                    }
                    await auditInfo.submitAudit();
                    await expect(auditInfo.modal.isVisible()).toBe(true, 'No Confirmation modal for Submit Audit action!');
                    await auditInfo.modal.clickYes();
                    await expect(auditInfo.getStatus()).toBe(auditInfo.statuses.submitted, 'Audit is not Submitted status!');
                    await auditInfo.notification.assertIsSuccess();

                    if (user.user_name !== auditAdmin.user_name) {
                        await projectList.menuBar.clickLogOut();
                        await logIn.logInAs(user.user_name, user.password);
                        await auditInfo.open(projectHelper.project.name, auditInfo.statuses.submitted);
                    }
                });
            });
        });
    });
});

