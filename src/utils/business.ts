type ExtractedFunctionalLocation = {
  sapPlantId?: number;
  tagNumber?: string;
};

export function extractFunctionalLocation(input: string): ExtractedFunctionalLocation {
  const parts = input.split('-');
  const extract: ExtractedFunctionalLocation = {
    sapPlantId: undefined,
    tagNumber: undefined
  };

  if (parts[0] != null) {
    extract.sapPlantId = Number(parts[0]);
  }

  if (parts[1] != null) {
    extract.tagNumber = parts[1];
  }

  return extract;
}
