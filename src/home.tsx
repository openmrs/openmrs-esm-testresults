import { ExtensionSlot } from '@openmrs/esm-react-utils';
import React from 'react';

export default function ActiveVisits() {
  return (
    <div className="omrs-link omrs-filled-neutral">
      <ExtensionSlot
        extensionSlotName="location-picker"
        state={{
          loginLocations: [
            {
              resource: {
                id: '1',
                name: 'Foo',
              },
            },
            {
              resource: {
                id: '2',
                name: 'Bar',
              },
            },
            {
              resource: {
                id: '3',
                name: 'Qxz',
              },
            },
          ],
          onChangeLocation: () => {},
          hideWelcomeMessage: true,
          currentLocationUuid: '1',
          currentUser: {},
        }}
      />
    </div>
  );
}
