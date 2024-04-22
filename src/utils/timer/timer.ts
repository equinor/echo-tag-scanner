interface TimerProps {
  maxTime?: number;
}

export class Timer {
  /** Time elapsed is stored as milliseconds. */
  private _timeElapsed = 0;
  private _startTime?: Date;

  /** We use a max time for the timer to avoid it counting "forever".
   * This value is configurable during construction.
   */
  private _maxTime = 2000;
  private _timerId?: NodeJS.Timeout;

  constructor(props?: TimerProps) {
    if (typeof props?.maxTime === 'number') this._maxTime = props.maxTime;
  }

  public get timeElapsed() {
    return this._timeElapsed;
  }

  public start(): void {
    if (!this._timerId) {
      this._startTime = new Date();

      this._timerId = globalThis.setTimeout(() => {
        this._timeElapsed = this.stop();
        console.warn(
          'A timer has exceeded its max time at ',
          this._timeElapsed
        );
      }, this._maxTime);
    } else console.info('A timer is already active.');
  }

  /** Stops the timer.
   * @returns {number} The time elapsed without decimal points.
   */
  public stop(): number {
    if (this._timerId) {
      clearTimeout(this._timerId);
      this._timerId = undefined;
    }
    if (this._startTime) {
      this._timeElapsed = Date.now() - this._startTime.getTime();
    }
    return Math.floor(this._timeElapsed);
  }
}
