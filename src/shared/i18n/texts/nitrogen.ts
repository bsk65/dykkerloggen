import { defineTexts } from '../translate'

export const nitrogenTexts = defineTexts({
  da: {
    title: 'Kvælstof (Bühlmann ZHL-16C)',
    missing: 'Udfyld maks. dybde og dyktid for at få beregnet kvælstofoptagelsen.',
    unsupported: 'Kvælstofberegningen findes kun for dyk med almindelig flaske (åbent kredsløb).',
    noDecoUnit: 'til dekogrænsen ved bundtidens slut',
    noDecoMax: 'over 3 t',
    decoUnit: 'dekostop krævet',
    surfaceGfUnit: 'mætning efter dykket (grænse {limit} %)',
    stops: 'Beregnede stop: {stops}',
    stop: '{depth} m i {min} min',
    loggedNoDeco:
      'Beregningen siger dekostop, men du loggede ingen. Det er helt normalt: et rigtigt dyk er sjældent hele tiden på maks. dybde, så computeren gav dig mere tid end dette forsigtige skøn.',
    chartTitle: 'Mætning i de 16 væv lige efter dykket',
    chartFast: 'Hurtige væv',
    chartSlow: 'Langsomme væv',
    limitLine: 'Grænse {n} %',
    tissue: 'Væv {n} (halveringstid {h} min): {p} % af grænsen',
    tissueHint: 'Tryk på en søjle for at se vævet.',
    leading: 'Mest mættet: væv {n} (halveringstid {h} min).',
    repetitive:
      'Restkvælstof fra {n} tidligere dyk (overfladetid {interval}): op til {pct} % mere kvælstof end normalt ved start.',
    repetitiveFresh: 'Uden de tidligere dyk: {fresh} til dekogrænsen.',
    repetitiveFreshDeco: 'Uden de tidligere dyk: også ved eller over dekogrænsen.',
    skipped:
      '{n} dyk inden for de foregående 48 timer kunne ikke regnes med (mangler klokkeslæt, dybde eller dyktid).',
    hours: '{h} t {m} min',
    minutes: '{m} min',
    gasAir: 'luft',
    gasNitrox: 'nitrox {o2} %',
    stopSafety: '3 min sikkerhedsstop på 5 m',
    stopDeco: 'de beregnede dekostop',
    stopNone: 'uden stop',
    assumptions:
      'Skøn: dykket regnes, som om du var på {depth} m i hele bundtiden ({bottom} min), med 18 m/min ned, 9 m/min op og {stop}. Ved havniveau, med {gas} hele dykket. Gradient factors {low}/{high} (kan ændres under Profil). Det giver for meget kvælstof hellere end for lidt.',
    disclaimer:
      'Kun til at forstå dykket bagefter — brug det aldrig til at planlægge et dyk. Følg altid din dykkercomputer og guide.',
    settingLabel: 'Kvælstofberegning',
    settingHint:
      'Hvor forsigtigt dykkets kvælstof beregnes (gradient factors). Påvirker kun visningen i appen.',
    preset_conservative: 'Forsigtig (30/70)',
    preset_standard: 'Mellem (40/85)',
    preset_liberal: 'Mindre forsigtig (50/90)',
  },
  en: {
    title: 'Nitrogen (Bühlmann ZHL-16C)',
    missing: 'Fill in max depth and dive time to calculate the nitrogen uptake.',
    unsupported: 'The nitrogen calculation is only available for open-circuit scuba dives.',
    noDecoUnit: 'to the no-deco limit at the end of the bottom time',
    noDecoMax: 'over 3 h',
    decoUnit: 'deco stops required',
    surfaceGfUnit: 'saturation after the dive (limit {limit} %)',
    stops: 'Calculated stops: {stops}',
    stop: '{depth} m for {min} min',
    loggedNoDeco:
      'The calculation says deco stops, but you logged none. That is perfectly normal: a real dive is rarely at max depth the whole time, so your computer gave you more time than this cautious estimate.',
    chartTitle: 'Saturation in the 16 tissues right after the dive',
    chartFast: 'Fast tissues',
    chartSlow: 'Slow tissues',
    limitLine: 'Limit {n} %',
    tissue: 'Tissue {n} (half-time {h} min): {p} % of the limit',
    tissueHint: 'Tap a bar to see the tissue.',
    leading: 'Most saturated: tissue {n} (half-time {h} min).',
    repetitive:
      'Residual nitrogen from {n} earlier dive(s) (surface interval {interval}): up to {pct} % more nitrogen than normal at the start.',
    repetitiveFresh: 'Without the earlier dives: {fresh} to the no-deco limit.',
    repetitiveFreshDeco: 'Without the earlier dives: also at or beyond the no-deco limit.',
    skipped:
      '{n} dive(s) within the previous 48 hours could not be included (missing time of day, depth or dive time).',
    hours: '{h} h {m} min',
    minutes: '{m} min',
    gasAir: 'air',
    gasNitrox: 'nitrox {o2} %',
    stopSafety: 'a 3 min safety stop at 5 m',
    stopDeco: 'the calculated deco stops',
    stopNone: 'no stops',
    assumptions:
      'Estimate: the dive is calculated as if you were at {depth} m for the whole bottom time ({bottom} min), descending at 18 m/min, ascending at 9 m/min with {stop}. At sea level, breathing {gas} throughout. Gradient factors {low}/{high} (can be changed under Profile). It errs towards too much nitrogen rather than too little.',
    disclaimer:
      'Only for understanding the dive afterwards — never use it to plan a dive. Always follow your dive computer and guide.',
    settingLabel: 'Nitrogen calculation',
    settingHint:
      'How cautiously the nitrogen of your dives is calculated (gradient factors). Only affects what the app shows.',
    preset_conservative: 'Conservative (30/70)',
    preset_standard: 'Medium (40/85)',
    preset_liberal: 'Less conservative (50/90)',
  },
})
