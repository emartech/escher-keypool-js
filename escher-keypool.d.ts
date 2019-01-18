declare class KeyPool {
  static create(json: string): KeyPool;
  getActiveKey(keyId: string): string;
  getKeyDb(): () => KeyPool;
}
export = KeyPool;
