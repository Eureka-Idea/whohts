import _ from 'lodash'
import { COUNTRY_MAP } from '../components/Homepage/countries'
import { FEATURE_FLAGS } from './flags'

// const BASE_URL = 'https://status.y-x.ch/query?'
const BASE_URL =
  'https://2024-2-app-dot-eic-database-290813.ew.r.appspot.com/query?'

// Master url:
// 'https://2024-app-dot-eic-database-290813.ew.r.appspot.com/query?'

// const R_2015_2019 = ['2015', '2016', '2017', '2018', '2019']
const LATEST_YEAR = '2023'
// we typically only want to search one year of shiny90 data
const SHINY_SOURCE_YEAR = '2024'
const R_2015_ON = _.range('2015', Number(LATEST_YEAR) + 1).map(String)
const R_2018_ON = _.range('2018', Number(LATEST_YEAR) + 1).map(String)
const R_2020_2025 = ['2020', '2021', '2022', '2023', '2024', '2025']

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
const R_LIMITED_DEMO_GROUPS = _.flatMap([
  [ALL_ADULTS, ADULTS15].map((y) => FEMALE[0] + y),
  [ALL_ADULTS, ADULTS15].map((y) => MALE[0] + y),
])

const SOURCE_DB_MAP = {
  S90: 'Shiny90',
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
  WSR: 'WHO special review',
  // WHTS: 'WHO HIV testing strategy',
  WNCPI: 'WHO NCPI',
  HIVST20: 'HIVST policy 2020 data set',
  HIVST21: 'HIVST policy 2021 data set',
  KP24: 'UNAIDS KP-Atlas 2024',
  // KP20: 'UNAIDS KP-Atlas 2020',
  // UNGAM20: 'UNAIDS Global AIDS Monitoring 2020',
  TGF: 'The Global Fund',

  ULP: 'UNAIDS Laws and Policies',
  DHS: 'The DHS Program',
  MICS: 'MICS UNICEF',
  // SPEC20: 'Spectrum estimates 2020 (UNAIDS/WHO)',
  // SPEC21: 'Spectrum estimates 2021 (UNAIDS/WHO)',
  // SPEC22: 'Spectrum estimates 2022 (UNAIDS/WHO)',
  SPEC24: 'Spectrum estimates 2024 (UNAIDS/WHO)',
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

// SOURCE objects for source prio charts
const adultsGAM24 = {
  id: 'GAM24',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.GAM24,
      [F.VALUE_COMMENT]: 'validated',
    },
  },
  indicators: {
    total: 'Den Age-All',
    men: 'Den Age-Male Gte 15',
    women: 'Den Age-Female Gte 15',

    pTotal: 'Per Age-All',
    pMen: 'Per Age-Male Gte 15',
    pWomen: 'Per Age-Female Gte 15',
  },
}
const adultsGAM23 = {
  id: 'GAM23',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.GAM23,
      [F.VALUE_COMMENT]: 'validated',
    },
  },
  indicators: {
    total: 'Den Age-All',
    men: 'Den Age-Male Gte 15',
    women: 'Den Age-Female Gte 15',

    pTotal: 'Per Age-All',
    pMen: 'Per Age-Male Gte 15',
    pWomen: 'Per Age-Female Gte 15',
  },
}
const adultsGAM21 = {
  id: 'GAM21',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.GAM21,
      [F.VALUE_COMMENT]: 'validated',
    },
  },
  indicators: {
    total: 'Den Age-All',
    men: 'Den Age-Male Gte 15',
    women: 'Den Age-Female Gte 15',

    pTotal: 'Per Age-All',
    pMen: 'Per Age-Male Gte 15',
    pWomen: 'Per Age-Female Gte 15',
  },
}
const adultsGAM20 = {
  id: 'GAM20',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.GAM20,
      [F.VALUE_COMMENT]: 'validated',
    },
  },
  indicators: {
    total: 'Den Age-All',
    men: 'Den Age-Male Gte 15',
    women: 'Den Age-Female Gte 15',

    pTotal: 'Per Age-All',
    pMen: 'Per Age-Male Gte 15',
    pWomen: 'Per Age-Female Gte 15',
  },
}
const adultsGAM19 = {
  id: 'GAM19',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.GAM19,
    },
  },
  indicators: {
    total: 'Total volume of tests conducted in past year',
    men: 'Men (15+) - Number of tests',
    women: 'Women (15+) - Number of tests',

    pTotal: 'Total aggregate positivity',
    pMen: 'Men (15+) -  Positivity',
    pWomen: 'Women (15+) -  Positivity',
  },
}
const adultsNPD19 = {
  id: 'NPD19',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.NPD19,
    },
  },
  indicators: {
    // NOTE: same as GAM
    total: 'Total volume of tests conducted in past year',
    men: 'Men (15+) - Number of tests',
    women: 'Women (15+) - Number of tests',

    pTotal: 'Total aggregate positivity',
    pMen: 'Men (15+) -  Positivity',
    pWomen: 'Women (15+) -  Positivity',
  },
}
const adultsPCOP20 = {
  id: 'PCOP20',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.PCOP20,
    },
  },
  indicators: {
    total: 'Den Age-All',
    men: 'Den Age-Male Gte 15',
    women: 'Den Age-Female Gte 15',

    pTotal: 'Per Age-All',
    pMen: 'Per Age-Male Gte 15',
    pWomen: 'Per Age-Female Gte 15',
  },
}
const adultsPROP20 = {
  id: 'PROP20',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.PROP20,
    },
  },
  indicators: {
    total: 'Den Age-All',
    men: 'Den Age-Male Gte 15',
    women: 'Den Age-Female Gte 15',

    pTotal: 'Per Age-All',
    pMen: 'Per Age-Male Gte 15',
    pWomen: 'Per Age-Female Gte 15',
  },
}
const adultsPCOP19 = {
  id: 'PCOP19',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.PCOP19,
    },
  },
  indicators: {
    total: 'People Tested in Past Year',
    men: 'Men (Tested in past year)',
    women: 'Women (Tested in past year)',

    pTotal: 'Aggregate Positivity - Tests conducted and positivity, by sex',
    pMen: 'Men -  Positivity',
    pWomen: 'Women -  Positivity',
  },
}
const adultsPROP19 = {
  id: 'PROP19',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.PROP19,
    },
  },
  indicators: {
    total: 'People Tested in Past Year',
    men: 'Men (Tested in past year)',
    women: 'Women (Tested in past year)',

    pTotal: 'Aggregate Positivity - Tests conducted and positivity, by sex',
    pMen: 'Men -  Positivity',
    pWomen: 'Women -  Positivity',
  },
}
const adultsPCOP1718 = {
  id: 'PCOP1718',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.PCOP1718,
    },
  },
  indicators: {
    total: 'People Tested in Past Year',
    men: 'Men (Tested in past year)',
    women: 'Women (Tested in past year)',

    pTotal: 'Aggregate Positivity - Tests conducted and positivity, by sex',
    pMen: 'Men -  Positivity',
    pWomen: 'Women -  Positivity',
  },
}
const adultsPROP17 = {
  id: 'PROP17',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.PROP17,
    },
  },
  indicators: {
    total: 'People Tested in Past Year',
    men: 'Men (Tested in past year)',
    women: 'Women (Tested in past year)',

    pTotal: 'Aggregate Positivity - Tests conducted and positivity, by sex',
    pMen: 'Men -  Positivity',
    pWomen: 'Women -  Positivity',
  },
}
const adultsPEPFAR = {
  id: 'PEPFAR',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.PEPFAR,
    },
  },
  indicators: {
    total: 'People Tested in Past Year',
    men: 'Men (15+) Tested in Past Year',
    women: 'Women (15+) Tested in Past Year',

    pTotal: 'Total positivity',
    pMen: 'Positivity - Men (15+)',
    pWomen: 'Positivity - Women (15+)',
  },
}

const communityGAM24 = {
  id: 'GAM24',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.GAM24,
      [F.VALUE_COMMENT]: 'validated',
    },
  },
  indicators: {
    total: 'Den Community-Community All',
    mobile: 'Den Community-Community Mobile',
    VCT: 'Den Community-Community Vct',
    other: 'Den Community-Community Other',

    pTotal: 'Per Community-Community All',
    pMobile: 'Per Community-Community Mobile',
    pVCT: 'Per Community-Community Vct',
    pOther: 'Per Community-Community Other',
  },
}
const communityGAM23 = {
  id: 'GAM23',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.GAM23,
      [F.VALUE_COMMENT]: 'validated',
    },
  },
  indicators: {
    total: 'Den Community-Community All',
    mobile: 'Den Community-Community Mobile',
    VCT: 'Den Community-Community Vct',
    other: 'Den Community-Community Other',

    pTotal: 'Per Community-Community All',
    pMobile: 'Per Community-Community Mobile',
    pVCT: 'Per Community-Community Vct',
    pOther: 'Per Community-Community Other',
  },
}
const communityGAM21 = {
  id: 'GAM21',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.GAM21,
      [F.VALUE_COMMENT]: 'validated',
    },
  },
  indicators: {
    total: 'Den Community-Community All',
    mobile: 'Den Community-Community Mobile',
    VCT: 'Den Community-Community Vct',
    other: 'Den Community-Community Other',

    pTotal: 'Per Community-Community All',
    pMobile: 'Per Community-Community Mobile',
    pVCT: 'Per Community-Community Vct',
    pOther: 'Per Community-Community Other',
  },
}
const communityGAM20 = {
  id: 'GAM20',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.GAM20,
      [F.VALUE_COMMENT]: 'validated',
    },
  },
  indicators: {
    total: 'Den Community-Community All',
    mobile: 'Den Community-Community Mobile',
    VCT: 'Den Community-Community Vct',
    other: 'Den Community-Community Other',

    pTotal: 'Per Community-Community All',
    pMobile: 'Per Community-Community Mobile',
    pVCT: 'Per Community-Community Vct',
    pOther: 'Per Community-Community Other',
  },
}
const communityGAM19 = {
  id: 'GAM19',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.GAM19,
    },
  },
  indicators: {
    total: 'Total Volume - Tests conducted and positivity at community level',
    mobile: 'Mobile testing - Number of tests - Community',
    VCT: 'VCT - Number of tests - Community',
    other: 'Other - Number of tests - Community',

    pTotal:
      'Aggregate Positivity - Tests conducted and positivity at community level',
    pMobile: 'Mobile testing - Positivity - Community',
    pVCT: 'VCT - Positivity - Community',
    pOther: 'Other - Positivity - Community',
  },
}
const communityNPD19 = {
  id: 'NPD19',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.NPD19,
    },
  },
  indicators: {
    // same as GAM19
    total: 'Total Volume - Tests conducted and positivity at community level',
    mobile: 'Mobile testing - Number of tests - Community',
    VCT: 'VCT - Number of tests - Community',
    other: 'Other - Number of tests - Community',

    pTotal:
      'Aggregate Positivity - Tests conducted and positivity at community level',
    pMobile: 'Mobile testing - Positivity - Community',
    pVCT: 'VCT - Positivity - Community',
    pOther: 'Other - Positivity - Community',
  },
}
const communityPEPFAR = {
  id: 'PEPFAR',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.PEPFAR,
    },
  },
  indicators: {
    total: 'Total Community Tests',
    mobile: 'Mobile testing - Number of tests - Community',
    VCT: 'VCT - Number of tests - Community',
    other: 'Other - Number of tests - Community',

    pTotal: 'Positivity - Community Modalities Total',
    pMobile: 'Positivity - Community Mobile Testing',
    pVCT: 'Positivity - Community VCT Testing',
    pOther: 'Positivity - Community Other Testing',
  },
}

