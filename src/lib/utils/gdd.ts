import type { Weather, Year } from '$lib/db';

export function cornGDD(weather?: Weather): Array<number> {
  if (!weather) {
    return [];
  }

  const maxTemp = weather.maxTemp;
  const minTemp = weather.minTemp;

  return maxTemp.map((maxT, i) => {
    let minT = minTemp[i];
    if (!minT || minT === -999 || maxT === -999) {
      return 0;
    }

    minT = Math.max(minT, 50);
    maxT = Math.min(Math.max(maxT, 50), 86);

    return (maxT + minT) / 2.0 - 50;
  });
}

export type GDU = Array<number>;

export function cornGDU(weatherMap: Map<Year, Weather>): Map<Year, GDU> {
  const gdu = new Map<Year, GDU>();

  weatherMap.forEach((w, year) => {
    gdu.set(year, cornGDD(w));
  });

  return gdu;
}
