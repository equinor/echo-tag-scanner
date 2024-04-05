import { TextItem } from '../types';
import { ocrFilterer } from './filtering';

export function reassembleOrdinaryTagCandidates<T extends TextItem>(
  words: T[]
): T[] {
  let clonedWords = structuredClone<T[]>(words);
  clonedWords = clonedWords.filter((w) => w.text);

  let reassembledTagCandidates: T[] = [];
  let preAssembledTagCandidates: T[] = [];

  /**
   * Before assembly, record any indices which are already valid tag candidates.
   */
  clonedWords.forEach((word) => {
    if (isValidTagCandidate(word.text)) {
      if (!preAssembledTagCandidates.find((t) => t.text === word.text)) {
        preAssembledTagCandidates.push(word);
      }
    }
  });

  let assembledTag = '';

  for (let i = 0; i < clonedWords.length; i++) {
    if (clonedWords.at(i)) {
      if (clonedWords[i].text !== assembledTag) {
        assembledTag += clonedWords[i].text;
        if (isValidTagCandidate(assembledTag)) {
          if (!clonedWords.find((word) => word.text === assembledTag)) {
            reassembledTagCandidates.push({
              ...clonedWords[i],
              text: assembledTag
            } as T);
          }
        }
      }
    }
  }

  return [...preAssembledTagCandidates, ...reassembledTagCandidates];
}

export function reassembleSpecialTagCandidates<T extends TextItem>(
  words: T[],
  identifier: string
): T[] {
  const clonedWords = structuredClone<T[]>(words);
  const identifierIndex = clonedWords.findIndex((w) =>
    w.text.includes(identifier)
  );
  const specialTagCandidates: T[] = clonedWords.filter(
    (word) =>
      word.text.includes(identifier) && isValidSpecialTagCandidate(word.text)
  );
  /**
   * To simplify, we slice up until, and including, the first occurence of (M).
   * In this way, identifierIndex always refers to the last indice in the relevant words.
   * - For example, on first run, ["foo", "bar", "(M)", "baz", "(M)"] becomes ["foo", "bar", "M"]
   */
  const relevantWords = clonedWords.slice(0, identifierIndex + 1);

  let assembledSpecialCandidate: string = '';
  const identifierWord: T = relevantWords[identifierIndex];
  /**
   * Here we do a series of string concats while looping backwards in the word array.
   * ["foo", "bar", "(M)", "baz", "(M)"] <-- We start from the first occurence of (M) and concat backwards.
   */
  for (let i = identifierIndex; i >= 0; i--) {
    if (relevantWords[i - 1]?.text) {
      assembledSpecialCandidate =
        relevantWords[i - 1].text + assembledSpecialCandidate;
      if (isValidSpecialTagCandidate(assembledSpecialCandidate)) {
        const clonedIdentifier = structuredClone<T>(identifierWord);
        clonedIdentifier.text = assembledSpecialCandidate + identifierWord.text;
        specialTagCandidates.push(clonedIdentifier);
      }

      /** We have no more strings to concat. */
      if (i === 0) break;
      /**
       * We continue building words. During this loop, a word is never built from scratch again.
       * For example, given the word array ["foo", "bar", "baz", "M"], we have constructed the word
       * "barbaz(M)" which has been recorded as a valid candidate. At this point, i is equal to 1, so
       * we can extend the previous candidate so that we record another candidate with the string
       * "foobarbaz(M)".
       */ else continue;
    }
  }

  return specialTagCandidates;
}

function isValidTagCandidate(candidate: string) {
  return (
    ocrFilterer.hasTwoIntegers(candidate) &&
    ocrFilterer.lettersAreValid(candidate) &&
    ocrFilterer.hasEnoughCharacters(candidate)
  );
}

function isValidSpecialTagCandidate(candidate: string) {
  return (
    ocrFilterer.hasTwoIntegers(candidate) &&
    ocrFilterer.hasEnoughCharacters(candidate)
  );
}
