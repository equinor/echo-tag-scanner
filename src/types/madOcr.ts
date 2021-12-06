interface MadOCRStatus {
  system: string;
  ok: boolean;
  dependencies: Array<MadOCRDependencies>;
}

interface MadOCRFunctionalLocations {
  results: string[];
}

interface MadOCRDependencies {
  name: string;
  description: string;
  ok: boolean;
  errorText: string;
}

export type { MadOCRStatus, MadOCRFunctionalLocations };
