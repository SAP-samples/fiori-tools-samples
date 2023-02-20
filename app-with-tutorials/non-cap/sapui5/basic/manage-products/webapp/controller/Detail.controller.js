sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
  ],
  
  function (Controller, MessageBox, MessageToast) {
        "use strict";
  
        return Controller.extend("sap.btp.sapui5.controller.Detail", {
            onInit: function () {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.getRoute("detail").attachMatched(this._onRouteMatched, this);
            },
            _onRouteMatched: function (oEvent) {
                var oArgs, oView;
                oArgs = oEvent.getParameter("arguments");
                oView = this.getView();
                oView.bindElement({
                    path: "/Products(" + oArgs.productId + ")",
                    events: {
                        dataRequested: function () {
                            oView.setBusy(true);
                        },
                        dataReceived: function () {
                            oView.setBusy(false);
                        }
                    }
                });
            },
            handleNavButtonPress: function (evt) {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("home");
            },

            handleOrder: function (evt) {
                // show confirmation dialog
                var bundle = this.getView().getModel("i18n").getResourceBundle();
                MessageBox.confirm(
                    bundle.getText("OrderDialogMsg"),
                    function (oAction) {
                        if (MessageBox.Action.OK === oAction) {
                            // notify user
                            var successMsg = bundle.getText("OrderDialogSuccessMsg");
                            MessageToast.show(successMsg);
                            // TODO call proper service method and update model (not part of this tutorial)
                        }
                    },
                    bundle.getText("OrderDialogTitle")
                );
            }
        });
    });
  