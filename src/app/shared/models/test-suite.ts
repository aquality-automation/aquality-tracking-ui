import { Test } from './test';

export class TestSuite {
  name?: string;
  id?: number;
  project_id?: number;
  tests?: Test[];

  static getCreateDashboardDtos(suites: TestSuite[]): TestSuite[] {
    let suiteDtos: TestSuite[] = [];
    suites.forEach(suite => {
      suiteDtos.push(TestSuite.getCreateDashboardDto(suite));
    });
    return suiteDtos;
  }

  static getCreateDashboardDto(suite: TestSuite): TestSuite {
      return { id: suite.id, name: suite.name, project_id: suite.project_id };
  }
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
  detailed: boolean | number;
  name: string;
  suites: TestSuite[];
  notDeletable?: boolean;
}
