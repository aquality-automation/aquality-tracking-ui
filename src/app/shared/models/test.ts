import { TestResult } from './test-result';
import { LocalPermissions } from './local-permissions';
import { TestSuite } from './test-suite';

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
  resolution_colors?: string;
  result_colors?: string;
  result_ids?: string;
}
