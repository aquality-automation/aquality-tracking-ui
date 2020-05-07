import { logIn } from '../../pages/login.po';
import { auditsDashboardPage } from '../../pages/audit/dashboard.po';
import { testData } from '../../utils/testData.util';
import { projectList } from '../../pages/project/list.po';
import { dateUtil } from '../../utils/date.util';
import using from 'jasmine-data-provider';
import users from '../../data/users.json';
import { ProjectHelper } from '../../helpers/project.helper';

const editorExamples = {
    auditAdmin: users.auditAdmin,
    manager: users.manager
};

const notEditorExamples = {
    autoAdmin: users.autoAdmin,
    viewer: users.viewer,
    coordinator: users.unitCoordinator
};

const getAllSubmittedAuditsfileName = (): string => {
    return `Aquality_Tracking_All_Submitted_Audits_${dateUtil.getDateFormat()}.xlsx`;
};

const getLastSubmittedAuditsfileName = (): string => {
    return `Aquality_Tracking_Last_Submitted_Audits_${dateUtil.getDateFormat()}.xlsx`;
};

describe('Audits Dashboard:', () => {
    const projectHelper = new ProjectHelper();

    beforeAll(async () => {
        await projectHelper.init({
            auditAdmin: users.auditAdmin,
            manager: users.manager,
            autoAdmin: users.autoAdmin,
            viewer: users.viewer,
            coordinator: users.unitCoordinator
        });
    })

    afterAll(async () => {
        await projectHelper.dispose();
    })

    using(notEditorExamples, (user, description) => {
        describe(`${description} role:`, () => {
            it(`Is not available for role ${description}`, async () => {
                await logIn.logInAs(user.user_name, user.password);
                return expect(projectList.menuBar.isAuditTabExists()).toBe(false, 'Audits Dashboard should be unavailable');
            });
        });
    });

    using(editorExamples, (user, description) => {
        describe(`${description} role:`, () => {
            beforeAll(async () => {
                await testData.cleanUpDownloadsData();
                await logIn.logInAs(user.user_name, user.password);
                return projectList.menuBar.audits();
            });

            afterAll(async () => {
                return testData.cleanUpDownloadsData();
            });

            it('Can export all submitted audits', async () => {
                await auditsDashboardPage.exportAllSubmittedAudits();
                return expect(
                    await testData.waitUntilFileExists(testData.getSimpleDownloadsFolderPath(), getAllSubmittedAuditsfileName()))
                    .toBe(true, `All submitted audits should be exported to file: ${getAllSubmittedAuditsfileName()}`);
            });

            it('Can export last submitted audits', async () => {
                await auditsDashboardPage.exportLastSubmittedAudits();
                return expect(
                    await testData.waitUntilFileExists(testData.getSimpleDownloadsFolderPath(), getLastSubmittedAuditsfileName()))
                    .toBe(true, `Last submitted audits should be exported to file: ${getLastSubmittedAuditsfileName()}`);
            });
        });
    });
});

