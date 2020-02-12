import { Injectable } from '@angular/core';
import { UserService } from './user.services';
import { LocalPermissions } from '../shared/models/LocalPermissions';

export enum ELocalPermissions {
    admin = 'admin',
    manager = 'manager',
    engineer = 'engineer',
    viewer = 'viewer',
}

export enum EGlobalPermissions {
    admin = 'admin',
    manager = 'manager',
    audit_admin = 'audit_admin',
    auditor = 'auditor',
    unit_coordinator = 'unit_coordinator',
    account_manager = 'account_manager',
    head = 'head'
}

@Injectable()
export class PermissionsService extends UserService {

    public async hasPermissions(anyOfGlobal?: EGlobalPermissions[], anyOfLocal?: ELocalPermissions[]) {
        if (await this.handleIsLogged()) {
            const local = await this.hasLocalPermissions(anyOfLocal);
            return local || this.hasGlobalPermissions(anyOfGlobal);
        }

        throw new Error(`You are not logged in!`);
    }

    public async hasProjectPermissions(projectId: number, anyOfGlobal: EGlobalPermissions[], anyOfLocal: ELocalPermissions[]) {
        if (await this.handleIsLogged()) {
            const local = await this.hasProjectLocalPermissions(projectId, anyOfLocal);
            return local || this.hasGlobalPermissions(anyOfGlobal);
        }

        throw new Error(`You are not logged in!`);
    }

    public async isProjectEditor(projectId: number) {
        return this.hasProjectPermissions(projectId, [EGlobalPermissions.manager],
            [ELocalPermissions.admin, ELocalPermissions.manager, ELocalPermissions.engineer]);
    }

    public isGlobalAdmin(): boolean {
        return !!this.currentUser().admin;
    }

    public isGlobalManager(): boolean {
        return !!this.currentUser().manager;
    }

    public isLocalAdmin(): Promise<boolean> {
        return this.hasLocalPermissions([ELocalPermissions.admin]);
    }

    public isLocalManager(): Promise<boolean> {
        return this.hasLocalPermissions([ELocalPermissions.manager]);
    }

    public isLocalEngineer(): Promise<boolean> {
        return this.hasLocalPermissions([ELocalPermissions.manager, ELocalPermissions.engineer]);
    }

    public isLocalViewer(): Promise<boolean> {
        return this.hasLocalPermissions([ELocalPermissions.admin, ELocalPermissions.manager,
        ELocalPermissions.engineer, ELocalPermissions.viewer]);
    }

    public isProjectAdmin(projectId: number): Promise<boolean> {
        return this.hasProjectLocalPermissions(projectId, [ELocalPermissions.admin]);
    }

    public isProjectManager(projectId: number): Promise<boolean> {
        return this.hasProjectLocalPermissions(projectId, [ELocalPermissions.manager]);
    }

    public isProjectEngineer(projectId: number): Promise<boolean> {
        return this.hasProjectLocalPermissions(projectId, [ELocalPermissions.manager, ELocalPermissions.engineer]);
    }

    public isProjectViewer(projectId: number): Promise<boolean> {
        return this.hasProjectLocalPermissions(projectId,
            [ELocalPermissions.admin, ELocalPermissions.manager, ELocalPermissions.engineer, ELocalPermissions.viewer]);
    }

    private hasGlobalPermissions(anyOf: EGlobalPermissions[]) {
        if (!anyOf) {
            return false;
        }
        return anyOf.find(x => !!this.currentUser()[x] === true) !== undefined;
    }

    private async hasProjectLocalPermissions(projectId: number, anyOf: ELocalPermissions[]): Promise<boolean> {
        const permissions: LocalPermissions[] = await this.getProjectUsers(projectId).toPromise();
        return this.searchForLocalPermissions(anyOf, permissions);
    }

    private async hasLocalPermissions(anyOf: ELocalPermissions[]): Promise<boolean> {
        const permissions: LocalPermissions[] = await this.getUserProjects(this.currentUser().id);
        return this.searchForLocalPermissions(anyOf, permissions);
    }

    private searchForLocalPermissions(anyOf: ELocalPermissions[], permissions: LocalPermissions[]): boolean {
        if (!anyOf) {
            return false;
        }
        return permissions.find(permission => {
            let result = false;
            anyOf.forEach(name => {
                if (permission[name] === 1 && this.currentUser().id === permission.user_id) {
                    result = true;
                    return;
                }
            });
            return result;
        }) !== undefined;
    }
}
