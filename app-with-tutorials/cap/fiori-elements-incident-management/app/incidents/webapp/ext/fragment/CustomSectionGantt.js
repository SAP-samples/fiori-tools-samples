sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/gantt/misc/Format"
], function (Controller, JSONModel, Format) {
	"use strict";

	return {
		fnTimeConverter: function (sTimestamp) {
			return Format.abapTimestampToDate(sTimestamp);
		}
	};
});