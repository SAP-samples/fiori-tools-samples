//the UI5_184 view controller pair has to be used for UI5 version >= 1.84
sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/fe/core/controllerextensions/RoutingListener',
	'sap/ui/model/json/JSONModel',
	'sap/m/MessageToast'
],
function (Controller, RoutingListener, JSONModel, MessageToast) {
	"use strict";

	return Controller.extend("myController", {
				routingListener: RoutingListener,

		constructor: function () {
			Controller.apply(this, arguments);
			// No need to instantiate the extension, it's done automatically
		},

		onInit: function () {
			var oView = this.getView();
			this.oProcessFlow1 = oView.byId("processflow1");

			var sDataPath = jQuery.sap.getModulePath("sap.fe.demo.incidents.ext.controller", "/ProcessFlowLanesAndNodes.json");
			var oModelPf1 = new JSONModel(sDataPath);
			oView.setModel(oModelPf1, "ProcessFlowModel");
			oModelPf1.attachRequestCompleted(this.oProcessFlow1.updateModel.bind(this.oProcessFlow1));
		},

		onNodePress: function (event) {
			MessageToast.show("Node " + event.getParameters().getNodeId() + " has been clicked.");
		}
	});
});