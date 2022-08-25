/**
 * This function is assigned to the toString function of MediaStream
 */
export function reportMediaStream(this: MediaStream) {
  return `
      Stream is active: ${this.active}
      ID: ${this.id}
      `;
}

export function reportVideoTrack(this: MediaStreamTrack) {
  return `
        ID: ${this.id}
        Label: ${this.label}
        Is enabled: ${this.enabled}
        Status: ${this.readyState}
        Is Muted: ${this.muted}
    `;
}
