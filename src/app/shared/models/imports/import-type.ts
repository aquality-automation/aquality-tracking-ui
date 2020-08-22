export class ImportType {
  name: string;
  description: string;
  link: string;
  fileExtension: string;
  isTestNameNodeNeeded: boolean;
  
  constructor(name: string, description: string, link: string, fileExtension: string, isTestNameNodeNeeded: boolean) {
    this.name = name;
    this.description = description;
    this.link = link;
    this.fileExtension = fileExtension;
    this.isTestNameNodeNeeded = isTestNameNodeNeeded;
  }

  getNameAndExtension(){
    return `${ this.name } (${ this.fileExtension })`
  }
}
