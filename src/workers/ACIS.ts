import { Weather } from '$lib/db/Weather';
import { getDayOfYear, format, parse } from 'date-fns';

export type FetchWeather = {
  coord: [number, number];
  years: number[];
};

onmessage = async function (e: MessageEvent<FetchWeather>) {
  const request = e.data;

  const today = new Date();

  for (const year of request.years) {
    const thisYear = await Weather.get(request.coord, year);

    // TODO: Only fetch this year's data IF its after the update time AND we haven't already got it today
    if (thisYear.maxTemp.length && thisYear.year !== today.getFullYear()) {
      console.info(
        `Already have ${year} weather for (${request.coord[0]}, ${request.coord[1]})`
      );
      continue;
    }

    const weather = await fetch('https://data.rcc-acis.org/GridData', {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sdate: `${year}-01-01`,
        edate:
          year == today.getFullYear()
            ? format(today, 'yyyy-MM-dd')
            : `${year}-12-31`,
        grid: '21',
        loc: `${request.coord[0]}, ${request.coord[1]}`,
        elems: [
          { name: 'maxt', units: 'degreeF' },
          { name: 'mint', units: 'degreeF' },
          { name: 'pcpn', units: 'inch' }
        ]
      })
    })
      .then((r) => r.json())
      .then((d) => d.data as Array<[string, number, number, number]>);

    weather.forEach(([date, maxt, mint, pcpn]) => {
      // TODO: I'm not sure about this "new Date()" so called "reference" ...
      const i = getDayOfYear(parse(date, 'yyyy-MM-dd', new Date())) - 1;
      thisYear.maxTemp[i] = maxt;
      thisYear.minTemp[i] = mint;
      thisYear.precipitation[i] = pcpn;
    });

    await thisYear.save();
  }
};

export {};
