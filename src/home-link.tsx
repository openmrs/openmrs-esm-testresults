import React from 'react';
import { ConfigurableLink } from '@openmrs/esm-react-utils';

export default function Root() {
  return (
    <ConfigurableLink className="omrs-link omrs-filled-neutral" to="${openmrsSpaBase}/lab-results">
      Lab Results
    </ConfigurableLink>
  );
}
