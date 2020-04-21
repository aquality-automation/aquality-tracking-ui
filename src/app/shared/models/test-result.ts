import { FinalResult } from './final-result';
import { Test } from './test';
import { StepResult } from './steps';
import { Issue } from './issue';

export class TestResult {
  id?: number;
  project_id?: number;
  test?: Test;
  test_id?: number;
  final_result?: FinalResult;
  final_result_id?: number;
  test_run_id?: number;
  debug?: number;
  updated?: Date;
  log?: string;
  start_date?: string | Date;
  finish_date?: string;
  final_result_updated?: Date;
  fail_reason?: string;
  fail_reason_regex?: string;
  limit?: number;
  steps?: StepResult[];
  issue_id?: number;
  issue?: Issue;
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
