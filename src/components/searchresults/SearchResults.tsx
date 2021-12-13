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
          {props.functionalLocations.map((fLocation) => (
            <List.Item key={fLocation.tagNumber}>
              <FunctionalLocationCard variant="info" onClick={() => onClick(fLocation.tagNumber)}>
                <FunctionalLocationCard.HeaderTitle>
                  <Typography variant="h5">{fLocation.tagNumber}</Typography>
                  <Typography variant="body_short">Tap to open this tag.</Typography>
                </FunctionalLocationCard.HeaderTitle>
              </FunctionalLocationCard>
            </List.Item>
          ))}
        </CardList>
      </Dialog.CustomContent>
      <Actions>
        <Button variant="outlined" onClick={props.onClose}>
          Close
        </Button>
      </Actions>
    </Dialogue>
  );
};

const Dialogue = styled(Dialog)`
  max-width: 90vw;
  min-width: 25vw;
  max-height: 70vh;
  z-index: 2;
`;

const Actions = styled(Dialog.Actions)`
  width: 100%;
  text-align: right;
`;

const CardList = styled(List)`
  list-style-type: none;
  overflow: auto;
  max-height: 50vh;
`;

const FunctionalLocationCard = styled(Card)`
  margin-bottom: var(--small);
`;

export { SearchResults };
