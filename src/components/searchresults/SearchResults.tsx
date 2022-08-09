import React, { useEffect } from 'react';
import styled from 'styled-components';
import { getNotificationDispatcher as dispatchNotification } from '@utils';
import { Button } from '@equinor/eds-core-react';
import { TagContextMenu, TagIcon, getIcon } from '@equinor/echo-components';
import { getLegendStatusColor } from '@equinor/echo-framework';
import { TagSummaryDto } from '@equinor/echo-search';
import { logger } from '@utils';
import { EchoEnv } from '@equinor/echo-core';

interface SearchResultsProps {
  tagSummary: TagSummaryDto[];
  onTagSearch: (tagNumber: string) => void;
  onClose: () => void;
}

const SearchResults = (props: SearchResultsProps): JSX.Element | null => {
  // Log new tag summaries as they arrive.
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

    EchoEnv.isDevelopment() && logTagSummaries();
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
      <InvisibleWrapper>
        {props.tagSummary.map(createSearchResult)}
        <Button variant="contained" onClick={props.onClose}>
          <ButtonLabel>Scan again</ButtonLabel>
        </Button>
      </InvisibleWrapper>
    );
  } else {
    return null;
  }
};

const ButtonLabel = styled.span`
  white-space: nowrap;
`;

const InvisibleWrapper = styled.div`
  display: flex;
  flex-direction: column;
  pointer-events: all;
  gap: var(--medium);
`;

const SearchResult = styled(TagContextMenu)`
  margin-bottom: var(--small);
`;

export { SearchResults };
