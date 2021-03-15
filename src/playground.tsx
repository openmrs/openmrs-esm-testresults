import { ExtensionSlot } from '@openmrs/esm-react-utils';
import React from 'react';

export default () => {
  const [slotName, setSlotName] = React.useState('');
  return (
    <div style={{ margin: '4em' }}>
      <h1>Playground Page</h1>
      <input value={slotName} onChange={e => setSlotName(e.currentTarget.value)} />
      <ExtensionSlot extensionSlotName={slotName} key={slotName} />
    </div>
  );
};
