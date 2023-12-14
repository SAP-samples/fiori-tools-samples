sap.ui.define(
  ["sap/ui/core/mvc/Controller", "xml-js"],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller, xmljs) {
    "use strict";
    const xml =
      '<?xml version="1.0" encoding="utf-8"?>' +
      '<note importance="high" logged="true">' +
      "    <title>Happy</title>" +
      "    <todo>Work</todo>" +
      "    <todo>Play</todo>" +
      "</note>";

    const xmlToJson = JSON.parse(
      xmljs.xml2json(xml, {
        compact: true,
        spaces: 4,
      })
    );
    console.log(`>>>> xmlToJson ${JSON.stringify(xmlToJson)}`);

    return Controller.extend("ztest.docapp1.ztravel.controller.View1", {
      onInit: function () {},
    });
  }
);