const facilityGAM24 = {
  id: 'GAM24',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.GAM24,
      [F.VALUE_COMMENT]: 'validated',
    },
  },
  indicators: {
    total: 'Den Facility-Facility All',
    PITC: 'Den Facility-Facility Provider Init',
    ANC: 'Den Facility-Facility Anc',
    VCT: 'Den Facility-Facility Vct',
    family: 'Den Facility-Facility Fp Clinic',
    other: 'Den Facility-Facility Other',

    pTotal: 'Per Facility-Facility All',
    pPITC: 'Per Facility-Facility Provider Init',
    pANC: 'Per Facility-Facility Anc',
    pVCT: 'Per Facility-Facility Vct',
    pFamily: 'Per Facility-Facility Fp Clinic',
    pOther: 'Per Facility-Facility Other',
  },
}
const facilityGAM23 = {
  id: 'GAM23',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.GAM23,
      [F.VALUE_COMMENT]: 'validated',
    },
  },
  indicators: {
    total: 'Den Facility-Facility All',
    PITC: 'Den Facility-Facility Provider Init',
    ANC: 'Den Facility-Facility Anc',
    VCT: 'Den Facility-Facility Vct',
    family: 'Den Facility-Facility Fp Clinic',
    other: 'Den Facility-Facility Other',

    pTotal: 'Per Facility-Facility All',
    pPITC: 'Per Facility-Facility Provider Init',
    pANC: 'Per Facility-Facility Anc',
    pVCT: 'Per Facility-Facility Vct',
    pFamily: 'Per Facility-Facility Fp Clinic',
    pOther: 'Per Facility-Facility Other',
  },
}
const facilityGAM21 = {
  id: 'GAM21',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.GAM21,
      [F.VALUE_COMMENT]: 'validated',
    },
  },
  indicators: {
    total: 'Den Facility-Facility All',
    PITC: 'Den Facility-Facility Provider Init',
    ANC: 'Den Facility-Facility Anc',
    VCT: 'Den Facility-Facility Vct',
    family: 'Den Facility-Facility Fp Clinic',
    other: 'Den Facility-Facility Other',

    pTotal: 'Per Facility-Facility All',
    pPITC: 'Per Facility-Facility Provider Init',
    pANC: 'Per Facility-Facility Anc',
    pVCT: 'Per Facility-Facility Vct',
    pFamily: 'Per Facility-Facility Fp Clinic',
    pOther: 'Per Facility-Facility Other',
  },
}
const facilityGAM20 = {
  id: 'GAM20',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.GAM20,
      [F.VALUE_COMMENT]: 'validated',
    },
  },
  indicators: {
    total: 'Den Facility-Facility All',
    PITC: 'Den Facility-Facility Provider Init',
    ANC: 'Den Facility-Facility Anc',
    VCT: 'Den Facility-Facility Vct',
    family: 'Den Facility-Facility Fp Clinic',
    other: 'Den Facility-Facility Other',

    pTotal: 'Per Facility-Facility All',
    pPITC: 'Per Facility-Facility Provider Init',
    pANC: 'Per Facility-Facility Anc',
    pVCT: 'Per Facility-Facility Vct',
    pFamily: 'Per Facility-Facility Fp Clinic',
    pOther: 'Per Facility-Facility Other',
  },
}
const facilityGAM19 = {
  id: 'GAM19',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.GAM19,
    },
  },
  indicators: {
    total: 'Total Volume - Tests conducted and positivity at facility level',
    PITC: 'PITC - Number of tests - Facility',
    ANC: 'ANC - Number of tests - Facility',
    VCT: 'VCT - Number of tests - Facility',
    other: 'Other - Number of tests - Facility',

    pTotal:
      'Aggregate Positivity - Tests conducted and positivity at facility level',
    pPITC: 'PITC - Positivity - Facility',
    pANC: 'ANC - Positivity - Facility',
    pVCT: 'VCT - Positivity - Facility',
    pOther: 'Other - Positivity - Facility',
  },
}
const facilityNPD19 = {
  id: 'NPD19',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.NPD19,
    },
  },
  indicators: {
    // same as GAM19
    total: 'Total Volume - Tests conducted and positivity at facility level',
    PITC: 'PITC - Number of tests - Facility',
    ANC: 'ANC - Number of tests - Facility',
    VCT: 'VCT - Number of tests - Facility',
    other: 'Other - Number of tests - Facility',

    pTotal:
      'Aggregate Positivity - Tests conducted and positivity at facility level',
    pPITC: 'PITC - Positivity - Facility',
    pANC: 'ANC - Positivity - Facility',
    pVCT: 'VCT - Positivity - Facility',
    pOther: 'Other - Positivity - Facility',
  },
}
const facilityPEPFAR = {
  id: 'PEPFAR',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.PEPFAR,
    },
  },
  indicators: {
    // TODO: fix calculated values
    total: 'Total Facility Tests',
    PITC: 'PITC - Number of tests - Facility',
    ANC: 'ANC - Number of tests - Facility',
    VCT: 'VCT - Number of tests - Facility',
    other: 'Other - Number of tests - Facility',

    pTotal: 'Positivity - Facility Modalities Total',
    pPITC: 'Positivity - Facility PITC Testing',
    pANC: 'Positivity - Facility ANC Testing',
    pVCT: 'Positivity - Facility VCT Testing',
    pOther: 'Positivity - Facility Other Testing',
  },
}

const indexPEPFAR = {
  id: 'PEPFAR',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.PEPFAR,
    },
  },
  indicators: {
    total: 'Total Index Tests',
    community: 'Index - Number of tests - Community',
    facility: 'Index - Number of tests - Facility',

    pTotal: 'Positivity - Index Testing Total',
    pCommunity: 'Positivity - Community Index testing',
    pFacility: 'Positivity - Facility Index Testing',
  },
}

const selfGAM24 = {
  id: 'GAM24',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.GAM24,
      [F.VALUE_COMMENT]: 'validated',
    },
  },
  indicators: {
    distributed: 'Self Test Distributed-Data Value',
  },
}
const selfGAM23 = {
  id: 'GAM23',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.GAM23,
      [F.VALUE_COMMENT]: 'validated',
    },
  },
  indicators: {
    distributed: 'Self Test Distributed-Data Value',
  },
}
const selfGAM21 = {
  id: 'GAM21',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.GAM21,
      [F.VALUE_COMMENT]: 'validated',
    },
  },
  indicators: {
    distributed: 'Self Test Distributed-Data Value',
  },
}
const selfGAM20 = {
  id: 'GAM20',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.GAM20,
      [F.VALUE_COMMENT]: 'validated',
    },
  },
  indicators: {
    distributed: 'Self Test Distributed-Data Value',
  },
}
const selfGAM19 = {
  id: 'GAM19',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.GAM19,
    },
  },
  indicators: {
    distributed: 'HIVSTs distributed',
  },
}
const selfNPD19 = {
  id: 'NPD19',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.NPD19,
    },
  },
  indicators: {
    // same as GAM19
    distributed: 'HIVSTs distributed',
  },
}
const selfPEPFAR = {
  id: 'PEPFAR',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.PEPFAR,
    },
  },
  indicators: {
    distributed: 'HIV self-tests distributed',
  },
}
const forecastWME = {
  id: 'WME',
  filters: {
    ALL: {
      // [F.SOURCE_DATABASE]: SOURCE_DB_MAP.WME, // now "WHO HIVST Forecast 2021"
    },
  },
  indicators: {
    demand: 'HIV RDT Demand Forecast - Total Volume',
    // need: 'HIVST Forecasting Need Estimate',
  },
}

const kpKP24 = {
  id: 'KP24',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.KP24,
      [F.AREA_NAME]: 'NULL',
    },
  },
  indicators: {
    prevMsm: 'HIV prevalence among men who have sex with men',
    awareMsm:
      'HIV testing and status awareness among men who have sex with men',

    prevPwid: 'HIV prevalence among people who inject drugs',
    awarePwid: 'HIV testing and status awareness among people who inject drugs',

    prevPris: 'HIV prevalence among prisoners',
    // awarePris: '',

    prevSw: 'HIV prevalence among sex workers',
    awareSw: 'HIV testing and status awareness among sex workers',

    prevTrans: 'HIV prevalence among transgender people',
    awareTrans: 'HIV testing and status awareness among transgender people',
  },
}
const kpGAM24 = {
  id: 'GAM24',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.GAM24,
      [F.AREA_NAME]: 'NULL',
    },
  },
  indicators: {
    prevMsm: 'HIV prevalence among men who have sex with men',
    awareMsm:
      'HIV testing and status awareness among men who have sex with men',

    prevPwid: 'HIV prevalence among people who inject drugs',
    awarePwid: 'HIV testing and status awareness among people who inject drugs',

    prevPris: 'HIV prevalence among prisoners',
    // awarePris: '',

    prevSw: 'HIV prevalence among sex workers',
    awareSw: 'HIV testing and status awareness among sex workers',

    prevTrans: 'HIV prevalence among transgender people',
    awareTrans: 'HIV testing and status awareness among transgender people',
  },
}

