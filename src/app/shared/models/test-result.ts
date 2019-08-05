import { User } from './user';
import { ResultResolution } from './result_resolution';
import { FinalResult } from './final-result';
import { LocalPermissions } from './LocalPermissions';
import { Test } from './test';

export class TestResult {
  id?: number;
  project_id?: number;
  test?: Test;
  test_id?: number;
  final_result?: FinalResult;
  final_result_id?: number;
  comment?: string;
  test_run_id?: number;
  test_resolution?: ResultResolution;
  test_resolution_id?: number;
  debug?: number;
  updated?: Date;
  log?: string;
  start_date?: string;
  finish_date?: string;
  final_result_updated?: Date;
  fail_reason?: string;
  assigned_user?: LocalPermissions;
  assignee?: number;
}

export class TestResultStat {
  test_run_id?: number;
  test_run_started?: Date;
  name?: string;
  status?: string;
  resolution?: string;
  assignee?: string;
  developer?: string;
  comment?: string;
}
