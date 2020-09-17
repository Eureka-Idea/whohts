import _ from 'lodash'

// indicates that the getter is for *all* chart values, rather than one (so MUST return a map of id -> value)
const AGGREGATE_GETTER = 'AGGREGATE_GETTER'

const getGenericIndId = indId => {
  return indId.replace(/\d+$/, '')
}

const R_2015_2019 = [
  '2015', '2016', '2017', '2018', '2019',
]
const R_2018_2019 = [
  '2018', '2019',
]
const R_2020_2025 = [
  '2020', '2021', '2022', '2023', '2024', '2025',
]
const R_ADULT_AGES = ['15-24', '25-34', '35-49', '50-99']
const R_SEXES = ['males', 'females']

const SOURCE_DB_MAP = {
  GAM20: 'Global AIDS Monitoring 2020',
  GAM19: 'Global AIDS Monitoring 2019',
  NPD: 'National Programme Data 2019',
  PCOP20: 'PEPFAR COP 2020',
  PROP20: 'PEPFAR ROP 2020',
  PCOP19: 'PEPFAR COP 2019',
  PROP19: 'PEPFAR ROP 2019',
  PCOP18: 'PEPFAR COP 2018',
  PROP18: 'PEPFAR ROP 2018',
  PCOP17: 'PEPFAR COP 2017',
  PROP17: 'PEPFAR ROP 2017',
  PEPFAR: 'PEPFAR System Data Extract',

  WME: 'WHO model estimates',
}

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
  MODALITY_CATEGORY: 'modality_category',
  VALUE_UPPER: 'value_upper',
  VALUE_LOWER: 'value_lower',
}
const F = FIELD_MAP

const adultsGAM20 = {
  id: 'GAM20',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.GAM20,
      [F.VALUE_COMMENT]: 'validated',
    }
  },
  indicators: {
    total1: 'Den Age-All',
    men1: 'Den Age-Male Gte 15',
    women1: 'Den Age-Female Gte 15',
    pTotal1: 'Per Age-All',
    pMen1: 'Per Age-Male Gte 15',
    pWomen1: 'Per Age-Female Gte 15',
  }
}
const adultsGAM19 = {
  id: 'GAM19',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.GAM19,
    }
  },
  indicators: {
    total2: 'Total volume of tests conducted in past year',
    men2: 'Men (15+) - Number of tests',
    women2: 'Women (15+) - Number of tests',
    pTotal2: 'Total aggregate positivity',
    pMen2: 'Men (15+) - Positivity',
    pWomen2: 'Women (15+) - Positivity',
  }
}
const adultsNPD = {
  id: 'NPD',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.NPD,
    }
  },
  indicators: { // NOTE: same as GAM
    total3: 'Total volume of tests conducted in past year',
    men3: 'Men (15+) - Number of tests',
    women3: 'Women (15+) - Number of tests',
    pTotal3: 'Total aggregate positivity',
    pMen3: 'Men (15+) - Positivity',
    pWomen3: 'Women (15+) - Positivity',
  }
}
const adultsPCOP20 = {
  id: 'PCOP20',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.PCOP20,
    }
  },
  indicators: {
    total4: 'Den Age-All',
    men4: 'Den Age-Male Gte 15',
    women4: 'Den Age-Female Gte 15',
    pTotal4: 'Per Age-All',
    pMen4: 'Per Age-Male Gte 15',
    pWomen4: 'Per Age-Female Gte 15',
  }
}
const adultsPROP20 = {
  id: 'PROP20',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.PROP20,
    }
  },
  indicators: {
    total5: 'Den Age-All',
    men5: 'Den Age-Male Gte 15',
    women5: 'Den Age-Female Gte 15',
    pTotal5: 'Per Age-All',
    pMen5: 'Per Age-Male Gte 15',
    pWomen5: 'Per Age-Female Gte 15',
  }
}
const adultsPCOP19 = {
  id: 'PCOP19',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.PCOP19,
    }
  },
  indicators: {
    total6: 'People Tested in Past Year',
    men6: 'Men (Tested in past year)',
    women6: 'Women (Tested in past year)',
    pTotal6: 'Aggregate Positivity - Tests conducted and positivity, by sex',
    pMen6: 'Men - Positivity',
    pWomen6: 'Women - Positivity',
  }
}
const adultsPROP19 = {
  id: 'PROP19',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.PROP19,
    }
  },
  indicators: {
    total7: 'People Tested in Past Year',
    men7: 'Men (Tested in past year)',
    women7: 'Women (Tested in past year)',
    pTotal7: 'Aggregate Positivity - Tests conducted and positivity, by sex',
    pMen7: 'Men - Positivity',
    pWomen7: 'Women - Positivity',
  }
}
const adultsPCOP18 = {
  id: 'PCOP18',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.PCOP18,
    }
  },
  indicators: {
    total8: 'People Tested in Past Year',
    men8: 'Men (Tested in past year)',
    women8: 'Women (Tested in past year)',
    pTotal8: 'Aggregate Positivity - Tests conducted and positivity, by sex',
    pMen8: 'Men - Positivity',
    pWomen8: 'Women - Positivity',
  }
}
const adultsPROP18 = {
  id: 'PROP18',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.PROP18,
    }
  },
  indicators: {
    total9: 'People Tested in Past Year',
    men9: 'Men (Tested in past year)',
    women9: 'Women (Tested in past year)',
    pTotal9: 'Aggregate Positivity - Tests conducted and positivity, by sex',
    pMen9: 'Men - Positivity',
    pWomen9: 'Women - Positivity',
  }
}
const adultsPCOP17 = {
  id: 'PCOP17',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.PCOP17,
    }
  },
  indicators: {
    total10: 'People Tested in Past Year',
    men10: 'Men (Tested in past year)',
    women10: 'Women (Tested in past year)',
    pTotal10: 'Aggregate Positivity - Tests conducted and positivity, by sex',
    pMen10: 'Men - Positivity',
    pWomen10: 'Women - Positivity',
  }
}
const adultsPROP17 = {
  id: 'PROP17',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.PROP17,
    }
  },
  indicators: {
    total11: 'People Tested in Past Year',
    men11: 'Men (Tested in past year)',
    women11: 'Women (Tested in past year)',
    pTotal11: 'Aggregate Positivity - Tests conducted and positivity, by sex',
    pMen11: 'Men - Positivity',
    pWomen11: 'Women - Positivity',
  }
}
const adultsPEPFAR = {
  id: 'PEPFAR',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.PEPFAR,
    }
  },
  indicators: {
    total4: 'People Tested in Past Year',
    men4: 'Men (15+) Tested in Past Year',
    women4: 'Women (15+) Tested in Past Year',
    pTotal4: 'Total positivity',
    pMen4: 'Positivity - Men (15+)',
    pWomen4: 'Positivity - Women (15+)',
  }
}

