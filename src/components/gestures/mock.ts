/* eslint-disable @typescript-eslint/no-unused-vars */
export const mockedPointerEvent: PointerEvent = {
  clientX: 101,
  pointerId: 1,
  height: 0,
  isPrimary: false,
  pointerType: '',
  pressure: 0,
  tangentialPressure: 0,
  tiltX: 0,
  tiltY: 0,
  twist: 0,
  width: 0,
  getCoalescedEvents: function (): PointerEvent[] {
    throw new Error('Function not implemented.');
  },
  getPredictedEvents: function (): PointerEvent[] {
    throw new Error('Function not implemented.');
  },
  altKey: false,
  button: 0,
  buttons: 0,
  clientY: 0,
  ctrlKey: false,
  metaKey: false,
  movementX: 0,
  movementY: 0,
  offsetX: 0,
  offsetY: 0,
  pageX: 0,
  pageY: 0,
  relatedTarget: null,
  screenX: 0,
  screenY: 0,
  shiftKey: false,
  x: 0,
  y: 0,
  getModifierState: function (keyArg: string): boolean {
    throw new Error('Function not implemented.');
  },
  initMouseEvent: function (
    typeArg: string,
    canBubbleArg: boolean,
    cancelableArg: boolean,
    viewArg: Window,
    detailArg: number,
    screenXArg: number,
    screenYArg: number,
    clientXArg: number,
    clientYArg: number,
    ctrlKeyArg: boolean,
    altKeyArg: boolean,
    shiftKeyArg: boolean,
    metaKeyArg: boolean,
    buttonArg: number,
    relatedTargetArg: EventTarget | null
  ): void {
    throw new Error('Function not implemented.');
  },
  detail: 0,
  view: null,
  which: 0,
  initUIEvent: function (
    typeArg: string,
    bubblesArg?: boolean,
    cancelableArg?: boolean,
    viewArg?: Window | null,
    detailArg?: number
  ): void {
    throw new Error('Function not implemented.');
  },
  bubbles: false,
  cancelBubble: false,
  cancelable: false,
  composed: false,
  currentTarget: null,
  defaultPrevented: false,
  eventPhase: 0,
  isTrusted: false,
  returnValue: false,
  srcElement: null,
  target: null,
  timeStamp: 0,
  type: '',
  composedPath: function (): EventTarget[] {
    throw new Error('Function not implemented.');
  },
  initEvent: function (type: string, bubbles?: boolean, cancelable?: boolean): void {
    throw new Error('Function not implemented.');
  },
  preventDefault: function (): void {
    throw new Error('Function not implemented.');
  },
  stopImmediatePropagation: function (): void {
    throw new Error('Function not implemented.');
  },
  stopPropagation: function (): void {
    throw new Error('Function not implemented.');
  },
  AT_TARGET: 0,
  BUBBLING_PHASE: 0,
  CAPTURING_PHASE: 0,
  NONE: 0
};
