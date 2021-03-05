import * as React from 'react';
import { useParams } from 'react-router';
import { Link } from 'react-router-dom';
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
const TimelineCell = ({ text }) => (
  <div className={styles['timeline-cell']}>
    <p>{text}</p>
  </div>
);

const RowStartCell = ({ title, range, unit, shadow = false }) => (
  <div
    className={styles['timeline-cell']}
    style={{ position: 'sticky', left: '0px', boxShadow: shadow ? '5px 0 5px 0 rgb(0 0 0 / 11%)' : undefined }}>
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
  const [xIsScrolled, yIsScrolled, containerRef] = useScrollIndicator(0, 32);

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
          boxShadow: yIsScrolled ? '5px 0 5px 0 rgb(0 0 0 / 11%)' : undefined,
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
              {sortedTimes.map((_, i) => (
                <TimelineCell text={obs[i]?.value || '--'} />
              ))}
            </>
          );
        })}
      </Grid>
    </PaddingContainer>
  );
};

export default Table;
