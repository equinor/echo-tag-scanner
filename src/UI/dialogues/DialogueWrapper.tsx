import { SetActiveTagNo } from '@equinor/echo-framework';
import { TagSummaryDto } from '@equinor/echo-search';
import React from 'react';
import { TagScanner } from '@cameraLogic';
import { SearchResults } from '@ui';
import styled from 'styled-components';

interface DialogueWrapperProps {
  validatedTags?: TagSummaryDto[];
  tagSearch: SetActiveTagNo;
  tagScanner: TagScanner;
  resetValidatedTags: () => void;
}

export const Dialogues = (props: DialogueWrapperProps) => {
  return (
    <>
      <DialogueWrapper id="dialogues">
        {props.validatedTags && (
          <SearchResults
            tagSummary={props.validatedTags}
            onTagSearch={props.tagSearch}
            onClose={() => {
              props.resetValidatedTags();
            }}
          />
        )}
      </DialogueWrapper>
    </>
  );
};

const DialogueWrapper = styled.section`
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 0;
  height: 100%;
  width: 100%;
`;
