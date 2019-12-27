import { projectList } from '../pages/project/list.po';
import { projectCreate } from '../pages/project/create.po';
import { projectView } from '../pages/project/view.po';
import { logIn } from '../pages/login.po';
import { Project } from '../../src/app/shared/models/project';
import { apiTokenAdministration } from '../pages/administration/apiToken.po';
import { permissionsAdministration } from '../pages/administration/permissions.po';
import { User } from '../../src/app/shared/models/user';
import { logger } from '../utils/log.util';
import { Importer } from '../api/importer.api';
import { EditorAPI } from '../api/editor.api';
import projects from '../data/projects.json';
import usersTestData from '../data/users.json';


export enum PermissionType {
    admin = 'admin',
    localAdmin = 'localAdmin',
    localManager = 'localManager',
    localEngineer = 'localEngineer',
    manager = 'manager',
    projectTemp = 'projectTemp',
    viewer = 'viewer',
}

export class ProjectHelper {
    public project: Project = projects.customerOnly;
    public importer: Importer;
    public editorAPI: EditorAPI;
    private admin = usersTestData.admin;

    constructor(name?: string) {
        this.project.name = name
            ? name
            : new Date().getTime().toString();
    }

    public async init(permissions?: { [key: string]: User; }) {
        await logIn.logInAs(this.admin.user_name, this.admin.password);

        await this.createProject(this.project);
        await this.openProject();
        this.project.id = await projectView.getCurrentProjectId();
        const token = await this.createToken(this.project);
        if (permissions) {
            await this.assigneProjectPermissions(this.project, permissions);
        }
        this.importer = new Importer(this.project, token);
        this.editorAPI = new EditorAPI(this.project, token);

        return projectView.menuBar.clickLogOut();
    }

    public async openProject() {
        await apiTokenAdministration.menuBar.clickLogo();
        return projectList.openProject(this.project.name);
    }

    public async  dispose() {
        await logIn.logInAs(this.admin.user_name, this.admin.password);
        await projectList.isOpened();
        await projectList.removeProject(this.project.name);
    }

    private async createProject(project: Project): Promise<void> {
        await projectList.clickCreateProjectButton();
        await projectCreate.fillProjectNameField(project.name);
        await projectCreate.selectCustomer(project.customer.name);
        return projectCreate.clickCreateButton();
    }

    private async createToken(project: Project): Promise<string> {
        await (await projectList.menuBar.user()).administration();
        await apiTokenAdministration.sidebar.apiToken();
        return apiTokenAdministration.generateToken(project.name);
    }

    private async assigneProjectPermissions(project: Project, users: { [key: string]: User; }): Promise<void> {
        await (await projectList.menuBar.user()).administration();
        await permissionsAdministration.sidebar.permissions();
        await permissionsAdministration.selectProject(project.name);
        const keys = Object.keys(users);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const user: User = users[key];
            switch (key) {
                case PermissionType.localAdmin:
                    await permissionsAdministration.create({ user, admin: 1, manager: 0, engineer: 0 });
                    break;
                case PermissionType.localEngineer:
                    await permissionsAdministration.create({ user, admin: 0, manager: 0, engineer: 1 });
                    break;
                case PermissionType.localManager:
                    await permissionsAdministration.create({ user, admin: 0, manager: 1, engineer: 0 });
                    break;
                case PermissionType.projectTemp:
                case PermissionType.viewer:
                    await permissionsAdministration.create({ user, admin: 0, manager: 0, engineer: 0 });
                    break;
                default:
                    logger.info(`Local Permissions for ${key} are not required`);
            }
        }
    }
}
