interface OCRFilterer {
  hasTwoIntegers: (word: string) => boolean;
  hasEnoughCharacters: (word: string) => boolean;
  /** Matches characters on letters A-Z, 0-9 and the special chars "_", "-". */
  lettersAreValid: (word: string) => boolean;
  isMotorTag: (word: string) => boolean;
}
const filterer: OCRFilterer = Object.create(null);

filterer.hasTwoIntegers = function containsAtLeastTwoNumericCharacters(
  word: string
) {
  return (
    Array.from(word).filter(
      (letter) =>
        letter !== ' ' && //Whitespaces will be coerced to a zero.
        Number.isInteger(Number(letter))
    ).length >= 2
  );
};

filterer.hasEnoughCharacters = function isAtLeast4Characters(word: string) {
  return word.length >= 4;
};

filterer.lettersAreValid = function hasValidLettering(word: string): boolean {
  return stripEscapees(word).match(/[A-Z0-9\_\-]/g)?.length === word.length;

  //TODO: Handle other types of escapes besides the general forwardslash.
  /** Strips escape characters from the word. */
  function stripEscapees(unescapedWord: string) {
    return Array.from(unescapedWord)
      .filter((w) => w !== '\\')
      .join('');
  }
};

filterer.isMotorTag = function isMotorTag(word: string) {
  return word.match(/(\(M)\)/g)?.join('') === '(M)';
};

export { filterer };
