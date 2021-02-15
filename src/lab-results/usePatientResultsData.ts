import React from 'react';

import loadPatientData from './loadPatientData';

type LoadingState = {
  sortedObs: Record<string, any>;
  loaded: boolean;
  error: Object | undefined;
};

const usePatientResultsData = (patientUuid: string): LoadingState => {
  const [state, setState] = React.useState<LoadingState>({ sortedObs: {}, loaded: false, error: undefined });

  React.useEffect(() => {
    loadPatientData(patientUuid)
      .then(sortedObs => setState({ sortedObs, loaded: true, error: undefined }))
      .catch(error => setState({ ...state, loaded: true, error }));
  }, []);

  return state;
};

export default usePatientResultsData;
