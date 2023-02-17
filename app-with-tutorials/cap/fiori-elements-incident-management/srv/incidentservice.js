const cds = require("@sap/cds");

/**
 * Enumeration values for FieldControlType
 * @see https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/Common.md#FieldControlType
 */
const FieldControl = {
    Mandatory: 7,
    Optional: 3,
    ReadOnly: 1,
    Inapplicable: 0,
  };
  
module.exports = cds.service.impl(async function (srv) {
    const {
        Incidents,
        BusinessPartner,
        Individual,
        BusinessPartnerAddress
    } = srv.entities

    //read/edit event hook after read  of entity 'Incidents'
    srv.after(["READ", "EDIT"], "Incidents", setTechnicalFlags);
    srv.after("READ", "Incidents", setPriorityCriticality);
    srv.before("SAVE", "Incidents", validateincident);

    /**
     * Set technical flags, used
     for controlling UI behaviour, on the 'Incidents'
     entity
     *
     * @param Incidents {
         Incidents | Incidents[]
     }(Array of ) Incidents
     */
    function setTechnicalFlags(Incidents) {

        function _setFlags(incident) {
            incident.isDraft = !incident.IsActiveEntity;
            // field control on the 'identifier' property
            if (incident.IsActiveEntity) {
                incident.identifierFieldControl = FieldControl.Optional;
            } else if (incident.HasActiveEntity) {
                incident.identifierFieldControl = FieldControl.ReadOnly;
            } else {
                incident.identifierFieldControl = FieldControl.Mandatory;
            }
        }

        if (Array.isArray(Incidents)) {
            Incidents.forEach(_setFlags);
        } else {
            _setFlags(Incidents);
        }
    };

    /**
     * Set priority criticality used for display in LR table
     *
     * @param Incidents {
         Incidents | Incidents[]
     }(Array of ) Incidents
     */
    function setPriorityCriticality(Incidents) {

        function _setCriticality(incident) {
            if (incident.priority) {
                incident.priority.criticality = parseInt(incident.priority.code);
            }
        }

        if (Array.isArray(Incidents)) {
            Incidents.forEach(_setCriticality);
        } else {
            _setCriticality(Incidents);
        }
    }

    /**
     * Validate a 'incident'
     entry
     *
     * @param req   Request
     */
    function validateincident(req) {
        // check mandatory properties
        if (!req.data.identifier) {
            req.error(400, "Enter an Incident Identifier", "in/identifier");
        }
    }
})
