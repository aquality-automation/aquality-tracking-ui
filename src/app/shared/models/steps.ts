export class Step {
    id?: number;
    name?: string;
    type?: StepType;
    type_id?: number;
    project_id?: number;
    order?: number;
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
