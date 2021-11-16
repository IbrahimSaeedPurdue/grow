<script context="module" lang="ts">
  import { goto } from '$app/navigation';
  import { Field, Year } from '$lib/db';
  //import { Weather } from '$lib/db';

  import type { Load } from '@sveltejs/kit';

  export const load: Load = async ({ page /*, fetch */ }) => {
    const id = page.params['id'] || '';
    const field = await Field.get(id);

    if (!field) {
      return goto('/fields');
    }

    return {
      props: { field }
    };
  };
</script>

<script lang="ts">
  import '@carbon/charts/styles.min.css';
  import 'carbon-components/css/carbon-components.min.css';
  import { AreaChart } from '@carbon/charts-svelte';
  import Header from '$lib/components/Header.svelte';
  import FieldCard from '$lib/components/FieldCard.svelte';
  import { weatherStore } from '$stores/weather';
  import { cornGDU, GDU } from '$lib/utils/gdd';
  import { addDays, getDayOfYear } from 'date-fns';
  import SettingsIcon from '$lib/icons/SettingsIcon.svelte';

  export let field: Field;
  // console.log('field: ', field);
  
  function handleOpenEdit() {
    goto('/fields/' + field.id + '/edit');
  }

  // Parameters of the weather computations
  // const now = new Date();
  const now = new Date('09/15/2021');
  const year = now.getFullYear();
  const todayDoY = getDayOfYear(now);
  // const plantDoY = getDayOfYear(field.datePlanted || now);

  // Years to base weather insights from
  const years = Array.from(new Array(6), (_, i) => year - i);
  const weather = weatherStore(field.center, years);
  

  let gdu: Map<Year, GDU> | undefined;
  let data: Array<{ group: string; date: Date; value: number, min: number, max: number }> = [];
  $: {
    gdu = cornGDU($weather);

    let gduYear = gdu.get(year);
    if (gduYear) {
      let last = 0;

      data = gduYear.slice(0, todayDoY + 1).map((v, doy) => {
        last += v;
        return {
          group: 'GDU',
          label: 'GDU',
          date: addDays(new Date(2021, 0), doy),
          value: last,
          min: last,
          max: last
        };
      });
      
      gduYear.slice(todayDoY + 1).forEach((v, i) => {
        last += v
        const doy = todayDoY + i;
        data.push({
          group: 'GDU',
          label: 'GDU Forecast',
          date: addDays(new Date(2021, 0), doy),
          value: last,
          min: last,
          max: last
        });
      })

      // Calculate min and max for each day between all the years
      const yearsCumulats: Array<number[]> = []
      gdu.forEach((yearGDUs) => {
        let sum: number = 0
        yearsCumulats.push(
          yearGDUs.map(v => {
            sum += v
            return sum;
          })
        );
      })

      // const minMaxData = data.map((point) => ({min: point.value, max:point.value}))
      data.forEach((_, doy) => {
        yearsCumulats.forEach((year) => {
          if (doy < year.length && year[doy] < data[doy].min) {
            data[doy].min = year[doy];
          } else if (doy < year.length && year[doy] > data[doy].max) {
            data[doy].max = year[doy];
          }
        })

      });
      
      console.log(data);
      
    }
  }
</script>

<Header title={`Field: ${field.name}`} backPath="/fields">
  <SettingsIcon
    slot="right"
    class="fill-current h-6 w-6"
    on:click={handleOpenEdit}
  />
</Header>

<FieldCard {field} />

<div class="container m-3 p-6">
  <AreaChart
    {data}
    options={{
      // getStrokeColor: function (group, label, data, defaultStrokeColor) {
      //   console.log(group, label, data, defaultStrokeColor);

      //   return 'green'
      // },
      // getFillColor: function (datasetLabel, label, value) {
      //   console.log(datasetLabel, label, value);
        
      //   return 'yellow'
      //   return false // return falsey values for default colors
      // },
      title: 'GDU Plots',
      data: {
        loading: false
      },
      points: {
        radius: 0,
        enabled: false
      },
      bounds: {
        upperBoundMapsTo: "max",
        lowerBoundMapsTo: "min"
      },
      axes: {
        bottom: {
          title: 'Date',
          mapsTo: 'date',
          scaleType: ScaleTypes.TIME,
          ticks: {
            rotation: 'always'
          },
          thresholds: [
            {
              value: addDays(new Date(2021, 0), todayDoY),
              label: "Today",
              fillColor: "red"
            }
			    ]
        },
        left: {
          mapsTo: 'value',
          title: 'Accumlated GDU',
          scaleType: 'linear',
          "thresholds": [
            {
              "value": 1000,
              "label": 'threshold label here!',
              "fillColor": "#03a9f4"
            }
          ]
        }
      },
      // color: {
      //   scale: {
      //     "GDU": "green",
      //     "GDU Forecast": "red",
      //   }
      // },
      timeScale: {
        addSpaceOnEdges: 0
      },
      zoomBar: {
        top: {
          enabled: true
        }
      },
      curve: 'curveMonotoneX',
      height: '400px'
    }}
  />
  
</div>
