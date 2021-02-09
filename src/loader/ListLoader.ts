const restPath = '/openmrs/ws/rest/v1';

async function* loadResources({ type, parameters }: { type: string; parameters: Record<string, string | number> }) {
  let fetchString = `${restPath}/${type}?`;
  if (parameters) {
    fetchString += Object.entries(parameters)
      .map(([n, v]) => encodeURIComponent(n) + '=' + encodeURIComponent(v))
      .join('&');
  }

  const offset = Number(parameters.limit) || 50;
  let doneFetching = false;
  let index = 0;

  while (!doneFetching) {
    const { results } = await fetch(fetchString + '&startIndex=' + offset * index).then(res => res.json());

    if (results.length < offset) doneFetching = true;
    index++;

    yield* results;
  }
}

export default class ListLoader {
  type: string;
  parameters: Record<string, string>;

  constructor(type, { parameters } = { parameters: undefined }) {
    this.type = type;
    this.parameters = parameters;
  }

  setLimit(limit: number) {
    return this.setParameter('limit', limit);
  }

  setParameter(name, value) {
    this.parameters = { ...this.parameters, [name]: value };
    return this;
  }

  copy({ ...newValues }: Partial<ListLoader>) {
    return new ListLoader(this.type, { ...this, ...newValues });
  }

  run() {
    return loadResources({ ...this });
  }
}
