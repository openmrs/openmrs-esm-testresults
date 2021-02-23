import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { LabResults } from './lab-results/lab-results.component';
import Timeline from './timeline/timeline.component';
import Trendline from './trendline/trendline.component';

export default function Root() {
  return (
    <BrowserRouter basename={window['getOpenmrsSpaBase']()}>
      <Switch>
        <Route path="/lab-results/:patientUuid/timeline/:panelUuid/trendline/:testUuid" component={Trendline} />
        <Route path="/lab-results/:patientUuid/timeline/:panelUuid" component={Timeline} />
        <Route path="/lab-results/:patientUuid/trendline/:testUuid" component={Trendline} />
        <Route path="/lab-results/:patientUuid" component={LabResults} />
        <Route path="/lab-results" component={LabResults} />
      </Switch>
    </BrowserRouter>
  );
}
