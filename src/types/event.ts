export type CustomNotificationDetail = {
  message: string;
  autohideDuration?: number;
};

export type ZoomEventDetail = {
  zoomFactor: number;
  type?: 'simulated' | 'native';
};
