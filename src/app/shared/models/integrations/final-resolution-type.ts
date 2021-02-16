export class FinalResolutionType {
    name: string;

    constructor(name: string){
        this.name = name;
    }
}

export const finalResolutionTypes = {
    FinalResult: new FinalResolutionType("finalResult"),
    Resolution: new FinalResolutionType("resolution")
}