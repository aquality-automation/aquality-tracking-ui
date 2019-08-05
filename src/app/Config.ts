import { environment } from '../environments/environment';
export class Config {
    public ApiHost: string = environment.host;
}
