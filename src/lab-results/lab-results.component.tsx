import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { createErrorHandler } from '@openmrs/esm-error-handling';
import { showToast } from '@openmrs/esm-styleguide';

import styles from './lab-results.scss';
import { useCurrentPatient, useConfig } from '@openmrs/esm-react-utils';
import { interpolateString, navigate } from '@openmrs/esm-config';
import { useTranslation } from 'react-i18next';
import { XAxis16, Information16 } from '@carbon/icons-react';
import {
  Button,
  Link,
  Grid,
  Row,
  Column,
  DataTable,
  DataTableSkeleton,
  Table,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
  TableBody,
  Loading,
} from 'carbon-components-react';
import ListLoader from '../loader/ListLoader';

const testPatient = '8673ee4f-e2ab-4077-ba55-4980f408773e';

const CHUNK_PREFETCH_COUNT = 5;
const loadPatientFHIRData = async patientUuid => {
  const responses = await Promise.all(
    new Array(CHUNK_PREFETCH_COUNT)
      .fill(undefined)
      .map((_, i) =>
        fetch(
          `/openmrs/ws/fhir2/R4/Observation?patient=${patientUuid}&category=laboratory&_sort=-_date&_summary=data&_format=json&_count=100&_getpagesoffset=${i *
            100}`,
        ).then(res => res.json()),
      ),
  );

  const total = responses[0].total;

  if (total > CHUNK_PREFETCH_COUNT * 100) {
    // load the rest and append to responses
  }

  const entries = responses.slice(0, Math.ceil(total / 100)).flatMap(res => res.entry.map(e => e.resource));

  const singeEntries = [];
  const memberRefs = {};

  const allConcepts = await Promise.all(
    [...new Set(entries.map(x => x.code.coding[0].code))].map(x =>
      fetch('/openmrs/ws/rest/v1/concept/' + x + '?v=full').then(res => res.json()),
    ),
  );

  const testConcepts = allConcepts.filter(x => x.conceptClass.name === 'Test' || x.conceptClass.name === 'LabSet');
  const testConceptUuids = testConcepts.map(x => x.uuid);
  const obsByClass = Object.fromEntries(testConceptUuids.map(x => [x, []]));

  entries.forEach(entr => {
    entr.conceptClass = entr.code.coding[0].code;

    if (entr.valueQuantity) {
      entr.value = entr.valueQuantity.value;
      delete entr.valueQuantity;
    }

    if (!testConceptUuids.includes(entr.conceptClass)) return;

    if (entr.hasMember) {
      entr.members = new Array(entr.hasMember.length);
      entr.hasMember.forEach((memb, i) => {
        memberRefs[memb.reference.split('/')[1]] = [entr.members, i];
      });
      obsByClass[entr.conceptClass].push(entr);
    } else {
      singeEntries.push(entr);
    }
  });

  singeEntries.forEach(sEntry => {
    const { id } = sEntry;
    const memRef = memberRefs[id];
    if (memRef) {
      memRef[0][memRef[1]] = sEntry;
    } else {
      obsByClass[sEntry.conceptClass].push(sEntry);
    }
  });

  const sortedObs = Object.fromEntries(
    Object.entries(obsByClass)
      .filter(x => x[1].length)
      .map(([uuid, val]) => {
        const {
          display,
          conceptClass: { display: type },
        } = testConcepts.find(x => x.uuid === uuid);
        return [display, { entries: val.sort((ent1, ent2) => new Date(ent2.issued) - new Date(ent1.issued)), type }];
      }),
  );

  // singeEntries.
  console.log({ sortedObs, testConcepts, entries });
};

loadPatientFHIRData(testPatient);

globalThis.load = () => loadPatientFHIRData(testPatient);

// (async () => {
//   const concepts = new ListLoader('concept');
//   concepts.setLimit(80).setParameter('v', 'custom:(uuid,display,conceptClass:(display))');

//   const iter = (async function*() {
//     for await (let con of concepts.run()) {
//       if (con.conceptClass.display !== 'Test' && con.conceptClass.display !== 'LabSet') continue;

