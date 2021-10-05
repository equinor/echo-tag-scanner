/**
 * For some reason, MediaTrackSupportedConstraints is missing zoom.
 */
interface ExtendedMediaTrackSupportedConstraints extends MediaTrackSupportedConstraints {
  zoom?: boolean;
  torch?: boolean;
}

/**
 * For some reason, MediaTrackCapabilities is missing zoom.
 */
interface ExtendedMediaTrackCapabilities extends MediaTrackCapabilities {
  zoom?: {
    min: number;
    max: number;
    step: number;
  };
}

interface ExtendedMediaTrackSettings extends MediaTrackSettings {
  zoom?: number;
}

export type {
  ExtendedMediaTrackSupportedConstraints,
  ExtendedMediaTrackCapabilities,
  ExtendedMediaTrackSettings
};
