import React from "react";
import styled from 'styled-components';

import { Button } from '@equinor/eds-core-react';
import { TagContextMenu, TagIcon, getIcon } from '@equinor/echo-components';
import { getLegendStatusColor } from '@equinor/echo-framework';
import { TagSummaryDto } from '@equinor/echo-search';

interface SearchResultsProps {
  tags: TagSummaryDto[];
  onTagSearch: (tagNumber: string) => void;
  onClose: () => void;
}

const SearchResults = (props: SearchResultsProps): JSX.Element => {
  function onClick(tagNumber?: string) {
    if (tagNumber) {
      props.onTagSearch(tagNumber);
    }
  }

  return (
    <InvisibleWrapper>
      {props.tags.map((tag, index) => (
        //@ts-ignore
        // Ignoring a non-optional (setExpanded) prop as this one should be optional.
        <SearchResult
          key={index}
          expanded
          description={tag.description}
          openTagInformation={() => onClick(tag.tagNo)}
          tagNo={tag.tagNo}
          selected={false}
        >
          <TagIcon
            icon={getIcon(tag.tagCategoryDescription)}
            legendColor={getLegendStatusColor(tag.tagStatus)}
          />
        </SearchResult>
      ))}
      <ScanAgainButton variant="contained" onClick={props.onClose}>
        Scan again
      </ScanAgainButton>
    </InvisibleWrapper>
  );
};

const ScanAgainButton = styled(Button)``;

const InvisibleWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--medium);
`;

const SearchResult = styled(TagContextMenu)`
  margin-bottom: var(--small);
`;

export { SearchResults };
