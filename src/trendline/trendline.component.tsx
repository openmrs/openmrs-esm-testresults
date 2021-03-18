import * as React from 'react';
import { useParams } from 'react-router';
import { Link } from 'react-router-dom';
import usePatientResultsData from '../loadPatientTestData/usePatientResultsData';
import styles from './timeline.scss';

const useTrendlineData = () => {
  const { patientUuid, panelUuid, testUuid } = useParams<{
    patientUuid: string;
    panelUuid: string | undefined;
    testUuid: string;
  }>();
  const { sortedObs, loaded, error } = usePatientResultsData(patientUuid);

  if (loaded && !error) {
    if (panelUuid) {
      // return Object.entries(sortedObs[panelUuid]).find(([panelName, { entries, type, uuid }]) => {
      // return uuid == testUuid;
      // });
      return null;
    }

    return Object.entries(sortedObs).find(([panelName, { entries, type, uuid }]) => {
      return uuid == testUuid;
    });
  }

  return null;
};

const Main = ({ className = '', ...props }) => <main {...props} className={`omrs-main-content ${className}`} />;

const Trendline = () => {
  //   const {} = useTrendlineData();

  return <Main>Trendline goes here.</Main>;
};

export default React.memo(Trendline);
