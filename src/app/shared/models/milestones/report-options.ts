import {ReportOption, Section} from './report-option';

export class ReportOptions {
  static issues_list: ReportOption = new ReportOption(Section.Other, 'Issue List');
  static results_failed: ReportOption = new ReportOption(Section.Result, 'Failed');
  static results_passed: ReportOption = new ReportOption(Section.Result, 'Passed');
  static results_other: ReportOption = new ReportOption(Section.Result, 'Other');
  static results_or_resolutions: ReportOption = new ReportOption(Section.Result, 'AND');
  static resolutions_app_issue: ReportOption = new ReportOption(Section.Resolution, 'App Issue');
  static resolutions_test_issue: ReportOption = new ReportOption(Section.Resolution, 'Test Issue');
  static resolutions_other: ReportOption = new ReportOption(Section.Resolution, 'Other');
  static resolutions_not_executed: ReportOption = new ReportOption(Section.Resolution, 'Not Executed');
  static trend_chart_show: ReportOption = new ReportOption(Section.Other, 'Show Chart');
}

