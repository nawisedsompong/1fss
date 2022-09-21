sap.ui.define([
	"BenefitClaim/ZBenefitClaim/controller/BaseController",
	"sap/m/MessageToast",
	"sap/ui/core/Fragment",
	"sap/ui/model/json/JSONModel",
	"../utils/Validator",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"../model/formatter"
], function (BaseController, MessageToast, Fragment, JSONModel, Validator, Filter, FilterOperator, formatter) {
	"use strict";

	return BaseController.extend("BenefitClaim.ZBenefitClaim.controller.Admin", {
		formatter: formatter,
		onInit: function () {
			this.getOwnerComponent().getRouter().getRoute("AdminRouteName").attachPatternMatched(this.objectMatched, this);
			this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oViewData = this.getOwnerComponent().getModel("ViewData");
		},

		onAfterRendering: function () {
			if (this.oViewData.getProperty("/oTile") === undefined) {
				this._oRouter.navTo("home");
			}
		},

		objectMatched: function () {
			this._fnDropdowns();
			this._fnEmpJob();
			this._fnGetTableData();
		},

		_fnGetTableData: function () {
			var oTile = this.oViewData.getProperty("/oTile");
			this._getBusyIndicator().show();
			if (oTile === "Info") {
				this.getView().byId("search_benefit").setValue();
				$.ajax({
					method: "GET",
					url: "/BenefietCAP/claim/Benefit_Claim_Admin",
					dataType: "json",
					success: function (response) {
						var oModel = this._getSizeLimit(response.value);
						this.oViewData.setProperty("/infoLength", response.value.length);
						this.getView().setModel(oModel, "ClaimDetails");
						this._getBusyIndicator().hide();
					}.bind(this),
					error: function (response) {
						this._getBusyIndicator().hide();
						this.handleErrorDialog(response);
					}.bind(this)
				});
			}
			if (oTile === "Elig") {
				this.getView().byId("search_elig").setValue();
				$.ajax({
					method: "GET",
					url: "/BenefietCAP/claim/Benefit_Eligibility",
					dataType: "json",
					success: function (response) {
						var oModel = this._getSizeLimit(response.value);
						this.oViewData.setProperty("/eligibLength", response.value.length);
						this.getView().setModel(oModel, "oEligibileData");
						this._getBusyIndicator().hide();
					}.bind(this),
					error: function (response) {
						this._getBusyIndicator().hide();
						this.handleErrorDialog(response);
					}.bind(this)
				});
			}
			if (oTile === "Copay") {
				this.getView().byId("search_copay").setValue();
				$.ajax({
					method: "GET",
					url: "/BenefietCAP/claim/Co_Payment",
					dataType: "json",
					success: function (response) {
						var oModel = this._getSizeLimit(response.value);
						this.oViewData.setProperty("/copayLength", response.value.length);
						this.getView().setModel(oModel, "oCopayData");
						this._getBusyIndicator().hide();
					}.bind(this),
					error: function (response) {
						this._getBusyIndicator().hide();
						this.handleErrorDialog(response);
					}.bind(this)
				});
			}
			if (oTile === "Approval" || oTile === "HRMC") {
				this.getView().byId("search_approval").setValue();
				var oURL = oTile === "HRMC" ? "&$expand=HR_maker,HR_checker" : "";
				$.ajax({
					method: "GET",
					url: "/BenefietCAP/claim/approval_structure_hr?$top=100000" + oURL,
					dataType: "json",
					success: function (response) {
						var oModel = this._getSizeLimit(response.value);
						this.oViewData.setProperty("/apprLength", response.value.length);
						this.getView().setModel(oModel, "oApprovalData");
						this._getBusyIndicator().hide();
					}.bind(this),
					error: function (response) {
						this._getBusyIndicator().hide();
						this.handleErrorDialog(response);
					}.bind(this)
				});
			}

			if (oTile === "Coord") {
				this.getView().byId("search_coord").setValue();
				$.ajax({
					method: "GET",
					url: "/BenefietCAP/claim/CLAIM_COORDINATOR",
					dataType: "json",
					success: function (response) {
						var oModel = this._getSizeLimit(response.value);
						this.oViewData.setProperty("/coordLength", response.value.length);
						this.getView().setModel(oModel, "oCoordinData");
						this._getBusyIndicator().hide();
					}.bind(this),
					error: function (response) {
						this._getBusyIndicator().hide();
						this.handleErrorDialog(response);
					}.bind(this)
				});
			}
			if (oTile === "Role") {
				$.ajax({
					method: "GET",
					url: "/BenefietCAP/claim/ADMIN_ROLE",
					dataType: "json",
					success: function (response) {
						var oModel = this._getSizeLimit(response.value);
						this.getView().setModel(oModel, "oRoleData");
						this._getBusyIndicator().hide();
					}.bind(this),
					error: function (response) {
						this._getBusyIndicator().hide();
						this.handleErrorDialog(response);
					}.bind(this)
				});
			}
		},

		_fnAddAll: function () {
			var oData = this.getView().getModel("ComboDetails").getData();
			oData.PERSONAL_AREA.push({
				"Personal_Area": "ALL",
				"Personal_Desc": "ALL"
			});
			oData.PERSONAL_SUB_AREA.push({
				"Personal_Sub_Area": "ALL",
				"Personal_Sub_Desc": "ALL",
				"Company": "MOHH"
			});
			oData.SPECIALISATION.push({
				"Special_Code": "ALL",
				"Special_Desc": "ALL",
				"Company": "MOHH"
			});
			this.getView().getModel("ComboDetails").refresh(true);
		},

		onSearchAdmin: function (oEvent, id, prop) {
			var table = this.getView().byId(id),
				oBinding = table.getBinding("items"),
				oFilter = "",
				sValue = oEvent.getSource().getValue();
			if (sValue) {
				var oFilter1 = new Filter("Claim_Code", FilterOperator.EQ, sValue),
					oFilter2 = new Filter("Entitlement_Type", FilterOperator.EQ, sValue),
					oFilter3 = new Filter("Pay_Grade", FilterOperator.EQ, sValue),
					oFilter4 = new Filter("Description", FilterOperator.Contains, sValue),
					oFilter5 = new Filter("Clinic_Desc", FilterOperator.Contains, sValue),
					oFilter6 = new Filter("Claim_Category", FilterOperator.Contains, sValue),
					oFilter7 = new Filter("Claim_Type", FilterOperator.Contains, sValue),
					oFilter8 = new Filter("Period_Number", FilterOperator.EQ, sValue),
					oFilter9 = new Filter("Period_Units", FilterOperator.EQ, sValue),
					oFilter10 = new Filter("Clinic", FilterOperator.Contains, sValue);
				oFilter = new Filter([oFilter1, oFilter2, oFilter3, oFilter4, oFilter5, oFilter6, oFilter7, oFilter8, oFilter9, oFilter10], false);
			} else {
				oFilter = [];
			}
			oBinding.filter(oFilter);
			this.oViewData.setProperty("/" + prop, oBinding.iLength);
		},

		onSearchElig: function (oEvent, id, prop) {
			var table = this.getView().byId(id),
				oBinding = table.getBinding("items"),
				oFilter = "",
				sValue = oEvent.getSource().getValue();
			if (sValue) {
				var oFilter1 = new Filter("Employee_Class", FilterOperator.EQ, sValue),
					oFilter2 = new Filter("Personal_Area", FilterOperator.EQ, sValue),
					oFilter3 = new Filter("Pay_Grade", FilterOperator.EQ, sValue),
					oFilter4 = new Filter("Description", FilterOperator.Contains, sValue),
					oFilter5 = new Filter("Personal_Sub_Area", FilterOperator.EQ, sValue),
					oFilter6 = new Filter("Document_Type", FilterOperator.EQ, sValue),
					oFilter7 = new Filter("Specialisation", FilterOperator.EQ, sValue),
					oFilter8 = new Filter("Entitlement", FilterOperator.EQ, sValue);
				oFilter = new Filter([oFilter1, oFilter2, oFilter3, oFilter4, oFilter5, oFilter6, oFilter7, oFilter8], false);
			} else {
				oFilter = [];
			}
			oBinding.filter(oFilter, true);
			this.oViewData.setProperty("/" + prop, oBinding.iLength);
		},

		onSearchAppr: function (oEvent, id, prop) {
			var table = this.getView().byId(id),
				oBinding = table.getBinding("items"),
				oFilter = "",
				sValue = oEvent.getSource().getValue();
			if (sValue !== "") {
				var oFilter2 = new Filter("Personal_Area", FilterOperator.EQ, sValue),
					oFilter3 = new Filter("Pay_Grade", FilterOperator.EQ, sValue),
					oFilter4 = new Filter("Description", FilterOperator.Contains, sValue),
					oFilter5 = new Filter("Personal_Sub_Area", FilterOperator.EQ, sValue),
					oFilter6 = new Filter("First_Level_Approver", FilterOperator.Contains, sValue),
					oFilter7 = new Filter("Second_Level_Approver", FilterOperator.Contains, sValue),
					oFilter8 = new Filter("Third_Level_Approver", FilterOperator.Contains, sValue),
					oFilter9 = new Filter("Fourth_Level_Approver", FilterOperator.Contains, sValue);
				oFilter = new Filter([oFilter2, oFilter3, oFilter4, oFilter5, oFilter6, oFilter7, oFilter8, oFilter9], false);
			} else {
				oFilter = [];
			}
			oBinding.filter(oFilter);
			this.oViewData.setProperty("/" + prop, oBinding.iLength);
		},

		onSearchCoord: function (oEvent, id, prop) {
			var table = this.getView().byId(id),
				oBinding = table.getBinding("items"),
				oFilter = "",
				sValue = oEvent.getSource().getValue();
			if (sValue !== "") {
				var oFilter1 = new Filter("EMPLOYEE_ID", FilterOperator.Contains, sValue),
					oFilter2 = new Filter("EMP_FNAME", FilterOperator.Contains, sValue),
					oFilter3 = new Filter("COORDINATOR", FilterOperator.Contains, sValue),
					oFilter4 = new Filter("COORD_FNAME", FilterOperator.Contains, sValue),
					oFilter5 = new Filter("PERSONAL_SUBAREA", FilterOperator.Contains, sValue),
					oFilter6 = new Filter("PAY_GRADE", FilterOperator.Contains, sValue),
					oFilter7 = new Filter("EMPLOYEE_DEPARTMENT", FilterOperator.Contains, sValue),
					oFilter8 = new Filter("EMPLOYEE_DIVISION", FilterOperator.Contains, sValue);
				oFilter = new Filter([oFilter1, oFilter2, oFilter3, oFilter4, oFilter5, oFilter6, oFilter7, oFilter8], false);
			} else {
				oFilter = [];
			}
			oBinding.filter(oFilter);
			this.oViewData.setProperty("/" + prop, oBinding.iLength);
		},

		onChangeCompany: function (oEvent) {
			var oClaimCodeData = [],
				oClaimCatData = [],
				oPayCompData = [],
				oKey = "",
				oJson = this.getView().getModel("ComboDetails").getData();
			if (oEvent) {
				oKey = oEvent.getSource().getSelectedKey();
			} else {
				oKey = this.oViewData.getProperty("/eCompany");
			}
			// filter claim code
			$.each(oJson.CLAIM_CODE, function (idx, obj) {
				if (obj.Company === oKey) {
					oClaimCodeData.push(obj);
				}
			});
			// filter claim category
			$.each(oJson.CLAIM_CATEGORY, function (idx, obj) {
				if (obj.Company === oKey) {
					oClaimCatData.push(obj);
				}
			});
			// filter Pay Component
			$.each(oJson.PAY_COMPONENT, function (idx, obj) {
				if (obj.Company === oKey) {
					oPayCompData.push(obj);
				}
			});
			this.getView().setModel(new JSONModel(oClaimCodeData), "oClaimCode");
			this.getView().setModel(new JSONModel(oClaimCatData), "oClaimCat");
			this.getView().setModel(new JSONModel(oPayCompData), "oPayComp");
		},

		onChangeClaim: function (oEvent, company) {
			var key = oEvent.getSource().getSelectedKey(),
				oJson = this.getView().getModel("ComboDetails").getData(),
				oClaimCatg = [];
			$.each(oJson.COMPANY_CLAIM_CATEGORY, function (idx, obj) {
				if (obj.Category_Code === key && obj.Company === company) {
					oClaimCatg.push(obj);
				}
			});
			this.getView().setModel(new JSONModel(oClaimCatg), "oClaimCatg");
		},

		onChangBg: function (oEvent) {
			var oStartDate = this._getFragmentTextPos("dlgBenefit", "dpStartDate"),
				oEndDate = this._getFragmentTextPos("dlgBenefit", "dpEndDate");
			this._fnvalidStartDate(oStartDate, oEndDate, oEvent);
		},

		onChangEd: function (oEvent) {
			var oStartDate = this._getFragmentTextPos("dlgBenefit", "dpStartDate"),
				oEndDate = this._getFragmentTextPos("dlgBenefit", "dpEndDate");
			this._fnvalidEndDate(oStartDate, oEndDate, oEvent);
		},

		onCreateBenefit: function () {
			this._fnDlgBtnTxtAdd("Benefit Plan");
			this.oViewData.setProperty("/TMode", "Submit");
			this.oViewData.setProperty("/DMode", true);
			if (!this._oCreateBenefitDialog) {
				this._oCreateBenefitDialog = Fragment.load({
					id: this.createId("dlgBenefit"),
					name: "BenefitClaim.ZBenefitClaim.view.Subview.BenefitPlan",
					controller: this
				}).then(function (oDialog) {
					this._oCreateBenefitDialog = oDialog;
					this.getView().addDependent(this._oCreateBenefitDialog);
					this._oCreateBenefitDialog.setModel(new JSONModel({
						"Start_Date": this._getCurrentDate(),
						"End_Date": "9999-12-31",
						"Company": ""
					}), "oClaimData");
					this.loadDatePicker(this._oCreateBenefitDialog.getModel("oClaimData"), "create", "Start_Date", "oClaimData", "datePicker1");
					this.loadDatePicker(this._oCreateBenefitDialog.getModel("oClaimData"), "create", "End_Date", "oClaimData", "datePicker2");
					this._oCreateBenefitDialog.open();
				}.bind(this));
			}
		},

		onCancelBenefit: function () {
			this._oCreateBenefitDialog.close();
			this._oCreateBenefitDialog.destroy();
			this._oCreateBenefitDialog = undefined;
		},

		onAddBenefit: function () {
			if (Validator.ValidateForm(this, "dlgBenefit", this._oCreateBenefitDialog)) {
				return;
			}
			Validator.resetValidStates(this, "dlgBenefit", this._oCreateBenefitDialog);
			var oData = this._oCreateBenefitDialog.getModel("oClaimData").getData(),
				oMode = this.oViewData.getProperty("/TMode");
			if (!oData.Start_Date || !oData.End_Date) {
				this._fnShowErrorMessage("Please select date");
				return;
			}
			if (oData.Start_Date < new Date().toISOString().substring(0, 10) && oMode === "Submit") {
				this._fnShowErrorMessage("Start date should be future date");
				return;
			}
			if (oData.End_Date < new Date().toISOString().substring(0, 10) && oMode === "Submit") {
				this._fnShowErrorMessage("End date should be future date");
				return;
			}
			if (oData.Start_Date > oData.End_Date) {
				this._fnShowErrorMessage("End date should be greater than start date");
				return;
			}
			if (oMode === "Submit") {
				this.getView().setBusy(true);
				$.ajax({
					url: "/BenefietCAP/claim/Benefit_Claim_Admin",
					data: JSON.stringify(oData),
					method: "POST",
					headers: {
						"Accept": "application/json",
						"Content-Type": "application/json"
					},
					crossDomain: true,
					success: function (data, oResponse) {
						this._fnGetTableData();
						this.onCancelBenefit();
						this.handleSuccessDialog("Data has been saved");
						this.getView().setBusy(false);
					}.bind(this),
					error: function (response) {
						this.getView().setBusy(false);
						this.handleErrorDialog(response);
					}.bind(this)
				});
			} else {
				var oURL = "/BenefietCAP/claim/Benefit_Claim_Admin(Start_Date=" + oData.Start_Date + ",End_Date=" + oData.End_Date +
					",Company='" + oData.Company + "',Claim_Code='" + oData.Claim_Code + "',Claim_Category='" + oData.Claim_Category + "')";
				this.getView().setBusy(true);
				$.ajax({
					url: oURL,
					data: JSON.stringify(oData),
					method: "PUT",
					crossDomain: true,
					headers: {
						"Accept": "application/json",
						"Content-Type": "application/json"
					},
					success: function (data, oResponse) {
						this._fnGetTableData();
						this.onCancelBenefit();
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

		onEditBenefit: function (oEvent) {
			this._fnDlgBtnTxtSave("Benefit Plan");
			var oContext = oEvent.getSource().getBindingContext("ClaimDetails"),
				sPath = oContext.getPath().replace(/^\D+/g, ""),
				sIndex = parseInt(sPath, 0);
			this.oViewData.setProperty("/DMode", true);
			this.oViewData.setProperty("/eIndex", sIndex);
			this.oViewData.setProperty("/TMode", "Edit");
			this.oViewData.setProperty("/eCompany", oContext.getObject().Company);
			this.onChangeCompany();
			if (!this._oCreateBenefitDialog) {
				Fragment.load({
					name: "BenefitClaim.ZBenefitClaim.view.Subview.BenefitPlan",
					controller: this
				}).then(function (oDialog) {
					this._oCreateBenefitDialog = oDialog;
					this.getView().addDependent(this._oCreateBenefitDialog);
					this._oCreateBenefitDialog.setModel(new JSONModel(oContext.getObject()), "oClaimData");
					this._oCreateBenefitDialog.open();
				}.bind(this));
			}
		},

		onSubDetail: function (oEvent) {
			var oContext = oEvent.getSource().getBindingContext("ClaimDetails");
			this.oViewData.setProperty("/DMode", false);
			this.oViewData.setProperty("/eCompany", oContext.getObject().Company);
			this.onChangeCompany();
			if (!this._oCreateBenefitDialog) {
				Fragment.load({
					name: "BenefitClaim.ZBenefitClaim.view.Subview.BenefitPlan",
					controller: this
				}).then(function (oDialog) {
					this._oCreateBenefitDialog = oDialog;
					this.getView().addDependent(this._oCreateBenefitDialog);
					this._oCreateBenefitDialog.setModel(new JSONModel(oContext.getObject()), "oClaimData");
					this._oCreateBenefitDialog.open();
				}.bind(this));

			} else {
				this._oCreateBenefitDialog.setModel(new JSONModel(oContext.getObject()), "oClaimData");
				this._oCreateBenefitDialog.open();
			}
		},

		onCopyBenefit: function (oEvent) {
			this._fnDlgBtnTxtCopy("Benefit Plan");
			var oContext = oEvent.getSource().getBindingContext("ClaimDetails"),
				sPath = oContext.getPath().replace(/^\D+/g, ""),
				sIndex = parseInt(sPath, 0);
			this.oViewData.setProperty("/DMode", true);
			this.oViewData.setProperty("/eIndex", sIndex);
			this.oViewData.setProperty("/TMode", "Submit");
			this.oViewData.setProperty("/eCompany", oContext.getObject().Company);
			this.onChangeCompany();
			if (!this._oCreateBenefitDialog) {
				Fragment.load({
					name: "BenefitClaim.ZBenefitClaim.view.Subview.BenefitPlan",
					controller: this
				}).then(function (oDialog) {
					this._oCreateBenefitDialog = oDialog;
					this.getView().addDependent(this._oCreateBenefitDialog);
					this._oCreateBenefitDialog.setModel(new JSONModel(oContext.getObject()), "oClaimData");
					this.loadDatePicker(this._oCreateBenefitDialog.getModel("oClaimData"), "edit", "Start_Date", "oClaimData", "datePicker1");
					this.loadDatePicker(this._oCreateBenefitDialog.getModel("oClaimData"), "edit", "End_Date", "oClaimData", "datePicker2");
					this._oCreateBenefitDialog.open();
				}.bind(this));
			} else {
				this._oCreateBenefitDialog.setModel(new JSONModel(oContext.getObject()), "oClaimData");
				this.loadDatePicker(this._oCreateBenefitDialog.getModel("oClaimData"), "edit", "Start_Date", "oClaimData", "datePicker1");
				this.loadDatePicker(this._oCreateBenefitDialog.getModel("oClaimData"), "edit", "End_Date", "oClaimData", "datePicker2");
				this._oCreateBenefitDialog.open();
			}
		},

		onDeleteBenefit: function (oEvent) {
			var oTable = this.getView().byId("oTableBenefit"),
				oData = oTable.getModel("ClaimDetails").getData(),
				selectedItems = oTable.getSelectedItems(),
				payLoad = [];
			if (selectedItems.length === 0) {
				sap.m.MessageToast.show("Please select a row to delete");
			} else {
				for (var i = selectedItems.length - 1; i >= 0; i--) {
					var idx = oTable.indexOfItem(selectedItems[i]);
					payLoad.push(oData[idx]);
				}

				var oValue = {
					"deleteItems": JSON.stringify(payLoad),
					"table_Name": "Benefit_Claim_Admin"
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
						this._fnGetTableData();
						this.handleSuccessDialog("Selected record(s) has been deleted");
						this.getView().setBusy(false);
					}.bind(this),
					error: function (response) {
						this.getView().setBusy(false);
						this.handleErrorDialog(response);
					}.bind(this)
				});
				oTable.getModel("ClaimDetails").refresh(true);
				oTable.removeSelections(true);
			}
		},

		// claim coordinator

		onAddCoord: function () {
			this._fnDlgBtnTxtAdd("Coordinator Data");
			this.oViewData.setProperty("/TMode", "Submit");
			this.oViewData.setProperty("/DMode", true);
			if (!this._oCoordinDialog) {
				this._oCoordinDialog = Fragment.load({
					id: this.createId("dlgCoordin"),
					name: "BenefitClaim.ZBenefitClaim.fragments.AddCoordinator",
					controller: this
				}).then(function (oDialog) {
					this._oCoordinDialog = oDialog;
					this.getView().addDependent(this._oCoordinDialog);
					this._oCoordinDialog.setModel(new JSONModel({}), "oCoordinData");
					this.loadDatePicker(this._oCoordinDialog.getModel("oCoordinData"), "create", "STARTDATE", "oCoordinData", "datePicker1");
					this.loadDatePicker(this._oCoordinDialog.getModel("oCoordinData"), "create", "ENDDATE", "oCoordinData", "datePicker2");
					this._oCoordinDialog.open();
				}.bind(this));
			}
		},

		onAddCoordin: function () {
			if (Validator.ValidateForm(this, "dlgCoordin", this._oCoordinDialog)) {
				return;
			}
			Validator.resetValidStates(this, "dlgCoordin", this._oCoordinDialog);
			var oData = this._oCoordinDialog.getModel("oCoordinData").getData(),
				oMode = this.oViewData.getProperty("/TMode");
			if (!oData.STARTDATE || !oData.ENDDATE) {
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
			oData.EMPLOYEE_ID = oData.EMPLOYEE_ID ? oData.EMPLOYEE_ID : "N/A";
			oData.EMPLOYEE_DEPARTMENT = oData.EMPLOYEE_DEPARTMENT ? oData.EMPLOYEE_DEPARTMENT : "ALL";
			oData.EMPLOYEE_DIVISION = oData.EMPLOYEE_DIVISION ? oData.EMPLOYEE_DIVISION : "ALL";
			oData.PAY_GRADE = oData.PAY_GRADE ? oData.PAY_GRADE : "ALL";
			oData.SPECIALISATION = oData.SPECIALISATION ? oData.SPECIALISATION : "ALL";
			oData.SPONSOR_INSTITUTION = oData.SPONSOR_INSTITUTION ? oData.SPONSOR_INSTITUTION : "ALL";
			if (oMode === "Submit") {
				this.getView().setBusy(true);
				$.ajax({
					url: "/BenefietCAP/claim/CLAIM_COORDINATOR",
					data: JSON.stringify(oData),
					method: "POST",
					headers: {
						"Accept": "application/json",
						"Content-Type": "application/json"
					},
					crossDomain: true,
					success: function (data, oResponse) {
						this._fnGetTableData();
						this.onCloseCoordin();
						this.handleSuccessDialog("Data has been saved");
						this.getView().setBusy(false);
					}.bind(this),
					error: function (response) {
						this.getView().setBusy(false);
						this.handleErrorDialog(response);
					}.bind(this)
				});
			} else {
				var oURL = "/BenefietCAP/claim/CLAIM_COORDINATOR(ID=" + oData.ID + ")";
				this.getView().setBusy(true);
				$.ajax({
					url: oURL,
					data: JSON.stringify(oData),
					method: "PUT",
					crossDomain: true,
					headers: {
						"Accept": "application/json",
						"Content-Type": "application/json"
					},
					success: function (data, oResponse) {
						this._fnGetTableData();
						this.onCloseCoordin();
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

		onSubDetailCoord: function (oEvent) {
			var oContext = oEvent.getSource().getBindingContext("oCoordinData");
			this.oViewData.setProperty("/DMode", false);
			if (!this._oCoordinDialog) {
				Fragment.load({
					name: "BenefitClaim.ZBenefitClaim.fragments.AddCoordinator",
					controller: this
				}).then(function (oDialog) {
					this._oCoordinDialog = oDialog;
					this.getView().addDependent(this._oCoordinDialog);
					this._oCoordinDialog.setModel(new JSONModel(oContext.getObject()), "oCoordinData");
					this._oCoordinDialog.open();
				}.bind(this));
			} else {
				this._oCoordinDialog.setModel(new JSONModel(oContext.getObject()), "oCoordinData");
				this._oCoordinDialog.open();
			}
		},

		onEditCoord: function (oEvent) {
			this._fnDlgBtnTxtSave("Coordinator Data");
			var oContext = oEvent.getSource().getBindingContext("oCoordinData"),
				sPath = oContext.getPath().replace(/^\D+/g, ""),
				sIndex = parseInt(sPath, 0);
			this.oViewData.setProperty("/DMode", true);
			this.oViewData.setProperty("/eIndex", sIndex);
			this.oViewData.setProperty("/TMode", "Edit");
			if (!this._oCoordinDialog) {
				Fragment.load({
					name: "BenefitClaim.ZBenefitClaim.fragments.AddCoordinator",
					controller: this
				}).then(function (oDialog) {
					this._oCoordinDialog = oDialog;
					this.getView().addDependent(this._oCoordinDialog);
					this._oCoordinDialog.setModel(new JSONModel(oContext.getObject()), "oCoordinData");
					this.loadDatePicker(this._oCoordinDialog.getModel("oCoordinData"), "edit", "STARTDATE", "oCoordinData", "datePicker1");
					this.loadDatePicker(this._oCoordinDialog.getModel("oCoordinData"), "edit", "ENDDATE", "oCoordinData", "datePicker2");
					this._oCoordinDialog.open();
				}.bind(this));
			}
		},

		onDeleteCoord: function (oEvent) {
			var oTable = this.getView().byId("oTableCoord"),
				selectedItems = oTable.getSelectedItems(),
				payLoad = [];
			if (selectedItems.length === 0) {
				sap.m.MessageToast.show("Please select a row to delete");
			} else {
				for (var j = 0; j < selectedItems.length; j++) {
					var jdx = selectedItems[j].getBindingContext("oCoordinData").getObject();
					payLoad.push(jdx);
				}
				var oValue = {
					"deleteItems": JSON.stringify(payLoad),
					"table_Name": "CLAIM_COORDINATOR"
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
						this._fnGetTableData();
						this.handleSuccessDialog("Selected record(s) has been deleted");
						this.getView().setBusy(false);
					}.bind(this),
					error: function (response) {
						this.getView().setBusy(false);
						this.handleErrorDialog(response);
					}.bind(this)
				});
				oTable.getModel("oCoordinData").refresh(true);
				oTable.removeSelections(true);
			}
		},

		onCloseCoordin: function () {
			this._oCoordinDialog.close();
			this._oCoordinDialog.destroy();
			this._oCoordinDialog = undefined;
		},

		// Popup

		onBenefitOpenSeg: function (oEvent, model, key) {
			this.oViewData.setProperty("/model", model);
			this.oViewData.setProperty("/DepKey", key);
			var oJson = this.getView().getModel("oClaimCatg").getData(),
				oView = this.getView();
			this.eDialogClaim = Fragment.load({
				id: oView.getId(),
				controller: this,
				name: "BenefitClaim.ZBenefitClaim.fragments.Benefit"
			}).then(function (oDialog) {
				oView.addDependent(oDialog);
				oDialog.setModel(new JSONModel(oJson), "oClaimCatg");
				oDialog.open();
			});
		},

		onBenefitOpen: function (oEvent, model) {
			this.oViewData.setProperty("/model", model);
			var oJson = this.getView().getModel("ComboDetails").getData(),
				oCompany = this.getView().getModel("oEmpData").getProperty("/COMPANY"),
				oClaimCatg = [];
			$.each(oJson.CLAIM_CODE, function (idx, obj) {
				if (obj.Company === oCompany) {
					oClaimCatg.push(obj);
				}
			});
			var oView = this.getView();
			this.eDialogClaim = Fragment.load({
				id: oView.getId(),
				controller: this,
				name: "BenefitClaim.ZBenefitClaim.fragments.Benefit"
			}).then(function (oDialog) {
				oView.addDependent(oDialog);
				oDialog.setModel(new JSONModel(oClaimCatg), "oClaimCatg");
				oDialog.open();
			});
		},

		onSPOpen: function (oEvent, model) {
			this.oViewData.setProperty("/model", model);
			var oView = this.getView();
			if (!this.byId("dlgSPService")) {
				Fragment.load({
					id: oView.getId(),
					controller: this,
					name: "BenefitClaim.ZBenefitClaim.fragments.Specialisation"
				}).then(function (oDialog) {
					oView.addDependent(oDialog);
					oDialog.open();
				});
			} else {
				this.byId("dlgSPService").open();
			}
		},

		// Eligible Popup

		onAddEligible: function (oEvent) {
			this._fnDlgBtnTxtAdd("Eligibility Data");
			this.oViewData.setProperty("/TMode", "Submit");
			this.oViewData.setProperty("/DMode", true);
			if (!this._oEligibleDialog) {
				this._oEligibleDialog = Fragment.load({
					id: this.createId("dlgEligible"),
					name: "BenefitClaim.ZBenefitClaim.fragments.AddEligibility",
					controller: this
				}).then(function (oDialog) {
					this._oEligibleDialog = oDialog;
					this.getView().addDependent(this._oEligibleDialog);
					this._oEligibleDialog.setModel(new JSONModel({}), "oEligibileData");
					this.loadDatePicker(this._oEligibleDialog.getModel("oEligibileData"), "create", "Effective_Date", "oEligibileData",
						"datePicker1");
					this.loadDatePicker(this._oEligibleDialog.getModel("oEligibileData"), "create", "End_Date", "oEligibileData", "datePicker2");
					this._oEligibleDialog.open();
				}.bind(this));
			}
		},

		onCloseEligibility: function () {
			this._oEligibleDialog.close();
			this._oEligibleDialog.destroy();
			this._oEligibleDialog = undefined;
		},

		onAddEligibility: function () {
			if (Validator.ValidateForm(this, "dlgEligible", this._oEligibleDialog)) {
				return;
			}
			Validator.resetValidStates(this, "dlgEligible", this._oEligibleDialog);
			var oData = this._oEligibleDialog.getModel("oEligibileData").getData();
			var oMode = this.oViewData.getProperty("/TMode");
			oData.Entitlement = oData.Entitlement === "" ? null : oData.Entitlement;
			if (!oData.Effective_Date || !oData.End_Date) {
				this._fnShowErrorMessage("Please select date");
				return;
			}
			if (oData.Effective_Date < new Date().toISOString().substring(0, 10) && oMode === "Submit") {
				this._fnShowErrorMessage("Effective date should be future date");
				return;
			}
			if ((oData.Effective_Date > oData.End_Date) && oMode === "Submit") {
				this._fnShowErrorMessage("End date should be greater than effective date");
				return;
			}
			if (oMode === "Submit") {
				this.getView().setBusy(true);
				$.ajax({
					url: "/BenefietCAP/claim/Benefit_Eligibility",
					data: JSON.stringify(oData),
					method: "POST",
					crossDomain: true,
					headers: {
						"Accept": "application/json",
						"Content-Type": "application/json"
					},
					success: function (response) {
						this._fnGetTableData();
						this.onCloseEligibility();
						this.handleSuccessDialog("Data has been saved");
						this.getView().getModel("oEligibileData").refresh(true);
						this.getView().setBusy(false);
					}.bind(this),
					error: function (response) {
						this.getView().setBusy(false);
						this.handleErrorDialog(response);
					}.bind(this)
				});
			} else {
				var oURL = "/BenefietCAP/claim/Benefit_Eligibility(Sequence=" + oData.Sequence + ",Effective_Date=" + oData.Effective_Date +
					",End_Date=" + oData.End_Date + ",Claim_Code='" + oData.Claim_Code + "')";
				this.getView().setBusy(true);
				$.ajax({
					url: oURL,
					data: JSON.stringify(oData),
					method: "PUT",
					crossDomain: true,
					headers: {
						"Accept": "application/json",
						"Content-Type": "application/json"
					},
					success: function (data, oResponse) {
						this._fnGetTableData();
						this.onCloseEligibility();
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

		onEditEligible: function (oEvent) {
			this._fnDlgBtnTxtSave("Eligibility Data");
			var oContext = oEvent.getSource().getBindingContext("oEligibileData"),
				sPath = oContext.getPath().replace(/^\D+/g, ""),
				sIndex = parseInt(sPath, 0);
			this.oViewData.setProperty("/DMode", true);
			this.oViewData.setProperty("/eIndex", sIndex);
			this.oViewData.setProperty("/TMode", "Edit");
			if (!this._oEligibleDialog) {
				Fragment.load({
					name: "BenefitClaim.ZBenefitClaim.fragments.AddEligibility",
					controller: this
				}).then(function (oDialog) {
					this._oEligibleDialog = oDialog;
					this.getView().addDependent(this._oEligibleDialog);
					this._oEligibleDialog.setModel(new JSONModel(oContext.getObject()), "oEligibileData");
					this._oEligibleDialog.open();
				}.bind(this));
			}
		},

		onSubDetailEligible: function (oEvent) {
			var oContext = oEvent.getSource().getBindingContext("oEligibileData");
			this.oViewData.setProperty("/DMode", false);
			if (!this._oEligibleDialog) {
				Fragment.load({
					name: "BenefitClaim.ZBenefitClaim.fragments.AddEligibility",
					controller: this
				}).then(function (oDialog) {
					this._oEligibleDialog = oDialog;
					this.getView().addDependent(this._oEligibleDialog);
					this._oEligibleDialog.setModel(new JSONModel(oContext.getObject()), "oEligibileData");
					this._oEligibleDialog.open();
				}.bind(this));
			}
		},

		onCopyEligible: function (oEvent) {
			this._fnDlgBtnTxtCopy("Eligibility Data");
			var oContext = oEvent.getSource().getBindingContext("oEligibileData"),
				sPath = oContext.getPath().replace(/^\D+/g, ""),
				sIndex = parseInt(sPath, 0);
			this.oViewData.setProperty("/DMode", true);
			this.oViewData.setProperty("/eIndex", sIndex);
			this.oViewData.setProperty("/TMode", "Submit");
			if (!this._oEligibleDialog) {
				Fragment.load({
					name: "BenefitClaim.ZBenefitClaim.fragments.AddEligibility",
					controller: this
				}).then(function (oDialog) {
					this._oEligibleDialog = oDialog;
					this.getView().addDependent(this._oEligibleDialog);
					this._oEligibleDialog.setModel(new JSONModel(oContext.getObject()), "oEligibileData");
					this.loadDatePicker(this._oEligibleDialog.getModel("oEligibileData"), "edit", "Effective_Date", "oEligibileData", "datePicker1");
					this.loadDatePicker(this._oEligibleDialog.getModel("oEligibileData"), "edit", "End_Date", "oEligibileData", "datePicker2");
					//	this._fnFilterPayGrade(oContext.getProperty("BenefitsCode"));
					this._oEligibleDialog.open();
				}.bind(this));
			}
		},

		onDeleteEligible: function (oEvent) {
			var oTable = this.getView().byId("oTableEligibility"),
				oData = oTable.getModel("oEligibileData").getData(),
				selectedItems = oTable.getSelectedItems(),
				payLoad = [];
			if (selectedItems.length === 0) {
				sap.m.MessageToast.show("Please Select a row to Delete");
			} else {
				for (var i = selectedItems.length - 1; i >= 0; i--) {
					var idx = oTable.indexOfItem(selectedItems[i]);
					payLoad.push(oData[idx]);
				}
				var oValue = {
					"deleteItems": JSON.stringify(payLoad),
					"table_Name": "Benefit_Eligibility"
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
						this._fnGetTableData();
						this.handleSuccessDialog("Selected record(s) has been deleted");
						this.getView().setBusy(false);
					}.bind(this),
					error: function (xhr, ajaxOptions, throwError) {
						this.getView().setBusy(false);
						this.handleErrorDialog(xhr);
					}.bind(this)
				});
				oTable.getModel("oEligibileData").refresh(true);
				oTable.removeSelections(true);
			}
		},

		onBenfitClose: function (oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem"),
				oModel = this.oViewData.getProperty("/model"),
				oKey = this.oViewData.getProperty("/DepKey");
			if (oModel === "oClaimData") {
				if (oKey === "A") {
					this._oCreateBenefitDialog.getModel(oModel).setProperty("/Claim_Code", oSelectedItem.getTitle());
				} else {
					this._oCreateBenefitDialog.getModel(oModel).setProperty("/Dependent_Claim_Code", oSelectedItem.getTitle());
				}
			} else if (oModel === "oCoPayData") {
				this._oCopayDialog.getModel(oModel).setProperty("/Claim_Code", oSelectedItem.getTitle());
				this._oCopayDialog.getModel(oModel).setProperty("/Description", oSelectedItem.getDescription());
			} else if (oModel === "oApprovalData") {
				this._oApproverDialog.getModel(oModel).setProperty("/Claim_code", oSelectedItem.getTitle());
				this._oApproverDialog.getModel(oModel).setProperty("/Description", oSelectedItem.getDescription());
			} else {
				this._oEligibleDialog.getModel(oModel).setProperty("/Claim_Code", oSelectedItem.getTitle());
				this._oEligibleDialog.getModel(oModel).setProperty("/Description", oSelectedItem.getDescription());
			}
		},

		// Co Pay

		onAddCopayOpen: function () {
			this._fnDlgBtnTxtAdd("CoPay Data");
			this._fnClinicData();
			this.oViewData.setProperty("/TMode", "Submit");
			this.oViewData.setProperty("/DMode", true);
			if (!this._oCopayDialog) {
				this._oCopayDialog = Fragment.load({
					id: this.createId("dlgCoPay"),
					name: "BenefitClaim.ZBenefitClaim.fragments.AddCoPay",
					controller: this
				}).then(function (oDialog) {
					this._oCopayDialog = oDialog;
					this.getView().addDependent(this._oCopayDialog);
					this._oCopayDialog.setModel(new JSONModel({}), "oCoPayData");
					this._oCopayDialog.open();
				}.bind(this));
			}
		},

		onAddCoPay: function () {
			if (Validator.ValidateForm(this, "dlgCoPay", this._oCopayDialog)) {
				return;
			}
			Validator.resetValidStates(this, "dlgCoPay", this._oCopayDialog);
			var oData = this._oCopayDialog.getModel("oCoPayData").getData();
			var oMode = this.oViewData.getProperty("/TMode");
			if (oMode === "Submit") {
				this.getView().setBusy(true);
				$.ajax({
					url: "/BenefietCAP/claim/Co_Payment",
					data: JSON.stringify(oData),
					method: "POST",
					crossDomain: true,
					headers: {
						"Accept": "application/json",
						"Content-Type": "application/json"
					},
					success: function (response) {
						this._fnGetTableData();
						this.onCloseCoPay();
						this.handleSuccessDialog("Data has been saved");
						this.getView().getModel("oCoPayData").refresh(true);
						this.getView().setBusy(false);
					}.bind(this),
					error: function (response) {
						this.getView().setBusy(false);
						this.handleErrorDialog(response);
					}.bind(this)
				});
			} else {
				this.getView().setBusy(true);
				var oURL = "/BenefietCAP/claim/Co_Payment(Claim_Code='" + oData.Claim_Code + "',Clinic='" + oData.Clinic + "',Med_Leave_Declar='" +
					oData.Med_Leave_Declar + "',AL_Exceeded='" + oData.AL_Exceeded + "')";
				$.ajax({
					url: oURL,
					data: JSON.stringify(oData),
					method: "PUT",
					crossDomain: true,
					headers: {
						"Accept": "application/json",
						"Content-Type": "application/json"
					},
					success: function (data, oResponse) {
						this._fnGetTableData();
						this.onCloseCoPay();
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

		onEditCoPay: function (oEvent) {
			this._fnDlgBtnTxtSave("CoPay Data");
			var oContext = oEvent.getSource().getBindingContext("oCopayData"),
				sPath = oContext.getPath().replace(/^\D+/g, ""),
				sIndex = parseInt(sPath, 0);
			this.oViewData.setProperty("/DMode", true);
			this.oViewData.setProperty("/eIndex", sIndex);
			this.oViewData.setProperty("/TMode", "Edit");
			if (!this._oCopayDialog) {
				Fragment.load({
					name: "BenefitClaim.ZBenefitClaim.fragments.AddCoPay",
					controller: this
				}).then(function (oDialog) {
					this._oCopayDialog = oDialog;
					this.getView().addDependent(this._oCopayDialog);
					this._oCopayDialog.setModel(new JSONModel(oContext.getObject()), "oCoPayData");
					this._oCopayDialog.open();
				}.bind(this));

			}
		},

		onCopyCoPay: function (oEvent) {
			this._fnDlgBtnTxtCopy("CoPay Data");
			var oContext = oEvent.getSource().getBindingContext("oCopayData"),
				sPath = oContext.getPath().replace(/^\D+/g, ""),
				sIndex = parseInt(sPath, 0);
			this.oViewData.setProperty("/DMode", true);
			this.oViewData.setProperty("/eIndex", sIndex);
			this.oViewData.setProperty("/TMode", "Submit");
			if (!this._oCopayDialog) {
				Fragment.load({
					name: "BenefitClaim.ZBenefitClaim.fragments.AddCoPay",
					controller: this
				}).then(function (oDialog) {
					this._oCopayDialog = oDialog;
					this.getView().addDependent(this._oCopayDialog);
					this._oCopayDialog.setModel(new JSONModel(oContext.getObject()), "oCoPayData");
					this._oCopayDialog.open();
				}.bind(this));
				this._oCopayDialog.open();
			}
		},

		onSubDetailCoPay: function (oEvent) {
			var oContext = oEvent.getSource().getBindingContext("oCopayData");
			this.oViewData.setProperty("/DMode", false);
			if (!this._oCopayDialog) {
				Fragment.load({
					name: "BenefitClaim.ZBenefitClaim.fragments.AddCoPay",
					controller: this
				}).then(function (oDialog) {
					this._oCopayDialog = oDialog;
					this.getView().addDependent(this._oCopayDialog);
					this._oCopayDialog.setModel(new JSONModel(oContext.getObject()), "oCoPayData");
					this._oCopayDialog.open();
				}.bind(this));
			}

		},

		onDeleteCoPay: function (oEvent) {
			var oTable = this.getView().byId("oTableCoPay"),
				oData = oTable.getModel("oCopayData").getData(),
				selectedItems = oTable.getSelectedItems(),
				payLoad = [];
			if (selectedItems.length === 0) {
				sap.m.MessageToast.show("Please Select a row to Delete");
			} else {
				for (var i = selectedItems.length - 1; i >= 0; i--) {
					var idx = oTable.indexOfItem(selectedItems[i]);
					payLoad.push(oData[idx]);
				}
				var oValue = {
					"deleteItems": JSON.stringify(payLoad),
					"table_Name": "Co_Payment"
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
						this._fnGetTableData();
						this.handleSuccessDialog("Selected record(s) has been deleted");
						this.getView().setBusy(false);
					}.bind(this),
					error: function (xhr, ajaxOptions, throwError) {
						this.getView().setBusy(false);
						this.handleErrorDialog(xhr);
					}.bind(this)
				});
				oTable.getModel("oClaimDetails").refresh(true);
				oTable.removeSelections(true);
			}
		},

		onCloseCoPay: function () {
			this._oCopayDialog.close();
			this._oCopayDialog.destroy();
			this._oCopayDialog = undefined;
		},

		// Approver

		onAddApproval: function () {
			var oTile = this.oViewData.getProperty("/oTile");
			this._fnDlgBtnTxtAdd("Approver Data");
			this.oViewData.setProperty("/TMode", "Submit");
			this.oViewData.setProperty("/DMode", true);
			if (!this._oApproverDialog) {
				this._oApproverDialog = Fragment.load({
					id: this.createId("dlgApprover"),
					name: "BenefitClaim.ZBenefitClaim.fragments.AddApprover",
					controller: this
				}).then(function (oDialog) {
					this._oApproverDialog = oDialog;
					this.getView().addDependent(this._oApproverDialog);
					if (oTile === "HRMC") {
						this._oApproverDialog.setModel(new JSONModel({
							"HR_checker": {
								UserID: ""
							},
							"HR_maker": [{
								UserID: ""
							}]
						}), "oApprovalData");
					} else {
						this._oApproverDialog.setModel(new JSONModel({}), "oApprovalData");
					}
					this._oApproverDialog.open();
				}.bind(this));
			}
		},

		onAddApprover: function () {
			if (Validator.ValidateForm(this, "dlgApprover", this._oApproverDialog)) {
				return;
			}
			Validator.resetValidStates(this, "dlgApprover", this._oApproverDialog);
			var oData = this._oApproverDialog.getModel("oApprovalData").getData(),
				oMode = this.oViewData.getProperty("/TMode"),
				oTile = this.oViewData.getProperty("/oTile");
			oData.Second_Level_Approver = oData.Second_Level_Approver ? oData.Second_Level_Approver : "N/A";
			oData.Third_Level_Approver = oData.Third_Level_Approver ? oData.Third_Level_Approver : "N/A";
			oData.Fourth_Level_Approver = oData.Fourth_Level_Approver ? oData.Fourth_Level_Approver : "N/A";
			oData.Sequence_of_check = parseInt(oData.Sequence_of_check);
			if (oMode === "Submit") {
				if (oTile === "HRMC") {
					oData.Pay_Grade = "ALL";
					oData.Sponsor_Institution = "ALL";
					oData.Specialisation = "ALL";
					oData.Employee_Department = "ALL";
				}
				this.getView().setBusy(true);
				$.ajax({
					url: "/BenefietCAP/claim/approval_structure_hr",
					data: JSON.stringify(oData),
					method: "POST",
					crossDomain: true,
					headers: {
						"Accept": "application/json",
						"Content-Type": "application/json"
					},
					success: function (response) {
						this._fnGetTableData();
						this.onCloseApprover();
						this.handleSuccessDialog("Data has been saved");
						this.getView().getModel("oApprovalData").refresh(true);
						this.getView().setBusy(false);
					}.bind(this),
					error: function (response) {
						this.getView().setBusy(false);
						this.handleErrorDialog(response);
					}.bind(this)
				});
			} else {
				var oURLe = "/BenefietCAP/claim/approval_structure_hr(Claim_code='" + oData.Claim_code + "',Sequence_of_check=" + oData.Sequence_of_check +
					")";
				this.getView().setBusy(true);
				$.ajax({
					url: oURLe,
					data: JSON.stringify(oData),
					method: "PUT",
					crossDomain: true,
					headers: {
						"Accept": "application/json",
						"Content-Type": "application/json"
					},
					success: function (data, oResponse) {
						this._fnGetTableData();
						this.onCloseApprover();
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

		onEditApprover: function (oEvent) {
			this._fnDlgBtnTxtSave("Approver Data");
			var oContext = oEvent.getSource().getBindingContext("oApprovalData"),
				sPath = oContext.getPath().replace(/^\D+/g, ""),
				sIndex = parseInt(sPath, 0),
				oTile = this.oViewData.getProperty("/oTile");
			this.oViewData.setProperty("/DMode", true);
			this.oViewData.setProperty("/eIndex", sIndex);
			this.oViewData.setProperty("/TMode", "Edit");
			if (!this._oApproverDialog) {
				Fragment.load({
					name: "BenefitClaim.ZBenefitClaim.fragments.AddApprover",
					controller: this
				}).then(function (oDialog) {
					this._oApproverDialog = oDialog;
					this.getView().addDependent(this._oApproverDialog);
					var oData = oContext.getObject();
					if (oTile === "HRMC") {
						if (oData.HR_checker === null) {
							oData.HR_checker = {
								UserID: ""
							};
						}
						if (oData.HR_maker.length === 0) {
							oData.HR_maker = [{
								UserID: ""
							}];
						}
					}
					this._oApproverDialog.setModel(new JSONModel(oData), "oApprovalData");
					this._oApproverDialog.open();
				}.bind(this));
			}
		},

		onCopyApprover: function (oEvent) {
			this._fnDlgBtnTxtCopy("Approver Data");
			var oContext = oEvent.getSource().getBindingContext("oApprovalData"),
				sPath = oContext.getPath().replace(/^\D+/g, ""),
				sIndex = parseInt(sPath, 0);
			this.oViewData.setProperty("/DMode", true);
			this.oViewData.setProperty("/eIndex", sIndex);
			this.oViewData.setProperty("/TMode", "Submit");
			if (!this._oApproverDialog) {
				Fragment.load({
					name: "BenefitClaim.ZBenefitClaim.fragments.AddApprover",
					controller: this
				}).then(function (oDialog) {
					this._oApproverDialog = oDialog;
					this.getView().addDependent(this._oApproverDialog);
					this._oApproverDialog.setModel(new JSONModel(oContext.getObject()), "oApprovalData");
					this._oApproverDialog.open();
				}.bind(this));

			}
		},

		onSubDetailApprover: function (oEvent) {
			var oContext = oEvent.getSource().getBindingContext("oApprovalData");
			this.oViewData.setProperty("/DMode", false);
			if (!this._oApproverDialog) {
				Fragment.load({
					name: "BenefitClaim.ZBenefitClaim.fragments.AddApprover",
					controller: this
				}).then(function (oDialog) {
					this._oApproverDialog = oDialog;
					this.getView().addDependent(this._oApproverDialog);
					this._oApproverDialog.setModel(new JSONModel(oContext.getObject()), "oApprovalData");
					this._oApproverDialog.open();
				}.bind(this));
			}
		},

		onDeleteApprover: function (oEvent) {
			var oTable = this.getView().byId("oTableApprover"),
				oData = oTable.getModel("oApprovalData").getData(),
				selectedItems = oTable.getSelectedItems(),
				payLoad = [];
			if (selectedItems.length === 0) {
				sap.m.MessageToast.show("Please select a row to delete");
			} else {
				for (var i = selectedItems.length - 1; i >= 0; i--) {
					var idx = oTable.indexOfItem(selectedItems[i]);
					payLoad.push(oData[idx]);
				}
				var oValue = {
					"deleteItems": JSON.stringify(payLoad),
					"table_Name": "approval_structure_hr"
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
						this._fnGetTableData();
						this.handleSuccessDialog("Selected record(s) has been deleted");
						this.getView().setBusy(false);
					}.bind(this),
					error: function (xhr, ajaxOptions, throwError) {
						this.getView().setBusy(false);
						this.handleErrorDialog(xhr);
					}.bind(this)
				});
				oTable.getModel("oApprovalData").refresh(true);
				oTable.removeSelections(true);
			}
		},

		onCloseApprover: function () {
			this._oApproverDialog.close();
			this._oApproverDialog.destroy();
			this._oApproverDialog = undefined;
		},

		// Admin Role
		onAddRole: function () {
			this._fnDlgBtnTxtAdd("Role Data");
			this.oViewData.setProperty("/TMode", "Submit");
			this.oViewData.setProperty("/DMode", true);
			if (!this._oRoleDialog) {
				this._oRoleDialog = Fragment.load({
					id: this.createId("dlgRole"),
					name: "BenefitClaim.ZBenefitClaim.fragments.Role",
					controller: this
				}).then(function (oDialog) {
					this._oRoleDialog = oDialog;
					this.getView().addDependent(this._oRoleDialog);
					this._oRoleDialog.setModel(new JSONModel({}), "oRoleData");
					this.loadDatePicker(this._oRoleDialog.getModel("oRoleData"), "create", "START_DATE", "oRoleData", "datePicker1");
					this.loadDatePicker(this._oRoleDialog.getModel("oRoleData"), "create", "END_DATE", "oRoleData", "datePicker2");
					this._oRoleDialog.open();
				}.bind(this));
			}
		},

		handleSelectionFinish: function (oEvent) {
			var selectedItems = oEvent.getParameter("selectedItems"),
				oData = [];
			for (var i = 0; i < selectedItems.length; i++) {
				oData.push(selectedItems[i].getKey());
			}
		},

		onAddRoleData: function () {
			if (Validator.ValidateForm(this, "dlgRole", this._oRoleDialog)) {
				return;
			}
			Validator.resetValidStates(this, "dlgRole", this._oRoleDialog);
			var oData = this._oRoleDialog.getModel("oRoleData").getData(),
				oMode = this.oViewData.getProperty("/TMode"),
				oJSON, oPayLoad = [];
			if (!oData.START_DATE || !oData.END_DATE) {
				this._fnShowErrorMessage("Please select date");
				return;
			}
			if (oData.START_DATE < new Date().toISOString().substring(0, 10) && oMode === "Submit") {
				this._fnShowErrorMessage("Start date should be future date");
				return;
			}
			if ((oData.END_DATE < new Date().toISOString().substring(0, 10)) && oMode === "Submit") {
				this._fnShowErrorMessage("End date should be future date");
				return;
			}
			if (oData.START_DATE > oData.END_DATE) {
				this._fnShowErrorMessage("End date should be greater than effective date");
				return;
			}
			if (oData.ADMIN.length > 0) {
				for (var i = 0; i < oData.ADMIN.length; i++) {
					oJSON = {
						"ADMIN": oData.ADMIN[i],
						"COPAY": oData.COPAY,
						"APPROVAL": "Yes",
						"EMPLOYEE_ID": oData.EMPLOYEE_ID,
						"END_DATE": oData.END_DATE,
						"FIRSTNAME": oData.FIRSTNAME,
						"START_DATE": oData.START_DATE
					};
					oPayLoad.push(oJSON);
				}
			} else {
				this._fnShowErrorMessage("Please select tile info");
				return;
			}

			if (oMode === "Submit") {
				this.getView().setBusy(true);
				$.ajax({
					url: "/BenefietCAP/claim/admin_role_create",
					data: JSON.stringify({
						"ADMIN_ROLE": oPayLoad
					}),
					method: "POST",
					crossDomain: true,
					headers: {
						"Accept": "application/json",
						"Content-Type": "application/json"
					},
					success: function (response) {
						this._fnGetTableData();
						this.onCloseRole();
						this.handleSuccessDialog("Data has been saved");
						this.getView().getModel("oRoleData").refresh(true);
						this.getView().setBusy(false);
					}.bind(this),
					error: function (response) {
						this.getView().setBusy(false);
						this.handleErrorDialog(response);
					}.bind(this)
				});
			} else {
				var oURL = "/BenefietCAP/claim/ADMIN_ROLE(EMPLOYEE_ID='" + oData.EMPLOYEE_ID + "',START_DATE=" + oData.START_DATE +
					",END_DATE=" + oData.END_DATE + ")";
				this.getView().setBusy(true);
				$.ajax({
					url: oURL,
					data: JSON.stringify(oData),
					method: "PUT",
					crossDomain: true,
					headers: {
						"Accept": "application/json",
						"Content-Type": "application/json"
					},
					success: function (data, oResponse) {
						this._fnGetTableData();
						this.onCloseRole();
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

		onEditRole: function (oEvent) {
			this._fnDlgBtnTxtSave("Role Data");
			var oContext = oEvent.getSource().getBindingContext("oRoleData"),
				sPath = oContext.getPath().replace(/^\D+/g, ""),
				sIndex = parseInt(sPath, 0);
			this.oViewData.setProperty("/DMode", true);
			this.oViewData.setProperty("/eIndex", sIndex);
			this.oViewData.setProperty("/TMode", "Edit");
			if (!this._oRoleDialog) {
				Fragment.load({
					name: "BenefitClaim.ZBenefitClaim.fragments.Role",
					controller: this
				}).then(function (oDialog) {
					this._oRoleDialog = oDialog;
					this.getView().addDependent(this._oRoleDialog);
					var oData = oContext.getObject();
					this._oRoleDialog.setModel(new JSONModel(oData), "oRoleData");
					this._oRoleDialog.open();
				}.bind(this));
			}
		},

		onSubDetailRole: function (oEvent) {
			var oContext = oEvent.getSource().getBindingContext("oRoleData");
			this.oViewData.setProperty("/DMode", false);
			if (!this._oRoleDialog) {
				Fragment.load({
					name: "BenefitClaim.ZBenefitClaim.fragments.Role",
					controller: this
				}).then(function (oDialog) {
					this._oRoleDialog = oDialog;
					this.getView().addDependent(this._oRoleDialog);
					this._oRoleDialog.setModel(new JSONModel(oContext.getObject()), "oRoleData");
					this._oRoleDialog.open();
				}.bind(this));
			}
		},

		onCloseRole: function () {
			this._oRoleDialog.close();
			this._oRoleDialog.destroy();
			this._oRoleDialog = undefined;
		},

		onDeleteRole: function (oEvent) {
			var oTable = this._getFragmentTextPos("idRole", "oTableRole"),
				oData = oTable.getModel("oRoleData").getData(),
				selectedItems = oTable.getSelectedItems(),
				payLoad = [];
			if (selectedItems.length === 0) {
				sap.m.MessageToast.show("Please select a row to delete");
			} else {
				for (var i = selectedItems.length - 1; i >= 0; i--) {
					var idx = oTable.indexOfItem(selectedItems[i]);
					payLoad.push(oData[idx]);
				}
				var oValue = {
					"deleteItems": JSON.stringify(payLoad),
					"table_Name": "ADMIN_ROLE"
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
						this._fnGetTableData();
						this.handleSuccessDialog("Selected record(s) has been deleted");
						this.getView().setBusy(false);
					}.bind(this),
					error: function (xhr, ajaxOptions, throwError) {
						this.getView().setBusy(false);
						this.handleErrorDialog(xhr);
					}.bind(this)
				});
				oTable.getModel("oRoleData").refresh(true);
				oTable.removeSelections(true);
			}

		},

		onDownload: function (model, id) {
			// var data = this.getView().getModel(model).getData();
			var data = [],
				oData = this.getView().byId(id).getBinding("items").getCurrentContexts();
			for (var i = 0; i < oData.length; i++) {
				data.push(oData[i].getObject());
			}
			this.JSONToCSVConvertor(data, model, true);
		},

		onDownloadE: function (model) {
			var data = this.getView().getModel(model).getData();
			this.JSONToCSVConvertor(data, model, true);
		}
	});

});