const getKpCROP = ({ id, sourceDb }) => ({
  id,
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: sourceDb,
      [F.AREA_NAME]: 'NULL',
    },
  },
  indicators: {
    yearMsm: 'MSM (Tested in past year)',
    yearSw: 'SW (Tested in past year)',
    yearPwid: 'PWID (Tested in past year)',
    yearPris: 'People in prisons (Tested in past year)',
    yearTrans: 'Transgender (Tested in past year)',
  },
})
const [
  kpPROP22,
  kpPCOP22,
  kpPROP21,
  kpPCOP21,
  kpPCOP20,
  kpPROP20,
  kpPCOP19,
  kpPROP19,
  kpPCOP1718,
  kpPROP17,
] = [
  { id: 'PCOP22', sourceDb: SOURCE_DB_MAP.PCOP22 },
  { id: 'PROP22', sourceDb: SOURCE_DB_MAP.PROP22 },
  { id: 'PCOP21', sourceDb: SOURCE_DB_MAP.PCOP21 },
  { id: 'PROP21', sourceDb: SOURCE_DB_MAP.PROP21 },
  { id: 'PCOP20', sourceDb: SOURCE_DB_MAP.PCOP20 },
  { id: 'PROP20', sourceDb: SOURCE_DB_MAP.PROP20 },
  { id: 'PCOP19', sourceDb: SOURCE_DB_MAP.PCOP19 },
  { id: 'PROP19', sourceDb: SOURCE_DB_MAP.PROP19 },
  { id: 'PCOP1718', sourceDb: SOURCE_DB_MAP.PCOP1718 },
  { id: 'PROP17', sourceDb: SOURCE_DB_MAP.PROP17 },
].map(getKpCROP)

const kpTGF = {
  id: 'TGF',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.TGF,
      [F.AREA_NAME]: 'NULL',
    },
  },
  indicators: {
    yearMsm: 'Number of HIV tests taken among men who have sex with men',
    yearSw: 'Number of HIV tests taken among sex workers',
    yearPwid: 'Number of HIV tests taken among people who use drugs',
    yearPris: 'Number of HIV tests taken among prisoners',
    yearTrans: 'Number of HIV tests taken among transgender population',
  },
}

// const groupsGAM20 = {
//   id: 'GAM20',
//   filters: {
//     ALL: {
//       [F.SOURCE_DATABASE]: SOURCE_DB_MAP.GAM20,
//       [F.VALUE_COMMENT]: 'validated',
//     }
//   },
//   indicators: {
//     year: 'Den Age-Female Gte 15'
//   }
// }
// const groupsS90 = {
//   id: 'S90',
//   filters: {
//     ALL: {
//       [F.SOURCE_DATABASE]: SOURCE_DB_MAP.S90,
//     }
//   },
//   indicators: {
//     year: 'tests_total'
//   },
//   indicatorAges: {
//     year: 'ALL'
//   }
// }
// const groupsPCOP20 = {
//   id: 'PCOP20',
//   filters: {
//     ALL: {
//       [F.SOURCE_DATABASE]: SOURCE_DB_MAP.PCOP20,
//     }
//   },
//   indicators: {
//     year: 'Den Age-Female Gte 15',
//     year: 'Women 15-24 (Tested in past year)',
//   }
// }

