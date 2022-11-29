interface OCRFilterer {
  /** Returns true if the word contains at least two integers. */
  hasTwoIntegers: (word: string) => boolean;
  /** Returns true if the word length is at least 4 characters. */
  hasEnoughCharacters: (word: string) => boolean;
  /** Matches characters on letters A-Z, 0-9 and the special chars "_", "-". */
  lettersAreValid: (word: string) => boolean;
  /** Returns true if the word is determined to be a motor tag (contains the phrase '(M)') */
  isMotorTag: (word: string) => boolean;
  /** Strips out the leading character in the word if it isn't an uppercase A-Z or a number 0-9. */
  filterLeadingChar: (word: string) => string;
  /** Strips out the trailing character in the word if it isn't an uppercase A-Z or a number 0-9. */
  filterTrailingChar: (word: string) => string;
}
const ocrFilterer: OCRFilterer = Object.create(null);
const numberOfIntegersLowerThreshold = 2;
const minLetters = 4;

ocrFilterer.hasTwoIntegers = function (word: string) {
  return (
    Array.from(word).filter(
      (letter) =>
        letter !== ' ' && //Whitespaces will be coerced to a zero.
        Number.isInteger(Number(letter))
    ).length >= numberOfIntegersLowerThreshold
  );
};

ocrFilterer.hasEnoughCharacters = function (word: string) {
  return word.length >= minLetters;
};

ocrFilterer.lettersAreValid = function (word: string): boolean {
  return stripEscapees(word).match(/[A-Z0-9\_\-]/g)?.length === word.length;

  //TODO: Handle other types of escapes besides the general forwardslash.
  /** Strips escape characters from the word. */
  function stripEscapees(unescapedWord: string) {
    return Array.from(unescapedWord)
      .filter((w) => w !== '\\')
      .join('');
  }
};

ocrFilterer.isMotorTag = function (word: string) {
  return word.match(/(\(M)\)/g)?.join('') === '(M)';
};

ocrFilterer.filterLeadingChar = function (word: string) {
  if (word.charAt(0).match(/[^A-Z ^0-9]/g)) return word.substring(1);
  else return word;
};

ocrFilterer.filterTrailingChar = function (word: string) {
  if (word.charAt(word.length - 1).match(/[^A-Z ^0-9]/g))
    return word.substring(0, word.length - 1);
  else return word;
};

export { ocrFilterer };
