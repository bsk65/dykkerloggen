import { defineTexts } from '../translate'

export const airTexts = defineTexts({
  da: {
    title: 'Luftforbrug',
    sacUnit: 'liter/min ved overfladen',
    sacShort: 'L/min',
    gasUsedUnit: 'liter luft brugt',
    barPerMinUnit: 'bar/min ved overfladen',
    decoGasUnit: 'liter dekogas brugt',
    explain:
      'Forbruget er omregnet til overfladen (SAC), så dyk på forskellige dybder kan sammenlignes. Beregnet ud fra flaskestørrelse, tryk, dyktid og gennemsnitsdybde.',
    usedMaxDepth:
      'Gennemsnitsdybden mangler, så maks. dybde er brugt. Det reelle forbrug er derfor højere end vist.',
    missingData:
      'Udfyld flaskestørrelse, start- og sluttryk, dyktid og dybde for at få beregnet luftforbruget.',
  },
  en: {
    title: 'Air consumption',
    sacUnit: 'litres/min at the surface',
    sacShort: 'L/min',
    gasUsedUnit: 'litres of gas used',
    barPerMinUnit: 'bar/min at the surface',
    decoGasUnit: 'litres of deco gas used',
    explain:
      'Consumption is converted to the surface (SAC), so dives at different depths can be compared. Calculated from tank size, pressure, dive time and average depth.',
    usedMaxDepth:
      'The average depth is missing, so the max depth was used. The real consumption is therefore higher than shown.',
    missingData:
      'Fill in tank size, start and end pressure, dive time and depth to calculate the air consumption.',
  },
})
