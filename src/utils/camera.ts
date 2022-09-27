function handleSimulatedZoomEvent(newFeed: Event, callback) {
  if (isCustomEvent(newFeed)) {
    callback({
      width: newFeed.detail.width,
      height: newFeed.detail.height
    });
  }

  function isCustomEvent(event: Event): event is CustomEvent {
    return (event as CustomEvent).detail != undefined;
  }
}
