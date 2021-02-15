import { getGlobalStore } from '@openmrs/esm-api';

const cacheStore = getGlobalStore('patientResultsDataCache', []);

const CHUNK_PREFETCH_COUNT = 6;

type ConceptUuid = string;
type ObsUuid = string;

interface ObsRecord {
  members?: ObsRecord[];
  conceptClass: ConceptUuid;
  meta?: ObsMetaInfo;
  [_: string]: any;
}

interface ObsMetaInfo {
  [_: string]: any;
}

interface ConceptRecord {
  uuid: ConceptUuid;
  [_: string]: any;
}

const loadObsEntries = async (patientUuid: string): Promise<ObsRecord[]> => {
  let responses = await Promise.all(
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
    responses = [
      ...responses,
      ...(await Promise.all(
        new Array(Math.ceil(total / 100) - CHUNK_PREFETCH_COUNT)
          .fill(undefined)
          .map((_, i) =>
            fetch(
              `/openmrs/ws/fhir2/R4/Observation?patient=${patientUuid}&category=laboratory&_sort=-_date&_summary=data&_format=json&_count=100&_getpagesoffset=${(i +
                CHUNK_PREFETCH_COUNT) *
                100}`,
            ).then(res => res.json()),
          ),
      )),
    ];
  }

  return responses.slice(0, Math.ceil(total / 100)).flatMap(res => res.entry.map(e => e.resource));
};

const getEntryConceptClassUuid = entry => entry.code.coding[0].code;

/**
 * fetch all concepts for all given observation entries
 */
const loadPresentConcepts = (entries: ObsRecord[]): Promise<ConceptRecord[]> =>
  Promise.all(
    [...new Set(entries.map(getEntryConceptClassUuid))].map(x =>
      fetch('/openmrs/ws/rest/v1/concept/' + x + '?v=full').then(res => res.json()),
    ),
  );

const exist = (...args: any[]): boolean => {
  for (const y of args) {
    if (y === null || y === undefined) return false;
  }
  return true;
};

export enum OBSERVATION_INTERPRETATION {
  'NORMAL',

  'HIGH',
  'CRITICALLY_HIGH',
  'OFF_SCALE_HIGH',

  'LOW',
  'CRITICALLY_LOW',
  'OFF_SCALE_LOW',
}

const assessValue = (meta: ObsMetaInfo) => (value: number): OBSERVATION_INTERPRETATION => {
  if (exist(meta.hiAbsolute) && value > meta.hiAbsolute) {
    return OBSERVATION_INTERPRETATION.OFF_SCALE_HIGH;
  }

  if (exist(meta.hiCritical) && value > meta.hiCritical) {
    return OBSERVATION_INTERPRETATION.CRITICALLY_HIGH;
  }

  if (exist(meta.hiNormal) && value > meta.hiNormal) {
    return OBSERVATION_INTERPRETATION.HIGH;
  }

  if (exist(meta.lowAbsolute) && value < meta.lowAbsolute) {
    return OBSERVATION_INTERPRETATION.OFF_SCALE_LOW;
  }

  if (exist(meta.lowCritical) && value < meta.lowCritical) {
    return OBSERVATION_INTERPRETATION.CRITICALLY_LOW;
  }

  if (exist(meta.lowNormal) && value < meta.lowNormal) {
    return OBSERVATION_INTERPRETATION.LOW;
  }

  return OBSERVATION_INTERPRETATION.NORMAL;
};

const extractMetaInformation = (concepts: ConceptRecord[]): Record<ConceptUuid, ObsMetaInfo> => {
  return Object.fromEntries(
    concepts.map(
      ({
        uuid,
        hiAbsolute,
        hiCritical,
        hiNormal,
        lowAbsolute,
        lowCritical,
        lowNormal,
        units,
        datatype: { display: datatype },
      }) => {
        const meta: ObsMetaInfo = {
          hiAbsolute,
          hiCritical,
          hiNormal,
          lowAbsolute,
          lowCritical,
          lowNormal,
          units,
          datatype,
        };

        if (exist(hiNormal, lowNormal)) {
          meta.range = `${lowNormal} – ${hiNormal}`;
        }

        meta.assessValue = assessValue(meta);

        return [uuid, meta];
      },
    ),
  );
};

const parseSingleObsData = ({ testConceptNameMap, memberRefs, metaInfomation }) => (entry: ObsRecord) => {
  entry.conceptClass = getEntryConceptClassUuid(entry);

  if (entry.hasMember) {
    entry.members = new Array(entry.hasMember.length);
    entry.hasMember.forEach((memb, i) => {
      memberRefs[memb.reference.split('/')[1]] = [entry.members, i];
    });
  } else {
    entry.meta = metaInfomation[entry.conceptClass];
  }

  if (entry.valueQuantity) {
    entry.value = entry.valueQuantity.value;
    delete entry.valueQuantity;
  }

  entry.name = testConceptNameMap[entry.conceptClass];
};

const loadPatientData = async patientUuid => {
  const entries: ObsRecord[] = await loadObsEntries(patientUuid);

  const allConcepts = await loadPresentConcepts(entries);

  const testConcepts = allConcepts.filter(x => x.conceptClass.name === 'Test' || x.conceptClass.name === 'LabSet');
  const testConceptUuids: ConceptUuid[] = testConcepts.map(x => x.uuid);
  const testConceptNameMap: Record<ConceptUuid, string> = Object.fromEntries(
    testConcepts.map(({ uuid, display }) => [uuid, display]),
  );
  const obsByClass: Record<ConceptUuid, ObsRecord[]> = Object.fromEntries(testConceptUuids.map(x => [x, []]));
  const metaInfomation = extractMetaInformation(testConcepts);

  // obs that are not panels
  const singeEntries: ObsRecord[] = [];

  // a record of observation uuids that are members of panels, mapped to the place where to put them
  const memberRefs: Record<ObsUuid, [ObsRecord[], number]> = {};
  const parseEntry = parseSingleObsData({ testConceptNameMap, memberRefs, metaInfomation });

  entries.forEach(entr => {
    if (!testConceptUuids.includes(getEntryConceptClassUuid(entr))) return;

    parseEntry(entr);

    if (entr.members) {
      obsByClass[entr.conceptClass].push(entr);
    } else {
      singeEntries.push(entr);
    }
  });

  singeEntries.forEach(entry => {
    const { id } = entry;
    const memRef = memberRefs[id];
    if (memRef) {
      memRef[0][memRef[1]] = entry;
    } else {
      obsByClass[entry.conceptClass].push(entry);
    }
  });

  const sortedObs: Record<string, { entries: ObsRecord[]; type: string }> = Object.fromEntries(
    Object.entries(obsByClass)
      // remove concepts that did not have any observations
      .filter(x => x[1].length)
      // replace the uuid key with the display name and sort the observations by date
      .map(([uuid, val]) => {
        const {
          display,
          conceptClass: { display: type },
        } = testConcepts.find(x => x.uuid === uuid);
        return [
          display,
          {
            entries: val.sort((ent1, ent2) => new Date(ent2.effectiveDateTime) - new Date(ent1.effectiveDateTime)),
            type,
          },
        ];
      }),
  );

  console.log({ testConcepts, entries, sortedObs, singeEntries, allConcepts });

  return sortedObs;
};

export default loadPatientData;
