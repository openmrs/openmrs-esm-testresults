import React from 'react';
import { ConfigurableLink } from '@openmrs/esm-react-utils';

export default function Root() {
  return (
    <ConfigurableLink to="${openmrsSpaBase}/lab-results" className="bx--side-nav__link">
      Lab Results
    </ConfigurableLink>
  );
}
