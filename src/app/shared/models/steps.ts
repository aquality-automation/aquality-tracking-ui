import { FinalResult } from './final-result';

export class Step {
    id?: number;
    name?: string;
    type?: StepType;
    type_id?: number;
    project_id?: number;
    order?: number;
    link_id?: number;
}

export class StepType {
    id?: number;
    name?: string;
}

export class StepToTest {
    step_id?: number;
    test_id?: number;
    order?: number;
    project_id?: number;
}

export class StepResult {
    id?: number;
    name?: string;
    type?: StepType;
    type_id?: number;
    project_id?: number;
    order?: number;
    result_id?: number;
    final_result_id?: number;
    final_result?: FinalResult;
    log?: string;
    start_time?: string | Date;
    finish_time?: string | Date;
    comment?: string;
    attachment?: string;
}
