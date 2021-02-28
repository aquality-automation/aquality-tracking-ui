export class SystemWorkflowStatusType {
    id: number;
    name: string;

    constructor(id: number, name: string){
        this.id = id;
        this.name = name;
    }
}

export const workflowStatusTypes = {
    Closed: new SystemWorkflowStatusType(1, 'Closed')
}
