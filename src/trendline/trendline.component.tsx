import * as React from 'react';
import { useParams } from 'react-router';
import { Link } from 'react-router-dom';
import usePatientResultsData from '../loadPatientTestData/usePatientResultsData';
import styles from './trendline.scss';
import { LineChart } from '@carbon/charts-react';

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
const TrendLineBackground = ({ ...props }) => <div {...props} className={styles['Background']} />;

const Trendline = () => {
  const patientData = useTrendlineData();

  if (patientData !== null) {
    let leftAxisLabel = '';
    const data = [];

    const DateFormatOption: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };

    // console.log(patientData)
    let dataset = patientData[0];
    patientData[1].entries.forEach(entry => {
      data.push({
        date: new Date(Date.parse(entry.effectiveDateTime)).toLocaleDateString('en-GB', DateFormatOption),
        value: entry.value,
        group: dataset,
        id: entry.id,
      });
    });

    if (patientData[1].entries[0]) {
      leftAxisLabel = patientData[1].entries[0].meta.units;
    }

    const options = {
      // "title": dataset,
      axes: {
        bottom: {
          title: 'Date',
          mapsTo: 'date',
          scaleType: 'labels',
        },
        left: {
          mapsTo: 'value',
          title: leftAxisLabel,
          scaleType: 'linear',
        },
      },
      height: '20.125rem',

      color: {
        scale: {
          dataset: '#6929c4',
        },
      },
    };

    return (
      <Main>
        <TrendLineBackground>
          <LineChart class={styles['chartHolder']} data={data} options={options}></LineChart>
        </TrendLineBackground>
      </Main>
    );
  }

  return (
    <Main>
      <div>Loading...</div>
    </Main>
  );
};

export default React.memo(Trendline);
