import { ChunkedData } from './chunked.data';


export class CollectionsService {
  constructor() { }

  static chunk(data: any[], size: number) : ChunkedData {
    let result = []
    for (let i = 0; i < data.length; i += size) {
      let chunk = data.slice(i, i + size)
      result.push(chunk)
    }
    return new ChunkedData(result, size);
  }
}
