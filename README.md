# WHO HIV self-testing data dashboard

Built using **React** + **Redux** + **Bootstrap** + **SASS** on top of [Rhymond's wrapper](https://github.com/Rhymond/product-compare-react) of [`create-react-app`](https://create-react-app.dev/). 

Usage
-
// clone repo\
`git checkout master`\
`npm install`\ // currently optimized for use with node version 14.16.1
`npm start` // ---> localhost:3000/

Deployment
-
The production site is deployed at [whohts.web.app](whohts.web.app), which is kept as a build of the latest `master` commit, hosted through [Firebase](https://console.firebase.google.com/u/0/project/whohts/overview). After being added to the Firebase project (and assuming you have [Firebase CLI](https://firebase.google.com/docs/cli) set up locally), updates to the site are made by the following workflow:\
`git checkout master`\
`git pull` // be sure to deploy the latest version of master (TODO: make updates to master trigger auto-deployment)\
// make some changes\
`npm run-script build && firebase deploy` // the latest build will be deployed, so failing to build before deploying would not deploy your latest changes\
`git commit`\
`git push` // otherwise future deployments by anyone else will omit your changes

To preview changes:\
`npm run-script build && firebase hosting:channel:deploy test --expires 30d` // generates a unique URL that includes "test", expires in 30 days\

License
-
The MIT License (MIT). Please see License File for more information.
