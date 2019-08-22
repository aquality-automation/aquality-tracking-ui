import { ProjectList } from '../pages/project/list.po';
import { ProjectCreate } from '../pages/project/create.po';
import { Project } from '../../src/app/shared/models/project';
import { ImportTokenAdministration } from '../pages/administration/importToken.po';

const projectList: ProjectList = new ProjectList();
const projectCreate: ProjectCreate = new ProjectCreate();
const importTokenAdministration: ImportTokenAdministration = new ImportTokenAdministration();

export const prepareProject = async (project: Project): Promise<string> => {
    await projectList.clickCreateProjectButton();
    await projectCreate.fillProjectNameField(project.name);
    await projectCreate.selectCustomer(project.customer.name);
    await projectCreate.clickCreateButton();
    await (await projectList.menuBar.user()).administration();
    await importTokenAdministration.sidebar.importToken();
    const token = await importTokenAdministration.generateToken(project.name);
    await importTokenAdministration.menuBar.clickLogo();
    await projectList.openProject(project.name);
    return token;
};
