export class ImportType {
  name: string;
  description: string;
  link: string;
  fileExtension: string;
  
  constructor(name: string, description: string, link: string, fileExtension: string) {
    this.name = name;
    this.description = description;
    this.link = link;
    this.fileExtension = fileExtension;
  }

  getNameAndExtension(){
    return `${ this.name } (${ this.fileExtension })`
  }
}
