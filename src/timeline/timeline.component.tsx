import * as React from 'react';
import { useParams } from 'react-router';
import { Link } from 'react-router-dom';
import styles from './timeline.scss';
import { useTimelineData } from './useTimelineData';

const Grid = ({ dataColumns, ...props }) => (
  <div
    style={{
      gridTemplateColumns: `9em repeat(${dataColumns}, 5em)`,
    }}
    className={styles['grid']}
    {...props}
  />
);

const NameColumnGrid = props => (
  <div
    style={{
      gridTemplateColumns: '9em',
      width: '9em',
      position: 'absolute',
    }}
    className={styles['grid']}
    {...props}
  />
);

const OverflowContainer = props => <div className={styles['overflow-container']} {...props} />;
const PaddingContainer = props => <div className={styles['padding-container']} {...props} />;
const TimeSlotsInner = props => <div className={styles['time-slot-inner']} {...props} />;
const Main = ({ className = '', ...props }) => <main {...props} className={`omrs-main-content ${className}`} />;
const TimelineCell = ({ text }) => (
  <div className={styles['timeline-cell']}>
    <p>{text}</p>
  </div>
);

const RowStartCell = ({ title, range, unit }) => (
  <div className={styles['timeline-cell']}>
    <p>
      {title}
      <br></br>
      {range} {unit}
    </p>
  </div>
);

const TimeSlots = ({ children = undefined, style }) => (
  <TimeSlotsInner style={style}>
    <div>{children}</div>
  </TimeSlotsInner>
);

const Table = () => {
  let { patientUuid, panelUuid } = useParams<{ patientUuid: string; panelUuid: string }>();
  // const { data, loaded, error } = useTimelineData(patientUuid, panelUuid);
  const {
    data: {
      parsedTime: { yearColumns, dayColumns, timeColumns, sortedTimes },
      rowData,
      panelName,
    },
    loaded,
  } = useTimelineData(patientUuid, panelUuid);

  if (!loaded)
    return (
      <Main>
        <h1>Loading</h1>
      </Main>
    );

  return (
    <Main>
      <Link to={`/lab-results/${patientUuid}`}>to overview</Link>
      <PaddingContainer>
        <OverflowContainer>
          <Grid dataColumns={timeColumns.length} padding>
            <TimeSlots style={{ gridRow: 'span 3' }}>{panelName}</TimeSlots>
            {yearColumns.map(({ year, size }) => {
              return (
                <TimeSlots key={year} style={{ gridColumn: `${size} span` }}>
                  {year}
                </TimeSlots>
              );
            })}
            {dayColumns.map(({ day, size }) => {
              return (
                <TimeSlots key={day} style={{ gridColumn: `${size} span` }}>
                  {day}
                </TimeSlots>
              );
            })}
            {timeColumns.map((time, i) => {
              return (
                <TimeSlots key={time + i} style={{ scrollSnapAlign: 'start' }}>
                  {time}
                </TimeSlots>
              );
            })}
            {Object.entries(rowData).map(([title, obs]) => {
              const {
                meta: { unit = '', range = '' },
              } = obs.find(x => !!x);
              return (
                <>
                  <RowStartCell {...{ unit, range, title }} />
                  {sortedTimes.map((_, i) => (
                    <TimelineCell text={obs[i]?.value || '--'} />
                  ))}
                </>
              );
            })}
          </Grid>
        </OverflowContainer>
        {/* <NameColumnGrid>
          <TimeSlots style={{ gridRow: 'span 3' }}>{panelName}</TimeSlots>

          {Object.entries(rowData).map(([title, obs]) => {
            const {
              meta: { unit = '', range = '' },
            } = obs.find(x => !!x);
            return <RowStartCell {...{ unit, range, title }} />;
          })}
        </NameColumnGrid> */}
      </PaddingContainer>
    </Main>
  );
};

export default React.memo(Table);
