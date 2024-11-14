export class JsonStreamer {
  private static readonly MAX_CHUNK_SIZE = 50 * 1024; // 50kb chunk size

  static async* streamify(data: any): AsyncGenerator<any> {
    const serialized = JSON.stringify(data);
    let position = 0;

    while (position < serialized.length) {
      const chunk = serialized.slice(position, position + this.MAX_CHUNK_SIZE);
      position += this.MAX_CHUNK_SIZE;
      yield chunk;
    }
  }

  static calculateProgress(position: number, total: number): number {
    return Math.min(100, (position / total) * 100);
  }
}