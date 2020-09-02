import React from 'react'
import './styles.css'
import { withRouter } from 'react-router'

const shinyCountries = [
  "Angola",
  "Benin",
  "Botswana",
  "Burkina Faso",
  "Burundi",
  "Cabo Verde",
  "Cameroon",
  "Central African Republic",
  "Chad",
  "Congo",
  "Côte d'Ivoire",
  "Democratic Republic of the Congo",
  "Equatorial Guinea",
  "Eritrea",
  "Eswatini",
  "Ethiopia",
  "Gabon",
  "Gambia",
  "Ghana",
  "Guinea",
  "Guinea - Bissau",
  "Kenya",
  "Lesotho",
  "Liberia",
  "Malawi",
  "Mali",
  "Mauritania",
  "Mozambique",
  "Namibia",
  "Niger",
  "Nigeria",
  "Rwanda",
  "Sao Tome and Principe",
  "Senegal",
  "Sierra Leone",
  "South Sudan",
  "Togo",
  "Uganda",
  "United Republic of Tanzania",
  "Zambia",
  "Zimbabwe",
]

const Homepage = withRouter(({ history }) =>
  <div className='homepage'>
    <img className='who-logo' src='images/who_logo.png' alt='WHO logo' />
    <section className='text-center'>
      <div>
      {/* <div className='container-fluid'> */}
        <h1>HIV Country Intelligence</h1>
        <h2>HIV Testing Services Dashboard</h2>
        <div className='input-group'>
          <select defaultValue='none' onChange={e => history.push('/' + e.target.value)} className='custom-select'>
            <option value='none'>Select Country</option>
            {shinyCountries.map(c => {
              return <option value={c} key={c}>{c}</option>
            })}
            {/* <option value='Kenya'>Kenya</option>
            <option value='Thailand'>Thailand</option> */}
          </select>
        </div>
      </div>
    </section>
    <p className='text-muted'>
      Overview: The HTS dashboard brings together data on HIV testing services from various sources into one visual tool. We would like to acknowledge the support of the Ministries of Health of Member States, UNAIDS, the Bill and Melinda Gates Foundation, the President’s Emergency Programme for AIDS Relief (PEPFAR), USAID, the World Health Organization, and the Global Fund to Fight AIDS, Tuberculosis and Malaria. This project aims to provide local level data for in country action for policy-makers, programme directors, outreach workers and community activists among others. The most recent data available has been collected from the relevant organisation including UNAIDS (Spectrum estimates, Global AIDS Monitoring and the Key Population Atlas), UNPOP, UNICEF and the World Bank. USAID/PEPFAR have kindly provided HIV testing data by approach. Data gaps have been filled (where possible) by reviewing publicly available sources, most notably from Ministries of Health and PEPFAR country operational plans. All dashboards have been viewed and approved by the Ministries of Health. This dashboard does not cover in-depth policy information, PrEP or paediatric HIV testing but includes links to relevant sites that do cover this information.
    </p>
    <p className='text-muted'>
      Contact: Cheryl Case Johnson (johnsonc@who.int)
    </p>
    {/* <div className='home mt-5'>
      <div className='row'>
        <div className='col-12'>
          <h2 className='mb-3'>! hello !</h2>
        </div>
      </div>
    </div> */}
  </div>)

export default Homepage
