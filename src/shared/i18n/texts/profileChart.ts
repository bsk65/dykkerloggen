import { defineTexts } from '../translate'

export const profileChartTexts = defineTexts({
  da: {
    title: 'Dykkerprofil',
    aria: 'Dykkerprofil: maks. {max} m, {min} min',
    axes: 'Dybde i meter · tid i minutter',
    depth: 'Dybde',
    deco: 'Dekoforpligtelse (computer)',
    fast: 'For hurtig opstigning (over {n} m/min)',
    hint: 'Tryk eller før fingeren hen over grafen for at se tal undervejs.',
    tipNdl: '{n} min til dekogrænsen',
    tipStop: 'Dekostop krævet på {m} m',
    temps: 'Vand {min}–{max} °C',
    cns: 'CNS højst {n} %',
    source: '{computer} · {n} målinger',
  },
  en: {
    title: 'Dive profile',
    aria: 'Dive profile: max {max} m, {min} min',
    axes: 'Depth in metres · time in minutes',
    depth: 'Depth',
    deco: 'Deco obligation (computer)',
    fast: 'Too fast ascent (over {n} m/min)',
    hint: 'Tap or drag your finger across the chart to see the figures along the way.',
    tipNdl: '{n} min to the no-deco limit',
    tipStop: 'Deco stop required at {m} m',
    temps: 'Water {min}–{max} °C',
    cns: 'CNS max {n} %',
    source: '{computer} · {n} samples',
  },
})
