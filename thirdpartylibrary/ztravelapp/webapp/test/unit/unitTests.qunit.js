/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"ztestdocapp1/ztravel/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
