export class ResolutionType {
    id: number;
    title: string;
    color: number;

    constructor(id: number, title: string) {
        this.id = id;
        this.title = title;
        this.color = id;
    }
}

export const resolutionTypes = {
    Danger: new ResolutionType(1, 'Danger'),
    Warning: new ResolutionType(2, 'Warning'),
    Primary: new ResolutionType(3, 'Primary'),
    Info: new ResolutionType(4, 'Info'),
    Success: new ResolutionType(5, 'Success')
}

export const resolutionTypesArray = [
    resolutionTypes.Danger,
    resolutionTypes.Warning,
    resolutionTypes.Primary,
    resolutionTypes.Info,
    resolutionTypes.Success
]