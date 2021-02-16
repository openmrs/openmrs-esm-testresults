import React from 'react';
import ListLoader from '../loader/ListLoader';
/**
 * this is here for the case we need to load observations from the REST API
 */
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
