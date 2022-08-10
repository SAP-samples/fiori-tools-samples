sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'salesorder/test/integration/pages/MainListReport' ,
        'salesorder/test/integration/pages/MainObjectPage',
        'salesorder/test/integration/OpaJourney'
    ],
    function(JourneyRunner, MainListReport, MainObjectPage, Journey) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('salesorder') + '/index.html'
        });

        JourneyRunner.run(
            {
                pages: { onTheMainPage: MainListReport, onTheDetailPage: MainObjectPage }
            },
            Journey.run
        );
    }
);