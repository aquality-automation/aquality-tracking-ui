import { projectList } from '../pages/project/list.po';
import { projectView } from '../pages/project/view.po';
import { logIn } from '../pages/login.po';
import { Project } from '../../../src/app/shared/models/project';
import { apiTokenAdministration } from '../pages/administration/apiToken.po';
import { User } from '../../../src/app/shared/models/user';
import { logger } from '../utils/log.util';
import { Importer } from '../api/importer.api';
import { EditorAPI } from '../api/editor.api';
import usersTestData from '../data/users.json';
import { PublicAPI } from '../api/public.api';
import { browser } from 'protractor';
import { UserAPI } from '../api/user.api';


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
    public project: Project;
    public importer: Importer;
    public editorAPI: EditorAPI;
    public publicAPI: PublicAPI;
    public adminAPI: UserAPI;
    private admin = usersTestData.admin;
    private disposed = false;

    constructor(projectName?: string) {
        this.project = {
            customer: {
                name: '-'
            }
        };
        this.project.name = projectName !== undefined
            ? `${projectName} ${new Date().getTime().toString()}`
            : new Date().getTime().toString();
    }

    public async init(permissions?: { [key: string]: User; }, steps?: boolean) {
        this.ifDisposed();
        try {
            logger.info('Logging as admin');
            await logIn.logInAs(this.admin.user_name, this.admin.password);
            const authCookie = await browser.manage().getCookie('iio78');
            this.adminAPI = new UserAPI(decodeURIComponent(authCookie.value), this.admin);
            
            logger.info('Createing project');
            this.project = await this.adminAPI.createProject(this.project);
            logger.info(`Project created ${this.project.id}`);
            const token = await this.adminAPI.createToken(this.project);
            if (permissions) {
                await this.assigneProjectPermissions(this.project, permissions);
            }
            if (steps) {
                this.project.steps = 1;
                await this.adminAPI.updateProject(this.project);
            }

            this.importer = new Importer(this.project, token);
            this.editorAPI = new EditorAPI(this.project, token);
            this.publicAPI = new PublicAPI(this.project, token);
            return projectView.menuBar.clickLogOut();
        } catch (err) {
            logger.error(err.message);
        }
    }

    public async openProject() {
        this.ifDisposed();
        await apiTokenAdministration.menuBar.clickLogo();
        return projectList.openProject(this.project.name);
    }

    public async dispose() {
        this.ifDisposed();
        logger.info('Going to relogin with admin');
        await this.adminAPI.relogin();
        logger.info('Trying to remove project');
        await this.adminAPI.removeProject(this.project);
        logger.info('Project disposed');
        this.disposed = true;
    }

    public generateBuilds = (count: number): { names: any, filenames: string[] } => {
        this.ifDisposed();
        const names = {};
        const filenames: string[] = [];

        for (let i = 0; i < count; i++) {
            const name = `build_${i + 1}`;
            names[name] = name;
            filenames.push(`${name}.json`);
        }

        return { names, filenames };
    }

    private async assigneProjectPermissions(project: Project, users: { [key: string]: User; }): Promise<void> {
        const keys = Object.keys(users);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const user: User = users[key];
            await this.adminAPI.assigneProjectPermission(this.project, user, key as PermissionType);
            logger.info(`Permissions were added for ${user.user_name}`);
        }
    }

    private ifDisposed() {
        if (this.disposed) {
            throw new Error(`'${this.project.name}' project was disposed! please create new project helper!`);
        }
    }
}
