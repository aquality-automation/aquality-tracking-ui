import {ReportOption} from './report-option';

export  class ReportToggle {
  option: ReportOption;
  state: boolean;

  constructor(option: ReportOption, state: boolean) {
    this.option = option;
    this.state = state;
  }
}
