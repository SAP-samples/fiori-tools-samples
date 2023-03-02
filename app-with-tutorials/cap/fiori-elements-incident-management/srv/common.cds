namespace scp.cloud;
using IncidentService as service from './incidentservice';

using {
    cuid
} from '@sap/cds/common';

annotate cuid with {
    ID @(
        title : '{i18n>ID}',
        UI.HiddenFilter,
        Core.Computed
    );
}

annotate service.Incidents with {
    ID @UI.Hidden: true;
    assignedIndividual @UI.Hidden : true;
    identifier @(Common.FieldControl: identifierFieldControl);
};

annotate service.Incidents with {
    incidentStatus @Common : {
        Text            : incidentStatus.name,
        TextArrangement : #TextOnly,
        ValueListWithFixedValues
    };
  category @Common : {
        Text            : category.name,
        TextArrangement : #TextOnly,
        //insert your value list here
                ValueList       : {
            $Type          : 'Common.ValueListType',
            Label          : 'Category',
            CollectionPath : 'Category',
            Parameters     : [
            {
                $Type             : 'Common.ValueListParameterInOut',
                LocalDataProperty : category_code,
                ValueListProperty : 'code'
            },
            {
                $Type             : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'descr'
            }
            ]
        }       
    };  
  priority @Common : {
        Text            : priority.name,
        TextArrangement : #TextOnly,
        ValueListWithFixedValues
    };
};

annotate service.Category with {
    code @Common : {
        Text            : name,
        TextArrangement : #TextOnly
    }    @title :  'Category'
};

annotate service.Priority with {
    code @Common : {
        Text            : name,
        TextArrangement : #TextOnly
    }    @title :  'Priority'
};

annotate service.IncidentStatus with {
    code @Common : {
        Text            : name,
        TextArrangement : #TextOnly
    }    @title :  'Incident Status'
};

annotate service.Individual with @(Communication.Contact : {
    fn   : fullName,
    kind   : #individual,
    email  : [{
        address : emailAddress,
        type    : #work
    }]
});