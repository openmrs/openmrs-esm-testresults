import { getAsyncLifecycle } from '@openmrs/esm-react-utils';
import { backendDependencies } from './openmrs-backend-dependencies';

const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

function setupOpenMRS() {
  const moduleName = '@openmrs/esm-testresults-app';

  const options = {
    featureName: 'testresults',
    moduleName,
  };

  return {
    lifecycle: getAsyncLifecycle(() => import('./playground'), options),
    activate: 'playground',
    extensions: [
      {
        id: 'playground-nav-link',
        slot: 'nav-menu',
        load: getAsyncLifecycle(() => import('./link'), options),
      },
      {
        id: 'playground-home-button',
        slot: 'home-page-buttons',
        load: getAsyncLifecycle(() => import('./home'), options),
      },
    ],
  };
}

export { backendDependencies, importTranslation, setupOpenMRS };
