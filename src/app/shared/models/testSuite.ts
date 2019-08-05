import { Test } from './test';

export class TestSuite {
  name?: string;
  id?: number;
  project_id?: number;
  tests?: Test[];
}

export class TestSuiteStat {
  id?: number;
  name?: number;
  developer_id?: number;
  total_runs?: number;
  passed?: number;
  failed?: number;
  app_issue?: number;
  autotest_issue?: number;
  resolution_na?: number;
}

export class SuiteDashboard {
  id?: number;
  project_id?: number;
  detailed: boolean|number;
  name: string;
  suites: TestSuite[];
  notDeletable?: boolean;
}
