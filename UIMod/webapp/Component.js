sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"BenefitClaim/ZBenefitClaim/model/models",
	"BenefitClaim/ZBenefitClaim/utils/Idle",
	"sap/m/MessageBox"
], function (UIComponent, Device, models, Idle, MessageBox) {
	"use strict";

	return UIComponent.extend("BenefitClaim.ZBenefitClaim.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function () {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);
			// enable routing
			// set the device model
			var deviceModel = new sap.ui.model.json.JSONModel({
				isDesktop: sap.ui.Device.system.desktop,
				isPhone: sap.ui.Device.system.phone
			});
			deviceModel.setDefaultBindingMode("OneWay");
			this.setModel(deviceModel, "device");
			// set the FLP model
			// this.setModel(models.createFLPModel(), "FLP");
			var sErrorMsg,
				oDeviceModel = new sap.ui.model.json.JSONModel({
					width: "120px",
					height: "35px",
					isBusy: true,
					AmountWRC: []
				});
			this.setModel(oDeviceModel, "ViewData");
			oDeviceModel.setSizeLimit(5000);
			sap.ui.core.BusyIndicator.show();

			$.ajax({
				url: "/BenefietCAP/claim/userValidation(USERID='')",
				type: "GET",
				method: "GET",
				crossDomain: true,
				success: function (data, oResponse) {
					var oData = JSON.parse(data.value);
					if (oData) {
						sap.ui.core.BusyIndicator.hide();
						this.getRouter().initialize();
						this.getModel("ViewData").setProperty("/EmpID", oData.USERID);
						this.getModel("ViewData").setProperty("/LoginID", oData.USERID);
						this.getModel("ViewData").setProperty("/ADMIN", oData.ADMIN);
						this.getModel("ViewData").setProperty("/MANAGER", oData.MANAGER);
						this.getModel("ViewData").setProperty("/CLAIM_COORD", oData.CLAIM_COORD);
						this.setModel(new sap.ui.model.json.JSONModel(oData), "oEmpData");
						this._fnRoleDef(oData);
						if (oData.CLAIM_COORD === "X") {
							this._fnCoordin(oData.USERID);
						}
					} else {
						sap.ui.core.BusyIndicator.hide();
						sErrorMsg = "User Data Not Found";
						this.getModel("ViewData").setProperty("/PageNotFoundMsgText", sErrorMsg);
						this.getRouter().getTargets().display("notFound");
					}
				}.bind(this),
				error: function (response) {
					try {
						sErrorMsg = JSON.parse(response.responseText).error.message;
					} catch (e) {
						sErrorMsg = response.responseText;
					}
					sap.ui.core.BusyIndicator.hide();
					this.getModel("ViewData").setProperty("/PageNotFoundMsgText", sErrorMsg);
					this.getRouter().getTargets().display("notFound");
				}.bind(this)
			});

			$(document).idle({
				onIdle: function () {
					MessageBox.warning("Session got timeout, Continue?", {
						actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
						emphasizedAction: MessageBox.Action.OK,
						onClose: function (sAction) {
							if (sAction === "OK") {
								window.location.reload();
							} else {
								window.location = "/do/logout";
							}
						}
					});
				},
				idle: 600000,
				// idle: 9000,
				keepTracking: true
			});

		},

		_fnRoleDef: function (odata) {
			var oCont = odata.adminList,
				oJson = {};
			if (oCont.length > 0) {
				for (var i = 0; i < oCont.length; i++) {
					oJson[oCont[i].ADMIN] = oCont[i].APPROVAL;
				}
			}
			this.setModel(new sap.ui.model.json.JSONModel(oJson), "oRoleDetails");
		},

		_fnCoordin: function (oEmp) {
			$.ajax({
				url: "/BenefietCAP/claim/CLAIM_COORDINATOR?$filter=COORDINATOR eq '" + oEmp + "'",
				type: "GET",
				method: "GET",
				crossDomain: true,
				success: function (data, oResponse) {
					var oData = data.value[0];
					if (oData) {
						this.getModel("ViewData").setProperty("/oVisReport", oData.REPORT);
						this.getModel("ViewData").setProperty("/oVisSubmit", oData.SUBMIT);
					}
				}.bind(this),
				error: function (response) {

				}.bind(this)
			});
		}

	});
});