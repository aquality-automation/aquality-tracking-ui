import { Reference } from "../shared/models/integrations/reference";
import { ReferenceType } from "../shared/models/integrations/reference-type";
import { System } from "../shared/models/integrations/system";

export const projectId: number = 1;

export const system1: System = {
    id: 1,
    name: 'test system',
    url: 'http://aquality',
    username: 'username',
    password: 'pass',
    int_system_type: 1,
    int_tts_type: 1,
    project_id: projectId,
    api_token: 'token'
};

export const system2: System = {
    id: 2,
    name: 'test system 2',
    url: 'http://aquality2',
    username: 'username2',
    password: 'pass2',
    int_system_type: 2,
    int_tts_type: 2,
    project_id: projectId,
    api_token: 'token2'
};

export const systems: System[] = [system1, system2];


export const expRefSys1: Reference = {
    id: 1000,
    key: 'S1-000001',
    entity_id: 1,
    project_id: projectId,
    int_system: system1.id
};

export const expRefSys2: Reference = {
    id: 1000,
    key: 'S2-000001',
    entity_id: 2,
    project_id: projectId,
    int_system: 2
};

// we already have such array in the project, but to exclude using the same in prod and test
// we decided to has another for testing
export const refTypes: ReferenceType[] = [
    new ReferenceType(1, 'test'),
    new ReferenceType(2, 'issue'),
    new ReferenceType(3, 'testrun')
];