import React from 'react';
import { ConfigurableLink } from '@openmrs/esm-react-utils';

export default () => (
  <ConfigurableLink to="${openmrsSpaBase}/playground" className="bx--side-nav__link">
    Playground
  </ConfigurableLink>
);
