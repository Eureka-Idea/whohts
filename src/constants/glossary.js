const diagnosticYield = {
  term: 'Diagnostic yield',
  // Note: Question from stakeholder on how this is determined so more detail may be needed.
  definition: 'Proportion of all tests conducted in which a new HIV diagnosis was identified.'
}

const firstTest = {
  term: 'First test',
  definition: 'Refers to the first time an individual has ever tested for HIV'
}

const hivPrevalence = {
  term: 'HIV prevalence',
  definition: 'Proportion of all people in the country who are HIV - infected'
}

const hivstDemand = {
  term: 'HIVST demand',
  definition: 'Estimated volume of HIV self - tests to be procured based on planned level of implementation'
}

const hivstNeed = {
  term: 'HIVST need',
  definition: 'Estimated volume of HIV self - tests required to support the testing needs of the national program'
}

const newDiagnosis = {
  term: 'New diagnosis',
  definition: 'The first positive / reactive test for an individual(i.e., the first time they become aware they are living with HIV).This can be either a first test or a retest.'
}

const plhivWhoKnowStatus = {
  term: 'PLHIV who know status',
  definition: 'A person living with HIV who is aware of their HIV infection'
}

const plhivWhoKnowStatusNotOnArt = {
  term: 'PLHIV who know status not on ART',
  definition: 'A person living with HIV who is aware of their HIV infection but is not currently on antiretroviral therapy'
}

const plhivKnowStatusOnArt = {
  term: 'PLHIV know status on ART',
  definition: 'A person living with HIV who is aware of their HIV infection and is currently on antiretroviral therapy'
}

const positivity = {
  term: 'Positivity',
  definition: 'Proportion of all tests conducted where an HIV - positive result was returned'
}

const retest = {
  term: 'Retest',
  definition: 'Refers to HIV tests among individuals who have previously tested for HIV'
}

const shiny90 = {
  term: 'Shiny90',
  // TODO: add link
  definition: 'A mathematical model that synthesizes population - based survey and HIV testing services program data to estimate awareness of HIV status over time. Full details of the model can be found here: https://journals.lww.com/aidsonline/fulltext/2019/12153/national_hiv_testing_and_diagnosis_coverage_in.7.aspx'
}


const treatmentAdjustedPrevalence = {
  term: 'Treatment - adjusted prevalence',
  definition: 'National HIV prevalence that is adjusted to exclude PLHIV on ART from the numerator and the denominator.Treatment - adjusted prevalence includes people with HIV who are undiagnosed, people with HIV who know their status but have not initiated treatment, and people with HIV who previously initiated treatment but have disengaged from care.'
}

const undiagnosedPlhiv = {
  term: 'Undiagnosed PLHIV',
  definition: 'A person living with HIV who is unaware of their HIV infection'
}

const TERMS = [diagnosticYield, firstTest, hivPrevalence, hivstDemand, hivstNeed, newDiagnosis, plhivWhoKnowStatus, plhivWhoKnowStatusNotOnArt, plhivKnowStatusOnArt, positivity, retest, shiny90, treatmentAdjustedPrevalence, undiagnosedPlhiv]

const TERM_MAP = {
  diagnosticYield,
  firstTest,
  hivPrevalence,
  hivstDemand,
  hivstNeed,
  newDiagnosis,
  plhivWhoKnowStatus,
  plhivWhoKnowStatusNotOnArt,
  plhivKnowStatusOnArt,
  positivity,
  retest,
  shiny90,
  treatmentAdjustedPrevalence,
  undiagnosedPlhiv,
}

export { TERMS, TERM_MAP }