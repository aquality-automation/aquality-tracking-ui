import { PubItem } from "./pub-item";

export class PubEntry {
    project_id: number;
    int_system_id: number;
    run_id: number;
    run_ref: string;
    time?: string;
    results: PubItem[];
}
