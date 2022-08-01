import React, { useEffect } from 'react';
import styled from 'styled-components';

import { Button, Scrim } from '@equinor/eds-core-react';
import { TagContextMenu, TagIcon, getIcon } from '@equinor/echo-components';
import { getLegendStatusColor } from '@equinor/echo-framework';
import { TagSummaryDto } from '@equinor/echo-search';
import { logger } from '@utils';

interface SearchResultsProps {
  tagSummary: TagSummaryDto[];
  onTagSearch: (tagNumber: string) => void;
  onClose: () => void;
}

const SearchResults = (props: SearchResultsProps): JSX.Element => {
  // Log new tag summaries as they arrive.
  // TODO: Make this only run in non-prod envs.
  useEffect(() => {
    function logTagSummaries() {
      if (props.tagSummary.length > 0) {
        logger.log('Info', () => {
          console.group(
            'This information will only be logged when LogLevel is Info'
          );
          props.tagSummary.forEach((tag) => console.table(tag));
          console.groupEnd();
        });
      }
    }

    logTagSummaries();
  }, [props.tagSummary]);

  function createSearchResult(tag: TagSummaryDto, index: number) {
    return (
      // Ignoring a non-optional (setExpanded) prop as there is
      // no need to handle expanded states.
      //@ts-ignore
      <SearchResult
        key={index}
        expanded
        openTagInformation={() => props.onTagSearch(tag.tagNo)}
        tagNo={tag.tagNo}
        selected={false}
      >
        <TagIcon
          icon={getIcon(tag.tagCategoryDescription)}
          legendColor={getLegendStatusColor(tag.tagStatus)}
        />
      </SearchResult>
    );
  }

  if (props.tagSummary.length > 0) {
    return (
      <Scrim open>
        <InvisibleWrapper>
          {props.tagSummary.map(createSearchResult)}
          <ScanAgainButton variant="contained" onClick={props.onClose}>
            <ButtonLabel>Scan again</ButtonLabel>
          </ScanAgainButton>
        </InvisibleWrapper>
      </Scrim>
    );
  } else {
    return (
      <Scrim open>
        <NoSearchResultsWrapper>
          <NoSearchResultsMessage>No tags detected.</NoSearchResultsMessage>
          <ScanAgainButton variant="contained" onClick={props.onClose}>
            <ButtonLabel>Scan again</ButtonLabel>
          </ScanAgainButton>
        </NoSearchResultsWrapper>
      </Scrim>
    );
  }
};

const ButtonLabel = styled.span`
  white-space: nowrap;
`;

const NoSearchResultsMessage = styled.p``;

const ScanAgainButton = styled(Button)``;

const DialogContentWrapper = styled.div`
  pointer-events: all;

  display: flex;
  flex-direction: column;
`;

const InvisibleWrapper = styled(DialogContentWrapper)`
  gap: var(--medium);
`;

const NoSearchResultsWrapper = styled(DialogContentWrapper)`
  background-color: var(--white);
  justify-content: center;
  z-index: 2;
  height: auto;
  padding: var(--medium);
`;

const SearchResult = styled(TagContextMenu)`
  margin-bottom: var(--small);
`;

export { SearchResults };
