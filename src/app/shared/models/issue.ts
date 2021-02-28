import { ResultResolution } from './result-resolution';
import { User } from './user';
import { Label } from './general';
import { IEntityId } from './i-entity-id';

export class Issue implements IEntityId{
    id?: number;
    resolution_id?: number;
    resolution?: ResultResolution;
    title?: string;
    description?: string;
    external_url?: string;
    assignee_id?: number;
    assignee?: User;
    expression?: string;
    status_id?: number;
    status?: Label;
    label_id?: number;
    label?: Label;
    project_id?: number;
    creator_id?: number;
    creator?: User;
    created?: Date;
    limit?: number;
}