const communityGAM20 = {
  id: 'GAM20',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.GAM20,
      [F.VALUE_COMMENT]: 'validated',
    }
  },
  indicators: {
    total1: 'Den Community-Community All',
    mobile1: 'Den Community-Community Mobile',
    VCT1: 'Den Community-Community Vct',
    other1: 'Den Community-Community Other',
    pTotal1: 'Per Community-Community All',
    pMobile1: 'Per Community-Community Mobile',
    pVCT1: 'Per Community-Community Vct',
    pOther1: 'Per Community-Community Other',
  }
}
const communityGAM19 = {
  id: 'GAM19',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.GAM19,
    }
  },
  indicators: {
    total2: 'Total Volume - Tests conducted and positivity at community level',
    mobile2: 'Mobile testing - Number of tests - Community',
    VCT2: 'VCT - Number of tests - Community',
    other2: 'Other - Number of tests - Community',
    pTotal2: 'Aggregate Positivity - Tests conducted and positivity at community level',
    pMobile2: 'Mobile testing - Positivity - Community',
    pVCT2: 'VCT - Positivity - Community',
    pOther2: 'Other - Positivity - Community',
  }
}
const communityNPD = {
  id: 'NPD',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.NPD,
    }
  },
  indicators: { // same as GAM19
    total3: 'Total Volume - Tests conducted and positivity at community level',
    mobile3: 'Mobile testing - Number of tests - Community',
    VCT3: 'VCT - Number of tests - Community',
    other3: 'Other - Number of tests - Community',
    pTotal3: 'Aggregate Positivity - Tests conducted and positivity at community level',
    pMobile3: 'Mobile testing - Positivity - Community',
    pVCT3: 'VCT - Positivity - Community',
    pOther3: 'Other - Positivity - Community',
  }
}
const communityPEPFAR = {
  id: 'PEPFAR',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.PEPFAR,
    }
  },
  indicators: { // TODO: fix calculated values
    total4: 'Total Community Tests',
    mobile4: 'HIV tests conducted(sum of modality_category like community mobile testing)',
    VCT4: 'HIV tests conducted(sum of modality_category like community VCT centres)',
    other4: 'HIV tests conducted(sum of modality_category like community other)',
    pTotal4: 'Positivity - Community Modalities Total',
    pMobile4: 'Positivity - Community Mobile Testing',
    pVCT4: 'Positivity - Community VCT Testing',
    pOther4: 'Positivity - Community Other Testing',
  }
}

