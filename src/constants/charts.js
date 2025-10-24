import _ from 'lodash'
import { COUNTRY_MAP } from '../components/Homepage/countries'
import { FEATURE_FLAGS } from './flags'

const basePath = 'https://2025-app-dot-eic-database-290813.ew.r.appspot.com/'
const BASE_URL = `${basePath}query?`
const NEW_ENDPOINT = `${basePath}charts/`

// const R_2015_2019 = ['2015', '2016', '2017', '2018', '2019']
const LATEST_YEAR = '2024'
// we typically only want to search one year of shiny90 data
const SHINY_SOURCE_YEAR = '2025'
const R_2015_ON = _.range('2015', Number(LATEST_YEAR) + 1).map(String)
const R_2018_ON = _.range('2018', Number(LATEST_YEAR) + 1).map(String)
const R_2024_2030 = ['2024', '2025', '2026', '2027', '2028', '2029', '2030']

const ADULTS15 = '15-24'
const ADULTS25 = '25-34'
const ADULTS35 = '35-49'
const ADULTS50 = '50-99'
const R_ADULT_AGES = [ADULTS15, ADULTS25, ADULTS35, ADULTS50]
const ALL_ADULTS = '15-99'
const AGE_MAP = {
  ADULTS15,
  ADULTS25,
  ADULTS35,
  ADULTS50,
  ALL_ADULTS,
}

const FEMALE = 'female'
const MALE = 'male'
const R_SEXES = [FEMALE, MALE]

// ['f15-24', 'm15-24', 'f24-34' ... 'm15-99']
const R_ALL_DEMO_GROUPS = _.flatMap([
  [ALL_ADULTS, ...R_ADULT_AGES].map((y) => FEMALE[0] + y),
  [ALL_ADULTS, ...R_ADULT_AGES].map((y) => MALE[0] + y),
])
const R_LIMITED_DEMO_GROUPS = [FEMALE[0] + ALL_ADULTS, MALE[0] + ALL_ADULTS]

const SOURCE_DB_MAP = {
  S90: 'Shiny90',
  GAM25: 'Global AIDS Monitoring 2025',
  GAM24: 'Global AIDS Monitoring 2024',
  GAM23: 'Global AIDS Monitoring 2023',
  GAM21: 'Global AIDS Monitoring 2021',
  GAM20: 'Global AIDS Monitoring 2020',
  GAM19: 'Global AIDS Monitoring 2019',
  GAM: 'Global AIDS Monitoring',
  NPD19: 'National Programme Data 2019',
  NPD: 'National Programme Data',

  PCOP22: 'PEPFAR COP 2022',
  PROP22: 'PEPFAR ROP 2022',
  PCOP21: 'PEPFAR COP 2021',
  PROP21: 'PEPFAR ROP 2021',
  PCOP20: 'PEPFAR COP 2020',
  PROP20: 'PEPFAR ROP 2020',
  PCOP19: 'PEPFAR COP 2019',
  PROP19: 'PEPFAR ROP 2019',
  PCOP1718: 'PEPFAR COP 2017 - 2018',
  PROP17: 'PEPFAR ROP 2017',
  PEPFAR: 'PEPFAR',

  WME: 'WHO model estimates',
  RDT: 'EIC and WHO HIV RDT Landscape Report 2024',
  WSR: 'WHO special review',
  // WHTS: 'WHO HIV testing strategy',
  WNCPI: 'WHO NCPI',
  WNCPI25: 'WHO_NCPI_2025',
  HIVST20: 'HIVST policy 2020 data set',
  HIVST21: 'HIVST policy 2021 data set',
  KP25: 'UNAIDS KP-Atlas 2025',
  // KP20: 'UNAIDS KP-Atlas 2020',
  // UNGAM20: 'UNAIDS Global AIDS Monitoring 2020',
  TGF: 'The Global Fund',

  ULP: 'UNAIDS Laws and Policies',
  DHS: 'The DHS Program',
  MICS: 'MICS UNICEF',
  // SPEC20: 'Spectrum estimates 2020 (UNAIDS/WHO)',
  // SPEC21: 'Spectrum estimates 2021 (UNAIDS/WHO)',
  // SPEC22: 'Spectrum estimates 2022 (UNAIDS/WHO)',
  SPEC25: 'Spectrum estimates 2025 (UNAIDS/WHO)',
  SPEC_REG: /Spectrum estimates .+ \(UNAIDS\/WHO\)/,
  WGHO: 'WHO Global Health Observatory',
  UNAIDS: 'UNAIDS', // also a source organization
  WB: 'World Bank', // also a source organization
  // to match any DB name including the value (rather than strict match)
  _NCPI_: 'NCPI',
}
const SOURCE_DISPLAY_MAP = {
  ['AIDS (AIM)']: 'Spectrum estimates 2020 (UNAIDS/WHO)',
  ['Demographic projection (DemProj)']: 'UNAIDS Demographic projections',
  // ['Global AIDS Monitoring 2019']: 'Global AIDS Monitoring 2019',
  // ['Global AIDS Monitoring 2020']: 'Global AIDS Monitoring 2020',
  // ['The Global Fund']: 'The Global Fund',
  ['Google 2019']: 'Google',
  [SOURCE_DB_MAP.HIVST20]: 'WHO NCPI',
  // ['National programme data']: 'National programme data',
  // ['National programme data 2019']: 'National programme data 2019',
  // ['PEPFAR COP 2017 - 2018']: 'PEPFAR COP 2017 - 2018',
  // ['PEPFAR COP 2019']: 'PEPFAR COP 2019',
  // ['PEPFAR ROP 2017']: 'PEPFAR ROP 2017',
  // ['PEPFAR ROP 2019']: 'PEPFAR ROP 2019',
  // ['PEPFAR']: 'PEPFAR',
  [SOURCE_DB_MAP.S90]: 'Spectrum/Shiny90 estimates 2021 (UNAIDS/WHO)',
  // ['Spectrum estimates 2020(UNAIDS / WHO)']: 'Spectrum estimates 2020 (UNAIDS/WHO)',
  [SOURCE_DB_MAP.UNAIDS]: 'Spectrum estimates 2020 (UNAIDS/WHO)',
  // ['UNAIDS KP - Atlas 2020']: 'UNAIDS KP-Atlas 2020',
  // ['UNPOP 2019']: 'UNPOP 2019',
  // ['WHO focal point catch-up plans']: 'WHO focal point catch-up plans',
  [SOURCE_DB_MAP.WNCPI]: 'WHO NCPI',
  // ['WHO special review']: 'WHO special review',
  ['World Bank List of Economies']: 'World Bank',
}

