sap.ui.define([
	"BenefitClaim/ZBenefitClaim/controller/BaseController",
	"sap/m/MessageToast",
	"sap/ui/core/Fragment",
	"sap/ui/model/json/JSONModel",
	"../utils/Validator",
	"sap/ui/model/Sorter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"../model/formatter"
], function (BaseController, MessageToast, Fragment, JSONModel, Validator, Sorter, Filter, FilterOperator, formatter) {
	"use strict";

	return BaseController.extend("BenefitClaim.ZBenefitClaim.controller.Table", {
		formatter: formatter,
		onInit: function () {
			this.getOwnerComponent().getRouter().getRoute("TableRouteName").attachPatternMatched(this.objectMatched, this);
			this.oViewData = this.getOwnerComponent().getModel("ViewData");
			this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
		},

		onAfterRendering: function () {
			if (this.oViewData.getProperty("/oTile") === undefined) {
				this._oRouter.navTo("home");
			}
		},

		objectMatched: function () {
			if (this.getModel("oEmpData").getProperty("/COMPANY") !== "MOHHSCH") {
				this._fnValueTable();
				this._fnEmpJob();
			}
		},

		_fnValueTable: function () {
			this.getView().setBusy(true);
			$.ajax({
				method: "GET",
				url: "/BenefietCAP/claim/DropDowns()",
				dataType: "json",
				success: function (data) {
					var oData = JSON.parse(data.value);
					this.getView().setModel(new JSONModel(oData), "ComboDetails");
					this._fnFilterDepDiv();
					this.getView().setBusy(false);
				}.bind(this),
				error: function (response) {
					this.getView().setBusy(false);
					this.handleErrorDialog(response);
				}.bind(this)
			});

			$.ajax({
				method: "GET",
				url: "/BenefietCAP/claim/Benefit_Entitlement_Adjust",
				dataType: "json",
				success: function (data) {
					var oModel = this._getSizeLimit(data.value);
					this.getView().setModel(oModel, "oEntitAdjus");
					this.getView().setBusy(false);
				}.bind(this),
				error: function (response) {
					this.getView().setBusy(false);
					this.handleErrorDialog(response);
				}.bind(this)
			});

			$.ajax({
				method: "GET",
				url: "/BenefietCAP/claim/WRC_CLAIM_TYPE",
				dataType: "json",
				success: function (data) {
					var oModel = this._getSizeLimit(data.value);
					this.getView().setModel(oModel, "oWRCamnt");
					this.getView().setBusy(false);
				}.bind(this),
				error: function (response) {
					this.getView().setBusy(false);
					this.handleErrorDialog(response);
				}.bind(this)
			});

			$.ajax({
				method: "GET",
				url: "/BenefietCAP/claim/VEHICLE_RATE",
				dataType: "json",
				success: function (data) {
					var oModel = this._getSizeLimit(data.value);
					this.getView().setModel(oModel, "oTransAmnt");
					this.getView().setBusy(false);
				}.bind(this),
				error: function (response) {
					this.getView().setBusy(false);
					this.handleErrorDialog(response);
				}.bind(this)
			});

			$.ajax({
				method: "GET",
				url: "/BenefietCAP/claim/claimPostingCutoff",
				dataType: "json",
				success: function (data) {
					var oModel = this._getSizeLimit(data.value);
					this.getView().setModel(oModel, "oPostCutoff");
					this.getView().setBusy(false);
				}.bind(this),
				error: function (response) {
					this.getView().setBusy(false);
					this.handleErrorDialog(response);
				}.bind(this)
			});
		},

		onChangeComb: function (oEvent) {
			var key, url;
			if (oEvent === "A") {
				key = "RO";
			} else {
				key = oEvent.getSource().getSelectedKey();
			}
			if (key === "RO") {
				url = "/BenefietCAP/claim/Location_RO?$top=100000";
				this._fnGetCall(url, "oLocationRO");
			}
		},

		onChangeSCH: function (oEvent) {
			var url,
				key = this.oViewData.getProperty("/oTbnameSCH");

			if (key === "GC") {
				url = "/BenefietCAP/claim/GL_MAPPING?$top=100000";
				this._fnGetCall(url, "oScholar");
			} else if (key === "VEND") {
				url = "/BenefietCAP/claim/VENDOR?$top=100000";
				this._fnGetCall(url, "oScholar");
			} else {
				url = "/BenefietCAP/claim/CURRENCY?$top=100000";
				this._fnGetCall(url, "oScholar");
			}
		},

		onSortingTable: function (oEvent) {
			var binding = oEvent.getSource().getBinding("items"),
				oSorter = new sap.ui.model.Sorter({
					path: "COMPANY",
					descending: false
				});
			binding.sort(oSorter);
		},

		updatingLoc: function (oEvent) {
			oEvent.getSource().setBusy(false);
		},

		onAddValueTable: function () {
			var oTableVal = this.oViewData.getProperty("/oTbname");
			this.oViewData.setProperty("/DMode", true);
			this.oViewData.setProperty("/TMode", "Submit");
			// if (!this._oCreateValue) {
			this._oCreateValue = Fragment.load({
				id: this.createId("dlgNewValue"),
				name: "BenefitClaim.ZBenefitClaim.fragments.AddValueTable",
				controller: this
			}).then(function (oDialog) {
				this._oCreateValue = oDialog;
				this.getView().addDependent(this._oCreateValue);
				this._oCreateValue.setModel(new JSONModel({}), "oValueTable");
				if (oTableVal === "WRC" || oTableVal === "RO" || oTableVal === "LOC" || oTableVal === "TRAN") {
					this.loadDatePicker(this._oCreateValue.getModel("oValueTable"), "create", "START_DATE", "oValueTable", "datePicker1");
					this.loadDatePicker(this._oCreateValue.getModel("oValueTable"), "create", "END_DATE", "oValueTable", "datePicker2");
				}
				if (oTableVal === "ADMIN") {
					this.loadDatePicker(this._oCreateValue.getModel("oValueTable"), "create", "Start_Date", "oValueTable", "datePicker1");
					this.loadDatePicker(this._oCreateValue.getModel("oValueTable"), "create", "End_Date", "oValueTable", "datePicker2");
				}
				if (oTableVal === "CUT") {
					this.loadDatePicker(this._oCreateValue.getModel("oValueTable"), "create", "payrollPeriod", "oValueTable", "datePickerp1");
					this.loadDatePicker(this._oCreateValue.getModel("oValueTable"), "create", "claimFinalApprovalDateFrom", "oValueTable",
						"datePickerp2");
					this.loadDatePicker(this._oCreateValue.getModel("oValueTable"), "create", "claimFinalApprovalDateTo", "oValueTable",
						"datePickerp3");
					this.loadDatePicker(this._oCreateValue.getModel("oValueTable"), "create", "estimatePaymentDate", "oValueTable", "datePickerp4");
					this.loadDatePicker(this._oCreateValue.getModel("oValueTable"), "create", "postingCutoffDate", "oValueTable", "datePickerp5");
					this.loadDatePicker(this._oCreateValue.getModel("oValueTable"), "create", "replicationRestart", "oValueTable", "datePickerp6");
				}
				this._oCreateValue.open();
			}.bind(this));

			/*} else {
				Validator.resetValidStates(this, "dlgNewValue", this._oCreateValue);
				this._oCreateValue.setModel(new JSONModel({}), "oValueTable");
				if (oTableVal === "WRC" || oTableVal === "RO" || oTableVal === "LOC" || oTableVal === "TRAN") {
					this.loadDatePicker(this._oCreateValue.getModel("oValueTable"), "create", "START_DATE", "oValueTable", "datePicker1");
					this.loadDatePicker(this._oCreateValue.getModel("oValueTable"), "create", "END_DATE", "oValueTable", "datePicker2");
				}
				if (oTableVal === "ADMIN") {
					this.loadDatePicker(this._oCreateValue.getModel("oValueTable"), "create", "Start_Date", "oValueTable", "datePicker1");
					this.loadDatePicker(this._oCreateValue.getModel("oValueTable"), "create", "End_Date", "oValueTable", "datePicker2");
				}
				if (oTableVal === "CUT") {
					this.loadDatePicker(this._oCreateValue.getModel("oValueTable"), "create", "payrollPeriod", "oValueTable", "datePickerp1");
					this.loadDatePicker(this._oCreateValue.getModel("oValueTable"), "create", "claimFinalApprovalDateFrom", "oValueTable",
						"datePickerp2");
					this.loadDatePicker(this._oCreateValue.getModel("oValueTable"), "create", "claimFinalApprovalDateTo", "oValueTable",
						"datePickerp3");
					this.loadDatePicker(this._oCreateValue.getModel("oValueTable"), "create", "estimatePaymentDate", "oValueTable", "datePickerp4");
					this.loadDatePicker(this._oCreateValue.getModel("oValueTable"), "create", "postingCutoffDate", "oValueTable", "datePickerp5");
					this.loadDatePicker(this._oCreateValue.getModel("oValueTable"), "create", "replicationRestart", "oValueTable", "datePickerp6");
				}
				this._oCreateValue.open();
			}*/
		},

		onAddValue: function () {
			if (Validator.ValidateForm(this, "dlgNewValue", this._oCreateValue)) {
				return;
			}
			Validator.resetValidStates(this, "dlgNewValue", this._oCreateValue);
			var oStrtdate, oEnddate, oTableVal = this.oViewData.getProperty("/oTbname"),
				oPayLoad = this._oCreateValue.getModel("oValueTable").getData();
			this._fnTableName(oPayLoad);
			if (oTableVal === "WRC" || oTableVal === "RO" || oTableVal === "LOC" || oTableVal === "TRAN") {
				oStrtdate = oPayLoad.START_DATE;
				oEnddate = oPayLoad.END_DATE;
			}
			if (oTableVal === "ADMIN") {
				oStrtdate = oPayLoad.Start_Date;
				oEnddate = oPayLoad.End_Date;
			}
			if (oTableVal === "ADMIN" || oTableVal === "WRC" || oTableVal === "RO" || oTableVal === "LOC" || oTableVal === "TRAN") {
				if (!oStrtdate || !oEnddate) {
					this._fnShowErrorMessage("Please select date");
					return;
				}
				if ((oStrtdate < new Date().toISOString().substring(0, 10)) && oTableVal !== "LOC") {
					this._fnShowErrorMessage("Start date should be future date");
					return;
				}
				if ((oEnddate < new Date().toISOString().substring(0, 10)) && oTableVal !== "LOC") {
					this._fnShowErrorMessage("End date should be future date");
					return;
				}
				if (oStrtdate > oEnddate) {
					this._fnShowErrorMessage("End date should be greater than start date");
					return;
				}
			}
			if (oTableVal === "CUT") {
				if (!oPayLoad.payrollPeriod || !oPayLoad.claimFinalApprovalDateFrom || !oPayLoad.claimFinalApprovalDateTo || !oPayLoad.estimatePaymentDate ||
					!oPayLoad.postingCutoffDate || !oPayLoad.replicationRestart) {
					this._fnShowErrorMessage("Please select date");
					return;
				}
			}
			if (oTableVal === "WRC") {
				var oLen = this.getModel("oWRCamnt").getData().length + 1;
				oPayLoad.WRC_CLAIM_TYPE_ID = oLen.toString();
			}
			$.ajax({
				url: this.oViewData.getProperty("/oTablePostURL"),
				data: JSON.stringify(oPayLoad),
				method: "POST",
				crossDomain: true,
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json"
				},
				success: function (response) {
					if (this.oViewData.getProperty("/oTbname") === "RO") {
						this.onChangeComb("A");
					} else {
						this._fnValueTable();
					}
					this.onCloseValueTable();
					this.handleSuccessDialog("Data has been saved");
					this.getView().getModel("ComboDetails").refresh(true);
				}.bind(this),
				error: function (response) {
					this.handleErrorDialog(response);
				}.bind(this)
			});
		},

		onEditValueTable: function (oEvent, model) {
			var oContext = oEvent.getSource().getBindingContext(model);
			var sPath = oContext.getPath().replace(/^\D+/g, ""),
				sIndex = parseInt(sPath, 0),
				oTableVal = this.oViewData.getProperty("/oTbname");
			this.oViewData.setProperty("/DMode", false);
			this.oViewData.setProperty("/eIndex", sIndex);
			this.oViewData.setProperty("/TMode", "Edit");

			this._oCreateValue = Fragment.load({
				id: this.createId("dlgNewValue"),
				name: "BenefitClaim.ZBenefitClaim.fragments.AddValueTable",
				controller: this
			}).then(function (oDialog) {
				this._oCreateValue = oDialog;
				this.getView().addDependent(this._oCreateValue);
				this._oCreateValue.setModel(new JSONModel(oContext.getObject()), "oValueTable");
				if (oTableVal === "CUT") {
					this.loadDatePicker(this._oCreateValue.getModel("oValueTable"), "edit", "claimFinalApprovalDateFrom", "oValueTable",
						"datePickerp2");
					this.loadDatePicker(this._oCreateValue.getModel("oValueTable"), "edit", "claimFinalApprovalDateTo", "oValueTable",
						"datePickerp3");
					this.loadDatePicker(this._oCreateValue.getModel("oValueTable"), "edit", "estimatePaymentDate", "oValueTable", "datePickerp4");
					this.loadDatePicker(this._oCreateValue.getModel("oValueTable"), "edit", "postingCutoffDate", "oValueTable", "datePickerp5");
					this.loadDatePicker(this._oCreateValue.getModel("oValueTable"), "edit", "replicationRestart", "oValueTable", "datePickerp6");
				}
				this._oCreateValue.open();
			}.bind(this));

		},

		onUpdateTable: function () {
			if (Validator.ValidateForm(this, "dlgNewValue", this._oCreateValue)) {
				return;
			}
			Validator.resetValidStates(this, "dlgNewValue", this._oCreateValue);

			var oPayLoad = this._oCreateValue.getModel("oValueTable").getData();
			this._fnTableName(oPayLoad);
			$.ajax({
				url: this.oViewData.getProperty("/oTableURL"),
				data: JSON.stringify(oPayLoad),
				method: "PUT",
				crossDomain: true,
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json"
				},
				success: function (response) {
					this._fnValueTable();
					this.onCloseValueTable();
					this.handleSuccessDialog("Data has been saved");
				}.bind(this),
				error: function (response) {
					this.handleErrorDialog(response);
				}.bind(this)
			});
		},

		onCopyValueTable: function (oEvent) {
			var oContext;
			if (this.oViewData.getProperty("/oTbname") === "RO") {
				oContext = oEvent.getSource().getBindingContext("oLocationRO");
			} else if (this.oViewData.getProperty("/oTbname") === "EA") {
				oContext = oEvent.getSource().getBindingContext("oEntitAdjus");
			} else {
				oContext = oEvent.getSource().getBindingContext("ComboDetails");
			}
			var sPath = oContext.getPath().replace(/^\D+/g, ""),
				sIndex = parseInt(sPath, 0);
			this.oViewData.setProperty("/DMode", false);
			this.oViewData.setProperty("/eIndex", sIndex);
			this.oViewData.setProperty("/TMode", "Copy");

			if (!this._oCreateValue) {
				Fragment.load({
					id: this.createId("dlgNewValue"),
					name: "BenefitClaim.ZBenefitClaim.fragments.AddValueTable",
					controller: this
				}).then(function (oDialog) {
					this._oCreateValue = oDialog;
					this.getView().addDependent(this._oCreateValue);
					this._oCreateValue.setModel(new JSONModel(oContext.getObject()), "oValueTable");
					this._oCreateValue.open();
				}.bind(this));
			} else {
				this._oCreateValue.setModel(new JSONModel(oContext.getObject()), "oValueTable");
				this._oCreateValue.open();
			}

		},

		onDeleteValueTable: function (oEvent, id, name, model) {

			var oTableKey = this.oViewData.getProperty("/oTbname"),
				oTable = this.getView().byId(id),
				// oData = oTable.getModel(model).getData(),
				selectedItems = oTable.getSelectedItems(),
				payLoad = [],
				oTableName;
			if (selectedItems.length === 0) {
				sap.m.MessageToast.show("Please select a row to delete");
			} else {
				for (var j = 0; j < selectedItems.length; j++) {
					var jdx = selectedItems[j].getBindingContext(model).getObject();
					payLoad.push(jdx);
					/*if (model === "ComboDetails") {
						payLoad.push(jdx.name);
					} else {
						payLoad.push(jdx);
					}*/
				}

				if (oTableKey === "CLMCD") {
					oTableName = "CLAIM_CODE";
				} else if (oTableKey === "CLMCG") {
					oTableName = "CLAIM_CATEGORY";
				} else if (oTableKey === "CLCCC") {
					oTableName = "COMPANY_CLAIM_CATEGORY";
				} else if (oTableKey === "ADMIN") {
					oTableName = "CLAIM_ADMIN";
				} else if (oTableKey === "CLI") {
					oTableName = "CLAIM_CLINIC";
				} else if (oTableKey === "EA") {
					oTableName = "Benefit_Entitlement_Adjust"; //
				} else if (oTableKey === "WRC") {
					oTableName = "WRC_CLAIM_TYPE";
				} else if (oTableKey === "RO") {
					oTableName = "Location_RO";
				} else if (oTableKey === "TRAN") {
					oTableName = "Benefit_Transport_Amount"; //
				} else if (oTableKey === "LOC") {
					oTableName = "BEN_LOCATION";
				} else if (oTableKey === "CUT") {
					oTableName = "claimPostingCutoff"; //
				} else {
					this._fnShowErrorMessage("Table name parameter missing.");
				}
				var oValue = {
					"deleteItems": JSON.stringify(payLoad),
					"table_Name": oTableName
				};

				this.getView().setBusy(true);
				$.ajax({
					url: "/BenefietCAP/claim/deleteGeneral",
					data: JSON.stringify(oValue),
					crossDomain: true,
					headers: {
						"Accept": "application/json",
						"Content-Type": "application/json"
					},
					method: "POST",
					success: function (data, oResponse) {
						if (this.oViewData.getProperty("/oTbname") === "RO") {
							this.onChangeComb("A");
						} else {
							this._fnValueTable();
						}
						this.handleSuccessDialog("Selected record(s) deleted.");
						this.getView().setBusy(false);
					}.bind(this),
					error: function (xhr, ajaxOptions, throwError) {
						this.getView().setBusy(false);
						this.handleErrorDialog(xhr);
					}.bind(this)
				});
				oTable.getModel("ComboDetails").refresh(true);
				oTable.removeSelections(true);
			}

		},

		onScholarOpen: function () {
			this.oViewData.setProperty("/TMode", "Submit");
			this.oViewData.setProperty("/DMode", true);
			this._oSchDialog = Fragment.load({
				id: this.createId("dlgoScholar"),
				name: "BenefitClaim.ZBenefitClaim.fragments.AddScholar",
				controller: this
			}).then(function (oDialog) {
				this._oSchDialog = oDialog;
				this.getView().addDependent(this._oSchDialog);
				this._oSchDialog.setModel(new JSONModel({}), "oScholar");
				this.loadDatePicker(this._oSchDialog.getModel("oScholar"), "create", "START_DATE", "oScholar", "datePicker1");
				this.loadDatePicker(this._oSchDialog.getModel("oScholar"), "create", "END_DATE", "oScholar", "datePicker2");
				this._oSchDialog.open();
			}.bind(this));
		},

		onEditSch: function (oEvent) {
			this._fnDlgBtnTxtSave("Update Details");
			var oContext = oEvent.getSource().getBindingContext("oScholar"),
				sPath = oContext.getPath().replace(/^\D+/g, ""),
				sIndex = parseInt(sPath, 0);
			this.oViewData.setProperty("/eIndex", sIndex);
			this.oViewData.setProperty("/TMode", "Edit");
			this.oViewData.setProperty("/DMode", false);
			this._oSchDialog = Fragment.load({
				id: this.createId("dlgoScholar"),
				name: "BenefitClaim.ZBenefitClaim.fragments.AddScholar",
				controller: this
			}).then(function (oDialog) {
				this._oSchDialog = oDialog;
				this.getView().addDependent(this._oSchDialog);
				var oData = this.getView().getModel("oScholar").getData();
				this.oInvst = $.extend(true, {}, oData);
				this._oSchDialog.setModel(new JSONModel(oContext.getObject()), "oScholar");
				this._oSchDialog.open();
			}.bind(this));

		},

		onCloseSch: function () {
			this._oSchDialog.close();
			this._oSchDialog.destroyContent();
			this._oSchDialog = undefined;
		},

		onAddScholar: function () {
			var oData = this._oSchDialog.getModel("oScholar").getData(),
				oMode = this.oViewData.getProperty("/TMode"),
				oCont = this.getView().getModel("oScholar").getData();
			if (oMode === "Submit") {
				this.oInvst = oCont;
			}
			if (Validator.ValidateForm(this, "dlgoScholar", this._oSchDialog)) {
				return;
			}
			Validator.resetValidStates(this, "dlgoScholar", this._oSchDialog);
			/*if (oCont.length > 0) {
				if (this._fnDupDeleg(oData)) {
					return;
				}
			}*/

			if (!oData.START_DATE || !oData.END_DATE) {
				this._fnShowErrorMessage("Please select date");
				return;
			}
			if (oData.STARTDATE < new Date().toISOString().substring(0, 10) && oMode === "Submit") {
				this._fnShowErrorMessage("Start date should be future date");
				return;
			}
			if (oData.ENDDATE < new Date().toISOString().substring(0, 10)) {
				this._fnShowErrorMessage("End date should be future date");
				return;
			}
			if (oData.STARTDATE > oData.ENDDATE) {
				this._fnShowErrorMessage("End date should be greater than start date");
				return;
			}
			if (oMode === "Submit") {
				var oURL = this._fnAddSchUrl();
				this.getView().setBusy(true);
				$.ajax({
					url: oURL,
					data: JSON.stringify(oData),
					method: "POST",
					headers: {
						"Accept": "application/json",
						"Content-Type": "application/json"
					},
					crossDomain: true,
					success: function (data, oResponse) {
						this.onChangeSCH();
						this.onCloseSch();
						this.getView().setBusy(false);
						this.handleSuccessDialog("Data has been saved");
					}.bind(this),
					error: function (response) {
						this.getView().setBusy(false);
						this.handleErrorDialog(response);
					}.bind(this)
				});
			} else {
				var sURL = this._fnEditSchUrl(oData);
				this.getView().setBusy(true);
				$.ajax({
					url: sURL,
					data: JSON.stringify(oData),
					method: "PUT",
					crossDomain: true,
					headers: {
						"Accept": "application/json",
						"Content-Type": "application/json"
					},
					success: function (data, oResponse) {
						this.onChangeSCH();
						this.onCloseSch();
						this.handleSuccessDialog("Data has been saved");
						this.getView().setBusy(false);
					}.bind(this),
					error: function (response) {
						this.getView().setBusy(false);
						this.handleErrorDialog(response);
					}.bind(this)
				});
			}
			this.oViewData.setProperty("/DMode", true);
		},

		onDeleteSch: function (oEvent, id, model) {
			this._fnAddSchUrl();
			var oTable = this.getView().byId(id),
				selectedItems = oTable.getSelectedItems(),
				oTableName = this.oViewData.getProperty("/oScholarTable"),
				payLoad = [];
			if (selectedItems.length === 0) {
				sap.m.MessageToast.show("Please select a row to delete");
			} else {
				for (var j = 0; j < selectedItems.length; j++) {
					var jdx = selectedItems[j].getBindingContext(model).getObject();
					payLoad.push(jdx);
				}

				var oValue = {
					"deleteItems": JSON.stringify(payLoad),
					"table_Name": oTableName
				};
				this.getView().setBusy(true);
				$.ajax({
					url: "/BenefietCAP/claim/deleteGeneral",
					data: JSON.stringify(oValue),
					method: "POST",
					crossDomain: true,
					headers: {
						"Accept": "application/json",
						"Content-Type": "application/json"
					},
					success: function (data, oResponse) {
						this.onChangeSCH();
						this.handleSuccessDialog("Selected record(s) has been deleted");
						this.getView().setBusy(false);
					}.bind(this),
					error: function (response) {
						this.getView().setBusy(false);
						this.handleErrorDialog(response);
					}.bind(this)
				});
			}
		},

		_fnAddSchUrl: function () {
			var oURL, oKey = this.oViewData.getProperty("/oTbnameSCH");
			if (oKey === "GC") {
				oURL = "/BenefietCAP/claim/GL_MAPPING";
				this.oViewData.setProperty("/oScholarTable", "GL_MAPPING");
			} else if (oKey === "VEND") {
				oURL = "/BenefietCAP/claim/VENDOR";
				this.oViewData.setProperty("/oScholarTable", "VENDOR");
			} else {
				oURL = "/BenefietCAP/claim/CURRENCY";
				this.oViewData.setProperty("/oScholarTable", "CURRENCY");
			}
			return oURL;
		},

		_fnEditSchUrl: function (oData) {
			var oURL, oKey = this.oViewData.getProperty("/oTbnameSCH");
			if (oKey === "GC") {
				oURL = "/BenefietCAP/claim/GL_MAPPING(START_DATE=" + oData.START_DATE + ",END_DATE=" +
					oData.END_DATE + ",GL_ACC='" + oData.GL_ACC + "')";
			} else if (oKey === "VEND") {
				oURL = "/BenefietCAP/claim/VENDOR(START_DATE=" + oData.START_DATE + ",END_DATE=" +
					oData.END_DATE + ",VENDOR_CODE='" + oData.VENDOR_CODE + "')";
			} else {
				oURL = "/BenefietCAP/claim/CURRENCY(START_DATE=" + oData.START_DATE + ",END_DATE=" +
					oData.END_DATE + ",CURRENCY='" + oData.CURRENCY + "')";
			}
			return oURL;
		},

		_fnTableName: function (oPayLoad) {
			var oTable = this.oViewData.getProperty("/oTbname"),
				url, posturl;
			if (oTable === "CLMCD") {
				url = "/BenefietCAP/claim/Claim_Code(Company='" + oPayLoad.Company + "',Claim_code='" + oPayLoad.Claim_code + "')";
				posturl = "/BenefietCAP/claim/Claim_Code";
				this.oViewData.setProperty("/oTableURL", url);
				this.oViewData.setProperty("/oTablePostURL", posturl);
			} else if (oTable === "CLMCG") {
				url = "/BenefietCAP/claim/Claim_Category(Company='" + oPayLoad.Company + "',Category_Code='" + oPayLoad.Category_Code + "')";
				posturl = "/BenefietCAP/claim/Claim_Category";
				this.oViewData.setProperty("/oTableURL", url);
				this.oViewData.setProperty("/oTablePostURL", posturl);
			} else if (oTable === "DEP") {
				url = "/BenefietCAP/claim/Claim_Department(Company='" + oPayLoad.Company + "',Department_Code='" + oPayLoad.Department_Code +
					"')";
				posturl = "/BenefietCAP/claim/Claim_Department";
				this.oViewData.setProperty("/oTableURL", url);
				this.oViewData.setProperty("/oTablePostURL", posturl);
			} else if (oTable === "DIV") {
				url = "/BenefietCAP/claim/Claim_Division(Company='" + oPayLoad.Company + "',Division_Code='" + oPayLoad.Division_Code + "')";
				posturl = "/BenefietCAP/claim/Claim_Division";
				this.oViewData.setProperty("/oTableURL", url);
				this.oViewData.setProperty("/oTablePostURL", posturl);
			} else if (oTable === "CLI") {
				url = "/BenefietCAP/claim/Claim_Clinic(Company='" + oPayLoad.Company + "',Clinic_Code='" + oPayLoad.Clinic_Code + "')";
				posturl = "/BenefietCAP/claim/Claim_Clinic";
				this.oViewData.setProperty("/oTableURL", url);
				this.oViewData.setProperty("/oTablePostURL", posturl);
			} else if (oTable === "SPL") {
				url = "/BenefietCAP/claim/Claim_Specialisation(Company='" + oPayLoad.Company + "',Sponsor_Code='" + oPayLoad.Special_Code + "')";
				posturl = "/BenefietCAP/claim/Claim_Specialisation";
				this.oViewData.setProperty("/oTableURL", url);
				this.oViewData.setProperty("/oTablePostURL", posturl);
			} else if (oTable === "SI") {
				url = "/BenefietCAP/claim/Claim_Sponsor(Company='" + oPayLoad.Company + "',Sponsor_Code='" + oPayLoad.Sponsor_Code + "')";
				posturl = "/BenefietCAP/claim/Claim_Sponsor";
				this.oViewData.setProperty("/oTableURL", url);
				this.oViewData.setProperty("/oTablePostURL", posturl);
			} else if (oTable === "ADMIN") {
				url = "/BenefietCAP/claim/Claim_Admin(Claim_Code='" + oPayLoad.Claim_Code + "')";
				posturl = "/BenefietCAP/claim/Claim_Admin";
				this.oViewData.setProperty("/oTableURL", url);
				this.oViewData.setProperty("/oTablePostURL", posturl);
			} else if (oTable === "RO") {
				url = "/BenefietCAP/claim/Location_RO(DEPARTMENT='" + oPayLoad.DEPARTMENT + "',DIVISION='" + oPayLoad.DIVISION +
					"',Location_RO_EmployeeID='" + oPayLoad.Location_RO_EmployeeID + "')";
				posturl = "/BenefietCAP/claim/Location_RO";
				this.oViewData.setProperty("/oTableURL", url);
				this.oViewData.setProperty("/oTablePostURL", posturl);
			} else if (oTable === "EA") {
				url = "/BenefietCAP/claim/Benefit_Entitlement_Adjust(emp_Id='" + oPayLoad.emp_Id + "',Year='" + oPayLoad.Year + "',Claim_code='" +
					oPayLoad.Claim_code + "')";
				posturl = "/BenefietCAP/claim/Benefit_Entitlement_Adjust";
				this.oViewData.setProperty("/oTableURL", url);
				this.oViewData.setProperty("/oTablePostURL", posturl);
			} else if (oTable === "WRC") {
				url = "/BenefietCAP/claim/WRC_CLAIM_TYPE(WRC_CLAIM_TYPE_ID='" + oPayLoad.WRC_CLAIM_TYPE_ID + "')";
				posturl = "/BenefietCAP/claim/WRC_CLAIM_TYPE";
				this.oViewData.setProperty("/oTableURL", url);
				this.oViewData.setProperty("/oTablePostURL", posturl);
			} else if (oTable === "TRAN") {
				url = "/BenefietCAP/claim/VEHICLE_RATE(START_DATE=" + oPayLoad.START_DATE + ",END_DATE=" + oPayLoad.END_DATE +
					",TRANSPORT_TYPE='" + oPayLoad.TRANSPORT_TYPE + "')";
				posturl = "/BenefietCAP/claim/VEHICLE_RATE";
				this.oViewData.setProperty("/oTableURL", url);
				this.oViewData.setProperty("/oTablePostURL", posturl);
			} else if (oTable === "CUT") {
				url = "/BenefietCAP/sfservice/claimPostingCutoff(company='" + oPayLoad.company + "',payrollPeriod=" + oPayLoad.payrollPeriod +
					")";
				posturl = "/BenefietCAP/sfservice/claimPostingCutoff";
				this.oViewData.setProperty("/oTableURL", url);
				this.oViewData.setProperty("/oTablePostURL", posturl);
			} else if (oTable === "LOC") {
				url = "/BenefietCAP/claim/BEN_LOCATION(START_DATE=" + oPayLoad.START_DATE + ",END_DATE=" + oPayLoad.END_DATE +
					",LOCATION='" + oPayLoad.LOCATION + "')";
				posturl = "/BenefietCAP/claim/BEN_LOCATION";
				this.oViewData.setProperty("/oTableURL", url);
				this.oViewData.setProperty("/oTablePostURL", posturl);
			}
		},

		onCloseValueTable: function () {
			this._oCreateValue.close();
			this._oCreateValue.destroyContent();
			this._oCreateValue = undefined;
		},

		onClaimTypeOpen: function (key) {
			var oData = this.getView().getModel("ComboDetails").getData(),
				oCompany = this.getView().getModel("oEmpData").getProperty("/COMPANY"),
				oClaimType = [];
			this.oViewData.setProperty("/oTableAdminClaim", key);
			if (key === "WRC") {
				$.each(oData.COMPANY_CLAIM_CATEGORY, function (idx, obj) {
					if (obj.Category_Code === "WRC" && obj.Company === oCompany) {
						oClaimType.push(obj);
					}
				});
			} else {
				$.each(oData.COMPANY_CLAIM_CATEGORY, function (idx, obj) {
					if (obj.Company === oCompany) {
						oClaimType.push(obj);
					}
				});
			}
			if (!this.byId("dlgClaimCategoryFil")) {
				Fragment.load({
					id: this.getView().getId(),
					controller: this,
					name: "BenefitClaim.ZBenefitClaim.fragments.ClaimCategoryFil"
				}).then(function (oDialog) {
					this.getView().addDependent(oDialog);
					oDialog.setModel(new JSONModel(oClaimType), "oClaimTypes");
					oDialog.open();
				}.bind(this));
			} else {
				this.byId("dlgClaimCategoryFil").setModel(new JSONModel(oClaimType), "oClaimTypes");
				this.byId("dlgClaimCategoryFil").open();
			}
		},

		onSortAscending: function (oEvent, id, value) {
			var table = this.getView().byId(id);
			var oItems = table.getBinding("items");
			var oSorter = new Sorter(value);
			oItems.sort(oSorter);
		},

		onSortDescending: function (oEvent, id, value) {
			var table = this.getView().byId(id);
			var oItems = table.getBinding("items");
			var oSorter = new Sorter(value, true);
			oItems.sort(oSorter);
		},

		onSearchTM: function (oEvent, id, key) {
			var oFilter = "",
				table = this.getView().byId(id),
				oBinding = table.getBinding("items"),
				sValue = oEvent.getSource().getValue();
			if (sValue !== "") {
				oFilter = new Filter(key, FilterOperator.Contains, sValue);
			} else {
				oFilter = "";
			}
			oBinding.filter([oFilter]);
		},

		onDownload: function (model, key) {
			var data;
			if (key) {
				data = this.getView().getModel(model).getData();
				this.JSONToCSVConvertor(data, "Data", true);
			} else {
				data = this.getView().getModel("ComboDetails").getData()[model];
				this.JSONToCSVConvertor(data, model, true);
			}
		}

	});

});