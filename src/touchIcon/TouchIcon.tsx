import { Button, Icon } from '@equinor/eds-core-react';

function createEDSButton(name: string, onClick: () => void): JSX.Element {
  return (
    <Button variant="ghost_icon" onClick={onClick} style={{ border: '1px solid' }}>
      <Icon name={name} />
    </Button>
  );
}
export { createEDSButton };
