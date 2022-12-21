type HomoglyphPair = {
  /** A control character which is recognized as a false-positive. */
  homoglyph: string;
  /** A substitution character for the false-positive. */
  substitution: string;
};

const homoglyphPairs: HomoglyphPair[] = [
  { homoglyph: '฿', substitution: 'B' },
  { homoglyph: '<', substitution: 'C' },
  { homoglyph: '©', substitution: 'C' },
  { homoglyph: '€', substitution: 'C' },
  { homoglyph: '[', substitution: 'I' },
  { homoglyph: '}', substitution: 'J' },
  { homoglyph: ']', substitution: 'J' },
  { homoglyph: ')', substitution: 'J' },
  { homoglyph: '£', substitution: 'L' },
  { homoglyph: '₽', substitution: 'P' },
  { homoglyph: 'Ⓡ', substitution: 'R' },
  { homoglyph: '&', substitution: 'R' },
  { homoglyph: '?', substitution: 'S' },
  { homoglyph: '§', substitution: 'S' },
  { homoglyph: '¿', substitution: 'S' },
  { homoglyph: '$', substitution: 'S' },
  { homoglyph: '±', substitution: 'T' },
  { homoglyph: 'µ', substitution: 'U' },
  { homoglyph: '¥', substitution: 'Y' },
  { homoglyph: '|', substitution: '1' },
  { homoglyph: '!', substitution: '1' },
  { homoglyph: '?', substitution: '2' },
  { homoglyph: '>', substitution: '7' }
];
Object.preventExtensions(homoglyphPairs);

export { homoglyphPairs };
