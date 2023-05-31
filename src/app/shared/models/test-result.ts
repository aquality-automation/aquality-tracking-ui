import { FinalResult } from './final-result';
import { Test } from './test';
import { StepResult } from './steps';
import { Issue } from './issue';
import { IEntityId } from './i-entity-id';

export class TestResult implements IEntityId {
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
  attachments?: TestResultAttachment[];
}

export class TestResultStat {
  test_run_id?: number;
  test_run_started?: Date;
  name?: string;
  status?: string;
  resolution?: string;
  issue_id?: string;
  issue_title?: string;
}

export class TestResultAttachment {
  id?: number;
  path?: string;
  test_result_id?: number;
  project_id?: number;
  link?: string;
  name?: string;
  attachment?: string | ArrayBuffer;
  mimeType?: string;
}
