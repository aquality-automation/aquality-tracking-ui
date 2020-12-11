export class ChunkedData {
    data: any[];
    chunkSize: number;

  constructor(data: any[], chunkSize: number) {
    this.data = data;
    this.chunkSize = chunkSize;
  }    
}