import {PossibleFunctionalLocations} from "@types"

type ComputerVisionResponse = {
    language: string;
    textAngle: number;
    orientation: "Up" | "Down" | "Left" | "Right";
    regions: Region[]
    modelVersion: string;
}

type Region = {
    boundingBox: BoundingBox;
    lines: Lines[]
}

type Lines = {
    boundingBox: BoundingBox;
    words: Word[]
}

type Word = {
    boundingBox: BoundingBox;
    text: string;
}

/**
 * example: "462,379,497,258" 
*/
type BoundingBox = string;

type ParsedComputerVisionResponse = PossibleFunctionalLocations;

export type { ComputerVisionResponse, ParsedComputerVisionResponse };