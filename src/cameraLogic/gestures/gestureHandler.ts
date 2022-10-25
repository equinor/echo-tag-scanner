import { PointerEvent } from 'react';
import { ZoomSteps } from '@types';
import { TagScanner } from '@cameraLogic';

interface TouchEvent extends PointerEvent<HTMLElement> {}

type ZoomGestureHandlerProps = {
  tagScanner: TagScanner;
};

/** Represents the base logic for different kinds of gestures the user performs on the viewfinder. */
class ZoomGestureHandler {
  private _tagScanner: TagScanner;
  private _savedLatestTouch: TouchEvent | undefined;
  private readonly _doubleTapThreshold = 300; //ms
  private _currentZoom: ZoomSteps = 1;

  constructor(props: ZoomGestureHandlerProps) {
    this._tagScanner = props.tagScanner;
  }

  public handleTouch(latestTouchEvent: TouchEvent) {
    if (this.isDoubleTap(latestTouchEvent)) {
      this.handleZoom();
    }

    this._savedLatestTouch = latestTouchEvent;
  }

  private handleZoom() {
    if (this._currentZoom === 1) {
      this._tagScanner.alterZoom(2);
      this._currentZoom = 2;
    } else if (this._currentZoom === 2) {
      this._tagScanner.alterZoom(1);
      this._currentZoom = 1;
    }
  }

  /**
   * Returns true if the user has just done a double tap gesture.
   */
  private isDoubleTap(latestTouchEvent?: TouchEvent) {
    if (this._savedLatestTouch && latestTouchEvent) {
      return (
        latestTouchEvent.timeStamp - this._savedLatestTouch.timeStamp <
        this._doubleTapThreshold
      );
    }

    return false;
  }
}

export { ZoomGestureHandler };
