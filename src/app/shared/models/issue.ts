import { ResultResolution } from './result_resolution';
import { User } from './user';
import { Label } from './general';

export class Issue {
    id?: number;
    resolution_id?: number;
    resolution?: ResultResolution;
    title?: String;
    description?: String;
    external_url?: String;
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
