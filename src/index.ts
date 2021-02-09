import { defineConfigSchema } from '@openmrs/esm-config';
import { getAsyncLifecycle } from '@openmrs/esm-react-utils';
import { backendDependencies } from './openmrs-backend-dependencies';
// import { esmLabResultsSchema } from './config-schemas/openmrs-esm-lab-results-schema';

const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

function setupOpenMRS() {
  const moduleName = '@openmrs/esm-lab-results-app';

  const options = {
    featureName: 'Lab Results',
    moduleName,
  };

  // defineConfigSchema(moduleName, esmLabResultsSchema);

  return {
    lifecycle: getAsyncLifecycle(() => import('./root.component'), options),
    activate: 'lab-results',
    extensions: [
      {
        id: 'registration-home-link',
        slot: 'home-page-buttons',
        load: getAsyncLifecycle(() => import('./home-link'), options),
      },
      {
        id: 'registration-nav-link',
        slot: 'nav-menu',
        load: getAsyncLifecycle(() => import('./nav-link'), options),
      },
    ],
  };
}

export { backendDependencies, importTranslation, setupOpenMRS };
