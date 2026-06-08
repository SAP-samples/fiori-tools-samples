sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'sap/fe/demo/incidents/test/integration/FirstJourney',
		'sap/fe/demo/incidents/test/integration/pages/IncidentsList',
		'sap/fe/demo/incidents/test/integration/pages/IncidentsObjectPage'
    ],
    function(JourneyRunner, opaJourney, IncidentsList, IncidentsObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('sap/fe/demo/incidents') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheIncidentsList: IncidentsList,
					onTheIncidentsObjectPage: IncidentsObjectPage
                }
            },
            opaJourney.run
        );
    }
);