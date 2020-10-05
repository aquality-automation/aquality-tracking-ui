export class ReportOption {
  section: Section;
  name: string;

  constructor(section: Section, name: string) {
    this.section = section;
    this.name = name;
  }
}


export enum Section {
  Result,
  Resolution,
  Other
}
