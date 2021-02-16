import React, { useState, useEffect } from 'react';

import styles from './lab-results.scss';
import { Information16, Table16, ChartLine16 } from '@carbon/icons-react';
import {
  Button,
  DataTable,
  DataTableSkeleton,
  Table,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
  TableBody,
  TableToolbarContent,
  TableToolbar,
  Loading,
} from 'carbon-components-react';
import usePatientResultsData from './usePatientResultsData';
import { OBSERVATION_INTERPRETATION } from './loadPatientData';

const testPatient = '8673ee4f-e2ab-4077-ba55-4980f408773e';

function formatDate(date: Date) {
  const strArray = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const d = date.getDate();
  const m = strArray[date.getMonth()];
  const y = date.getFullYear();
  const h = date.getHours();
  const min = date.getMinutes();
  return (
    '' +
    m +
    ' ' +
    (d <= 9 ? '0' + d : d) +
    ', ' +
    y +
    ' · ' +
    (h <= 9 ? '0' + h : h) +
    ':' +
    (min <= 9 ? '0' + min : min)
  );
}

const headers = [
  { key: 'name', header: 'Test Name' },
  { key: 'value', header: 'Value' },
  { key: 'range', header: 'Reference Range' },
];

const Main = ({ className = '', ...props }) => <main {...props} className={`omrs-main-content ${className}`} />;
const Card = ({ ...props }) => <div {...props} className={styles.card} />;
const InfoButton = () => <Information16 className={styles['info-button']} />;
const TypedTableRow = ({ interpretation, ...props }: { interpretation: OBSERVATION_INTERPRETATION }) => {
  switch (interpretation) {
    case OBSERVATION_INTERPRETATION.OFF_SCALE_HIGH:
      return <TableRow {...props} className={styles['off-scale-high']} />;

    case OBSERVATION_INTERPRETATION.CRITICALLY_HIGH:
      return <TableRow {...props} className={styles['critically-high']} />;

    case OBSERVATION_INTERPRETATION.HIGH:
      return <TableRow {...props} className={styles['high']} />;

    case OBSERVATION_INTERPRETATION.OFF_SCALE_LOW:
      return <TableRow {...props} className={styles['off-scale-low']} />;

    case OBSERVATION_INTERPRETATION.CRITICALLY_LOW:
      return <TableRow {...props} className={styles['critically-low']} />;

    case OBSERVATION_INTERPRETATION.LOW:
      return <TableRow {...props} className={styles['low']} />;

    case OBSERVATION_INTERPRETATION.NORMAL:
    default:
      return <TableRow {...props} />;
  }
};

interface LabResultsProps {
  openTrendlineView: (uuid: string) => void;
  openTimelineView: (uuid: string) => void;
}

export const LabResults: React.FC<LabResultsProps> = ({
  openTrendlineView = () => {},
  openTimelineView = () => {},
}) => {
  //   const config = useConfig();
  //   const [isLoadingPatient, existingPatient, patientUuid, patientErr] = useCurrentPatient();
  const { sortedObs, loaded, error } = usePatientResultsData(testPatient);
  const [displayData, setDisplayData] = React.useState([]);

  React.useEffect(() => {
    setDisplayData(
      Object.entries(sortedObs)
        .map(([panelName, { entries, type, uuid }]) => {
          const newestEntry = entries[0];

          let data;

          if (type === 'Test') {
            data = [
              {
                id: newestEntry.id,
                name: panelName,
                range: newestEntry.meta?.range || '--',
                interpretation: newestEntry.meta.assessValue(newestEntry.value),
                value: newestEntry.value,
              },
            ];
          } else {
            data = newestEntry.members.map(gm => ({
              id: gm.id,
              key: gm.id,
              name: gm.name,
              range: gm.meta?.range || '--',
              interpretation: gm.meta.assessValue(gm.value),
              value: gm.value,
            }));
          }

          return [panelName, type, data, new Date(newestEntry.effectiveDateTime), uuid];
        })
        .sort(([, , , date1], [, , , date2]) => date2 - date1),
    );
  }, [sortedObs]);

  console.log({ displayData, sortedObs });

  return (
    <Main>
      {loaded ? (
        displayData.map(([title, type, data, date, uuid]) => (
          <Card>
            <DataTable rows={data} headers={headers}>
              {({ rows, headers, getHeaderProps, getRowProps, getTableProps, getTableContainerProps }) => (
                <TableContainer
                  title={title}
                  description={
                    <div>
                      {formatDate(date)}
                      <InfoButton />
                    </div>
                  }
                  {...getTableContainerProps()}>
                  <TableToolbar>
                    <TableToolbarContent>
                      {type === 'Test' && (
                        <Button kind="ghost" renderIcon={ChartLine16} onClick={() => openTrendlineView(uuid)}>
                          Trend
                        </Button>
                      )}
                      <Button kind="ghost" renderIcon={Table16} onClick={() => openTimelineView(uuid)}>
                        Timeline
                      </Button>
                    </TableToolbarContent>
                  </TableToolbar>
                  <Table {...getTableProps()} isSortable>
                    <colgroup>
                      <col span="1" style={{ width: '33%' }} />
                      <col span="1" style={{ width: '33%' }} />
                      <col span="1" style={{ width: '34%' }} />
                    </colgroup>
                    <TableHead>
                      <TableRow>
                        {headers.map(header => (
                          <TableHeader key={header.key} {...getHeaderProps({ header })} isSortable>
                            {header.header}
                          </TableHeader>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.map((row, i) => (
                        <TypedTableRow key={row.id} interpretation={data[i].interpretation} {...getRowProps({ row })}>
                          {row.cells.map(cell => (
                            <TableCell key={cell.id}>{cell.value}</TableCell>
                          ))}
                        </TypedTableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </DataTable>
          </Card>
        ))
      ) : (
        <Card>
          <DataTableSkeleton columnCount={3} />
        </Card>
      )}
    </Main>
  );
};
