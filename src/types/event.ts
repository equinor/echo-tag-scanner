export type CustomNotificationDetail = {
  message: string;
  autohideDuration?: number;
};

export type ZoomEventDetail = {
  zoomFactor: number;
  type?: 'simulated' | 'native';
};

export type NewCaptureEventDetail = {
  url: string;
  size: number;
};
