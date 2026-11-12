// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { parseUddf, UddfError } from './uddf'
import { planUddfImport } from './uddfImport'
import { testDive } from './testDive'

/** En lille UDDF-fil som dem, Shearwater Cloud eksporterer. */
const UDDF = `<?xml version="1.0" encoding="utf-8"?>
<uddf version="3.2.3" xmlns="http://www.streit.cc/uddf/3.2/">
  <generator><name>Shearwater Cloud Desktop</name></generator>
  <diver><owner><equipment>
    <divecomputer id="PC1"><name>Perdix AI</name><model>Perdix AI</model></divecomputer>
  </equipment></owner></diver>
  <divesite><site id="S1"><name>Vraget</name><geography><location>Øen</location></geography></site></divesite>
  <gasdefinitions>
    <mix id="M32"><o2>0.32</o2><he>0</he></mix>
    <mix id="M50"><o2>0.5</o2><he>0</he></mix>
  </gasdefinitions>
  <decomodel><buehlmann id="zhl16c"><gradientfactorhigh>85</gradientfactorhigh><gradientfactorlow>40</gradientfactorlow></buehlmann></decomodel>
  <profiledata><repetitiongroup>
    <dive id="D1">
      <informationbeforedive>
        <link ref="S1" /><divenumber>12</divenumber>
        <datetime>2025-12-30T09:32:15Z</datetime>
        <equipmentused><link ref="PC1" /></equipmentused>
      </informationbeforedive>
      <tankdata><tankpressurebegin>0</tankpressurebegin></tankdata>
      <tankdata><tankpressurebegin>20000000</tankpressurebegin><tankpressureend>5000000</tankpressureend></tankdata>
      <samples>
        <waypoint><depth>0</depth><divetime>0</divetime><switchmix ref="M32" /><temperature>299.15</temperature></waypoint>
        <waypoint><depth>18</depth><divetime>60</divetime><tankpressure ref="T1">19500000</tankpressure><temperature>297.15</temperature><nodecotime>3000</nodecotime><cns>5</cns></waypoint>
        <waypoint><depth>18</depth><divetime>1200</divetime><nodecotime>0</nodecotime><decostop kind="mandatory" decodepth="3" duration="60" /><cns>12</cns></waypoint>
        <waypoint><depth>6</depth><divetime>1500</divetime><switchmix ref="M50" /></waypoint>
        <waypoint><depth>0</depth><divetime>1800</divetime></waypoint>
      </samples>
      <informationafterdive><greatestdepth>18.2</greatestdepth><averagedepth>14.04</averagedepth><diveduration>1810</diveduration></informationafterdive>
    </dive>
  </repetitiongroup></profiledata>
  <tablegeneration><calculateprofile><profile><density>1020</density></profile></calculateprofile></tablegeneration>
</uddf>`

describe('parseUddf', () => {
  const [dive] = parseUddf(UDDF)

  it('reads the dive', () => {
    expect(dive).toMatchObject({
      id: 'D1',
      computerDiveNumber: 12,
      date: '2025-12-30',
      entryTime: '09:32',
      diveTimeMin: 30,
      maxDepthM: 18.2,
      avgDepthM: 14,
      siteName: 'Vraget',
      region: 'Øen',
      o2Percent: 32,
      salt: true,
      startBar: 200,
      endBar: 50,
      minTempC: 24,
      computer: 'Perdix AI',
      gfLow: 40,
      gfHigh: 85,
      decoRequired: true,
      maxCns: 12,
    })
  })

  it('reads the profile in metric units', () => {
    expect(dive.profile.t).toEqual([0, 60, 1200, 1500, 1800])
    expect(dive.profile.d).toEqual([0, 18, 18, 6, 0])
    expect(dive.profile.temp).toEqual([26, 24, null, null, null])
    expect(dive.profile.bar).toEqual([null, 195, null, null, null])
    expect(dive.profile.ndl).toEqual([null, 50, 0, null, null])
    expect(dive.profile.stop).toEqual([null, null, 3, null, null])
    expect(dive.profile.gas).toEqual([
      { t: 0, o2: 32 },
      { t: 1500, o2: 50 },
    ])
  })

  it('rejects other files', () => {
    expect(() => parseUddf('<html></html>')).toThrow(UddfError)
    expect(() => parseUddf('ikke xml')).toThrow(UddfError)
  })
})

describe('planUddfImport', () => {
  const [u] = parseUddf(UDDF)

  it('creates a new dive with the next number', () => {
    const plan = planUddfImport([u], [testDive({ id: 'a', diveNumber: 38, date: '2025-01-01' })])
    expect(plan.newDives).toHaveLength(1)
    expect(plan.newDives[0].docId).toBe('uddf-D1')
    expect(plan.newDives[0].data).toMatchObject({
      diveNumber: 39,
      date: '2025-12-30',
      entryTime: '09:32',
      siteName: 'Vraget',
      nitrox: true,
      o2Percent: 32,
      source: 'computer',
      computerDiveId: 'D1',
      deco: true,
    })
    expect(plan.newDives[0].data.profile?.computer).toBe('Perdix AI')
  })

  it('links to a dive logged at the same time and keeps its own figures', () => {
    const logged = testDive({
      id: 'x',
      date: '2025-12-30',
      entryTime: '09:40',
      siteName: 'Mit navn',
      maxDepthM: 18,
      avgDepthM: null,
      startBar: null,
    })
    const plan = planUddfImport([u], [logged])
    expect(plan.newDives).toHaveLength(0)
    expect(plan.links).toHaveLength(1)
    const { patch } = plan.links[0]
    expect(patch.siteName).toBeUndefined()
    expect(patch.maxDepthM).toBeUndefined()
    expect(patch.avgDepthM).toBe(14)
    expect(patch.startBar).toBe(200)
    expect(patch.computerDiveId).toBe('D1')
  })

  it('skips dives that are already imported', () => {
    const plan = planUddfImport([u], [testDive({ computerDiveId: 'D1' })])
    expect(plan.duplicates).toBe(1)
    expect(plan.newDives).toHaveLength(0)
  })
})
