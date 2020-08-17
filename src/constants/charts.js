import _ from 'lodash'

const CHARTS = {
  CONTEXT: {
    // title: 'context',
    id: 'CONTEXT'
  },
  PLHIV_DIAGNOSIS: {
    title: 'PLHIV by diagnosis and treatment status',
    id: 'PLHIV_DIAGNOSIS'
  },
  PLHIV_SEX: {
    title: 'PLHIV who know status - by sex',
    id: 'PLHIV_SEX'
  },
  PLHIV_AGE: {
    title: 'PLHIV who know status - by age',
    id: 'PLHIV_AGE'
  },
  HIV_NEGATIVE: {
    title: 'HIV-negative tests - first-time testers and repeat testers',
    id: 'HIV_NEGATIVE'
  },
  HIV_POSITIVE: {
    title: 'HIV-positive tests - new diagnoses and retests',
    id: 'HIV_POSITIVE'
  },
  PREVALENCE: {
    title: 'Prevalence and positivity',
    id: 'PREVALENCE'
  },
  ADULTS: {
    title: 'Adults',
    id: 'ADULTS'
  },
  COMMUNITY: {
    title: 'Community Testing Modalities',
    id: 'COMMUNITY'
  },
  FACILITY: {
    title: 'Facility Testing Modalities',
    id: 'FACILITY'
  },
  INDEX: {
    title: 'Index',
    id: 'INDEX'
  },
  FORECAST: {
    title: 'HIVST Forecast',
    id: 'FORECAST'
  },
  KP_TABLE: {
    title: 'Key Populations',
    id: 'KP_TABLE'
  },
  POLICY_TABLE: {
    title: 'WHO HIV Testing Policy Compliance',
    id: 'POLICY_TABLE'
  },
  GROUPS_TABLE: {
    title: 'Population Groups',
    id: 'GROUPS_TABLE'
  },
}

const FIELD_MAP = {
  INDICATOR: 'indicator',
  INDICATOR_DESCRIPTION: 'indicator_description',
  CONTRY_ISO_CODE: 'contry_iso_code',
  COUNTRY_NAME: 'country_name',
  AREA_NAME: 'area_name',
  GEOGRAPHIC_SCOPE: 'geographic_scope',
  YEAR: 'year',
  SEX: 'sex',
  AGE: 'age',
  POPULATION_SEGMENT: 'population_segment',
  POPULATION_SUB_GROUP: 'population_sub_group',
  VALUE: 'value',
  VALUE_COMMENT: 'value_comment',
  UNIT_FORMAT: 'unit_format',
  SOURCE_ORGANIZATION: 'source_organization',
  SOURCE_DATABASE: 'source_database',
  SOURCE_YEAR: 'source_year',
  NOTES: 'notes',
  MODALITY: 'modality',
  MODALITY_CATEGORY: 'modality_category'
}
const F = FIELD_MAP

// indicates that the getter is for *all* chart values, rather than one (so MUST return a map of id -> value)
const AGGREGATE_GETTER = 'AGGREGATE_GETTER'

const R_2010_2019 = [
  '2010','2011','2012','2013','2014',
  '2015','2016','2017','2018','2019',
]
const R_ADULT_AGES = ['15-24', '25-34', '35-49', '50-99']

const INDICATOR_MAP = {
  [CHARTS.CONTEXT.id]: [
    {
      id: 'population',
      [F.INDICATOR]: 'Population',
      [F.COUNTRY_NAME]: true,
      getter: results => {
        return _.maxBy(results, 'year')
      }
    },
    {
      id: 'classification',
      [F.INDICATOR]: 'Country income classification', //TODO: not in DB
      [F.COUNTRY_NAME]: true,
      getter: results => {
        return _.maxBy(results, 'year')
      }
    },
  ],
  [CHARTS.PLHIV_AGE.id]: R_ADULT_AGES.map(ageRange => (
    {
      id: ageRange,
      [F.INDICATOR]: 'aware',
      [F.AGE]: ageRange,
      [F.SEX]: 'both',
      // [F.YEAR]: '2020', // CHECK: do we need to go earlier for some?
      [F.AREA_NAME]: 'NULL',
      [F.COUNTRY_NAME]: true,
      getter: results => {
        return R_2010_2019.map(y => {
          const fResults = _.filter(results, r => r.year === y)
          const lci = _.find(fResults, r => {
            return r[F.VALUE_COMMENT] === 'lci'
          })
          const uci = _.find(fResults, r => {
            return r[F.VALUE_COMMENT] === 'uci'
          })
          const median = _.find(fResults, r => {
            return r[F.VALUE_COMMENT] === 'median'
          })
          return { lci, uci, median }
        })
      }
    }
  ))
}

export { CHARTS, FIELD_MAP, INDICATOR_MAP, AGGREGATE_GETTER }