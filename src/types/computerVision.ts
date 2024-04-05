export type MockWord = Pick<TextItem, 'text'>;

export type TextItem = {
  text: string;
};
export type ParsedComputerVisionResponse = TextItem[];
