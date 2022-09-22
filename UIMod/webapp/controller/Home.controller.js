sap.ui.define([
	"BenefitClaim/ZBenefitClaim/controller/BaseController",
	"sap/ui/core/mvc/Controller",
	"../model/formatter"
], function (BaseController, Controller, formatter) {
	"use strict";
	return BaseController.extend("BenefitClaim.ZBenefitClaim.controller.Home", {
		formatter: formatter,
		navToDetailPage: function (oEvent, sTargetPage, tilename) {
			var sTarget = sTargetPage + "RouteName";
			this.getView().getModel("ViewData").setProperty("/oTile", tilename);
			this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this._oRouter.navTo(sTarget);
		},

		onNext: function (oEvent, key) {
			this.getView().getModel("ViewData").setProperty("/ClaimType", "PAY_UP");
			this.getView().getModel("ViewData").setProperty("/oTile", "Admin");
			this.getView().getModel("ViewData").setProperty("/oAdminHis", key);
			this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this._oRouter.navTo("ClaimFormRouteName", {
				Claim: this.getView().getModel("ViewData").getProperty("/ClaimType")
			});
		}

	});

});