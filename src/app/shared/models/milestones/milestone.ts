import { TestSuite } from '../test-suite';

export class Milestone {
  id?: number;
  name?: string;
  project_id?: number;
  suites?: TestSuite[];
  active?: boolean | number;
  due_date?: Date;
}
