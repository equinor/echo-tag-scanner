import React, { useEffect } from 'react';
import styled from 'styled-components';
import { Button, Dialog, Scrim } from '@equinor/eds-core-react';
import { TagContextMenu, TagIcon, getIcon } from '@equinor/echo-components';
import { getLegendStatusColor } from '@equinor/echo-framework';
import { TagSummaryDto } from '@equinor/echo-search';

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
      console.group('This tag data is used for presentation');
      if (props.tagSummary.length > 0) {
        props.tagSummary.forEach((tag) => console.table(tag));
      }

      console.groupEnd();
    }

    logTagSummaries();
  }, [props.tagSummary]);

  function createSearchResult(tag: TagSummaryDto, index: number) {
    return (
      //@ts-ignore
      // Ignoring a non-optional (setExpanded) prop as there is
      // no need to handle expanded states.

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
      <NoSearchResultsWrapper open>
        <NoSearchResultsMessage>No tags detected.</NoSearchResultsMessage>
        <ScanAgainButton variant="contained" onClick={props.onClose}>
          <ButtonLabel>Scan again</ButtonLabel>
        </ScanAgainButton>
      </NoSearchResultsWrapper>
    );
  }
};

const ButtonLabel = styled.span`
  white-space: nowrap;
`;

const NoSearchResultsMessage = styled.p`
  background-color: var(--white);
`;

const ScanAgainButton = styled(Button)``;

const InvisibleWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--medium);
`;

const NoSearchResultsWrapper = styled(Dialog)`
  justify-content: center;
  z-index: 2;
  width: 100%;
  height: auto;
  padding: var(--medium);
  max-width: unset !important;
`;

const SearchResult = styled(TagContextMenu)`
  margin-bottom: var(--small);
`;

export { SearchResults };
