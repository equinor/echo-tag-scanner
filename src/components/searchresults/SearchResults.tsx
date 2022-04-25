import React, { useState } from 'react';
import styled from 'styled-components';

import { Button } from '@equinor/eds-core-react';
import EchoUtils from '@equinor/echo-utils';
import { TagContextMenu, TagIcon, getIcon } from '@equinor/echo-components';
import { getLegendStatusColor } from '@equinor/echo-framework';
import { ExtractedFunctionalLocation } from '@types';
import { Search, TagSummaryDto } from '@equinor/echo-search';
import { getInstCode } from '@utils';

interface SearchResultsProps {
  functionalLocations: ExtractedFunctionalLocation[];
  onTagSearch: (tagNumber: string) => void;
  onClose: () => void;
}

const SearchResults = (props: SearchResultsProps): JSX.Element => {
  const [tagSummary, setTagSummary] = useState<TagSummaryDto[]>(undefined);

  /**
   * Keeps and updates a list of tag summaries for user presentation.
   */
  EchoUtils.Hooks.useEffectAsync(async () => {
    if (props.functionalLocations.length > 0) {
      const result = await Search.Tags.getAllAsync(
        props.functionalLocations.map((l) => l.tagNumber)
      );
      console.log(result);
      if (result.isSuccess && result.values.length > 0) {
        logTagSummaries(result.values);
        setTagSummary(result.values);
      } else {
        setTagSummary(undefined);
      }
    }
  }, [props.functionalLocations]);

  function onClick(tagNumber: string) {
    props.onTagSearch(tagNumber);
  }

  function logTagSummaries(tagSummaries: TagSummaryDto[]) {
    console.group('This tag data is used for presentation');
    if (tagSummaries.length > 0) {
      tagSummaries.forEach((tag) => console.table(tag));
    }

    console.groupEnd();
  }

  function createSearchResult(tag: TagSummaryDto, index: number) {
    return (
      //@ts-ignore
      // Ignoring a non-optional (setExpanded) prop as there is
      // no need to handle expanded states.
      <SearchResult
        key={index}
        expanded
        openTagInformation={() => onClick(tag.tagNo)}
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

  if (Array.isArray(tagSummary) && tagSummary.length > 0) {
    return (
      <InvisibleWrapper>
        {tagSummary.map(createSearchResult)}
        <ScanAgainButton variant="contained" onClick={props.onClose}>
          Scan again
        </ScanAgainButton>
      </InvisibleWrapper>
    );
  } else {
    return null;
  }
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