const CHARTS = {
  CONTEXT: {
    // title: 'context',
    id: 'CONTEXT',
  },
  P95: {
    title: 'Progress towards 95-95-95',
    id: 'P95',
    indicators: {
      status: 'Percent of people living with HIV who know their status',
      art: 'Percent of people who know their status who are on ART',
      suppression: 'Percent of people on ART who achieve viral suppression',
    },
  },
  PLHIV_DIAGNOSIS: {
    title: 'PLHIV by diagnosis and treatment status',
    id: 'PLHIV_DIAGNOSIS',
    yearRange: R_2015_ON,
    indicators: {
      plhiv: 'People living with HIV - adults (aged 15+)',
      know: 'People living with HIV who know their status',
      onArt: 'PLHIV know status on ART',
    },
  },
  PLHIV_SEX: {
    title: 'PLHIV who know status - by sex',
    id: 'PLHIV_SEX',
    yearRange: R_2015_ON,
    indicators: {
      status: 'Percent of people living with HIV who know their status',
    },
  },
  PLHIV_AGE: {
    title: 'PLHIV who know status - by age',
    id: 'PLHIV_AGE',
    yearRange: R_2015_ON,
    shinyOnly: true,
    indicators: {
      aware: 'aware',
    },
  },
  HIV_NEGATIVE: {
    title: 'HIV-negative tests - first-time testers and repeat testers',
    id: 'HIV_NEGATIVE',
    yearRange: R_2015_ON,
    shinyOnly: true,
    indicators: {
      retests: 'retests_total',
      firsts: 'tests_first',
    },
  },
  HIV_POSITIVE: {
    title: 'HIV-positive tests - new diagnoses and retests',
    id: 'HIV_POSITIVE',
    yearRange: R_2015_ON,
    shinyOnly: true,
    indicators: {
      arts: 'retests_art',
      awares: 'retests_aware',
      news: 'new_diagnoses',
    },
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
    indicators: {
      // prevalence: 'HIV Prevalence - adults (15-49)',
      // prevalence: 'M- Adult prevalence (15+) (Percent) Male+Female',
      prevalence: 'Adult prevalence (15+) (Percent) Male+Female',

      // 15+
      plhiv: 'People living with HIV - adults (aged 15+)',
      onArt: 'People receiving antiretroviral therapy',
      population: 'Population aged 15+ Male+Female',
    },
  },
  // PREGNANCY: {
  //   title: 'Pregnant women',
  //   yearRange: R_2015_2019,
  //   id: 'PREGNANCY',
  //   indicators: {
  //     perAnc: 'PerctestedANC',
  //     perPregKnown: 'HIV testing in pregnant women',
  //   },
  // },

  ADULTS: {
    title: 'HIV tests conducted and positivity, by sex',
    id: 'ADULTS',
    sources: [
      adultsGAM24,
      adultsGAM23,
      adultsGAM21,
      adultsGAM20,
      adultsGAM19,
      adultsNPD19,
      adultsPCOP20,
      adultsPROP20,
      adultsPCOP19,
      adultsPROP19,
      adultsPCOP1718,
      adultsPROP17,
      adultsPEPFAR,
    ],
    indicatorIds: ['total', 'men', 'women', 'pTotal', 'pMen', 'pWomen'],
  },
  COMMUNITY: {
    title: 'HIV tests conducted and positivity at community level',
    id: 'COMMUNITY',
    sources: [
      communityGAM24,
      communityGAM23,
      communityGAM21,
      communityGAM20,
      communityGAM19,
      communityNPD19,
      communityPEPFAR,
    ],
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
    sources: [
      facilityGAM24,
      facilityGAM23,
      facilityGAM21,
      facilityGAM20,
      facilityGAM19,
      facilityNPD19,
      facilityPEPFAR,
    ],
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
    sources: [indexPEPFAR],
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
    sources: [
      selfGAM24,
      selfGAM23,
      selfGAM21,
      selfGAM20,
      selfGAM19,
      selfNPD19,
      selfPEPFAR,
    ],
    indicatorIds: ['distributed'],
    indicatorYears: {
      distributed: R_2018_ON,
    },
  },
  FORECAST: {
    title: 'WHO Integrated HIV RDT forecast',
    id: 'FORECAST',
    sources: [forecastWME],
    indicatorIds: ['demand'],
    indicatorYears: {
      demand: R_2020_2025,
      // need: R_2020_2025,
    },
  },

  KP_TABLE: {
    title: 'Key Populations',
    id: 'KP_TABLE',
    sources: [
      kpKP24,
      kpGAM24,

      kpPROP22,
      kpPCOP22,
      kpPROP21,
      kpPCOP21,
      kpPCOP20,
      kpPROP20,
      kpPCOP19,
      kpPROP19,
      kpPCOP1718,
      kpPROP17,
      kpTGF,
    ],
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
      },
    },
    indicators: {
      age: 'Laws requiring parental consent for adolescents to access HIV testing',
      provider:
        'From national authorities Provider-initiated testing and counselling',
      community:
        'From national authorities Community-based testing and counselling',
      lay: 'From national authorities Lay provider testing',
      hivst: 'From national authorities Self-testing',
      assisted: 'From national authorities Assisted partner notification',
      // social: 'From national authorities Social network-based HIV testing',
      // compliance: '3-test strategy/algorithm for an HIV-positive diagnosis used',
      verification: 'Verification testing before ART',
      // dual: 'Dual HIV/syphilis rapid diagnostic tests for pregnant women and/or key populations included in national policy',
      client: 'Client-initiated testing and counselling',
      condition: 'Indicator condition testing',
      routine: 'Routine antenatal testing',
      antenatal:
        'Dual HIV/syphilis rapid diagnostic tests for pregnant women in antenatal care',
      rapid:
        'Dual HIV/syphilis rapid diagnostic tests for any key population group',
      social_key: 'Social network-based HIV testing for key populations',
      social_gen: 'Social network-based HIV testing for general population',
    },
  },
  GROUPS_TABLE: {
    title: 'Population Groups',
    id: 'GROUPS_TABLE',
    // sources: [],
    indicatorIds: ['plhiv', 'aware', 'prev', 'newly', 'year', 'ever'],
    // calculatedIndicatorIds: ['undiagnosed'],
    indicatorDemographics: {
      ALL: R_ALL_DEMO_GROUPS,
    },
    indicatorDemographicsNoShiny: {
      ALL: R_LIMITED_DEMO_GROUPS,
    },
    // indicator query objects spelled out manually, given their complexity
    // indicatorSourceDbMap: {
    // }
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

const getGenericIndId = (indId) => {
  return indId.replace(/\d+$/, '')
}

const allSexVariations = [
  'all sexes',
  'both',
  'males, females',
  'males, females, unknown',
]
const isAllSex = (r) => {
  const sex = r[FIELD_MAP.SEX]

  const is = !sex || allSexVariations.includes(sex.toLowerCase())
  if (!is) {
    // console.log('Not considered ALLSEX: ', sex)
  }
  return is
}
const allAgeVariations = ['all ages', '15+, <15, unknown']
const isAllAge = (r) => {
  const age = r[FIELD_MAP.AGE]

  const is = !age || allAgeVariations.includes(age.toLowerCase())
  if (!is) {
    // console.log('Not considered ALLAGE: ', age)
  }
  return is
}

const isFemale = (str) => str.toLowerCase().includes('female')

// const findPrioritizedResult = ({ results, dbHierarchy, resultCriteria = {} }) => {
//   let prioritizedResult = null

//   return _.find(dbHierarchy, db => {
//     const fResults = _.filter(results, r => {
//       // r is from db and satisfies all the result criteria
//       r[F.SOURCE_DATABASE] === db && _.every(resultCriteria, ({ value, field }) =>
//         r[field] === value)
//     })

//     const latest = _.maxBy(fResults, 'year')
//     return latest
//   })
// }

const findPrioritizedResult = ({
  results,
  dbHierarchy,
  resultCriteria = {},
  allSexCheck,
  allAgeCheck,
}) => {
  return _.find(dbHierarchy, (db) => {
    const fResults = _.filter(results, (r) => {
      if (r[F.SOURCE_DATABASE] !== db) {
        return false
      }
      const matchesCriteria = _.every(
        resultCriteria,
        ({ value, field }) => r[field] === value
      )
      if (!matchesCriteria) {
        return false
      }
      if (allSexCheck && !isAllSex(r)) {
        return false
      }
      if (allAgeCheck && !isAllAge(r)) {
        return false
      }

      // r is has passed all the filters
      return true
    })

    const latest = _.maxBy(fResults, 'year')
    if (fResults.length > 1) {
      // console.log('*** multiple results: ***')
      // console.log(fResults)
      // console.log('!: ', latest)
    }
    return latest
  })
}

// this map specifies which records need to be pulled to cover the indicators relevant to each chart
const getIndicatorMap = (isShiny) => {
  const indicatorMap = {
    [C.CONTEXT.id]: [
      {
        id: 'population',
        [F.INDICATOR]: 'Population',
        [F.UNIT_FORMAT]: 'NUMBER',
        [F.SOURCE_ORGANIZATION]: SOURCE_DB_MAP.UNAIDS,
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          return _.maxBy(results, 'year')
        },
      },
      {
        id: 'classification',
        [F.INDICATOR]: 'Income Group',
        [F.SOURCE_ORGANIZATION]: SOURCE_DB_MAP.WB,
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          return _.maxBy(results, 'year')
        },
      },
    ],
    [C.P95.id]: _.map(C.P95.indicators, (v, k) => ({
      id: k,
      [F.INDICATOR]: v,
      [F.COUNTRY_ISO_CODE]: true,
      [F.AGE]: 'all ages',
      [F.AREA_NAME]: 'NULL',
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC24,
      getter: (results) => {
        return _.maxBy(results, 'year')
      },
    })),
    [C.PLHIV_DIAGNOSIS.id]: _.map(C.PLHIV_DIAGNOSIS.indicators, (v, k) => ({
      id: k,
      [F.INDICATOR]: v,
      [F.AGE]: '15+',
      [F.SEX]: 'NULL',
      [F.AREA_NAME]: 'NULL',
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC24,
      [F.COUNTRY_ISO_CODE]: true,
      getter: (results) => {
        return C.PLHIV_DIAGNOSIS.yearRange.map((y) => {
          const fResults = _.filter(results, (r) => r.year === y)
          return _.maxBy(fResults, F.SOURCE_YEAR)
        })
      },
    })),
    [C.PLHIV_SEX.id]: ['Females', 'Males'].map(
      (
        sex // TODO: standardize
      ) => ({
        id: sex,
        [F.INDICATOR]: C.PLHIV_SEX.indicators.status,
        [F.AGE]: '15+',
        [F.SEX]: sex,
        [F.AREA_NAME]: 'NULL',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC24,
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          return C.PLHIV_SEX.yearRange.map((y) => {
            return _.find(results, (r) => r.year === y)
          })
        },
      })
    ),
    [C.PREVALENCE.id]: [
      {
        id: 'prevalence',
        [F.INDICATOR]: C.PREVALENCE.indicators.prevalence,
        // [F.AGE]: '15-99', // TODO: 15-49 ok?
        // [F.SEX]: 'both',
        [F.AREA_NAME]: 'NULL',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC24,
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          return C.PREVALENCE.yearRange.map((y) => {
            const fResults = _.filter(results, (r) => r.year === y)

            if (fResults.length > 1) {
              console.warn(
                '## should not be multi results PREVALENCE.prevalence ##'
              )
            }
            return _.maxBy(fResults, F.SOURCE_YEAR)
          })
        },
      },
      {
        id: 'plhiv',
        [F.INDICATOR]: C.PREVALENCE.indicators.plhiv,
        [F.AGE]: '15+',
        [F.SEX]: 'NULL',
        [F.AREA_NAME]: 'NULL',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC24,
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          return C.PREVALENCE.yearRange.map((y) => {
            const fResults = _.filter(results, (r) => r.year === y)
            return _.maxBy(fResults, F.SOURCE_YEAR)
          })
        },
      },
      {
        id: 'onArt',
        [F.INDICATOR]: C.PREVALENCE.indicators.onArt,
        [F.AGE]: '15+',
        [F.SEX]: 'NULL',
        [F.AREA_NAME]: 'NULL',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC24,
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          return C.PREVALENCE.yearRange.map((y) => {
            return _.find(results, (r) => r.year === y)
          })
        },
      },
      {
        id: 'population',
        [F.INDICATOR]: C.PREVALENCE.indicators.population,
        [F.AREA_NAME]: 'NULL',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC24,
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          return C.PREVALENCE.yearRange.map((y) => {
            return _.find(results, (r) => r.year === y)
          })
        },
      },
    ],
    // [C.PREGNANCY.id]: [
    //   {
    //     id: 'perAnc',
    //     [F.INDICATOR]: C.PREGNANCY.indicators.perAnc,
    //     // [F.AGE]: '15+',
    //     // [F.SEX]: 'NULL',
    //     [F.AREA_NAME]: 'NULL',
    //     [F.SOURCE_DATABASE]: SOURCE_DB_MAP.WGHO,
    //     [F.COUNTRY_ISO_CODE]: true,
    //     getter: (results) => {
    //       return C.PREGNANCY.yearRange.map((y) => {
    //         return _.find(results, (r) => r.year === y)
    //       })
    //     },
    //   },
    // ],
    [C.ADULTS.id]: _.flatMap(C.ADULTS.sources, (s) => {
      return _.map(s.indicators, (indVal, indId) => {
        return _.extend({}, s.filters.ALL, s.filters[indId], {
          id: indId,
          [F.INDICATOR]: indVal,
          [F.AREA_NAME]: 'NULL',
          [F.COUNTRY_ISO_CODE]: true,
          getter: (results) => {
            if (results.length > 1) {
              // debugger
              console.warn(
                `**LOOKOUT! Taking highest year result for: * ', indI
              `,
                results[0].indicator,
                'R:',
                _.maxBy(results, 'year'),
                `
              `,
                'rs:',
                results
              )
            }
            return _.maxBy(results, 'year')
          },
        })
      })
    }),
    [C.COMMUNITY.id]: _.flatMap(C.COMMUNITY.sources, (s) => {
      return _.map(s.indicators, (indVal, indId) => {
        return _.extend({}, s.filters.ALL, s.filters[indId], {
          id: indId,
          [F.INDICATOR]: indVal,
          [F.AREA_NAME]: 'NULL',
          [F.COUNTRY_ISO_CODE]: true,
          getter: (results) => {
            if (results.length > 1) {
              // debugger
              console.warn(
                `**LOOKOUT! Taking highest year result for: * ', indI
              `,
                results[0].indicator,
                'R:',
                _.maxBy(results, 'year'),
                `
              `,
                'rs:',
                results
              )
            }
            return _.maxBy(results, 'year')
          },
        })
      })
    }),
    [C.FACILITY.id]: _.flatMap(C.FACILITY.sources, (s) => {
      return _.map(s.indicators, (indVal, indId) => {
        return _.extend({}, s.filters.ALL, s.filters[indId], {
          id: indId,
          // see TODO-@*&
          // id: indId + s.id,
          [F.INDICATOR]: indVal,
          [F.AREA_NAME]: 'NULL',
          [F.COUNTRY_ISO_CODE]: true,
          getter: (results) => {
            if (results.length > 1) {
              // debugger
              console.warn(
                `**LOOKOUT! Taking highest year result for: * ', indI
              `,
                results[0].indicator,
                'R:',
                _.maxBy(results, 'year'),
                `
              `,
                'rs:',
                results
              )
            }
            return _.maxBy(results, 'year')
          },
        })
      })
    }),
    [C.INDEX.id]: _.flatMap(C.INDEX.sources, (s) => {
      return _.map(s.indicators, (indVal, indId) => {
        return _.extend({}, s.filters.ALL, s.filters[indId], {
          id: indId,
          [F.INDICATOR]: indVal,
          [F.AREA_NAME]: 'NULL',
          [F.COUNTRY_ISO_CODE]: true,
          getter: (results) => {
            if (results.length > 1) {
              // debugger
              console.warn(
                `**LOOKOUT! Taking highest year result for: * ', indI
              `,
                results[0].indicator,
                'R:',
                _.maxBy(results, 'year'),
                `
              `,
                'rs:',
                results
              )
            }
            return _.maxBy(results, 'year')
          },
        })
      })
    }),
    [C.SELF_TESTS.id]: _.flatMap(C.SELF_TESTS.sources, (s) => {
      return _.map(s.indicators, (indVal, indId) => {
        return _.extend({}, s.filters.ALL, s.filters[indId], {
          id: indId,
          [F.INDICATOR]: indVal,
          [F.AREA_NAME]: 'NULL',
          [F.COUNTRY_ISO_CODE]: true,
          getter: (results) => {
            const genericIndId = getGenericIndId(indId)
            return C.SELF_TESTS.indicatorYears[genericIndId].map((y) => {
              const fResults = _.filter(results, (r) => r.year === y)
              if (fResults.length > 1) {
                // debugger
                console.warn(
                  `**LOOKOUT! Taking highest year result for: * ', indI
                `,
                  fResults[0].indicator,
                  'R:',
                  _.maxBy(fResults, 'year'),
                  `
                `,
                  'rs:',
                  fResults
                )
              }
              return _.maxBy(fResults, 'year')
            })
          },
        })
      })
    }),
    [C.FORECAST.id]: _.flatMap(C.FORECAST.sources, (s) => {
      return _.map(s.indicators, (indVal, indId) => {
        return _.extend({}, s.filters.ALL, s.filters[indId], {
          id: indId,
          [F.INDICATOR]: indVal,
          [F.AREA_NAME]: 'NULL',
          [F.COUNTRY_ISO_CODE]: true,
          getter: (results) => {
            const genericIndId = getGenericIndId(indId)
            return C.FORECAST.indicatorYears[genericIndId].map((y) => {
              const fResults = _.filter(results, (r) => r.year === y)
              if (fResults.length > 1) {
                // debugger
                console.warn(
                  `**LOOKOUT! Taking highest year result for: * ', indI
                `,
                  fResults[0].indicator,
                  'R:',
                  _.maxBy(fResults, 'year'),
                  `
                `,
                  'rs:',
                  fResults
                )
              }
              return _.maxBy(fResults, 'year')
            })
          },
        })
      })
    }),
    [C.KP_TABLE.id]: _.flatMap(C.KP_TABLE.sources, (s) => {
      return _.map(s.indicators, (indVal, indId) => {
        return _.extend({}, s.filters.ALL, s.filters[indId], {
          id: indId,
          [F.INDICATOR]: indVal,
          [F.COUNTRY_ISO_CODE]: true,
          getter: (results) => {
            // if (fResults.length > 1) {
            // debugger
            //   console.warn(`**LOOKOUT! Taking highest year result for: * ', indI
            //   `, fResults[0].indicator, 'R:', _.maxBy(fResults, 'year'), `
            //   `,'rs:', fResults)
            // }
            // don't allSexCheck msm results, which are all males
            const allSexCheck = !indId.toLowerCase().includes('msm')
            const fResults = results.filter((r) => {
              return isAllAge(r) && (!allSexCheck || isAllSex(r))
            })

            const result = _.maxBy(fResults, 'year')
            // if (!result && results.length > 1) {
            // console.log('@indicator: ', indId)
            // console.log('@@@@: ', fResults)
            // console.log('!!!!', results)
            // }
            return result
          },
        })
      })
    }),
    [C.POLICY_TABLE.id]: _.map(C.POLICY_TABLE.indicators, (v, k) =>
      _.extend({}, C.POLICY_TABLE.filters.ALL, C.POLICY_TABLE.filters[k], {
        id: k,
        [F.INDICATOR]: v,
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          if (results.length > 1) {
            // debugger
            console.warn(
              `**LOOKOUT! Taking highest year result for: ', 
            `,
              results[0].indicator,
              'R:',
              _.maxBy(results, 'year'),
              `
            `,
              'rs:',
              results
            )
          }
          return _.maxBy(
            results,
            // in case we want to filter by source db
            // results.filter((r) =>
            //   r[FIELD_MAP.SOURCE_DATABASE].includes(SOURCE_DB_MAP._NCPI_)
            // ),
            'year'
          )
        },
      })
    ),
    [C.GROUPS_TABLE.id]: [
      // ESTIMATED NUMBER OF PLHIV
      {
        id: 'plhiv',
        [F.INDICATOR]: 'HIV population (15+) Female',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC24,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          const result = getMostRecentResult(results)
          if (!result) return {}
          return { [`${FEMALE[0]}${ALL_ADULTS}`]: result }
        },
      },
      {
        id: 'plhiv',
        [F.INDICATOR]: 'HIV population (15+) Male',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC24,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          const result = getMostRecentResult(results)
          if (!result) return {}
          return { [`${MALE[0]}${ALL_ADULTS}`]: result }
        },
      },
      {
        id: 'plhiv',
        [F.INDICATOR]: 'HIV population (50+) Female',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC24,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          const result = getMostRecentResult(results)
          if (!result) return {}
          return { [`${FEMALE[0]}${ADULTS50}`]: result }
        },
      },
      {
        id: 'plhiv',
        [F.INDICATOR]: 'HIV population (50+) Male',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC24,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          const result = getMostRecentResult(results)
          if (!result) return {}
          return { [`${MALE[0]}${ADULTS50}`]: result }
        },
      },
      {
        id: 'plhiv',
        [F.INDICATOR]: 'People living with HIV - female adults (aged 15+)',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC24,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          const result = getMostRecentResult(results)
          if (!result) return {}
          return { [`${FEMALE[0]}${ALL_ADULTS}`]: result }
        },
      },
      {
        id: 'plhiv',
        [F.INDICATOR]: 'People living with HIV - male adults (aged 15+)',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC24,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          const result = getMostRecentResult(results)
          if (!result) return {}
          return { [`${MALE[0]}${ALL_ADULTS}`]: result }
        },
      },
      {
        id: 'plhiv',
        [F.INDICATOR]: 'People living with HIV - females aged 15-24',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC24,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          const result = getMostRecentResult(results)
          if (!result) return {}
          return { [`${FEMALE[0]}${ADULTS15}`]: result }
        },
      },
      {
        id: 'plhiv',
        [F.INDICATOR]: 'People living with HIV - males aged 15-24',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC24,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          const result = getMostRecentResult(results)
          if (!result) return {}
          return { [`${MALE[0]}${ADULTS15}`]: result }
        },
      },
      {
        id: 'plhiv',
        [F.INDICATOR]: 'People living with HIV - females aged 25-34',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC24,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          const result = getMostRecentResult(results)
          if (!result) return {}
          return { [`${FEMALE[0]}${ADULTS25}`]: result }
        },
      },
      {
        id: 'plhiv',
        [F.INDICATOR]: 'People living with HIV - males aged 25-34',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC24,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          const result = getMostRecentResult(results)
          if (!result) return {}
          return { [`${MALE[0]}${ADULTS25}`]: result }
        },
      },
      {
        id: 'plhiv',
        [F.INDICATOR]: 'People living with HIV - females aged 35-49',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC24,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          const result = getMostRecentResult(results)
          if (!result) return {}
          return { [`${FEMALE[0]}${ADULTS35}`]: result }
        },
      },
      {
        id: 'plhiv',
        [F.INDICATOR]: 'People living with HIV - males aged 35-49',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC24,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          const result = getMostRecentResult(results)
          if (!result) return {}
          return { [`${MALE[0]}${ADULTS35}`]: result }
        },
      },
      {
        id: 'plhiv',
        [F.INDICATOR]: 'People living with HIV - females aged 50+',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC24,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          const result = getMostRecentResult(results)
          if (!result) return {}
          return { [`${FEMALE[0]}${ADULTS50}`]: result }
        },
      },
      {
        id: 'plhiv',
        [F.INDICATOR]: 'People living with HIV - males aged 50+',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC24,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          const result = getMostRecentResult(results)
          if (!result) return {}
          return { [`${MALE[0]}${ADULTS50}`]: result }
        },
      },
      // [ UNDIAGNOSED PLHIV = (1 - PLHIV WHO KNOW STATUS) * ESTIMATED # PLHIV]
      // PLHIV WHO KNOW STATUS (%)
      {
        id: 'aware',
        [F.INDICATOR]:
          'Percent of people living with HIV who know their status',
        [F.AGE]: '15+',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC24,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          const resultMap = {}

          _.each(['Females', 'Males'], (sex) => {
            const result = getMostRecentResult(results, {
              filterCheck: (r) => r[F.SEX] === sex,
            })
            if (!!result) {
              resultMap[`${sex[0].toLowerCase()}${ALL_ADULTS}`] = result
            }
          })

          return resultMap
        },
      },
      {
        id: 'aware',
        [F.INDICATOR]: 'aware',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.S90,
        [F.SOURCE_YEAR]: SHINY_SOURCE_YEAR,
        [F.YEAR]: LATEST_YEAR,
        [F.AREA_NAME]: 'NULL',
        [F.INDICATOR_DESCRIPTION]: 'positive',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          const resultMap = {}
          R_SEXES.forEach((sex) => {
            ;[...R_ADULT_AGES, ALL_ADULTS].forEach((ageRange) => {
              const result = _.find(
                results,
                (r) => r[F.SEX] === sex && r[F.AGE] === ageRange
              )

              resultMap[`${sex[0]}${ageRange}`] = result
            })
          })
          return resultMap
        },
      },
      // HIV PREVALENCE
      {
        id: 'prev',
        [F.INDICATOR]: 'Adult prevalence (15-24) (Percent) Female',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC24,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          const result = getMostRecentResult(results)
          if (!result) return {}
          return { [`${FEMALE[0]}${ADULTS15}`]: result }
        },
      },
      {
        id: 'prev',
        [F.INDICATOR]: 'Adult prevalence (15-24) (Percent) Male',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC24,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          const result = getMostRecentResult(results)
          if (!result) return {}
          return { [`${MALE[0]}${ADULTS15}`]: result }
        },
      },
      {
        id: 'prev',
        [F.INDICATOR]: 'Adult prevalence (15+) (Percent) Female',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC24,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          const result = getMostRecentResult(results)
          if (!result) return {}
          return { [`${FEMALE[0]}${ALL_ADULTS}`]: result }
        },
      },
      {
        id: 'prev',
        [F.INDICATOR]: 'Adult prevalence (15+) (Percent) Male',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC24,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          const result = getMostRecentResult(results)
          if (!result) return {}
          return { [`${MALE[0]}${ALL_ADULTS}`]: result }
        },
      },
      {
        id: 'prev',
        [F.INDICATOR]: 'Adult prevalence (25-34) (Percent) Female',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC24,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          const result = getMostRecentResult(results)
          if (!result) return {}
          return { [`${FEMALE[0]}${ADULTS25}`]: result }
        },
      },
      {
        id: 'prev',
        [F.INDICATOR]: 'Adult prevalence (25-34) (Percent) Male',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC24,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          const result = getMostRecentResult(results)
          if (!result) return {}
          return { [`${MALE[0]}${ADULTS25}`]: result }
        },
      },
      {
        id: 'prev',
        [F.INDICATOR]: 'Adult prevalence (35-49) (Percent) Female',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC24,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          const result = getMostRecentResult(results)
          if (!result) return {}
          return { [`${FEMALE[0]}${ADULTS35}`]: result }
        },
      },
      {
        id: 'prev',
        [F.INDICATOR]: 'Adult prevalence (35-49) (Percent) Male',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC24,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          const result = getMostRecentResult(results)
          if (!result) return {}
          return { [`${MALE[0]}${ADULTS35}`]: result }
        },
      },
      {
        id: 'prev',
        [F.INDICATOR]: 'Adult prevalence (50+) (Percent) Female',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC24,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          const result = getMostRecentResult(results)
          if (!result) return {}
          return { [`${FEMALE[0]}${ADULTS50}`]: result }
        },
      },
      {
        id: 'prev',
        [F.INDICATOR]: 'Adult prevalence (50+) (Percent) Male',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC24,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          const result = getMostRecentResult(results)
          if (!result) return {}
          return { [`${MALE[0]}${ADULTS50}`]: result }
        },
      },
      // NEW HIV INFECTIONS
      {
        id: 'newly',
        [F.INDICATOR]: 'New HIV infections (15+) Female',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC24,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          const result = getMostRecentResult(results)
          if (!result) return {}
          return { [`${FEMALE[0]}${ALL_ADULTS}`]: result }
        },
      },
      {
        id: 'newly',
        [F.INDICATOR]: 'New HIV infections (15+) Male',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC24,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          const result = getMostRecentResult(results)
          if (!result) return {}
          return { [`${MALE[0]}${ALL_ADULTS}`]: result }
        },
      },
      {
        id: 'newly',
        [F.INDICATOR]: 'New infections by age 15-24 ; Female',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC24,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          const result = getMostRecentResult(results)
          if (!result) return {}
          return { [`${FEMALE[0]}${ADULTS15}`]: result }
        },
      },
      {
        id: 'newly',
        [F.INDICATOR]: 'New infections by age 15-24 ; Male',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC24,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          const result = getMostRecentResult(results)
          if (!result) return {}
          return { [`${MALE[0]}${ADULTS15}`]: result }
        },
      },
      {
        id: 'newly',
        [F.INDICATOR]: 'New infections by age 25-34 ; Female',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC24,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          const result = getMostRecentResult(results)
          if (!result) return {}
          return { [`${FEMALE[0]}${ADULTS25}`]: result }
        },
      },
      {
        id: 'newly',
        [F.INDICATOR]: 'New infections by age 25-34 ; Male',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC24,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          const result = getMostRecentResult(results)
          if (!result) return {}
          return { [`${MALE[0]}${ADULTS25}`]: result }
        },
      },
      {
        id: 'newly',
        [F.INDICATOR]: 'New infections by age 35-49 ; Female',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC24,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          const result = getMostRecentResult(results)
          if (!result) return {}
          return { [`${FEMALE[0]}${ADULTS35}`]: result }
        },
      },
      {
        id: 'newly',
        [F.INDICATOR]: 'New infections by age 35-49 ; Male',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC24,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          const result = getMostRecentResult(results)
          if (!result) return {}
          return { [`${MALE[0]}${ADULTS35}`]: result }
        },
      },
      {
        id: 'newly',
        [F.INDICATOR]: 'New HIV infections (50+) Female',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC24,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          const result = getMostRecentResult(results)
          if (!result) return {}
          return { [`${FEMALE[0]}${ADULTS50}`]: result }
        },
      },
      {
        id: 'newly',
        [F.INDICATOR]: 'New HIV infections (50+) Male',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC24,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          const result = getMostRecentResult(results)
          if (!result) return {}
          return { [`${MALE[0]}${ADULTS50}`]: result }
        },
      },
      // TESTED IN PAST YEAR
      {
        id: 'year',
        [F.INDICATOR]: 'tests_total',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.S90,
        [F.SOURCE_YEAR]: SHINY_SOURCE_YEAR,
        [F.YEAR]: LATEST_YEAR,
        [F.AREA_NAME]: 'NULL_OR_ALL',
        [F.INDICATOR_DESCRIPTION]: 'all',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          const resultMap = {}
          R_SEXES.forEach((sex) => {
            ;[...R_ADULT_AGES, ALL_ADULTS].forEach((ageRange) => {
              const countryCode = _.get(results, [0, F.COUNTRY_ISO_CODE])
              const countryApplies = _.get(
                COUNTRY_MAP,
                [countryCode, 'sumFix'],
                false
              )
              if (FEATURE_FLAGS.SHINY_SUM && countryApplies) {
                const fResults = _.filter(
                  results,
                  (r) => r[F.SEX] === sex && r[F.AGE] === ageRange
                )

                const firstRow = fResults[0]
                const sumRow = { ...firstRow }
                sumRow[F.AREA_NAME] = 'NULL' // let's pretend
                sumRow[F.VALUE_UPPER] = undefined
                sumRow[F.VALUE_LOWER] = undefined
                sumRow[F.VALUE] = 0
                const areaMap = {}
                fResults.forEach((r) => {
                  if (r[F.VALUE]) {
                    const rowArea = r[F.AREA_NAME]
                    // we're summing over regional values. if there's also a country-wide
                    // value (ie AREA_NAME = NULL), it should not be included in sum.
                    if (areaMap[rowArea] || !r[F.AREA_NAME]) {
                      console.warn(
                        `$$$$ duplicate (or NULL) area_name for tests_total ${sex} ${ageRange}: `,
                        r
                      )
                    } else {
                      areaMap[rowArea] = true
                      sumRow[F.VALUE] += Number(r[F.VALUE])
                      console.log('$$$: ', rowArea, r[F.VALUE], sumRow[F.VALUE])
                    }
                  }
                })
                resultMap[`${sex[0]}${ageRange}`] = sumRow
                console.log(
                  `$$$$ USING SUMMED ROW FOR tests_total ${sex} ${ageRange} `
                )
                console.log('$$$$: ', sumRow)
                console.log('$$$$ SUMMED OVER: ', fResults)
              } else {
                const result = getMostRecentResult(results, {
                  filterCheck: (r) => r[F.SEX] === sex && r[F.AGE] === ageRange,
                })
                if (!!result) {
                  resultMap[`${sex[0]}${ageRange}`] = result
                }
              }
            })
          })
          return resultMap
        },
      },
      {
        id: 'year',
        [F.INDICATOR]: 'tests_total',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.S90,
        [F.SOURCE_YEAR]: SHINY_SOURCE_YEAR,
        [F.YEAR]: '2021',
        [F.AREA_NAME]: 'NULL_OR_ALL',
        [F.INDICATOR_DESCRIPTION]: 'all',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          const resultMap = {}
          R_SEXES.forEach((sex) => {
            ;[...R_ADULT_AGES, ALL_ADULTS].forEach((ageRange) => {
              const countryCode = _.get(results, [0, F.COUNTRY_ISO_CODE])
              const countryApplies = _.get(
                COUNTRY_MAP,
                [countryCode, 'sumFix'],
                false
              )
              if (FEATURE_FLAGS.SHINY_SUM && countryApplies) {
                const fResults = _.filter(
                  results,
                  (r) => r[F.SEX] === sex && r[F.AGE] === ageRange
                )

                const firstRow = fResults[0]
                const sumRow = { ...firstRow }
                sumRow[F.AREA_NAME] = 'NULL' // let's pretend
                sumRow[F.VALUE_UPPER] = undefined
                sumRow[F.VALUE_LOWER] = undefined
                sumRow[F.VALUE] = 0
                const areaMap = {}
                fResults.forEach((r) => {
                  if (r[F.VALUE]) {
                    const rowArea = r[F.AREA_NAME]
                    // we're summing over regional values. if there's also a country-wide
                    // value (ie AREA_NAME = NULL), it should not be included in sum.
                    if (areaMap[rowArea] || !r[F.AREA_NAME]) {
                      console.warn(
                        `$$$$ duplicate (or NULL) area_name for tests_total ${sex} ${ageRange}: `,
                        r
                      )
                    } else {
                      areaMap[rowArea] = true
                      sumRow[F.VALUE] += Number(r[F.VALUE])
                      console.log('$$$: ', rowArea, r[F.VALUE], sumRow[F.VALUE])
                    }
                  }
                })
                resultMap[`${sex[0]}${ageRange}`] = sumRow
                console.log(
                  `$$$$ USING SUMMED ROW FOR tests_total ${sex} ${ageRange} `
                )
                console.log('$$$$: ', sumRow)
                console.log('$$$$ SUMMED OVER: ', fResults)
              } else {
                const result = getMostRecentResult(results, {
                  filterCheck: (r) => r[F.SEX] === sex && r[F.AGE] === ageRange,
                })
                if (!!result) {
                  resultMap[`${sex[0]}${ageRange}`] = result
                }
              }
            })
          })
          return resultMap
        },
      },
      {
        id: 'year',
        [F.INDICATOR]: 'tests_total',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.S90,
        [F.SOURCE_YEAR]: SHINY_SOURCE_YEAR,
        [F.YEAR]: '2020',
        [F.AREA_NAME]: 'NULL_OR_ALL',
        [F.INDICATOR_DESCRIPTION]: 'all',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          const resultMap = {}
          R_SEXES.forEach((sex) => {
            ;[...R_ADULT_AGES, ALL_ADULTS].forEach((ageRange) => {
              const countryCode = _.get(results, [0, F.COUNTRY_ISO_CODE])
              const countryApplies = _.get(
                COUNTRY_MAP,
                [countryCode, 'sumFix'],
                false
              )
              if (FEATURE_FLAGS.SHINY_SUM && countryApplies) {
                const fResults = _.filter(
                  results,
                  (r) => r[F.SEX] === sex && r[F.AGE] === ageRange
                )

                const firstRow = fResults[0]
                const sumRow = { ...firstRow }
                sumRow[F.AREA_NAME] = 'NULL' // let's pretend
                sumRow[F.VALUE_UPPER] = undefined
                sumRow[F.VALUE_LOWER] = undefined
                sumRow[F.VALUE] = 0
                const areaMap = {}
                fResults.forEach((r) => {
                  if (r[F.VALUE]) {
                    const rowArea = r[F.AREA_NAME]
                    // we're summing over regional values. if there's also a country-wide
                    // value (ie AREA_NAME = NULL), it should not be included in sum.
                    if (areaMap[rowArea] || !r[F.AREA_NAME]) {
                      console.warn(
                        `$$$$ duplicate (or NULL) area_name for tests_total ${sex} ${ageRange}: `,
                        r
                      )
                    } else {
                      areaMap[rowArea] = true
                      sumRow[F.VALUE] += Number(r[F.VALUE])
                      console.log('$$$: ', rowArea, r[F.VALUE], sumRow[F.VALUE])
                    }
                  }
                })
                resultMap[`${sex[0]}${ageRange}`] = sumRow
                console.log(
                  `$$$$ USING SUMMED ROW FOR tests_total ${sex} ${ageRange} `
                )
                console.log('$$$$: ', sumRow)
                console.log('$$$$ SUMMED OVER: ', fResults)
              } else {
                const result = getMostRecentResult(results, {
                  filterCheck: (r) => r[F.SEX] === sex && r[F.AGE] === ageRange,
                })
                if (!!result) {
                  resultMap[`${sex[0]}${ageRange}`] = result
                }
              }
            })
          })
          return resultMap
        },
      },
      {
        id: 'year',
        [F.INDICATOR]: 'Den Age-Female Gte 15',
        [F.VALUE_COMMENT]: 'validated',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.GAM24,
        [F.YEAR]: '2023',
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          const result = getMostRecentResult(results)
          if (!result) return {}
          return { [`${FEMALE[0]}${ALL_ADULTS}`]: result }
        },
      },
      {
        id: 'year',
        [F.INDICATOR]: 'Den Age-Female Gte 15',
        [F.VALUE_COMMENT]: 'validated',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.GAM23,
        [F.YEAR]: '2022',
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          const result = getMostRecentResult(results)
          if (!result) return {}
          return { [`${FEMALE[0]}${ALL_ADULTS}`]: result }
        },
      },
      {
        id: 'year',
        [F.INDICATOR]: 'Den Age-Female Gte 15',
        [F.VALUE_COMMENT]: 'validated',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.GAM21,
        [F.YEAR]: '2020',
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          const result = getMostRecentResult(results)
          if (!result) return {}
          return { [`${FEMALE[0]}${ALL_ADULTS}`]: result }
        },
      },
      {
        id: 'year',
        [F.INDICATOR]: 'Den Age-Male Gte 15',
        [F.VALUE_COMMENT]: 'validated',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.GAM24,
        [F.YEAR]: '2023',
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          const result = getMostRecentResult(results)
          if (!result) return {}
          return { [`${MALE[0]}${ALL_ADULTS}`]: result }
        },
      },
      {
        id: 'year',
        [F.INDICATOR]: 'Den Age-Male Gte 15',
        [F.VALUE_COMMENT]: 'validated',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.GAM23,
        [F.YEAR]: '2022',
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          const result = getMostRecentResult(results)
          if (!result) return {}
          return { [`${MALE[0]}${ALL_ADULTS}`]: result }
        },
      },
      {
        id: 'year',
        [F.INDICATOR]: 'Den Age-Male Gte 15',
        [F.VALUE_COMMENT]: 'validated',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.GAM21,
        [F.YEAR]: '2020',
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          if (
            results.length > 1 &&
            _.uniqBy(results, 'year').length !== results.length
          ) {
            // debugger
            console.warn(
              `**LOOKOUT! Taking highest year result.**
            `,
              results[0].indicator,
              'R:',
              _.maxBy(results, 'year'),
              `
            `,
              'rs:',
              results
            )
          }
          return { [`${MALE[0]}${ALL_ADULTS}`]: _.maxBy(results, 'year') }
        },
      },
      {
        id: 'year',
        [F.INDICATOR]: 'Den Age-Female Gte 15',
        // [F.SOURCE_DATABASE]: SOURCE_DB_MAP.PCOP20,
        // [F.YEAR]: LATEST_YEAR,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          const dbHierarchy = [SOURCE_DB_MAP.PCOP20, SOURCE_DB_MAP.PROP20]
          const result = findPrioritizedResult({ results, dbHierarchy })

          return { [`${FEMALE[0]}${ALL_ADULTS}`]: result }
        },
      },
      {
        id: 'year',
        [F.INDICATOR]: 'Den Age-Male Gte 15',
        // [F.SOURCE_DATABASE]: SOURCE_DB_MAP.PCOP20,
        // [F.YEAR]: LATEST_YEAR,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          const dbHierarchy = [SOURCE_DB_MAP.PCOP20, SOURCE_DB_MAP.PROP20]
          const result = findPrioritizedResult({ results, dbHierarchy })

          return { [`${MALE[0]}${ALL_ADULTS}`]: result }
        },
      },
      {
        id: 'year',
        [F.INDICATOR]: 'Women 15-24 (Tested in past year)',
        // [F.SOURCE_DATABASE]: SOURCE_DB_MAP.PCOP20,
        // [F.YEAR]: LATEST_YEAR,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          const dbHierarchy = [SOURCE_DB_MAP.PCOP20, SOURCE_DB_MAP.PROP20]
          const result = findPrioritizedResult({ results, dbHierarchy })

          return { [`${FEMALE[0]}${ADULTS15}`]: result }
        },
      },
      {
        id: 'year',
        [F.INDICATOR]: 'Men 15-24 (Tested in past year)',
        // [F.SOURCE_DATABASE]: SOURCE_DB_MAP.PCOP20,
        // [F.YEAR]: LATEST_YEAR,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          const dbHierarchy = [SOURCE_DB_MAP.PCOP20, SOURCE_DB_MAP.PROP20]
          const result = findPrioritizedResult({ results, dbHierarchy })

          return { [`${MALE[0]}${ADULTS15}`]: result }
        },
      },
      {
        id: 'year',
        [F.INDICATOR]: 'Women (15+) - Number of tests',
        // [F.SOURCE_DATABASE]
        // [F.YEAR]: '2018',
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          const dbHierarchy = [SOURCE_DB_MAP.GAM, SOURCE_DB_MAP.NPD]
          const result = findPrioritizedResult({ results, dbHierarchy })

          return { [`${FEMALE[0]}${ALL_ADULTS}`]: result }
        },
      },
      {
        id: 'year',
        [F.INDICATOR]: 'Men (15+) - Number of tests',
        // [F.SOURCE_DATABASE]
        // [F.YEAR]: '2018',
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          const dbHierarchy = [SOURCE_DB_MAP.GAM, SOURCE_DB_MAP.NPD]
          const result = findPrioritizedResult({ results, dbHierarchy })

          return { [`${MALE[0]}${ALL_ADULTS}`]: result }
        },
      },
      {
        id: 'year',
        [F.INDICATOR]: 'Women (Tested in past year)',
        // [F.SOURCE_DATABASE]
        // [F.YEAR]: '2018',
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          const { PCOP19, PROP19, PCOP1718, PROP17 } = SOURCE_DB_MAP
          const dbHierarchy = [PCOP19, PROP19, PCOP1718, PROP17]

          const result = findPrioritizedResult({ results, dbHierarchy })

          return { [`${FEMALE[0]}${ALL_ADULTS}`]: result }
        },
      },
      {
        id: 'year',
        [F.INDICATOR]: 'Men (Tested in past year)',
        // [F.SOURCE_DATABASE]
        // [F.YEAR]: '2018',
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          const { PCOP19, PROP19, PCOP1718, PROP17 } = SOURCE_DB_MAP
          const dbHierarchy = [PCOP19, PROP19, PCOP1718, PROP17]

          const result = findPrioritizedResult({ results, dbHierarchy })

          return { [`${MALE[0]}${ALL_ADULTS}`]: result }
        },
      },
      {
        id: 'year',
        [F.INDICATOR]: 'Women 15-24 (Tested in past year)',
        // [F.SOURCE_DATABASE]
        // [F.YEAR]: '2018',
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          const { PCOP19, PROP19, PCOP1718, PROP17 } = SOURCE_DB_MAP
          const dbHierarchy = [PCOP19, PROP19, PCOP1718, PROP17]

          const result = findPrioritizedResult({ results, dbHierarchy })

          return { [`${FEMALE[0]}${ADULTS15}`]: result }
        },
      },
      {
        id: 'year',
        [F.INDICATOR]: 'Men 15-24 (Tested in past year)',
        // [F.SOURCE_DATABASE]
        // [F.YEAR]: '2018',
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          const { PCOP19, PROP19, PCOP1718, PROP17 } = SOURCE_DB_MAP
          const dbHierarchy = [PCOP19, PROP19, PCOP1718, PROP17]

          const result = findPrioritizedResult({ results, dbHierarchy })

          return { [`${MALE[0]}${ADULTS15}`]: result }
        },
      },
      {
        id: 'year',
        [F.INDICATOR]: 'Women (15+) Tested in Past Year',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.PEPFAR,
        // [F.YEAR]: '2018',
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          if (
            results.length > 1 &&
            _.uniqBy(results, 'year').length !== results.length
          ) {
            // debugger
            console.warn(
              `**LOOKOUT! Taking highest year result.**
            `,
              results[0].indicator,
              'R:',
              _.maxBy(results, 'year'),
              `
            `,
              'rs:',
              results
            )
          }
          return { [`${FEMALE[0]}${ALL_ADULTS}`]: _.maxBy(results, 'year') }
        },
      },
      {
        id: 'year',
        [F.INDICATOR]: 'Men (15+) Tested in Past Year',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.PEPFAR,
        // [F.YEAR]: '2018',
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          if (
            results.length > 1 &&
            _.uniqBy(results, 'year').length !== results.length
          ) {
            // debugger
            console.warn(
              `**LOOKOUT! Taking highest year result.**
            `,
              results[0].indicator,
              'R:',
              _.maxBy(results, 'year'),
              `
            `,
              'rs:',
              results
            )
          }
          return { [`${MALE[0]}${ALL_ADULTS}`]: _.maxBy(results, 'year') }
        },
      },
      // EVER TESTED (%)
      {
        id: 'ever',
        [F.INDICATOR]: 'evertest',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.S90,
        [F.SOURCE_YEAR]: SHINY_SOURCE_YEAR,
        [F.YEAR]: LATEST_YEAR,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          const resultMap = {}
          R_SEXES.forEach((sex) => {
            ;[...R_ADULT_AGES, ALL_ADULTS].forEach((ageRange) => {
              const result = _.find(
                results,
                (r) => r[F.SEX] === sex && r[F.AGE] === ageRange
              )

              resultMap[`${sex[0]}${ageRange}`] = result
            })
          })
          return resultMap
        },
      },
      {
        id: 'ever',
        [F.INDICATOR]: 'Women ever receiving an HIV test',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.DHS,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          if (
            results.length > 1 &&
            _.uniqBy(results, 'year').length !== results.length
          ) {
            // debugger
            console.warn(
              `**LOOKOUT! Taking highest year result.**
            `,
              results[0].indicator,
              'R:',
              _.maxBy(results, 'year'),
              `
            `,
              'rs:',
              results
            )
          }
          return { [`${FEMALE[0]}${ALL_ADULTS}`]: getMostRecentResult(results) }
        },
      },
      {
        id: 'ever',
        [F.INDICATOR]: 'Men ever receiving an HIV test',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.DHS,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          if (
            results.length > 1 &&
            _.uniqBy(results, 'year').length !== results.length
          ) {
            // debugger
            console.warn(
              `**LOOKOUT! Taking highest year result.**
            `,
              results[0].indicator,
              'R:',
              _.maxBy(results, 'year'),
              `
            `,
              'rs:',
              results
            )
          }
          return { [`${MALE[0]}${ALL_ADULTS}`]: getMostRecentResult(results) }
        },
      },
      {
        id: 'ever',
        [F.INDICATOR]: 'ever_tested',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.MICS,
        // [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          const resultMap = {}
          R_SEXES.forEach((sex) => {
            resultMap[`${sex[0]}${ADULTS15}`] = _.find(
              results,
              (r) => r[F.SEX] === sex && r[F.AGE] === ADULTS15
            )

            resultMap[`${sex[0]}${ALL_ADULTS}`] = _.find(
              results,
              (r) => r[F.SEX] === sex && r[F.AGE] === '15-49'
            )
          })
          return resultMap
        },
      },
      {
        id: 'ever',
        [F.INDICATOR]: 'ever_tested_results',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.MICS,
        // [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          const resultMap = {}
          R_SEXES.forEach((sex) => {
            resultMap[`${sex[0]}${ADULTS15}`] = _.find(
              results,
              (r) => r[F.SEX] === sex && r[F.AGE] === ADULTS15
            )

            resultMap[`${sex[0]}${ALL_ADULTS}`] = _.find(
              results,
              (r) => r[F.SEX] === sex && r[F.AGE] === '15-49'
            )
          })
          return resultMap
        },
      },
    ],
  }

  if (isShiny) {
    // add shiny90-only charts
    indicatorMap[C.PLHIV_AGE.id] = R_ADULT_AGES.map((ageRange) => ({
      id: ageRange,
      [F.INDICATOR]: C.PLHIV_AGE.indicators.aware,
      [F.AGE]: ageRange,
      [F.SEX]: 'both',
      [F.AREA_NAME]: 'NULL',
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.S90,
      [F.SOURCE_YEAR]: SHINY_SOURCE_YEAR,
      [F.COUNTRY_ISO_CODE]: true,
      getter: (results) => {
        return C.PLHIV_AGE.yearRange.map((y) => {
          const fResults = _.filter(results, (r) => r.year === y)

          if (fResults.length > 1) {
            console.warn(
              '## should not be multi results PLHIV_AGE.aware ##',
              fResults
            )
          }
          console.log('## PLHIV_AGE ##', fResults[0])
          return _.maxBy(fResults, F.SOURCE_YEAR)
        })
      },
    }))
    indicatorMap[C.HIV_NEGATIVE.id] = _.map(
      C.HIV_NEGATIVE.indicators,
      (v, k) => ({
        id: k,
        [F.INDICATOR]: v,
        [F.INDICATOR_DESCRIPTION]: 'negative',
        [F.AGE]: '15-99',
        [F.SEX]: 'both',
        [F.AREA_NAME]: 'NULL_OR_ALL',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.S90,
        [F.SOURCE_YEAR]: SHINY_SOURCE_YEAR,
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          return C.HIV_NEGATIVE.yearRange.map((y) => {
            const fResults = _.filter(results, (r) => r.year === y)

            let fixing = false
            const firstRow = fResults[0]
            const countryCode = _.get(firstRow, F.COUNTRY_ISO_CODE)
            const countryApplies = _.get(
              COUNTRY_MAP,
              [countryCode, 'sumFix'],
              false
            )
            if (FEATURE_FLAGS.SHINY_SUM && countryApplies) {
              fixing = true
              const sumRow = { ...firstRow }
              sumRow[F.AREA_NAME] = 'NULL' // let's pretend
              sumRow[F.VALUE_UPPER] = undefined
              sumRow[F.VALUE_LOWER] = undefined
              sumRow[F.VALUE] = 0
              fResults.forEach((r) => {
                if (r[F.VALUE]) {
                  // we're summing over regional values. if there's also a country-wide
                  // value (ie AREA_NAME = NULL), it should not be included in sum.
                  if (r[F.AREA_NAME]) {
                    sumRow[F.VALUE] += Number(r[F.VALUE])
                  } else {
                    console.log('$$$$ skipping NULL AREA_NAME: ', r)
                  }
                }
              })
              console.log(`$$$$ USING SUMMED ROW FOR ${v} ${y}`)
              console.log('$$$$ USING SUMMED ROW: ', sumRow)
              console.log('$$$$ SUMMED OVER: ', fResults)
              fResults.unshift(sumRow)
            }
            return _.maxBy(fResults, F.SOURCE_YEAR)
          })
        },
      })
    )
    indicatorMap[C.HIV_POSITIVE.id] = _.map(
      C.HIV_POSITIVE.indicators,
      (v, k) => ({
        id: k,
        [F.INDICATOR]: v,
        [F.INDICATOR_DESCRIPTION]: 'positive',
        [F.AGE]: '15-99',
        [F.SEX]: 'both',
        [F.AREA_NAME]: 'NULL_OR_ALL',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.S90,
        [F.SOURCE_YEAR]: SHINY_SOURCE_YEAR,
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          return C.HIV_POSITIVE.yearRange.map((y) => {
            const fResults = _.filter(results, (r) => r.year === y)

            let fixing = false
            const firstRow = fResults[0]
            const countryCode = _.get(firstRow, F.COUNTRY_ISO_CODE)
            const countryApplies = _.get(
              COUNTRY_MAP,
              [countryCode, 'sumFix'],
              false
            )
            if (FEATURE_FLAGS.SHINY_SUM && countryApplies) {
              fixing = true
              const sumRow = { ...firstRow }
              sumRow[F.AREA_NAME] = 'NULL' // let's pretend
              sumRow[F.VALUE_UPPER] = undefined
              sumRow[F.VALUE_LOWER] = undefined
              sumRow[F.VALUE] = 0
              fResults.forEach((r) => {
                if (r[F.VALUE]) {
                  // we're summing over regional values. if there's also a country-wide
                  // value (ie AREA_NAME = NULL), it should not be included in sum.
                  if (
                    r[F.AREA_NAME] &&
                    r[F.AREA_NAME].toUpperCase() !== 'NULL'
                  ) {
                    sumRow[F.VALUE] += Number(r[F.VALUE])
                  } else {
                    console.log('$$$$ skipping NULL AREA_NAME: ', r)
                  }
                }
              })
              console.log(`$$$$ USING SUMMED ROW FOR ${v} ${y}`)
              console.log('$$$$ USING SUMMED ROW: ', sumRow)
              console.log('$$$$ SUMMED OVER: ', fResults)
              fResults.unshift(sumRow)
            }
            return _.maxBy(fResults, F.SOURCE_YEAR)
          })
        },
      })
    )

    // add shiny90-only fields for PREVALENCE
    const shinyPrevInds = _.map(C.PREVALENCE.shinyOnlyIndicators, (v, k) => ({
      id: k,
      [F.INDICATOR]: v,
      [F.AGE]: '15-99',
      [F.SEX]: 'both',
      [F.AREA_NAME]: 'NULL',
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.S90,
      [F.SOURCE_YEAR]: SHINY_SOURCE_YEAR,
      [F.COUNTRY_ISO_CODE]: true,
      getter: (results) => {
        return C.PREVALENCE.yearRange.map((y) => {
          const fResults = _.filter(results, (r) => r.year === y)
          return _.maxBy(fResults, F.SOURCE_YEAR)
        })
      },
    }))

    indicatorMap[C.PREVALENCE.id].push(...shinyPrevInds)
  }

  return indicatorMap
}

export {
  BASE_URL,
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
  getIndicatorMap,
  isFemale,
}
