sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"BenefitClaim/ZBenefitClaim/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Fragment",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"../utils/Validator",
	"../model/formatter"
], function (Controller, BaseController, JSONModel, Fragment, Filter, FilterOperator, Validator, formatter) {
	"use strict";

	return BaseController.extend("BenefitClaim.ZBenefitClaim.controller.Claims", {
		formatter: formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf BenefitClaim.ZBenefitClaim.view.Claims
		 */
		onInit: function () {
			this.getOwnerComponent().getRouter().getRoute("ClaimsRouteName").attachPatternMatched(this.objectMatched, this);
			this.oViewData = this.getOwnerComponent().getModel("ViewData");
			this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
		},

		onAfterRendering: function () {
			if (this.oViewData.getProperty("/oTile") === undefined) {
				this._oRouter.navTo("home");
			}
		},

		objectMatched: function () {
			this.oViewData.setProperty("/ClaimCateg", "");
			this.oViewData.setProperty("/ClaimCate", "");
			this.oViewData.setProperty("/Status", "");
			var oEmp = this.oViewData.getProperty("/EmpID"),
				oTileKey = this.oViewData.getProperty("/oTile"),
				oURL;
			if (oTileKey === "Delegate" || oTileKey === "ADDelegate") {
				if (oTileKey === "Delegate") {
					oURL = "/BenefietCAP/claim/DELEGATOR?$filter=CREATED_BY eq '" + oEmp + "'&$top=100000";
				} else {
					oURL = "/BenefietCAP/claim/DELEGATOR?$top=100000";
				}

				$.ajax({
					type: "GET",
					method: "GET",
					url: oURL,
					dataType: "json",
					success: function (data) {
						this.getView().setModel(new JSONModel(data.value), "oDelegate");
					}.bind(this),
					error: function (response) {
						this.handleErrorDialog(response);
					}.bind(this)
				});
			} else if (oTileKey === "Finance") {
				this.oViewData.setProperty("/ClaimType", "");
				this.oViewData.setProperty("/ClaimDesc", "");
				var oFilter = this.getView().byId("fbFilterFinance");
				oFilter._oSearchButton.setProperty("text", "SEARCH");
				oFilter._oClearButtonOnFB.setProperty("text", "CLEAR");
				this.loadDatePicker(this.oViewData, "create", "oPostingDate", "ViewData", "Posting");
				this.loadDatePicker(this.oViewData, "create", "oFinanceDate", "ViewData", "Replicate");
				this._fnFinanceData();
			} else if (oTileKey === "Coordinat" || oTileKey === "CoordinatSch") {
				this._fnClaimLoad();
			} else {
				this._fnClaimLoad();
			}

		},

		_fnClaimLoad: function () {
			this.oViewData.setProperty("/ClaimType", "");
			this.oViewData.setProperty("/ClaimDesc", "");
			// this._fnClaimCategory(oEmp);
			$.ajax({
				type: "GET",
				method: "GET",
				url: "/BenefietCAP/claim/Claim_Category",
				dataType: "json",
				success: function (response) {
					this._fnClaimCategFilter(response.value);
				}.bind(this),
				error: function (response) {
					this.handleErrorDialog(response);
				}.bind(this)
			});
		},

		_fnClaimCategFilter: function (response) {
			var oClaimCatData = [],
				oNameTile = this.oViewData.getProperty("/oTile"),
				oCompany = this.getView().getModel("oEmpData").getProperty("/COMPANY");
			if (oNameTile === "AdminSch" || oNameTile === "CoordinatSch" || oCompany === "MOHHSCH") {
				oCompany = "MOHHSCH";
			} else {
				oCompany = "MOHH";
			}
			// filter claim category
			$.each(response, function (idx, obj) {
				if (obj.Company === oCompany && oNameTile === "Admin") {
					// this.oViewData.setProperty("/oAdminID", this.oViewData.getProperty("/EmpID"));
					oClaimCatData.push(obj);
				} else if (obj.Company === oCompany) {
					if (obj.Category_Code !== "WRC_HR" && obj.Category_Code !== "PAY_UP") {
						oClaimCatData.push(obj);
					}
				}
			}.bind(this));
			this.getView().setModel(new JSONModel(oClaimCatData), "oClaimCat");
		},

		onNextForma: function () {
			var oNameTile = this.oViewData.getProperty("/oTile"),
				oClaim = this.oViewData.getProperty("/ClaimType"),
				oAdmin = this.oViewData.getProperty("/oAdminID"),
				oEmp = this.oViewData.getProperty("/EmpID"),
				sURL = "/BenefietCAP/calclaim/getEmployeeHrChecker(EMPLOYEE_ID='" + oEmp + "',CLAIMCODE='" + oClaim + "',HR_MAKER_LOGGED='" +
				oAdmin + "')/Set";
			if (oNameTile === "Admin") {
				$.ajax({
					type: "GET",
					method: "GET",
					url: sURL,
					dataType: "json",
					success: function (response) {
						if (response.value.length > 0) {
							this._fnNavigation();
						} else {
							this._fnShowErrorMessage("Please check the selected employee");
						}
					}.bind(this),
					error: function (response) {
						this.handleErrorDialog(response);
					}.bind(this)
				});
			} else {
				this._fnNavigation();
			}
		},

		onNavBackHome: function () {
			this.oViewData.setProperty("/EmpID", this.oViewData.getProperty("/LoginID"));
			this.oViewData.refresh(true);
			this.getRouter().navTo("home");
		},

		onNextForm: function (key) {
			// var oNameTile = this.oViewData.getProperty("/oTile"),
			// 	oAdmin = this.oViewData.getProperty("/LoginID"),
			// 	oEmp = this.oViewData.getProperty("/EmpID");
			// if (oAdmin === oEmp && oNameTile === "Admin") {
			// 	this._fnShowErrorMessage("Selected Employee will not be same as Login Admin");
			// } else {
			this.oViewData.setProperty("/oAdminHis", key);
			this._oRouter.navTo("ClaimFormRouteName", {
				Claim: this.oViewData.getProperty("/ClaimType")
			});
			// }
		},

		onSearchDeleg: function (oEvent, id) {
			var table = this.getView().byId(id),
				oBinding = table.getBinding("items"),
				oFilter = "",
				sValue = oEvent.getSource().getValue();
			if (sValue !== "") {
				var oFilter1 = new Filter("APPROVER_ID", FilterOperator.Contains, sValue),
					oFilter2 = new Filter("DELEGATOR_ID", FilterOperator.Contains, sValue),
					oFilter3 = new Filter("APP_FIRST_NAME", FilterOperator.Contains, sValue),
					// oFilter4 = new Filter("APP_LAST_NAME", FilterOperator.Contains, sValue),
					oFilter5 = new Filter("FIRST_NAME", FilterOperator.Contains, sValue);
				// oFilter6 = new Filter("LAST_NAME", FilterOperator.Contains, sValue);
				oFilter = new Filter([oFilter1, oFilter2, oFilter3, oFilter5], false);
			} else {
				oFilter = [];
			}
			oBinding.filter(oFilter);
		},

		onDelegateOpen: function () {
			this.oViewData.setProperty("/TMode", "Submit");
			this.oViewData.setProperty("/DMode", true);
			this.oDelDialog = Fragment.load({
				id: this.createId("dlgoDelegate"),
				name: "BenefitClaim.ZBenefitClaim.fragments.Delegate",
				controller: this
			}).then(function (oDialog) {
				this.oDelDialog = oDialog;
				this.getView().addDependent(this.oDelDialog);
				this.oDelDialog.setModel(new JSONModel({}), "oDelegate");
				this.loadDatePicker(this.oDelDialog.getModel("oDelegate"), "create", "START_DATE", "oDelegate", "datePicker1");
				this.loadDatePicker(this.oDelDialog.getModel("oDelegate"), "create", "END_DATE", "oDelegate", "datePicker2");
				this.oDelDialog.open();
			}.bind(this));
		},

		onEdit: function (oEvent, key) {
			this._fnDlgBtnTxtSave("Delegator Details");
			var oContext = oEvent.getSource().getBindingContext("oDelegate"),
				sPath = oContext.getPath().replace(/^\D+/g, ""),
				sIndex = parseInt(sPath, 0);
			this.oViewData.setProperty("/DMode", key);
			this.oViewData.setProperty("/eIndex", sIndex);
			this.oViewData.setProperty("/TMode", "Edit");
			this._oCreateBenefitDialog = Fragment.load({
				id: this.createId("dlgoDelegate"),
				name: "BenefitClaim.ZBenefitClaim.fragments.Delegate",
				controller: this
			}).then(function (oDialog) {
				this.oDelDialog = oDialog;
				this.getView().addDependent(this.oDelDialog);
				var oData = this.getView().getModel("oDelegate").getData();
				this.oInvst = $.extend(true, {}, oData);
				this.oDelDialog.setModel(new JSONModel(oContext.getObject()), "oDelegate");
				this.loadDatePicker(this.oDelDialog.getModel("oDelegate"), "edit", "END_DATE", "oDelegate", "datePicker2");
				this.oDelDialog.open();
			}.bind(this));
		},

		onCloseDeleg: function () {
			this.oDelDialog.close();
			this.oDelDialog.destroyContent();
			this.oDelDialog = undefined;
		},

		_fnDupDeleg: function (oCont) {
			var isValidate = false,
				aDupRec,
				sDate = oCont.START_DATE,
				eDate = oCont.END_DATE,
				oDeleg = oCont.DELEGATOR_ID,
				oData = this.oInvst;

			if (this.oViewData.getProperty("/TMode") === "Submit" && oData.length > 0) {
				aDupRec = $.grep(oData, function (element, index) {
					var obj1 = JSON.parse(JSON.stringify(element));
					return obj1.START_DATE === sDate && obj1.END_DATE === eDate;
				});
				if (aDupRec.length > 0) {
					isValidate = true;
					this._fnShowErrorMessage("Date overlapping");
				}
			}
			if (this.oViewData.getProperty("/TMode") === "Edit" && oData.length > 1) {
				aDupRec = $.grep(oData, function (element, index) {
					var obj1 = JSON.parse(JSON.stringify(element));
					return obj1.END_DATE === eDate && obj1.DELEGATOR_ID === oDeleg;
				});
				if (aDupRec.length > 0) {
					isValidate = true;
					this._fnShowErrorMessage("Date overlapping");
				}
			}
			return isValidate;
		},

		onAddDelegator: function () {
			var oData = this.oDelDialog.getModel("oDelegate").getData(),
				oMode = this.oViewData.getProperty("/TMode"),
				oCont = this.getView().getModel("oDelegate").getData();
			if (oMode === "Submit") {
				this.oInvst = oCont;
			}
			if (Validator.ValidateForm(this, "dlgoDelegate", this.oDelDialog)) {
				return;
			}
			Validator.resetValidStates(this, "dlgoDelegate", this.oDelDialog);
			if (!oData.START_DATE || !oData.END_DATE) {
				this._fnShowErrorMessage("Please select date");
				return;
			}
			if (oData.START_DATE < new Date().toISOString().substring(0, 10) && (oMode === "Submit")) {
				this._fnShowErrorMessage("Start date should be future date");
				return;
			}
			if (oData.END_DATE < new Date().toISOString().substring(0, 10)) {
				this._fnShowErrorMessage("End date should be future date");
				return;
			}
			if (oData.START_DATE > oData.END_DATE) {
				this._fnShowErrorMessage("End date should be greater than start date");
				return;
			}

			if (oCont.length > 0) {
				if (this._fnDupDeleg(oData)) {
					return;
				}
			}
			if (this.oViewData.getProperty("/oTile") === "Approvals" || this.oViewData.getProperty("/oTile") === "Delegate") {
				oData.APPROVER_ID = this.getView().getModel("oEmpData").getProperty("/USERID");
				oData.APP_FIRST_NAME = this.getView().getModel("oEmpData").getProperty("/FULLNAME");
				// oData.APP_LAST_NAME = this.getView().getModel("oEmpData").getProperty("/LASTNAME");
			}
			oData.CREATED_BY = this.oViewData.getProperty("/EmpID");
			if (oMode === "Submit") {
				this.getView().setBusy(true);
				$.ajax({
					url: "/BenefietCAP/claim/DELEGATOR",
					data: JSON.stringify(oData),
					method: "POST",
					headers: {
						"Accept": "application/json",
						"Content-Type": "application/json"
					},
					crossDomain: true,
					success: function (data, oResponse) {
						this.objectMatched();
						this.onCloseDeleg();
						this.getView().setBusy(false);
						this.handleSuccessDialog("Data has been saved");
						// this._fnDelegation(oData.DELEGATOR_ID, oData.START_DATE, oData.END_DATE);
					}.bind(this),
					error: function (response) {
						this.getView().setBusy(false);
						this.handleErrorDialog(response);
					}.bind(this)
				});
			} else {
				var oURL = "/BenefietCAP/claim/DELEGATOR(START_DATE=" + oData.START_DATE + ",DELEGATOR_ID='" +
					oData.DELEGATOR_ID + "',APPROVER_ID='" + oData.APPROVER_ID + "')";
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
						this.objectMatched();
						this.onCloseDeleg();
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

		onDeleteDeleg: function (oEvent) {
			var oData = oEvent.getSource().getBindingContext("oDelegate").getObject(),
				payLoad = [];
			payLoad.push(oData);
			if (oData.START_DATE >= new Date().toISOString().substring(0, 10)) {
				var oValue = {
					"deleteItems": JSON.stringify(payLoad),
					"table_Name": "DELEGATOR"
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
						this.objectMatched();
						this.handleSuccessDialog("Selected record(s) has been deleted");
						this.getView().setBusy(false);
					}.bind(this),
					error: function (response) {
						this.getView().setBusy(false);
						this.handleErrorDialog(response);
					}.bind(this)
				});
			} else {
				this._fnShowErrorMessage("Deletion not allowed for this period");
			}
		},

		_fnDelegateApprover: function (oValue) {
			$.ajax({
				url: "/BenefietCAP/claim/delegateApprover",
				data: JSON.stringify(oValue),
				method: "POST",
				crossDomain: true,
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json"
				},
				success: function (data, oResponse) {
					this.getView().setBusy(false);
					this.handleSuccessDialog("Delegation completed");
				}.bind(this),
				error: function (xhr, ajaxOptions, throwError) {
					this.getView().setBusy(false);
					this.handleErrorDialog(xhr);
				}.bind(this)
			});
		},

		onClearFin: function () {
			this.oViewData.setProperty("/oFinanceDate", null);
			this.oViewData.setProperty("/oPostingDate", null);
			this.oViewData.setProperty("/Emp_SMS_finance", "");
			$(".Posting").val(null);
			$(".Replicate").val(null);
			this._fnFinanceData();
		}

	});

});