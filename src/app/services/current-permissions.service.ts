import { Injectable } from '@angular/core';
import { UserService } from './user.services';
import { LocalPermissions } from '../shared/models/LocalPermissions';

export enum Permissions {
    admin = 'admin',
    manager = 'manager',
    engineer = 'engineer',
    viewer = 'viewer',
}

@Injectable()
export class CurrentPermissionsService extends UserService {

    public isGlobalAdmin(): boolean {
        return !!this.currentUser().admin;
    }

    public isGlobalManager(): boolean {
        return !!this.currentUser().manager;
    }

    public isLocalAdmin(): Promise<boolean> {
        return this.hasLocalPermissions([Permissions.admin]);
    }

    public isLocalManager(): Promise<boolean> {
        return this.hasLocalPermissions([Permissions.manager]);
    }

    public isLocalEngineer(): Promise<boolean> {
        return this.hasLocalPermissions([Permissions.manager, Permissions.engineer]);
    }

    public isLocalViewer(): Promise<boolean> {
        return this.hasLocalPermissions([Permissions.admin, Permissions.manager, Permissions.engineer, Permissions.viewer]);
    }

    public isProjectAdmin(projectId: number): Promise<boolean> {
        return this.hasProjectLocalPermissions(projectId, [Permissions.admin]);
    }

    public isProjectManager(projectId: number): Promise<boolean> {
        return this.hasProjectLocalPermissions(projectId, [Permissions.manager]);
    }

    public isProjectEngineer(projectId: number): Promise<boolean> {
        return this.hasProjectLocalPermissions(projectId, [Permissions.manager, Permissions.engineer]);
    }

    public isProjectViewer(projectId: number): Promise<boolean> {
        return this.hasProjectLocalPermissions(projectId,
            [Permissions.admin, Permissions.manager, Permissions.engineer, Permissions.viewer]);
    }

    async hasProjectLocalPermissions(projectId: number, anyOf: Permissions[]): Promise<boolean> {
        const permissions: LocalPermissions[] = await this.getProjectUsers(projectId).toPromise();
        return permissions.find(permission => {
            let result = false;
            anyOf.forEach(name => {
                if (permission[name] === 1) {
                    result = true;
                    return;
                }
            });
            return result;
        }) !== undefined;
    }

    async hasLocalPermissions(anyOf: Permissions[]): Promise<boolean> {
        const permissions: LocalPermissions[] = await this.getUserProjects(this.currentUser().id);
        return permissions.find(permission => {
            let result = false;
            anyOf.forEach(name => {
                if (permission[name] === 1) {
                    result = true;
                    return;
                }
            });
            return result;
        }) !== undefined;
    }
}
