import { TestResult } from './test-result';
import { LocalPermissions } from './LocalPermissions';
import { TestSuite } from './testSuite';

export class Test {
  id?: number;
  name?: string;
  body?: string;
  test_suite_id?: number;
  project_id?: number;
  manual_duration?: number;
  developer?: LocalPermissions;
  developer_id?: number;
  results?: TestResult[];
  suites?: TestSuite[];
}
