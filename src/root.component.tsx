import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import { LabResults } from './lab-results/lab-results.component';

export default function Root() {
  return (
    <BrowserRouter basename={window['getOpenmrsSpaBase']()}>
      <Route path="/lab-results" component={LabResults} />
      <Route path="/lab-results/{id}/timeline/{id2}" component={LabResults} />
    </BrowserRouter>
  );
}
