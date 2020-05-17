import { BaseAPI } from './base.api';
import { Project } from '../../src/app/shared/models/project';
import { User } from '../../src/app/shared/models/user';
import { Customer } from '../../src/app/shared/models/customer';
import { LocalPermissions } from '../../src/app/shared/models/LocalPermissions';
import { PermissionType } from '../helpers/project.helper';
import { logger } from '../utils/log.util';
import { logIn } from '../pages/login.po';
import { browser } from 'protractor';

enum Endpoints {
    project = '/project',
    customer = '/customer',
    apiToken = '/project/apiToken',
    projectPermission = '/users/permissions',
    users = '/users',
    testrun = '/testrun',
}

export class UserAPI extends BaseAPI {
    private user: User;

    constructor(authCookie: string, user: User) {
        super(null, null, authCookie)
        this.user = user;
    }

    public async createProject(project: Project): Promise<Project> {
        const customers: Customer[] = await this.sendGet(Endpoints.customer);
        project.customer_id = customers.find(x => x.name === project.customer.name).id;
        return this.updateProject(project)
    }

    public updateProject(project: Project): Promise<Project> {
        return this.sendPost(Endpoints.project, undefined, project)
    }

    public createUser(user: User): Promise<User> {
        return this.sendPost(Endpoints.users, undefined, user);
    }

    public async assigneProjectPermission(project: Project, user: User, permissionType: PermissionType): Promise<void> {
        let localPermissions: LocalPermissions;
        let userToAdd = (await this.sendGet(Endpoints.users, { user_name: user.user_name }))[0];

        if (!userToAdd) {
            logger.info(`User ${user.user_name} does not exist. Creating...`);
            userToAdd = await this.createUser(user);
        }

        switch (permissionType) {
            case PermissionType.localAdmin:
                localPermissions = { project_id: project.id, user_id: userToAdd.id, admin: 1, manager: 0, engineer: 0 };
                break;
            case PermissionType.localEngineer:
                localPermissions = { project_id: project.id, user_id: userToAdd.id, admin: 0, manager: 0, engineer: 1 };
                break;
            case PermissionType.localManager:
                localPermissions = { project_id: project.id, user_id: userToAdd.id, admin: 0, manager: 1, engineer: 0 };
                break;
            case PermissionType.projectTemp:
            case PermissionType.viewer:
                localPermissions = { project_id: project.id, user_id: userToAdd.id, admin: 0, manager: 0, engineer: 0 };
                break;
            default:
                logger.info(`Local Permissions for ${permissionType} are not required`);
        }

        if (localPermissions) {
            return this.sendPost(Endpoints.projectPermission, undefined, localPermissions);
        }
    }

    public async createToken(project: Project): Promise<string> {
        const resp = await this.sendGet(Endpoints.apiToken, { id: project.id });
        return (resp).api_token;
    }

    public removeProject(project: Project): Promise<string> {
        return this.sendDelete(Endpoints.project, { id: project.id });
    }

    public async relogin(): Promise<void> {
        await logIn.logInAs(this.user.user_name, this.user.password);
        const authCookie = await browser.manage().getCookie('iio78');
        this.cookie = decodeURIComponent(authCookie.value)
    }

    public async removeTestRun(id: number, project_id: number) {
        return this.sendDelete(Endpoints.testrun, { id, project_id }, null);
    }
}