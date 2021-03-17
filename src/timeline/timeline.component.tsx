import * as React from 'react';
import { useParams } from 'react-router';
import { Link } from 'react-router-dom';
import { OBSERVATION_INTERPRETATION } from '../loadPatientTestData/helpers';
import styles from './timeline.scss';
import useScrollIndicator from './useScroll';
import { useTimelineData } from './useTimelineData';

const Grid = ({ dataColumns, style = {}, padding = false, ...props }) => (
  <div
    style={{
      ...style,
      gridTemplateColumns: `${padding ? '9em ' : ''} repeat(${dataColumns}, 5em)`,
    }}
    className={styles['grid']}
    {...props}
  />
);

const PaddingContainer = React.forwardRef((props, ref) => (
  <div ref={ref} className={styles['padding-container']} {...props} />
));
const TimeSlotsInner = props => <div className={styles['time-slot-inner']} {...props} />;
const Main = ({ className = '', ...props }) => <main {...props} className={`omrs-main-content ${className}`} />;

const TimelineCell = ({ text, interpretation = OBSERVATION_INTERPRETATION.NORMAL }) => {
  switch (interpretation) {
    case OBSERVATION_INTERPRETATION.OFF_SCALE_HIGH:
      return (
        <div className={`${styles['timeline-cell']} ${styles['off-scale-high']}`}>
          <p>{text}</p>
        </div>
      );

    case OBSERVATION_INTERPRETATION.CRITICALLY_HIGH:
      return (
        <div className={`${styles['timeline-cell']} ${styles['critically-high']}`}>
          <p>{text}</p>
        </div>
      );

    case OBSERVATION_INTERPRETATION.HIGH:
      return (
        <div className={`${styles['timeline-cell']} ${styles['high']}`}>
          <p>{text}</p>
        </div>
      );

    case OBSERVATION_INTERPRETATION.OFF_SCALE_LOW:
      return (
        <div className={`${styles['timeline-cell']} ${styles['off-scale-low']}`}>
          <p>{text}</p>
        </div>
      );

    case OBSERVATION_INTERPRETATION.CRITICALLY_LOW:
      return (
        <div className={`${styles['timeline-cell']} ${styles['critically-low']}`}>
          <p>{text}</p>
        </div>
      );

    case OBSERVATION_INTERPRETATION.LOW:
      return (
        <div className={`${styles['timeline-cell']} ${styles['low']}`}>
          <p>{text}</p>
        </div>
      );

    case OBSERVATION_INTERPRETATION.NORMAL:
    default:
      return (
        <div className={`${styles['timeline-cell']}`}>
          <p>{text}</p>
        </div>
      );
  }
};

const RowStartCell = ({ title, range, unit, shadow = false }) => (
  <div
    className={styles['timeline-cell']}
    style={{ position: 'sticky', left: '0px', boxShadow: shadow ? '8px 0 20px 0 rgba(0,0,0,0.15)' : undefined }}>
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

const GridItems = React.memo(({ sortedTimes, obs }) => (
  <>
    {sortedTimes.map((_, i) => {
      if (!obs[i]) return <TimelineCell text={'--'} />;
      const interpretation: OBSERVATION_INTERPRETATION = obs[i].meta.assessValue(obs[i].value);
      return <TimelineCell text={obs[i].value} interpretation={interpretation} />;
    })}
  </>
));

const Table = () => {
  let { patientUuid, panelUuid } = useParams<{ patientUuid: string; panelUuid: string }>();
  const [xIsScrolled, yIsScrolled, containerRef] = useScrollIndicator(0, 32);

  const {
    data: {
      parsedTime: { yearColumns, dayColumns, timeColumns, sortedTimes },
      rowData,
      panelName,
    },
    loaded,
  } = useTimelineData(patientUuid, panelUuid);

  console.log({ rowData });

  if (!loaded)
    return (
      <Main>
        <h1>Loading</h1>
      </Main>
    );

  return (
    <PaddingContainer ref={containerRef}>
      <TimeSlots
        style={{
          gridRow: 'span 1',
          position: 'sticky',
          left: '0px',
          top: '-32px',
          zIndex: 3,
        }}>
        {panelName}
      </TimeSlots>
      <Grid
        dataColumns={timeColumns.length}
        style={{
          gridTemplateRows: 'repeat(3, 24px)',
          position: 'sticky',
          top: '-32px',
          zIndex: 2,
          boxShadow: yIsScrolled ? '8px 0 20px 0 rgba(0,0,0,0.15)' : undefined,
        }}>
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
            <TimeSlots key={time + i} style={{ scrollSnapAlign: 'start', fontWeight: '400' }}>
              {time}
            </TimeSlots>
          );
        })}
      </Grid>
      <Grid dataColumns={timeColumns.length} padding style={{ gridColumn: 'span 2' }}>
        {Object.entries(rowData).map(([title, obs]) => {
          const {
            meta: { unit = '', range = '' },
          } = obs.find(x => !!x);
          return (
            <>
              <RowStartCell {...{ unit, range, title, shadow: xIsScrolled }} />
              <GridItems {...{ sortedTimes, obs }} />
            </>
          );
        })}
      </Grid>
    </PaddingContainer>
  );
};

export default Table;