const facilityGAM20 = {
  id: 'GAM20',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.GAM20,
      [F.VALUE_COMMENT]: 'validated',
    }
  },
  indicators: {
    total1: 'Den Facility-Facility All',
    PITC1: 'Den Facility-Facility Provider Init',
    ANC1: 'Den Facility-Facility Anc',
    VCT1: 'Den Facility-Facility Vct',
    family1: 'Den Facility-Facility Fp Clinic',
    other1: 'Den Facility-Facility Other',
    pTotal1: 'Per Facility-Facility All',
    pPITC1: 'Per Facility-Facility Provider Init',
    pANC1: 'Per Facility-Facility Anc',
    pVCT1: 'Per Facility-Facility Vct',
    pFamily1: 'Per Facility-Facility Fp Clinic',
    pOther1: 'Per Facility-Facility Other',
  }
}
const facilityGAM19 = {
  id: 'GAM19',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.GAM19,
    }
  },
  indicators: {
    total2: 'Total Volume - Tests conducted and positivity at facility level',
    PITC2: 'PITC - Number of tests - Facility',
    ANC2: 'ANC - Number of tests - Facility',
    VCT2: 'VCT - Number of tests - Facility',
    family2: 'n/a',
    other2: 'Other - Number of tests - Facility',
    pTotal2: 'Aggregate Positivity - Tests conducted and positivity at facility level',
    pPITC2: 'PITC - Positivity - Facility',
    pANC2: 'ANC - Positivity - Facility',
    pVCT2: 'VCT - Positivity - Facility',
    pFamily2: 'n/a',
    pOther2: 'Other - Positivity - Facility',
  }
}
const facilityNPD = {
  id: 'NPD',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.NPD,
    }
  },
  indicators: { // same as GAM19
    total3: 'Total Volume - Tests conducted and positivity at facility level',
    PITC3: 'PITC - Number of tests - Facility',
    ANC3: 'ANC - Number of tests - Facility',
    VCT3: 'VCT - Number of tests - Facility',
    family3: 'n/a',
    other3: 'Other - Number of tests - Facility',
    pTotal3: 'Aggregate Positivity - Tests conducted and positivity at facility level',
    pPITC3: 'PITC - Positivity - Facility',
    pANC3: 'ANC - Positivity - Facility',
    pVCT3: 'VCT - Positivity - Facility',
    pFamily3: 'n/a',
    pOther3: 'Other - Positivity - Facility',
  }
}
const facilityPEPFAR = {
  id: 'PEPFAR',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.PEPFAR,
    }
  },
  indicators: { // TODO: fix calculated values
    total4: 'Total Facility Tests',
    PITC4: 'HIV tests conducted (sum of modality_category like facility provider initiated)',
    ANC4: 'HIV tests conducted (sum of modality_category like facility ANC clinics)',
    VCT4: 'HIV tests conducted (sum of modality_category like facility VCT)',
    family4: 'n/a',
    other4: 'HIV tests conducted (sum of modality_category like facility other)',
    pTotal4: 'Positivity - Facility Modalities Total',
    pPITC4: 'Positivity - Facility PITC Testing',
    pANC4: 'Positivity - Facility ANC Testing',
    pVCT4: 'Positivity - Facility VCT Testing',
    pFamily4: 'n/a',
    pOther4: 'Positivity - Facility Other Testing',
  }
}