//       yield* new ListLoader('obs')
//         .setParameter('patient', testPatient)
//         .setParameter('concept', con.uuid)
//         .setParameter('v', 'full')
//         .run();
//     }
//   })();

//   // for await (const ob of iter) {
//   //   console.log(ob);
//   // }

//   // globalThis.getNext = async () => {
//   //   return (await iter.next()).value;
//   // };
// })();

const usePatientTestObs = patientUuid => {
  const [loaded, setLoaded] = React.useState(false);
  const [observations, setObservations] = React.useState([]);

  React.useEffect(() => {
    const concepts = new ListLoader('concept')
      .setLimit(80)
      .setParameter('v', 'custom:(uuid,display,conceptClass:(display))');

    const iter = (async function*() {
      for await (let con of concepts.run()) {
        if (con.conceptClass.display !== 'Test' && con.conceptClass.display !== 'LabSet') continue;

        yield* new ListLoader('obs')
          .setParameter('patient', patientUuid)
          .setParameter('concept', con.uuid)
          .setParameter('v', 'full')
          .run();
      }
    })();

    let newObs = [];
    let stop = false;
    const interVal = setInterval(() => {
      if (newObs.length) {
        setObservations(obs => [...obs, ...newObs]);
        newObs = [];
      }

      if (stop) {
        clearInterval(interVal);
      }
    }, 200);
    (async () => {
      for await (const ob of iter) {
        if (stop) break;
        newObs.push(ob);
      }

      stop = true;
      setLoaded(true);
    })();

    () => {
      stop = true;
      clearInterval(interVal);
    };
  }, [patientUuid]);

  return { loaded, observations };
};

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

export const LabResults: React.FC = () => {
  //   const { search } = useLocation();
  //   const config = useConfig();
  //   const [location, setLocation] = useState('');
  //   const [addressTemplate, setAddressTemplate] = useState('');
  //   const [isLoadingPatient, existingPatient, patientUuid, patientErr] = useCurrentPatient();
  //   const { t } = useTranslation();
  //   const [sections, setSections] = useState([]);
  // const { loaded, observations } = usePatientTestObs(testPatient);
  const { loaded, observations } = {};
  const [sortedObs, setSortedObs] = React.useState<Record<string, any>>({});
  const [displayData, setDisplayData] = React.useState([]);

  React.useEffect(() => {
    const newSortedObs = {};

    observations.forEach(obs => {
      const type = obs.concept.display;
      if (!type) return;
      if (obs.obsGroup) return;

      if (!newSortedObs[type]) newSortedObs[type] = { entries: [], type: obs.concept?.conceptClass?.display };

      newSortedObs[type].entries.push(obs);
    });

    setSortedObs(newSortedObs);
  }, [observations]);

  React.useEffect(() => {
    setDisplayData(
      Object.entries(sortedObs).map(([panelName, { entries, type }]) => {
        const newestEntry = entries.sort((ent1, ent2) => new Date(ent2.obsDatetime) - new Date(ent1.obsDatetime))[0];

        let data;

        if (type === 'Test') {
          data = [
            {
              id: newestEntry.uuid,
              name: newestEntry.concept?.name?.display || panelName,
              range: '',
              value: newestEntry.value,
            },
          ];
        } else {
          data = newestEntry.groupMembers.map(gm => ({
            id: gm.uuid,
            name: gm.concept?.name?.display,
            range: '',
            value: gm.value,
          }));
        }

        return [panelName, type, data, new Date(newestEntry.obsDatetime)];
      }),
    );
  }, [sortedObs]);

  console.log({ displayData, sortedObs, observations });

  return (
    <main className={`omrs-main-content`}>
      {displayData.map(([title, type, data, date]) => (
        <div className={styles.card}>
          <DataTable rows={data} headers={headers}>
            {({ rows, headers, getHeaderProps, getRowProps, getTableProps, getTableContainerProps }) => (
              <TableContainer
                title={title}
                description={
                  <>
                    {formatDate(date)}
                    <Information16 style={{ marginLeft: '10px' }} />
                  </>
                }
                {...getTableContainerProps()}>
                <Table {...getTableProps()} isSortable>
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
        </div>
      ))}
    </main>
  );
};
