export class CountdownLatch {
  private limit: number;
  private count: number;
  private waitBlock: () => void;

  constructor(limit: number) {
    this.limit = limit;
    this.count = 0;
    this.waitBlock = function () {};
  }

  public countDown() {
    this.count = this.count + 1;
    if (this.limit <= this.count) {
      return this.waitBlock();
    }
  }

  public await(callback: () => void) {
    this.waitBlock = callback;
  }
}
