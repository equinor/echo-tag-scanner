type ComputerVisionResponse = {
  language: string;
  textAngle: number;
  orientation: 'Up' | 'Down' | 'Left' | 'Right';
  regions: Region[];
  modelVersion: string;
};

type Region = {
  boundingBox?: BoundingBox;
  lines: Lines[];
};

export type Lines = {
  boundingBox?: BoundingBox;
  words: Word[];
};

export type Word = {
  boundingBox?: BoundingBox;
  text: string;
};

export type MockWord = Pick<Word, 'text'>;


/**
 * example: "462,379,497,258"
 */
type BoundingBox = string;

type ParsedComputerVisionResponse = string[];

export type { ComputerVisionResponse, ParsedComputerVisionResponse };
