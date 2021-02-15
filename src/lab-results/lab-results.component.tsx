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
// const Input = ({ outlined ,...props }) => <div {...props} className={outlined ? className1 : className2} />;

export const LabResults: React.FC = () => {
  //   const { search } = useLocation();
  //   const config = useConfig();
  //   const [location, setLocation] = useState('');
  //   const [addressTemplate, setAddressTemplate] = useState('');
  //   const [isLoadingPatient, existingPatient, patientUuid, patientErr] = useCurrentPatient();
  //   const { t } = useTranslation();
  //   const [sections, setSections] = useState([]);
  // const { loaded, observations } = usePatientTestObs(testPatient);
  const { sortedObs, loaded, error } = usePatientResultsData(testPatient);
  const [displayData, setDisplayData] = React.useState([]);

  React.useEffect(() => {
    setDisplayData(
      Object.entries(sortedObs)
        .map(([panelName, { entries, type }]) => {
          const newestEntry = entries[0];

          let data;

          if (type === 'Test') {
            data = [
              {
                id: newestEntry.id,
                name: panelName,
                range: newestEntry.meta?.range || '--',
                value: newestEntry.value,
              },
            ];
          } else {
            data = newestEntry.members.map(gm => ({
              id: gm.id,
              key: gm.id,
              name: gm.name,
              range: gm.meta?.range || '--',
              value: gm.value,
            }));
          }

          return [panelName, type, data, new Date(newestEntry.effectiveDateTime)];
        })
        .sort(([, , , date1], [, , , date2]) => date2 - date1),
    );
  }, [sortedObs]);

  console.log({ displayData, sortedObs });

  return (
    <Main>
      {loaded ? (
        displayData.map(([title, type, data, date]) => (
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
                        <Button kind="ghost" renderIcon={ChartLine16} onClick={() => console.log('click')}>
                          Trend
                        </Button>
                      )}
                      <Button kind="ghost" renderIcon={Table16} onClick={() => console.log('click')}>
                        Timeline
                      </Button>
                    </TableToolbarContent>
                  </TableToolbar>
                  <Table {...getTableProps()} isSortable>
                    <colgroup>
                      <col span="1" style={{ width: '33.3%' }} />
                      <col span="1" style={{ width: '33.3%' }} />
                      <col span="1" style={{ width: '33.3%' }} />
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
                      {rows.map(row => (
                        <TableRow key={row.id} {...getRowProps({ row })}>
                          {row.cells.map(cell => (
                            <TableCell key={cell.id}>{cell.value}</TableCell>
                          ))}
                        </TableRow>
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
