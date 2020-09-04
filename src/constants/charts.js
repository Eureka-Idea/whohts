import _ from 'lodash'

const CHARTS = {
  CONTEXT: {
    // title: 'context',
    id: 'CONTEXT'
  },
  P95: {
    title: 'Progress towards 95-95-95',
    id: 'P95',
    indicators: {
      status: 'Percent of people living with HIV who know their status',
      art: 'Percent of people who know their status who are on ART',
      suppression: 'Percent of people on ART who achieve viral suppression',
    }
  },
  PLHIV_DIAGNOSIS: {
    title: 'PLHIV by diagnosis and treatment status',
    id: 'PLHIV_DIAGNOSIS',
    indicators: {
      plhiv: 'People living with HIV - adults (aged 15+)',
      know: 'People living with HIV who know their status',
      onArt: 'People receiving antiretroviral therapy',
    }
  },
  PLHIV_SEX: {
    title: 'PLHIV who know status - by sex',
    id: 'PLHIV_SEX',
    indicators: {
      status: 'Percent of people living with HIV who know their status',
    }
  },
  PLHIV_AGE: {
    title: 'PLHIV who know status - by age',
    id: 'PLHIV_AGE',
    indicators: {
      aware: 'aware',
    }
  },
  HIV_NEGATIVE: {
    title: 'HIV-negative tests - first-time testers and repeat testers',
    id: 'HIV_NEGATIVE',
    indicators: {
      retests: 'retests_total',
      firsts: 'tests_first'
    }
  },
  HIV_POSITIVE: {
    title: 'HIV-positive tests - new diagnoses and retests',
    id: 'HIV_POSITIVE',
    indicators: {
      arts: 'retests_art',
      awares: 'retests_aware',
      firsts: 'tests_first',
    }
  },
  PREVALENCE: {
    title: 'Prevalence and positivity',
    id: 'PREVALENCE',
    shinyOnlyIndicators: {
      // 15-99, confidence intervals on value_comment
      positivity: 'positivity',
      dYield: 'yldnew',
    },
    indicators: {
      prevalence: 'prev',

      // 15+
      plhiv: 'People living with HIV - adults (aged 15+)', // ci on population_segment
      onArt: 'People receiving antiretroviral therapy',
      population: 'Population', // TODO: 15+
    }
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
const C = CHARTS

const FIELD_MAP = {
  INDICATOR: 'indicator',
  INDICATOR_DESCRIPTION: 'indicator_description',
  COUNTRY_ISO_CODE: 'country_iso_code',
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

// const R_2010_2019 = [
//   '2010','2011','2012','2013','2014',
//   '2015','2016','2017','2018','2019',
// ]
const R_2015_2019 = [
  '2015','2016','2017','2018','2019',
]
const R_ADULT_AGES = ['15-24', '25-34', '35-49', '50-99']
const R_SEXES = ['males', 'females']

// this map specifies which records need to be pulled to cover the indicators relevant to each chart
const getIndicatorMap = (isShiny) => {

  const indicatorMap = {
    [C.CONTEXT.id]: [
      {
        id: 'population',
        [F.INDICATOR]: 'Population',
        [F.UNIT_FORMAT]: 'NUMBER',
        [F.COUNTRY_ISO_CODE]: true,
        getter: results => {
          return _.maxBy(results, 'year')
        }
      },
      {
        id: 'classification',
        [F.INDICATOR]: 'Income Group',
        [F.COUNTRY_ISO_CODE]: true,
        getter: results => {
          return _.maxBy(results, 'year')
        }
      },
    ],
    [C.P95.id]: _.map(C.P95.indicators, (v, k) =>
      ({
        id: k,
        [F.INDICATOR]: v,
        [F.COUNTRY_ISO_CODE]: true,
        [F.AGE]: 'all ages',
        getter: results => {
          return _.maxBy(results, 'year')
        }
      })
    ),
    [C.PLHIV_DIAGNOSIS.id]: _.map(C.PLHIV_DIAGNOSIS.indicators, (v, k) => (
      {
        id: k,
        [F.INDICATOR]: v,
        [F.AGE]: '15+',
        [F.SEX]: 'NULL',
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: results => {
          return R_2015_2019.map(y => {
            const fResults = _.filter(results, r => r.year === y)

            const median = _.find(fResults, r => 
              !r.population_segment.includes('lower') &&
              !r.population_segment.includes('upper')
            )
            const lci = _.find(fResults, r => r.population_segment.includes('lower'))
            const uci = _.find(fResults, r => r.population_segment.includes('upper'))
            
            return { median, lci, uci }
          })
        }
      }
    )),
    [C.PLHIV_AGE.id]: R_ADULT_AGES.map(ageRange => (
      {
        id: ageRange,
        [F.INDICATOR]: C.PLHIV_AGE.indicators.aware,
        [F.AGE]: ageRange,
        [F.SEX]: 'both',
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: results => {
          return R_2015_2019.map(y => {
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
    )),
    [C.PLHIV_SEX.id]: R_SEXES.map(sex => (
      {
        id: sex,
        [F.INDICATOR]: C.PLHIV_SEX.indicators.status,
        [F.AGE]: '15+',
        [F.SEX]: sex,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: results => {
          return R_2015_2019.map(y => {
            return _.find(results, r => (r.year === y))
          })
        }
      }
    )),
    [C.HIV_NEGATIVE.id]: _.map(C.HIV_NEGATIVE.indicators, (v, k) => (
      {
        id: k,
        [F.INDICATOR]: v,
        [F.INDICATOR_DESCRIPTION]: 'negative',
        [F.AGE]: '15-99',
        [F.SEX]: 'both',
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: results => {
          return R_2015_2019.map(y => {
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
    )),
    [C.HIV_POSITIVE.id]: _.map(C.HIV_POSITIVE.indicators, (v, k) => (
      {
        id: k,
        [F.INDICATOR]: v,
        [F.INDICATOR_DESCRIPTION]: 'positive',
        [F.AGE]: '15-99',
        [F.SEX]: 'both',
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: results => {
          return R_2015_2019.map(y => {
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
    )),
    [C.PREVALENCE.id]: [
      {
        id: 'prevalence',
        [F.INDICATOR]: C.PREVALENCE.indicators.prevalence,
        [F.AGE]: '15-99',
        [F.SEX]: 'both',
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: results => {
          return R_2015_2019.map(y => {
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
      },
      {
        id: 'plhiv',
        [F.INDICATOR]: C.PREVALENCE.indicators.plhiv,
        [F.AGE]: '15+',
        [F.SEX]: 'NULL',
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: results => {
          return R_2015_2019.map(y => {
            const fResults = _.filter(results, r => r.year === y)
            
            const median = _.find(fResults, r =>
              !r.population_segment.includes('lower') &&
              !r.population_segment.includes('upper')
            )
            const lci = _.find(fResults, r => r.population_segment.includes('lower'))
            const uci = _.find(fResults, r => r.population_segment.includes('upper'))

            return { median, lci, uci }
          })
        }
      },
      {
        id: 'onArt',
        [F.INDICATOR]: C.PREVALENCE.indicators.onArt,
        [F.AGE]: '15+',
        [F.SEX]: 'NULL',
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: results => {
          return R_2015_2019.map(y => {
            return _.find(results, r => (r.year === y))
          })
        }
      },
      {
        id: 'population',
        [F.INDICATOR]: C.PREVALENCE.indicators.population,
        // [F.AGE]: '15+', TODO
        // [F.SEX]: 'both',
        [F.AREA_NAME]: 'NULL',
        [F.UNIT_FORMAT]: 'NUMBER', // otherwise may get another unit, e.g. 51.4 for Kenya row 3991911
        [F.COUNTRY_ISO_CODE]: true,
        getter: results => {
          return R_2015_2019.map(y => {
            return _.find(results, r => (r.year === y))
          })
        }
      },
    ]
  }

  if (isShiny) {
    const shinyPrevInds = _.map(C.PREVALENCE.shinyOnlyIndicators, (v, k) => ({
      id: k,
      [F.INDICATOR]: v,
      [F.AGE]: '15-99',
      [F.SEX]: 'both',
      [F.AREA_NAME]: 'NULL',
      [F.COUNTRY_ISO_CODE]: true,
        getter: results => {
          return R_2015_2019.map(y => {
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
      })
    )

    indicatorMap[C.PREVALENCE.id].push(...shinyPrevInds)
  }

  return indicatorMap
}

export { CHARTS, FIELD_MAP, AGGREGATE_GETTER, getIndicatorMap }