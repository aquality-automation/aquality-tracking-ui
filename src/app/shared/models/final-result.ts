export class FinalResult {
  name?: string;
  id?: number;
  color?: number;
}

export const finalResultNames = {
  Failed: 'failed',
  Passed: 'passed',
  NotExecuted: 'not executed',
  InProgress: 'in progress',
  Pending: 'pending'
}