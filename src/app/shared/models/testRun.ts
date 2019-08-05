import { TestResult } from './test-result';
import { Milestone } from './milestone';
import { TestSuite } from './testSuite';

export class TestRun {
  test_suite_id?: number;
  test_suite?: TestSuite;
  start_time?: Date;
  project_id?: number;
  milestone_id?: number;
  milestone?: Milestone;
  execution_environment?: string;
  id?: number;
  build_name?: string;
  milestone_name?: string;
  testsuite_name?: string;
  finish_time?: Date;
  debug?: number;
  author?: string;
  testResults?: TestResult[];
  label?: TestRunLabel;
  label_id?: number;
  ci_build?: string;
}

export class TestRunLabel {
  id?: number;
  name?: string;
  color?: string;
}
