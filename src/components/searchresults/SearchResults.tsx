import React from "react";
import styled from 'styled-components';
import { Dialog, Card, List, Typography, Button } from '@equinor/eds-core-react';
import { ExtractedFunctionalLocation } from '@types';

interface SearchResultsProps {
  functionalLocations: ExtractedFunctionalLocation[];
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
    <Dialogue>
      <Dialog.Title>Search results</Dialog.Title>
      <Dialog.CustomContent>
        <CardList>
          {props.functionalLocations.map((fLocation, index) => (
            <List.Item key={fLocation.tagNumber + '-' + String(index)}>
              <FunctionalLocationCard
                variant="info"
                onClick={() => onClick(fLocation.tagNumber)}
              >
                <FunctionalLocationCard.HeaderTitle>
                  <Typography variant="h5">{fLocation.tagNumber}</Typography>
                  <Typography variant="body_short">
                    Tap to open this tag.
                  </Typography>
                </FunctionalLocationCard.HeaderTitle>
              </FunctionalLocationCard>
            </List.Item>
          ))}
        </CardList>
      </Dialog.CustomContent>
      <Actions>
        <Button variant="contained" onClick={props.onClose}>
          Scan again
        </Button>
      </Actions>
    </Dialogue>
  );
};

const Dialogue = styled(Dialog)`
  max-width: 90vw !important;
  min-width: 25vw !important;
  max-height: 70vh !important;
  width: unset !important;
  z-index: 2;
`;

const Actions = styled(Dialog.Actions)`
  place-self: unset !important;
  text-align: right;
`;

const CardList = styled(List)`
  list-style-type: none;
  overflow: auto;
  max-height: 50vh;
  padding: 0;
`;

const FunctionalLocationCard = styled(Card)`
  margin-bottom: var(--small);
  padding: var(--small);
`;

export { SearchResults };
