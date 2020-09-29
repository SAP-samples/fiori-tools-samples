sap.ui.define(["sap/ovp/cards/generic/Component", "jquery.sap.global"],
 
    function (CardComponent, jQuery) {
        "use strict";
 
        return CardComponent.extend("sap.teched.teched-ovp.ext.timeline.Component", {
            // use inline declaration instead of component.json to save 1 round trip
            metadata: {
                properties: {
                    "contentFragment": {
                        "type": "string",
                        "defaultValue": "sap.teched.teched-ovp.ext.timeline.Timeline"
                    },
                    "controllerName": {
                        "type": "string",
                        "defaultValue": "sap.teched.teched-ovp.ext.timeline.Timeline"
                    }
                },
 
                version: "${version}",
 
                library: "sap.ovp",
 
                includes: [],
 
                dependencies: {
                    libs: [],
                    components: []
                },
                config: {}
            }
        });
    }
);