// adds in the source year, if provided
const getSourceDisplayWithYear = ({ source, sourceYear }) => {
  const sourceDisplay = SOURCE_DISPLAY_MAP[source] || source
  if (!sourceYear) return sourceDisplay

  // NOTE: this assumes that if the source display name has a 4 digit number, it's a year
  // (and will be replaced with the source year)
  return sourceDisplay.replace(/\d{4}/, sourceYear)
}

// TODO: replace all _.maxBy calls with this
const getMostRecentResult = (
  results,
  {
    // by default, only include results with a numeric VALUE
    hasValueCheck = (r) => _.isNumber(r[F.VALUE]),
    filterCheck = (r) => true,
  } = {}
) =>
  _.maxBy(
    results.filter((r) => hasValueCheck(r) && filterCheck(r)),
    'year'
  ) || null

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
  IMPORT_FILE: 'import_file',
}
const F = FIELD_MAP
const CSV_FIELDS = [
  // NOTE: for now we're displaying the fieldId in the CSV, so displayName is irrelevant
  { fieldId: FIELD_MAP.INDICATOR, displayName: 'Indicator' },
  { fieldId: FIELD_MAP.VALUE, displayName: 'Value' },
  { fieldId: FIELD_MAP.VALUE_LOWER, displayName: 'Lower Bound' },
  { fieldId: FIELD_MAP.VALUE_UPPER, displayName: 'Upper Bound' },
  { fieldId: FIELD_MAP.VALUE_COMMENT, displayName: 'Value Comment' },
  // { fieldId: FIELD_MAP.UNIT_FORMAT, displayName: 'UF' },
  { fieldId: FIELD_MAP.SEX, displayName: 'Sex' },
  { fieldId: FIELD_MAP.AGE, displayName: 'Age' },
  { fieldId: FIELD_MAP.YEAR, displayName: 'Year' },
  { fieldId: FIELD_MAP.SOURCE_DATABASE, displayName: 'Source Database' },
  { fieldId: FIELD_MAP.NOTES, displayName: 'Notes' },
]

