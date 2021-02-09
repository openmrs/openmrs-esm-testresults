https://openmrs-spa.org/openmrs/owa/conceptdictionary/index.html#/concept/856AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/
https://openmrs-spa.org/openmrs/owa/conceptdictionary/index.html#/concept/21AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/

In legacy: https://openmrs-spa.org/openmrs/dictionary/concept.htm?conceptId=165285

Could this be what your looking for: https://github.com/openmrs/openmrs-module-webservices.rest/blob/master/omod-1.9/src/test/java/org/openmrs/module/webservices/rest/web/v1_0/resource/openmrs1_9/ObsResource1_9Test.java

https://www.hl7.org/fhir/valueset-observation-interpretation.html

https://github.com/AMPATH/ampath-esm-patient-chart-widgets
https://github.com/AMPATH/ampath-esm-angular-form-entry

https://github.com/openmrs/openmrs-owa-labworkflow/blob/b9ffd52d2d01ac5d83073f4b8fca637f938c3924/app/js/actions/labOrdersAction.js#L40
"obs/?patient=${patientUuid}&concept=${conceptUuid}&v=custom:(id,uuid,display,obsDatetime,value:(id,uuid,display,name:(uuid,name)),encounter:(id,uuid,encounterDatetime,obs:(uuid,display,value)))"
