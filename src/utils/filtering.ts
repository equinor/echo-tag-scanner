interface OCRFilterer {
  /**
   * Returns true if the word contains at least two integers.
   * @param {string} word Any non-empty string
   * @returns {boolean} Returns true if the word contains at least two integers.
   * */
  hasTwoIntegers: (word: string) => boolean;
  /**
   * Returns true if the word length is at least 4 characters.
   * @param {string} word Any non-empty string.
   * @returns {boolean} Returns true if the word has at least 4 characters.
   * */
  hasEnoughCharacters: (word: string) => boolean;
  /**
   * Matches characters on letters A-Z, 0-9 and the special chars "_", "-".
   * @param {string} word Any non-empty string.
   * @returns {boolean} Returns true if the letters are valid.
   */
  lettersAreValid: (word: string) => boolean;
  /**
   * Returns true if the word is determined to be a motor tag (contains the phrase '(M)')
   * @param {string} word Any non-empty string.
   * @returns {boolean} Returns true if the provided word is a motor tag candidate.
   */
  isMotorTag: (word: string) => boolean;
  /**
   * Strips out the leading and trailing characters in the word if it isn't an uppercase A-Z, or a number 0-9, or the provided exceptions.
   * @param {string} word Any non-empty string.
   * @param {string} exceptions Any characters that should be excempted, for example "()/".
   */
  filterTrailingAndLeadingChars: (word: string, exceptions?: string) => string;
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
  return stripEscapees(word).match(/[A-Z0-9\_\-\"\.]/g)?.length === word.length;

  /** Strips escape characters from the word. */
  function stripEscapees(unescapedWord: string) {
    return Array.from(unescapedWord)
      .filter((w) => w !== '\\')
      .join('');
  }
};

ocrFilterer.filterTrailingAndLeadingChars = function (
  word: string,
  exceptions?: string
) {
  const regexp = new RegExp(`[^A-Z ^0-9 ^${exceptions ? exceptions : ''}]`);
  let filteredWord = word;

  // Conditionally remove leading character.
  if (word.charAt(0).match(regexp)) filteredWord = filteredWord.substring(1);

  // Conditionally remove trailing character.
  const lastIndex = filteredWord.length - 1;
  if (typeof lastIndex === 'number') {
    if (word.charAt(lastIndex).match(regexp)) {
      filteredWord = filteredWord.substring(0, lastIndex);
    }
  }
  return filteredWord;
};

ocrFilterer.isMotorTag = function (word: string) {
  return word.match(/(\(M)\)/g)?.join('') === '(M)';
};

export { ocrFilterer };