const CHARTS = {
  CONTEXT: {
    // title: 'context',
    id: 'CONTEXT',
  },
  P95: {
    title: 'Progress towards 95-95-95',
    id: 'P95',
  },
  PLHIV_DIAGNOSIS: {
    title: 'PLHIV by diagnosis and treatment status',
    id: 'PLHIV_DIAGNOSIS',
    yearRange: R_2015_ON,
  },
  PLHIV_SEX: {
    title: 'PLHIV who know status - by sex',
    id: 'PLHIV_SEX',
    yearRange: R_2015_ON,
  },
  PLHIV_AGE: {
    title: 'PLHIV who know status - by age',
    id: 'PLHIV_AGE',
    yearRange: R_2015_ON,
    shinyOnly: true,
  },
  HIV_NEGATIVE: {
    title: 'HIV-negative tests - first-time testers and repeat testers',
    id: 'HIV_NEGATIVE',
    yearRange: R_2015_ON,
    shinyOnly: true,
  },
  HIV_POSITIVE: {
    title: 'HIV-positive tests - new diagnoses and retests',
    id: 'HIV_POSITIVE',
    yearRange: R_2015_ON,
    shinyOnly: true,
  },
  PREVALENCE: {
    title: 'Prevalence and positivity',
    nonShinyTitle: 'Prevalence',
    yearRange: R_2015_ON,
    id: 'PREVALENCE',
    shinyOnlyIndicators: {
      positivity: 'positivity',
      dYield: 'yldnew',
    },
  },
  // PREGNANCY: {
  //   title: 'Pregnant women',
  //   yearRange: R_2015_2019,
  //   id: 'PREGNANCY',
  // },

  ADULTS: {
    title: 'HIV tests conducted and positivity, by sex',
    id: 'ADULTS',
    indicatorIds: ['total', 'men', 'women', 'pTotal', 'pMen', 'pWomen'],
  },
  COMMUNITY: {
    title: 'HIV tests conducted and positivity at community level',
    id: 'COMMUNITY',
    indicatorIds: [
      'total',
      'mobile',
      'VCT',
      'other',
      'pTotal',
      'pMobile',
      'pVCT',
      'pOther',
    ],
  },
  FACILITY: {
    title: 'HIV tests conducted and positivity at facility level',
    id: 'FACILITY',
    indicatorIds: [
      'total',
      'PITC',
      'ANC',
      'VCT',
      'family',
      'other',
      'pTotal',
      'pPITC',
      'pANC',
      'pVCT',
      'pFamily',
      'pOther',
    ],
  },
  INDEX: {
    title:
      'HIV tests conducted and positivity for provider-assisted referral / index testing',
    id: 'INDEX',
    indicatorIds: [
      'total',
      'community',
      'facility',
      'pTotal',
      'pCommunity',
      'pFacility',
    ],
  },
  SELF_TESTS: {
    title: 'HIV self-tests',
    id: 'SELF_TESTS',
    indicatorIds: ['distributed'],
    indicatorYears: {
      distributed: R_2018_ON,
    },
  },
  FORECAST: {
    title: 'WHO Integrated HIV RDT forecast',
    id: 'FORECAST',
    indicatorIds: ['demand'],
    indicatorYears: {
      demand: R_2024_2030,
      // need: R_2024_2030,
    },
  },

  KP_TABLE: {
    title: 'Key Populations',
    id: 'KP_TABLE',
    filters: {
      prev: {},
    },
    indicatorIds: [
      'prevMsm',
      'prevPwid',
      'prevPris',
      'prevSw',
      'prevTrans',
      'awareMsm',
      'awarePwid',
      'awarePris',
      'awareSw',
      'awareTrans',
      'yearMsm',
      'yearPwid',
      'yearPris',
      'yearSw',
      'yearTrans',
    ],
  },
  POLICY_TABLE: {
    title: 'WHO HIV Testing Policy Compliance',
    id: 'POLICY_TABLE',
    filters: {
      ALL: {
        [F.AREA_NAME]: 'NULL',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.WNCPI25,
      },
    },
  },
  GROUPS_TABLE: {
    title: 'Population Groups',
    id: 'GROUPS_TABLE',
    indicatorIds: ['plhiv', 'aware', 'prev', 'newly', 'year', 'ever'],
    // calculatedIndicatorIds: ['undiagnosed'],
    indicatorDemographics: {
      ALL: R_ALL_DEMO_GROUPS,
    },
    indicatorDemographicsNoShiny: {
      ALL: R_LIMITED_DEMO_GROUPS,
    },
  },
}
const C = CHARTS
const ALL_CHARTS = [
  //population/country context?
  C.P95,
  C.PLHIV_DIAGNOSIS,
  C.PLHIV_SEX,
  C.PLHIV_AGE,
  C.HIV_NEGATIVE,
  C.HIV_POSITIVE,
  C.PREVALENCE,
  // C.PREGNANCY,
  C.ADULTS,
  C.COMMUNITY,
  C.FACILITY,
  C.INDEX,
  C.SELF_TESTS,
  C.FORECAST,
  C.KP_TABLE,
  C.POLICY_TABLE,
  C.GROUPS_TABLE,
]

export {
  BASE_URL,
  NEW_ENDPOINT,
  CHARTS, // TODO: rename 'CHART_MAP'
  ALL_CHARTS,
  FIELD_MAP,
  CSV_FIELDS,
  R_2015_ON,
  R_ADULT_AGES,
  AGE_MAP,
  R_SEXES,
  FEMALE,
  MALE,
  SOURCE_DB_MAP,
  SOURCE_DISPLAY_MAP,
  getSourceDisplayWithYear,
}
