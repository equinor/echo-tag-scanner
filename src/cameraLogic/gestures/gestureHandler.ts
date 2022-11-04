import { PointerEvent } from 'react';
import { ZoomSteps } from '@types';
import { TagScanner } from '@cameraLogic';
import { logger } from '@utils';

interface TouchEvent extends PointerEvent<HTMLElement> {}

type ZoomGestureHandlerProps = {
  tagScanner: TagScanner;
};

/** Represents the base logic for different kinds of gestures the user performs on the viewfinder. */
class ZoomGestureHandler {
  private _tagScanner: TagScanner;
  private _savedLatestTouch: TouchEvent | undefined;
  private readonly _doubleTapThresholdMs = { max: 300, min: 100 };
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
    // We make the compiler ignore these since the statements below will ensure the numbers are within ZoomSteps.
    //@ts-ignore
    const nextZoom: ZoomSteps = this._currentZoom + 1;
    //@ts-ignore
    const maxZoom: ZoomSteps = this._tagScanner.zoomMethod.max;

    const minZoom: ZoomSteps = this._tagScanner.zoomMethod.min;

    if (this._tagScanner.zoomMethod.type === 'native') {
      if (nextZoom >= minZoom && nextZoom < maxZoom) {
        this._tagScanner.alterZoom(nextZoom);
        this._currentZoom = nextZoom;
      } else if (nextZoom === maxZoom) {
        this._tagScanner.alterZoom(minZoom);
        this._currentZoom = minZoom;
      }
    } else if (this._tagScanner.zoomMethod.type === 'simulated') {
      if (this._currentZoom === 1) {
        this._tagScanner.alterZoom(2);
        this._currentZoom = 2;
      } else if (this._currentZoom === 2) {
        this._tagScanner.alterZoom(1);
        this._currentZoom = 1;
      }
    } else {
      logger.log('QA', () =>
        console.warn(
          'A zoom action was attempted with a gesture, but no method of zooming has been established.'
        )
      );
    }
  }

  /**
   * Returns true if the user has just done a double tap gesture.
   */
  private isDoubleTap(latestTouchEvent?: TouchEvent) {
    if (this._savedLatestTouch && latestTouchEvent) {
      const timeBetweenTouches =
        latestTouchEvent.timeStamp - this._savedLatestTouch.timeStamp;
      return (
        // The threshold for the second touch. If too long, it will be distinguished as a seperate touch.
        timeBetweenTouches <= this._doubleTapThresholdMs.max &&
        // The minimum threshold. If this is lower, it is treated as a multi-touch instead.
        timeBetweenTouches >= this._doubleTapThresholdMs.min
      );
    }

    return false;
  }
}

export { ZoomGestureHandler };