const forecastGAM20 = {
  id: 'GAM20',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.GAM20,
      [F.VALUE_COMMENT]: 'validated',
    }
  },
  indicators: {
    distributed1: 'Self Test Distributed-Data Value'
  }
}
const forecastGAM19 = {
  id: 'GAM19',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.GAM19,
    }
  },
  indicators: {
    distributed2: 'HIVSTs distributed'
  }
}
const forecastNPD = {
  id: 'NPD',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.NPD,
    }
  },
  indicators: { // same as GAM19
    distributed3: 'HIVSTs distributed'
  }
}
const forecastPEPFAR = {
  id: 'PEPFAR',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.PEPFAR,
    }
  },
  indicators: {
    distributed4: 'HIV self-tests distributed'
  }
}
const forecastWME = {
  id: 'WME',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.WME,
    }
  },
  indicators: {
    demand1: 'HIVST forecast demand',
    need1: 'HIVST forecast need',
  }
}

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
    shinyOnly: true,
    indicators: {
      aware: 'aware',
    }
  },
  HIV_NEGATIVE: {
    title: 'HIV-negative tests - first-time testers and repeat testers',
    id: 'HIV_NEGATIVE',
    shinyOnly: true,
    indicators: {
      retests: 'retests_total',
      firsts: 'tests_first'
    }
  },
  HIV_POSITIVE: {
    title: 'HIV-positive tests - new diagnoses and retests',
    id: 'HIV_POSITIVE',
    shinyOnly: true,
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
      prevalence: 'HIV Prevalence - adults (15-49)',

      // 15+
      plhiv: 'People living with HIV - adults (aged 15+)', // ci on population_segment
      onArt: 'People receiving antiretroviral therapy',
      population: 'Population by age and sex', // TODO: 15+
    }
  },

  ADULTS: {
    title: 'Adults',
    id: 'ADULTS',
    sourceHierarchy: true,
    sources: [
      adultsGAM20,
      adultsGAM19,
      adultsNPD,
      adultsPCOP20,
      adultsPROP20,
      adultsPCOP19,
      adultsPROP19,
      adultsPCOP18,
      adultsPROP18,
      adultsPCOP17,
      adultsPROP17,
      adultsPEPFAR
    ],
    indicatorIds: ['total', 'men', 'women', 'pTotal', 'pMen', 'pWomen']
  },
  
  COMMUNITY: {
    title: 'Community Testing Modalities',
    id: 'COMMUNITY',
    sourceHierarchy: true,
    sources: [communityGAM20, communityGAM19, communityNPD, communityPEPFAR],
    indicatorIds: ['total', 'mobile', 'VCT', 'other', 'pTotal', 'pMobile', 'pVCT', 'pOther']
  },
  FACILITY: {
    title: 'Facility Testing Modalities',
    id: 'FACILITY',
    sources: [facilityGAM20, facilityGAM19, facilityNPD, facilityPEPFAR],
    indicatorIds: ['total', 'PITC', 'ANC', 'VCT', 'family', 'other', 'pTotal', 'pPITC', 'pANC', 'pVCT', 'pFamily', 'pOther']
  },
  INDEX: { // TODO
    title: 'Index',
    id: 'INDEX',
    indicators: {
      number: 'Number of tests conducted',
      positivity: 'Positivity (%)'
    }
  },
  FORECAST: {
    title: 'HIVST Forecast',
    id: 'FORECAST',
    sources: [forecastGAM20, forecastGAM19, forecastNPD, forecastPEPFAR, forecastWME],
    indicatorIds: ['distributed', 'demand', 'need'],
    indicatorYears: {
      distributed: R_2018_2019,
      demand: R_2020_2025,
      need: R_2020_2025,
    }
  },
  KP_TABLE: {
    title: 'Key Populations',
    id: 'KP_TABLE',
    indicators: {
      number: 'Number of tests conducted',
      positivity: 'Positivity (%)'
    }
  },
  POLICY_TABLE: {
    title: 'WHO HIV Testing Policy Compliance',
    id: 'POLICY_TABLE',
    indicators: {
      number: 'Number of tests conducted',
      positivity: 'Positivity (%)'
    }
  },
  GROUPS_TABLE: {
    title: 'Population Groups',
    id: 'GROUPS_TABLE',
    indicators: {
      number: 'Number of tests conducted',
      positivity: 'Positivity (%)'
    }
  },
}
const C = CHARTS

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
    [C.PREVALENCE.id]: [
      {
        id: 'prevalence',
        [F.INDICATOR]: C.PREVALENCE.indicators.prevalence,
        // [F.AGE]: '15-99', // TODO: 15-49 ok?
        // [F.SEX]: 'both',
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: results => {
          return R_2015_2019.map(y => {
            const fResults = _.filter(results, r => r.year === y)
            // TODO: will be on one row
            const lci = _.find(fResults, r => {
              return r[F.VALUE_LOWER]
            })
            const uci = _.find(fResults, r => {
              return r[F.VALUE_UPPER]
            })
            const median = _.find(fResults, r => {
              return r[F.VALUE]
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
    ],
    [C.ADULTS.id]: _.flatMap(C.ADULTS.sources, s => {
      return _.map(s.indicators, (indVal, indId) => {
        
        return _.extend({}, s.filters.ALL, s.filters[indId], {
          id: indId,
          [F.INDICATOR]: indVal,
          [F.AREA_NAME]: 'NULL',
          [F.COUNTRY_ISO_CODE]: true,
          getter: results => {
            console.log('r for ', indId, ' ', results)
            if (results.length > 1) {
              console.error('**LOOKOUT! Taking first result.**')
            }
            return results[0]
          }
        })
      })
    }),
    [C.COMMUNITY.id]: _.flatMap(C.COMMUNITY.sources, s => {
      return _.map(s.indicators, (indVal, indId) => {
        
        return _.extend({}, s.filters.ALL, s.filters[indId], {
          id: indId,
          [F.INDICATOR]: indVal,
          [F.AREA_NAME]: 'NULL',
          [F.COUNTRY_ISO_CODE]: true,
          getter: results => {
            console.log('r for ', indId, ' ', results)
            if (results.length > 1) {
              console.error('**LOOKOUT! Taking first result.**')
            }
            return results[0]
          }
        })
      })
    }),
    [C.FACILITY.id]: _.flatMap(C.FACILITY.sources, s => {
      return _.map(s.indicators, (indVal, indId) => {
        
        return _.extend({}, s.filters.ALL, s.filters[indId], {
          id: indId,
          [F.INDICATOR]: indVal,
          [F.AREA_NAME]: 'NULL',
          [F.COUNTRY_ISO_CODE]: true,
          getter: results => {
            console.log('r for ', indId, ' ', results)
            if (results.length > 1) {
              console.error('**LOOKOUT! Taking first result.**')
            }
            return results[0]
          }
        })
      })
    }),
    [C.FORECAST.id]: _.flatMap(C.FORECAST.sources, s => {
      return _.map(s.indicators, (indVal, indId) => {
        
        return _.extend({}, s.filters.ALL, s.filters[indId], {
          id: indId,
          [F.INDICATOR]: indVal,
          [F.AREA_NAME]: 'NULL',
          [F.COUNTRY_ISO_CODE]: true,
          getter: results => {
            console.log('r for ', indId, ' ', results)

            const genericIndId = getGenericIndId(indId)
            return C.FORECAST.indicatorYears[genericIndId].map(y => {
              const fResults = _.filter(results, r => r.year === y)
              if (results.length > 1) {
                console.error('**LOOKOUT! Taking first result.**')
              }

              return fResults[0]
            })
          }
        })
      })
    }),
  }

  if (isShiny) {
    // add shiny90-only charts
    indicatorMap[C.PLHIV_AGE.id] = R_ADULT_AGES.map(ageRange => (
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
              return r[F.VALUE_LOWER]
            })
            const uci = _.find(fResults, r => {
              return r[F.VALUE_UPPER]
            })
            const median = _.find(fResults, r => {
              return r[F.VALUE]
            })
            return { lci, uci, median }
          })
        }
      }
    ))
    indicatorMap[C.HIV_NEGATIVE.id] = _.map(C.HIV_NEGATIVE.indicators, (v, k) => (
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
              return r[F.VALUE_LOWER]
            })
            const uci = _.find(fResults, r => {
              return r[F.VALUE_UPPER]
            })
            const median = _.find(fResults, r => {
              return r[F.VALUE]
            })
            return { lci, uci, median }
          })
        }
      }
    ))
    indicatorMap[C.HIV_POSITIVE.id] =  _.map(C.HIV_POSITIVE.indicators, (v, k) => (
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
              return r[F.VALUE_LOWER]
            })
            const uci = _.find(fResults, r => {
              return r[F.VALUE_UPPER]
            })
            const median = _.find(fResults, r => {
              return r[F.VALUE]
            })
            return { lci, uci, median }
          })
        }
      }
    ))

    // add shiny90-only fields for PREVALENCE
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
              return r[F.VALUE_LOWER]
            })
            const uci = _.find(fResults, r => {
              return r[F.VALUE_UPPER]
            })
            const median = _.find(fResults, r => {
              return r[F.VALUE]
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

export { CHARTS, FIELD_MAP, AGGREGATE_GETTER, R_2015_2019, getIndicatorMap }