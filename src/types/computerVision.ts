export type ComputerVisionResponse = {
  version: string;
  modelVersion: string;
  readResults: ReadResult[];
};

export type ReadResult = {
  angle: number;
  lines: Line[];
};

export type Line = {
  boundingBox: BoundingBox;
  text: string;
  words: Word[];
};

export type Word = {
  boundingBox?: BoundingBox;
  text: string;
  condfidence?: number;
};

export type MockWord = Pick<Word, 'text'>;

export type ComputerVisionResponseLegacy = {
  language: string;
  textAngle: number;
  orientation: 'Up' | 'Down' | 'Left' | 'Right';
  regions: RegionLegacy[];
  modelVersion: string;
};

export type RegionLegacy = {
  boundingBox?: BoundingBox;
  lines: LinesLegacy[];
};

export type LinesLegacy = {
  boundingBox?: BoundingBox;
  words: WordLegacy[];
};

export type WordLegacy = {
  boundingBox?: BoundingBox;
  text: string;
};

/**

 * example: "462,379,497,258"
 */
type BoundingBox = number[];

export type ParsedComputerVisionResponse = string[];
