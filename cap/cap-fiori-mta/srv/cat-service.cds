using my.bookshop as my from '../db/data-model';

@requires: 'authenticated-user'
service CatalogService {
    @readonly entity Books as projection on my.Books;
}

// New UI annotations
annotate CatalogService.Books with @(
    UI : { 
        SelectionFields  : [
            title
        ],
        LineItem  : [
            { Value : ID },
            { Value : title }, 
            { Value : stock }                                   
        ],
     }
){
    ID @( title: 'ID' );    
    title @( title: 'Title' );
    stock @( title: 'Stock' );
};