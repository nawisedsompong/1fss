sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"BenefitClaim/ZBenefitClaim/controller/BaseController",
	"sap/ui/core/Fragment",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"../utils/Validator",
	"../model/formatter"
], function (Controller, BaseController, Fragment, JSONModel, Filter, FilterOperator, Validator, formatter) {
	"use strict";

	return BaseController.extend("BenefitClaim.ZBenefitClaim.controller.ClaimForm", {
		formatter: formatter,
		onInit: function () {
			this.getOwnerComponent().getRouter().getRoute("ClaimFormRouteName").attachPatternMatched(this.objectMatched, this);
			this.oViewData = this.getOwnerComponent().getModel("ViewData");
			this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
		},

		onAfterRendering: function () {
			this.getView().setModel(new JSONModel([]), "oLocationRO");
			this.getView().setModel(new JSONModel([]), "oApprovers");
			this.getView().setModel(new JSONModel([]), "oCancelClaims");
			if (this.oViewData.getProperty("/oTile") === undefined) {
				this._oRouter.navTo("home");
			}
		},

		objectMatched: function (oEvent) {
			var oEmpId = this.oViewData.getProperty("/EmpID"),
				oNameTile = this.oViewData.getProperty("/oTile"),
				oAdminHis = this.oViewData.getProperty("/oAdminHis");
			this.oCompany = this.getView().getModel("oEmpData").getProperty("/COMPANY");
			this.oViewData.setProperty("/App", false);
			this.oViewData.setProperty("/oHis", false);
			this.oViewData.setProperty("/oCan", false);
			this.oViewData.setProperty("/isActiveClose", true);
			this.oViewData.setProperty("/ClaimCateg", "");
			this.oViewData.setProperty("/ClaimCate", "");
			this.oViewData.setProperty("/Status", "");
			this.oViewData.setProperty("/ClaimNo", "");
			this.oViewData.setProperty("/Claim_Owner", "");
			this.oViewData.setProperty("/EmpID_App", "");
			this.oViewData.setProperty("/EmpID_App_Rep", "");
			this.oViewData.setProperty("/oNameTile", "");
			this.oViewData.setProperty("/oFinanc", true);
			this.eDialog = undefined;
			this._fnAttachValidation();
			this._fnTimePicker();
			setTimeout(this._fnDropdowns(), 50);
			this._fnEmpJob();
			this.loadDatePicker(this.oViewData, "create", "Sdate", "ViewData", "HisdatePicker1");
			this.loadDatePicker(this.oViewData, "create", "Edate", "ViewData", "HisdatePicker2");
			this.loadDatePicker(this.oViewData, "create", "oRecp", "ViewData", "ReceiptDate");
			this.loadDatePicker(this.oViewData, "create", "IntSdate", "ViewData", "datePicker1");
			this.loadDatePicker(this.oViewData, "create", "IntEdate", "ViewData", "datePicker2");
			this.loadDatePicker(this.oViewData, "create", "oReceiptdate", "ViewData", "receiptdate");
			if (this.getView().getModel("ApprovalModel") !== undefined) {
				this.getView().getModel("ApprovalModel").setData([]);
			}

			if (oNameTile === "Admin" && oAdminHis === "F") {
				this._fnUserInfo(oEmpId);
				this.oViewData.setProperty("/ClaimDesc", "Claim Admin");
			} else if (oNameTile === "History" || oNameTile === "PaymentUpload" || ((oNameTile === "Admin" || oNameTile === "AdminSch" ||
					oNameTile === "Coordinat" || oNameTile === "CoordinatSch") && oAdminHis === "H")) {
				this.oViewData.setProperty("/ClaimCate", "");
				this.oViewData.setProperty("/ClaimType", "");
				this.oViewData.setProperty("/Status", "");
				this.oViewData.setProperty("/Sdate", null);
				this.oViewData.setProperty("/Edate", null);
				this.oViewData.setProperty("/oRecp", null);
				$(".HisdatePicker1").val(null);
				$(".HisdatePicker2").val(null);
				this.oViewData.setProperty("/ClaimDesc", "Claim Records");
				var oURL, oFilter = this.getView().byId("fbFilter"),
					osDate = new Date().getFullYear() + "-01-01",
					oeDate = new Date().getFullYear() + "-12-31";
				oFilter._oSearchButton.setProperty("text", "SEARCH");
				oFilter._oClearButtonOnFB.setProperty("text", "CLEAR");
				if (oNameTile === "PaymentUpload") {
					oURL = "/BenefietCAP/claim/app_histwithCancel?$top=100000&$filter=CATEGORY_CODE eq 'PAY_UP'";
				} else {
					// oURL = "/BenefietCAP/claim/app_histwithCancel?$top=100000&$filter=(CLAIM_OWNER_ID eq '" + oEmpId + "' or lineitem_emp eq '" +
					// 	oEmpId + "') and CLAIM_DATE ge " + osDate + " and CLAIM_DATE le " + oeDate + "";
					oURL = "/BenefietCAP/claim/app_histwithlineItem(EMP_LINEITEM='" + oEmpId +
						"')/Set?$top=100000&$filter=Rep_Status ne 'Error'";
				}
				this._fnApprovalModel(oURL);
			} else if (oNameTile === "HistoryCoord" || oNameTile === "HistoryCoordSch") {
				this.oViewData.setProperty("/ClaimDesc", "Claim Records");
				var oFkeyss, oMkey, oFilters = this.getView().byId("fbFilter");
				oFilters._oSearchButton.setProperty("text", "SEARCH");
				oFilters._oClearButtonOnFB.setProperty("text", "CLEAR");
				if (oNameTile === "HistoryCoord" || oNameTile === "Coordinat") {
					oMkey = "/BenefietCAP/claim/Approval_Claim_Coordinator(claim_Cordinator='" + oEmpId + "')/Set?$top=100000";
					oFkeyss =
						"&$filter=Rep_Status ne 'Error' and CATEGORY_CODE ne 'OC' and CATEGORY_CODE ne 'CPR' and CATEGORY_CODE ne 'CPC' and CATEGORY_CODE ne 'SDFR' and CATEGORY_CODE ne 'SDFC' and CATEGORY_CODE ne 'PAY_UP'";
				} else {
					oMkey = "/BenefietCAP/claim/Approval_Claim_Coordinator_Line(claim_Cordinator='" + oEmpId + "')/Set?$top=100000";
					oFkeyss =
						"&$filter=Rep_Status ne 'Error' and CATEGORY_CODE eq 'OC' or CATEGORY_CODE eq 'CPR' or CATEGORY_CODE eq 'CPC' or CATEGORY_CODE eq 'SDFR' or CATEGORY_CODE eq 'SDFC' or CATEGORY_CODE eq 'PAY_UP'";
				}
				var sURL = oMkey + oFkeyss;
				this._fnApprovalModel(sURL);
			} else if (oNameTile === "Approvals" || oNameTile === "SMSApprovals") {
				this.loadDatePicker(this.oViewData, "create", "Sdate1", "ViewData", "HisdatePicker3");
				this.loadDatePicker(this.oViewData, "create", "Edate2", "ViewData", "HisdatePicker4");
				this.loadDatePicker(this.oViewData, "create", "Sdate3", "ViewData", "HisdatePicker5");
				this.loadDatePicker(this.oViewData, "create", "Edate4", "ViewData", "HisdatePicker6");
				var oFkeys, oFilterA = this.getView().byId("fbFilterA"),
					oFilterAB = this.getView().byId("fbFilterAB"),
					oFilterAC = this.getView().byId("fbFilterAC");
				oFilterA._oSearchButton.setProperty("text", "SEARCH");
				oFilterA._oClearButtonOnFB.setProperty("text", "CLEAR");
				oFilterAB._oSearchButton.setProperty("text", "SEARCH");
				oFilterAB._oClearButtonOnFB.setProperty("text", "CLEAR");
				oFilterAC._oSearchButton.setProperty("text", "SEARCH");
				oFilterAC._oClearButtonOnFB.setProperty("text", "CLEAR");
				this.oViewData.setProperty("/ClaimDesc", "Claim Approvals");
				this.oViewData.setProperty("/oTabValue", "Pending");
				if (this.oViewData.getProperty("/Del_EmpID") === "" || this.oViewData.getProperty("/Del_EmpID") === undefined) {
					this.onSelfPress();
				}

				if (oNameTile === "Approvals") {
					oFkeys =
						"CATEGORY_CODE ne 'OC' and CATEGORY_CODE ne 'CPR' and CATEGORY_CODE ne 'CPC' and CATEGORY_CODE ne 'SDFR' and CATEGORY_CODE ne 'SDFC' and CATEGORY_CODE ne 'PAY_UP' and";
				} else {
					oFkeys =
						"(CATEGORY_CODE eq 'OC' or CATEGORY_CODE eq 'CPR' or CATEGORY_CODE eq 'CPC' or CATEGORY_CODE eq 'SDFR' or CATEGORY_CODE eq 'SDFC' or CATEGORY_CODE eq 'PAY_UP') and";
				}

				// oEmpId="42000141";
				var eURL = "/BenefietCAP/claim/app_histwithCancel?$top=100000&$filter=" + oFkeys + " EMPLOYEE_ID eq '" + oEmpId +
					"' and CLAIM_STATUS ne 'Approved' and CLAIM_STATUS ne 'Cancellation Approved' and CLAIM_STATUS ne 'Rejected' and CLAIM_STATUS ne 'Cancelled'";
				this._fnApprovalModel(eURL);

				$.ajax({
					method: "GET",
					url: "/BenefietCAP/claim/app_histwithCancel?$top=100000&$filter=" + oFkeys + " ((EMPLOYEE_ID eq '" + oEmpId +
						"' and (CLAIM_STATUS eq 'Approved' or CLAIM_STATUS eq 'Cancellation Approved' or CLAIM_STATUS eq 'Rejected')) or (APPROVER1_STATUS eq '" +
						oEmpId + "' or APPROVER2_STATUS eq '" + oEmpId + "' or APPROVER3_STATUS eq '" + oEmpId + "'))",
					dataType: "json",
					success: function (data) {
						var oModel = this._getSizeLimit(data.value);
						this.getView().setModel(oModel, "ApprovalHistoryModel");
					}.bind(this),
					error: function (response) {
						this.handleErrorDialog(response);
					}.bind(this)
				});

				this._fnDelegateData(oEmpId);

			} else if (oNameTile === "HisRep") {
				this.onClearRep();
				var oFilterInt = this.getView().byId("fbFilterInt");
				oFilterInt._oSearchButton.setProperty("text", "SEARCH");
				oFilterInt._oClearButtonOnFB.setProperty("text", "CLEAR");
				this.oViewData.setProperty("/ClaimDesc", "Claim Records");
			} else if (oNameTile === "MassR") {
				this.oViewData.setProperty("/ClaimDesc", "Claims Re-Route");
			} else if (oNameTile === "Coordinat" || oNameTile === "CoordinatSch") {
				this._fnUserInfo(oEmpId);
				this.oViewData.setProperty("/oTile", "Admin");
				this.oViewData.setProperty("/oNameTile", oNameTile);
				this.oViewData.setProperty("/ClaimDesc", "Claim Coordinator");
			} else {
				this._fnUserInfo(oEmpId);
				this._fnTableData();
			}
		},

		_fnApprovalModel: function (oURL) {
			$.ajax({
				method: "GET",
				url: oURL,
				dataType: "json",
				success: function (data) {
					var oModel = this._getSizeLimit(data.value);
					this.getView().setModel(oModel, "ApprovalModel");
				}.bind(this),
				error: function (response) {
					this.handleErrorDialog(response);
				}.bind(this)
			});
		},

		onNavBackForm: function () {
			$(".HisdatePicker1").removeAttr('id');
			$(".HisdatePicker2").removeAttr('id');
			var oTile = this.oViewData.getProperty("/oTile"),
				oTileUpd = this.oViewData.getProperty("/oNameTile");
			if (this.oViewData.getProperty("/ClaimType") === "PAY_UP") {
				this._oRouter.navTo("home");
			} else if (oTile === "Form" || oTile === "Admin" || oTile === "Coordinat" || oTile === "CoordinatSch") {
				this._oRouter.navTo("ClaimsRouteName");
				if (oTileUpd) {
					this.oViewData.setProperty("/oTile", oTileUpd);
				}
			} else {
				this._oRouter.navTo("home");
			}
		},

		_fnTableData: function () {
			var oEmpId = this.oViewData.getProperty("/EmpID"),
				code = this.oViewData.getProperty("/ClaimType"),
				oURL = this.fnPostEntity(),
				modelname = this.oViewData.getProperty("/oModelName"),
				oParam;
			if (oURL.includes("LINE_ITEM")) {
				oParam = "&$top=100000&$filter=EMPLOYEE_ID eq '" + oEmpId +
					"' and CLAIM_STATUS eq 'Pending for Submission' and CATEGORY_CODE eq '" + code + "'";
			} else {
				oParam = "?$top=100000&$filter=EMPLOYEE_ID eq '" + oEmpId +
					"' and CLAIM_STATUS eq 'Pending for Submission' and CATEGORY_CODE eq '" + code + "'";
			}
			$.ajax({
				method: "GET",
				url: oURL + oParam,
				dataType: "json",
				success: function (response) {
					if ((response.value).length > 0) {
						this.getView().setModel(new JSONModel(response.value), modelname);
					} else {
						this.getView().setModel(new JSONModel([]), modelname);
					}
				}.bind(this),
				error: function (response) {
					this.handleErrorDialog(response);
				}.bind(this)
			});
		},

		// Claim Types - 

		onDialogOpen: function (name) {
			this.oViewData.setProperty("/oDlgName", name);
			this.oViewData.setProperty("/RATE", 1.00);
			var oValid = this.oViewData.getData().AttachValidation,
				key = this.oViewData.getProperty("/ClaimType"),
				// oResponse = this.getView().getModel("oClaimCatNew").getData(), 
				oResponse = this.getView().getModel("ComboDetails").getData(),
				oClaimCatg = [],
				oValidCode = [],
				oCompany = this.oCompany;
			$.each(oValid[0], function (idx, obj) {
				if (obj.Claim_Category === key && obj.Allow_Apply_In_Web === "Yes") {
					oValidCode.push(obj);
				}
			});
			if (name === "PUpload") {
				$.each(oResponse.COMPANY_CLAIM_CATEGORY, function (idx, obj) {
					if (obj.Category_Code === key) {
						oClaimCatg.push(obj);
					}
				});
			} else {
				$.each(oResponse.COMPANY_CLAIM_CATEGORY, function (idx, obj) {
					if (obj.Category_Code === key && obj.Company === oCompany) {
						oClaimCatg.push(obj);
					}
				});
			}
			var result = oClaimCatg.filter(function (o1) {
				return oValidCode.some(function (o2) {
					return o1.Claim_code === o2.Claim_Code; // return the ones with equal code
				});
			});
			this._fnClinicData();
			this._fnClaimCategoryOpen(result);
		},

		onDialogOpenWRC: function (name) {
			var eDialogM = "_o" + name + "Dialog";
			this._fnDlgBtnTxtAdd(name + " Expense");
			this.oViewData.setProperty("/TMode", "Add");
			this.oViewData.setProperty("/DMode", true);
			this.oViewData.setProperty("/ALength", 0);
			this.oViewData.getData().AmountWRC = [];
			if (!this.eDialogM) {
				this.eDialogM = Fragment.load({
					id: this.createId(name),
					name: "BenefitClaim.ZBenefitClaim.fragments." + name,
					controller: this
				}).then(function (oDialog) {
					this.eDialogM = oDialog;
					this.getView().addDependent(this.eDialogM);
					this.eDialogM.setModel(new JSONModel({
						"CLAIM_DATE": this._getCurrentDate(),
						"CLAIM_REFERENCE": this.oViewData.getProperty("/ClaimType") + new Date().getTime().toString(),
						"EMPLOYEE_ID": this.oViewData.getProperty("/EmpID"),
						"CLAIM_AMOUNT": 0.00,
						"CLAIM_STATUS": "Pending for Submission",
						"CLAIM_CATEGORY": this.oViewData.getProperty("/ClaimType"),
						"CATEGORY_CODE": this.oViewData.getProperty("/ClaimType"),
						"LINE_ITEM": []
					}), name);
					var sModelProperty = "START_DATE";
					if (name === "Sponsorship_Master") {
						if (this.oViewData.getProperty("/ClaimType") === "SP1" || this.oViewData.getProperty("/ClaimType") === "SP2") {
							this._fnSpEligib(this.oViewData.getProperty("/ClaimType"), this.oViewData.getProperty("/EmpID"), "create");
						} else {
							this.fnGetBalancAmnt(this.oViewData.getProperty("/ClaimType"), this.oViewData.getProperty("/EmpID"));
							this.loadDatePicker(this.eDialogM.getModel(name), "create", sModelProperty, name, "datePicker1");
							sModelProperty = "END_DATE";
							this.loadDatePicker(this.eDialogM.getModel(name), "create", sModelProperty, name, "datePicker2");
							this.eDialogM.open();
						}
					} else if (name === "SDFRClaim_Master") {
						this.fnGetBalancAmnt(this.oViewData.getProperty("/ClaimType"), this.oViewData.getProperty("/EmpID"));
						sModelProperty = "PRG_START_DATE";
						this.loadDatePicker(this.eDialogM.getModel(name), "create", sModelProperty, name, "datePicker1");
						sModelProperty = "PRG_END_DATE";
						this.loadDatePicker(this.eDialogM.getModel(name), "create", sModelProperty, name, "datePicker2");
						this.eDialogM.open();
					} else {
						this.fnGetBalancAmnt(this.oViewData.getProperty("/ClaimType"), this.oViewData.getProperty("/EmpID"));
						this.eDialogM.open();
					}
				}.bind(this));
			}
			if (name === "SDFClaim_Master" || name === "SDFRClaim_Master" || name === "CPClaim_Master" || name === "OClaim_Master") {
				this.eDialogM.then(function (oDialog) {
					this.fncallelig(name);
				}.bind(this));
			}

		},

		fncallelig: function (name) {
			if (name === "SDFRClaim_Master") {
				var oURL = "/BenefietCAP/claim/INFT_SCHOLAR_SCHEME?$filter=externalCode eq '" + this.oViewData
					.getProperty("/EmpID") + "'&$orderby=effectiveStartDate desc";
				this._fnGetCallSDFR(oURL, "SDFR");
			}
			if (name === "SDFClaim_Master" || name === "CPClaim_Master" || name === "OClaim_Master") {
				var aURL = "/BenefietCAP/claim/BANK_ACC?$filter=externalCode eq '" + this.oViewData.getProperty(
					"/EmpID") + "'&$orderby=effectiveStartDate desc";
				this._fnAccountDetaila(aURL, name);
			}
		},

		_fnSpEligib: function (code, emp, action) {
			var oEmpId = emp,
				oClaim = code;
			oClaim = oClaim === "SP" ? "TrvExitExamSpons" : oClaim === "SP1" ? "TrvHMDSpons1" : oClaim === "SP2" ? "TrvHMDSpons2" :
				"TrvIntExamSpons";

			var eURL = "/BenefietCAP/claim/EmployeeEligibility(UserID='" + oEmpId + "')/Set?$filter=Claim_Code eq '" + oClaim + "'";
			$.ajax({
				url: eURL,
				method: "GET",
				crossDomain: true,
				dataType: "json",
				success: function (data, oResponse) {
					var oData = data.value;
					if (oData.length === 0 || (oData[0].Entitlement === 0)) {
						this._fnShowErrorMessage("Staff is not eligible for this claim");
					} else {
						this.oViewData.getData().oEntit = [];
						this.oViewData.getData().oEntit.push(oData[0]);
						this.fnProrationRule(oClaim, "Sponsorship_Master", oEmpId);
						if (action === "create") {
							var sModelProperty = "START_DATE";
							this.loadDatePicker(this.eDialogM.getModel("Sponsorship_Master"), "create", sModelProperty, "Sponsorship_Master",
								"datePicker1");
							sModelProperty = "END_DATE";
							this.loadDatePicker(this.eDialogM.getModel("Sponsorship_Master"), "create", sModelProperty, "Sponsorship_Master",
								"datePicker2");
							this.eDialogM.open();
						}
						// this.fnGetBalancAmnt(this.oViewData.getProperty("/ClaimType"), oEmpId);
					}
				}.bind(this),
				error: function (xhr, ajaxOptions, throwError) {
					this.getView().setBusy(false);
					this.handleErrorDialog(xhr);
				}.bind(this)
			});
		},

		onSubDetailWRC: function (oEvent, model, name, data) {
			var oData;
			if (oEvent === "H") {
				oData = data;
			} else {
				oData = oEvent.getSource().getBindingContext(model).getObject();
			}
			this.fnGetBalancAmnt(oData.CATEGORY_CODE, oData.EMPLOYEE_ID);
			if (name === "SDFRClaim_Master") {
				var oURL = "/BenefietCAP/claim/INFT_SCHOLAR_SCHEME?$filter=externalCode eq '" + oData.EMPLOYEE_ID +
					"'&$orderby=effectiveStartDate desc";
				this._fnGetCallSDFR(oURL, "SDFR", "Edit");
			}
			this.oViewData.setProperty("/DMode", false);
			this.eDialogM = Fragment.load({
				id: this.createId(name),
				name: "BenefitClaim.ZBenefitClaim.fragments." + name,
				controller: this
			}).then(function (oDialog) {
				this.eDialogM = oDialog;
				this.getView().addDependent(this.eDialogM);
				this.eDialogM.setModel(new JSONModel(oData), name);
				this.eDialogM.open();
				if (name === "PUpload_Master" || name === "SDFRClaim_Master") {
					this.onDisplayFiles(oData.CLAIM_REFERENCE);
				}
			}.bind(this));
		},

		onEditWRC: function (oEvent, model, name, data) {
			if (this.oViewData.getProperty("/oTile") === "History") {
				this.hasChange = true;
			} else {
				this.hasChange = false;
			}
			this._fnDlgBtnTxtSave("Eligibility Data");
			var eDialogM = "_o" + model + "Dialog",
				sModelProperty, oData;
			if (oEvent === "H") {
				oData = data;
				this.oViewData.setProperty("/TMode", "Add");
			} else {
				this.oViewData.setProperty("/TModeLine", true);
				this.oViewData.setProperty("/TMode", "Edit");
				var oContext = oEvent.getSource().getBindingContext(model),
					sPath = oContext.getPath().replace(/^\D+/g, ""),
					sIndex = parseInt(sPath, 0);
				oData = oContext.getObject();
			}
			if (this.oViewData.getProperty("/ClaimType") === "SP1" || this.oViewData.getProperty("/ClaimType") === "SP2") {
				this._fnSpEligib(oData.CATEGORY_CODE, oData.EMPLOYEE_ID);
			} else {
				this.fnGetBalancAmnt(oData.CATEGORY_CODE, oData.EMPLOYEE_ID);
			}
			if (name === "SDFRClaim_Master") {
				var oURL = "/BenefietCAP/claim/INFT_SCHOLAR_SCHEME?$filter=externalCode eq '" + oData.EMPLOYEE_ID +
					"'&$orderby=effectiveStartDate desc";
				this._fnGetCallSDFR(oURL, "SDFR", "Edit");
			}

			this.oViewData.setProperty("/DMode", true);
			this.oViewData.setProperty("/eIndex", sIndex);
			this.eDialogM = Fragment.load({
				id: this.createId(name),
				name: "BenefitClaim.ZBenefitClaim.fragments." + name,
				controller: this
			}).then(function (oDialog) {
				this.eDialogM = oDialog;
				this.getView().addDependent(this.eDialogM);
				this.oMaster = $.extend(true, {}, oData);
				this.eDialogM.setModel(new JSONModel(oData), name);
				this.eDialogM.getModel(name).attachPropertyChange(function (oEvt) {
					this.mDataModelChange(oEvt, oData);
				}, this);
				// if (oData.CLAIM_STATUS === "Pending for Submission" || oData.CLAIM_STATUS === "Rejected" || oData.CLAIM_STATUS === "Cancelled" ||
				// 	oData.CLAIM_STATUS === "Cancellation Approved") {
				this.onReceiptDate("A", oData, "E");
				// }
				if (name === "PUpload_Master" || name === "SDFRClaim_Master") {
					this.onDisplayFiles(oData.CLAIM_REFERENCE);
				}
				if (name === "Sponsorship_Master") {
					sModelProperty = "START_DATE";
					this.loadDatePicker(this.eDialogM.getModel(name), "edit", sModelProperty, name, "datePicker1");
					sModelProperty = "END_DATE";
					this.loadDatePicker(this.eDialogM.getModel(name), "edit", sModelProperty, name, "datePicker2");
				} else if (name === "SDFRClaim_Master") {
					sModelProperty = "PRG_START_DATE";
					this.loadDatePicker(this.eDialogM.getModel(name), "edit", sModelProperty, name, "datePicker1");
					sModelProperty = "PRG_END_DATE";
					this.loadDatePicker(this.eDialogM.getModel(name), "edit", sModelProperty, name, "datePicker2");
					this.eDialogM.open();
				}
				this.eDialogM.open();
			}.bind(this));
		},

		onAddLineData: function (oEvent, model, Dmodel) {
			var oTAmount = 0.00,
				oModel = this.eDialog.getModel(model).getData(),
				oIndex = this.oViewData.getProperty("/oLineItemIndex"),
				oMode = this.oViewData.getProperty("/TMode"),
				oMasterData = this.eDialogM.getModel(Dmodel).getData(),
				oNameTile = this.oViewData.getProperty("/oTile");

			var oClaimCode = this.oViewData.getProperty("/oClaimCode"),
				oLen = this.oViewData.getProperty("/ALength"),
				valid = this._fnAttachReq(oClaimCode);
			if (Validator.ValidateForm(this, model, this.eDialog)) {
				return;
			}
			Validator.resetValidStates(this, model, this.eDialog);

			if (this.oValidateDate(model, oModel)) {
				this._fnShowErrorMessage("Please select mandatory date");
				return;
			}
			if (model === "Transportation") {
				if (oModel.RECEIPT_DATE > new Date().toISOString().substring(0, 10)) {
					this._fnShowErrorMessage("Receipt date should not be future");
					return;
				}
				var oCont = this.getView().getModel("oLocationData").getData();
				var oLocFrom = $.grep(oCont, function (obj, index) {
					return obj.LOCATION === oModel.TRANSPORT_FROM;
				});
				var oLocTo = $.grep(oCont, function (obj, index) {
					return obj.LOCATION === oModel.TRANSPORT_TO;
				});
				if (oLocFrom.length === 0) {
					this._fnShowErrorMessage("Transport From location is inactive");
					return;
				}
				if (oLocTo.length === 0) {
					this._fnShowErrorMessage("Transport To location is inactive");
					return;
				}
			}

			if (valid && oLen === 0) {
				this._fnShowErrorMessage("Please add attachment");
				return;
			}

			if (this.hasChange && (model === "Covid" || model === "Transportation" || model === "Sponsorship")) {
				this._fnShowErrorMessage("Please press the Compute button again to verify the claim amount before submitting");
				return;
			}

			if (parseFloat(oModel.CLAIM_AMOUNT) === 0 || parseFloat(oModel.CLAIM_AMOUNT) === 0.00) {
				this._fnShowErrorMessage("Claim amount = $0 is not allowed.");
				return;
			}

			if (model === "Transportation" && oModel.TRANSPORT_TYPE !== "TAXI") {
				var oEmp = oModel.EMPLOYEE_ID,
					oTime = oModel.START_TIME.replaceAll(":", ""),
					oDate = oModel.RECEIPT_DATE.replaceAll("-", "");
				oModel.RECEIPT_NUMBER = oEmp + oDate + oTime;
			}

			if (model === "Transportation" && oModel.TRANSPORT_TYPE === "TAXI") {
				if (this._fnIsDuplicateRecordTC(oModel, oMasterData)) {
					return;
				}
			}

			if (model === "PUpload" && this.oViewData.getProperty("/PAYMENT") === "Vendor") {
				oModel.PAY_TO_BANK = "";
				oModel.ACC_NAME = "";
				oModel.ACC_NO = "";
				oModel.BANK_CURRENCY = "";
			}

			/*if (Dmodel === "SDFRClaim_Master" || Dmodel === "SDFClaim_Master" || Dmodel === "CPClaim_Master") {
				var amount = Dmodel === "SDFRClaim_Master" ? "ESTIMATE_COST" : "CLAIM_AMOUNT";
				if (oMasterData.LINE_ITEM.length > 0) {
					for (var k = 0; k < (oMasterData.LINE_ITEM).length; k++) {
						oTAmount += parseFloat(oMasterData.LINE_ITEM[k][amount], 10);
					}
				} else {
					oTAmount = oModel[amount];
				}
				if (Dmodel === "SDFRClaim_Master") {
					var oEnt = this.getView().getModel("oEligCalData").getProperty("/BALANCE");
					if (parseFloat(oEnt, 2) < parseFloat(oTAmount, 2)) {
						this._fnShowErrorMessage("Total request amount exceeded SDF capped amount");
						return;
					}
				}
				if (Dmodel === "SDFClaim_Master") {
					var oAmnt = oMasterData.SDF_APPROVED_AMOUNT,
						oCalamnt = parseFloat(oTAmount, 0);
					if (oCalamnt > oAmnt) {
						this._fnShowErrorMessage("Please check SDF approved amount");
						return;
					}
				}
				if (Dmodel === "CPClaim_Master") {
					var oAmntcpc = oMasterData.CPR_AMOUNT,
						oCalamntcpc = parseFloat(oTAmount, 0);
					if (oCalamntcpc > oAmntcpc) {
						this._fnShowErrorMessage("Please check CPR approved amount");
						return;
					}
				}
			}*/

			this._fnAddInLineWRC(oMode, oModel, oMasterData, oNameTile, model, Dmodel, name, oIndex);

			// if ((model === "WorkRelated" || model === "WorkRelatedHR") && oMode === "Add") {
			// 	if (this._fnIsDuplicateRecordN(oModel, oMasterData)) {
			// 		return;
			// 	}
			// 	this._fnAddInLineWRC(oMode, oModel, oMasterData, oNameTile, model, Dmodel, name, oIndex);
			// } else {
			// 	this._fnAddInLineWRC(oMode, oModel, oMasterData, oNameTile, model, Dmodel, name, oIndex);
			// }
		},

		_fnAddInLineWRC: function (oMode, oModel, oMasterData, oNameTile, model, Dmodel, name, oIndex) {
			if (oIndex === undefined || oIndex === "") {
				oModel.LINE_ITEM_REFERENCE_NUMBER = new Date().getTime().toString();
			}

			if (oMode === "Add") {
				oModel.LINE_ITEM_REFERENCE_NUMBER = new Date().getTime().toString();
				if (this.oViewData.getProperty("/oTile") === "Form" || this.oViewData.getProperty("/oTile") === "Admin" || this.oViewData.getProperty(
						"/oTile") === "AdminSch") {
					oModel.EMPLOYEE_ID = this.oViewData.getProperty("/EmpID");
				} else {
					oModel.EMPLOYEE_ID = oMasterData.EMPLOYEE_ID;
				}
				$.ajax({
					url: "/BenefietCAP/claim/validateClaimSubmission",
					data: JSON.stringify({
						"claimCode": oModel.CLAIM_CODE,
						"claimReference": oModel.CLAIM_REFERENCE,
						"claimDate": oModel.CLAIM_DATE,
						"receiptDate": oModel.RECEIPT_DATE === undefined ? null : oModel.RECEIPT_DATE,
						"receiptNumber": oModel.RECEIPT_NUMBER ? oModel.RECEIPT_NUMBER : "",
						"invoiceDate": oModel.INVOICE_DATE === undefined ? null : oModel.INVOICE_DATE,
						"invoiceNumber": oModel.INVOICE_NUMBER ? oModel.INVOICE_NUMBER : "",
						"isHr": (oNameTile === "Admin" || oNameTile === "AdminSch" || oMasterData.BEHALF_FLAG === "Y" || oNameTile ===
							"SMSApprovals") ? "X" : "",
						"employeeId": oMasterData.CATEGORY_CODE === "PAY_UP" ? oModel.SCHOLAR_ID : oModel.EMPLOYEE_ID,
						"isMode": "X"
					}),
					method: "POST",
					crossDomain: true,
					headers: {
						"Accept": "application/json",
						"Content-Type": "application/json"
					},
					success: function (data) {
						if (model === "WorkRelated" || model === "WorkRelatedHR") {
							this._fnAddlineWRC(oModel, oMasterData, Dmodel, oIndex, oMode);
							// if (oModel.CLAIM_CODE === "WRCWKONPH" || oModel.CLAIM_CODE === "WRCPHNONWD") {
							// 	this.validatePublicHol(oMasterData, Dmodel, oModel, oIndex, oMode);
							// } else {
							// 	this._fnAddlineWRC(oModel, oMasterData, Dmodel, oIndex, oMode);
							// }
						} else {
							oMasterData.LINE_ITEM.push(oModel);
							this.eDialogM.getModel(Dmodel).refresh(true);
							this.onCloseLineDialog(true);
						}

					}.bind(this),
					error: function (response) {
						this.handleErrorDialog(response);
					}.bind(this)
				});
			} else {
				$.ajax({
					url: "/BenefietCAP/claim/validateClaimSubmission",
					data: JSON.stringify({
						"claimCode": oModel.CLAIM_CODE,
						"claimReference": oModel.CLAIM_REFERENCE,
						"claimDate": oModel.CLAIM_DATE,
						"receiptDate": oModel.RECEIPT_DATE === undefined ? null : oModel.RECEIPT_DATE,
						"receiptNumber": oModel.RECEIPT_NUMBER ? oModel.RECEIPT_NUMBER : "",
						"invoiceDate": oModel.INVOICE_DATE === undefined ? null : oModel.INVOICE_DATE,
						"invoiceNumber": oModel.INVOICE_NUMBER ? oModel.INVOICE_NUMBER : "",
						"isHr": (oNameTile === "Admin" || oNameTile === "AdminSch" || oMasterData.BEHALF_FLAG === "Y" || oNameTile ===
							"SMSApprovals") ? "X" : "",
						"employeeId": oMasterData.CATEGORY_CODE === "PAY_UP" ? oModel.SCHOLAR_ID : oModel.EMPLOYEE_ID,
						"isMode": "X"
					}),
					method: "POST",
					crossDomain: true,
					headers: {
						"Accept": "application/json",
						"Content-Type": "application/json"
					},
					success: function (data) {
						if (model === "WorkRelated" || model === "WorkRelatedHR") {
							this._fnAddlineWRC(oModel, oMasterData, Dmodel, oIndex, oMode);
						} else {
							if (oIndex === undefined || oIndex === "") {
								oMasterData.LINE_ITEM.push(oModel);
								this.eDialogM.getModel(Dmodel).refresh(true);
								this.onCloseLineDialog(true);
							} else {
								oMasterData.LINE_ITEM[oIndex] = oModel;
								this.eDialogM.getModel(Dmodel).refresh(true);
								this.onCloseLineDialog(true);
							}
						}
					}.bind(this),
					error: function (response) {
						this.handleErrorDialog(response);
					}.bind(this)
				});

			}
		},

		_fnAddlineWRC: function (oModel, oMasterData, Dmodel, oIndex, oMode) {
			$.ajax({
				url: "/BenefietCAP/claim/validateDuplicateWRCClaim",
				data: JSON.stringify({
					"claimReference": oModel.CLAIM_REFERENCE,
					"employeeId": oModel.EMPLOYEE_ID,
					"claimCode": oModel.CLAIM_CODE,
					"claimDate": oModel.CLAIM_DATE,
					"claimCategory": Dmodel === "WorkRelated_Master" ? "WRC" : "WRC_HR"
				}),
				method: "POST",
				crossDomain: true,
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json"
				},
				success: function (oData) {
					var key = oModel.CLAIM_CODE;
					if (key === "KKH" || key === "LOCUM" || key === "MRF" || key === "NSCNC" || key === "WRCM") {
						if (oMode === "Add" || (oMode === "Edit" && (oIndex === undefined || oIndex === ""))) {
							oMasterData.LINE_ITEM.push(oModel);
						} else {
							if ((oMode === "Edit" && (oIndex === undefined || oIndex === ""))) {
								oMasterData.LINE_ITEM.push(oModel);
							} else {
								oMasterData.LINE_ITEM[oIndex] = oModel;
							}
						}
						this.eDialogM.getModel(Dmodel).refresh(true);
						this.onCloseLineDialog(true);
					} else {
						this._fnAddDataWRC(oModel, oMasterData, Dmodel, oData, oIndex, oMode);
					}
				}.bind(this),
				error: function (response) {
					this.handleErrorDialog(response);
				}.bind(this)
			});
		},

		_fnAddDataWRC: function (oModel, oMasterData, Dmodel, oData, oIndex, oMode) {
			$.ajax({
				url: "/BenefietCAP/claim/getWrcClaimAmount",
				data: JSON.stringify({
					"claimCode": oModel.CLAIM_CODE,
					"employeeId": oModel.EMPLOYEE_ID,
					"claimDate": oModel.CLAIM_DATE,
					"claimUnit": oModel.CLAIM_UNIT
				}),
				method: "POST",
				crossDomain: true,
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json"
				},
				success: function (oResp) {
					this.oViewData.getData().AmountWRC.push(oResp.claimDetails);
					oModel.CLAIM_AMOUNT = oResp.claimDetails.AMOUNT;
					if (oMode === "Add") {
						oMasterData.LINE_ITEM.push(oModel);
					} else {
						if ((oMode === "Edit" && (oIndex === undefined || oIndex === ""))) {
							oMasterData.LINE_ITEM.push(oModel);
						} else {
							oMasterData.LINE_ITEM[oIndex] = oModel;
						}
					}
					this.eDialogM.getModel(Dmodel).refresh(true);
					this.onCloseLineDialog(true);
				}.bind(this),
				error: function (response) {
					this.handleErrorDialog(response);
				}.bind(this)
			});

		},

		onDeleteLineItem: function (tableid, model) {
			var oTable = this._getFragmentTextPos(model, tableid),
				selectedItems = oTable.getSelectedItems(),
				oWRCAmnt = this.oViewData.getData(),
				oData = oTable.getModel(model).getData();
			for (var j = selectedItems.length - 1; j >= 0; j--) {
				var jdx = oTable.indexOfItem(selectedItems[j]);
				oData.LINE_ITEM.splice(jdx, 1);
				oWRCAmnt.AmountWRC.splice(jdx, 1);
			}
			this.oViewData.refresh(true);
			oTable.removeSelections(true);
			oTable.getModel(model).refresh(true);
		},

		onUpdateWRC: function (oEvent, model, amount) {
			var oWRCAmnt = this.oViewData.getData().AmountWRC;
			var oAmount = 0.00,
				oTAmount = 0.00,
				oLocRo = this.getView().getModel("oLocationRO").getData(),
				oAppr = this.getView().getModel("oApprovers").getData(),
				data = oEvent.getSource().getModel(model).getData(),
				oModel = oEvent.getSource().getModel(model);

			if (model === "PUpload_Master") {
				if (this.oViewData.getProperty("/oTile") === "History") {
					var oFilter = [],
						oEmp = this.oViewData.getProperty("/EmpID");
					oFilter.push(new Filter("SCHOLAR_ID", FilterOperator.EQ, oEmp));
					oEvent.getSource().getBinding("items").filter(oFilter, true);
				}
				this.oViewData.setProperty("/PayUpLength", oEvent.getSource().getBinding("items").iLength);
			}

			if ((model === "WorkRelated_Master" || model === "WorkRelatedHR_Master")) {
				if (data.LINE_ITEM.length > 0) {
					for (var i = 0; i < (data.LINE_ITEM).length; i++) {
						oAmount += parseFloat(data.LINE_ITEM[i].CLAIM_AMOUNT, 10);
					}
					if (oLocRo.length === 0 && data.CLAIM_STATUS === "Pending for Submission") {
						this.onWRCSubmissiondate(data.LINE_ITEM[0], model, oModel);
					}
					data.CLAIM_AMOUNT = oAmount.toFixed(2);
					oEvent.getSource().getModel(model).refresh();
				} else {
					data.FIRST_LEVEL_APPROVER = "";
					oEvent.getSource().getModel(model).refresh(true);
					this.getView().setModel(new JSONModel([]), "oLocationRO");
				}
			} else {

				if (!amount) {
					amount = "CLAIM_AMOUNT";
				}

				for (var j = 0; j < (data.LINE_ITEM).length; j++) {
					oAmount += parseFloat(data.LINE_ITEM[j][amount], 10);
				}
				if ((model === "SDFRClaim_Master" || model === "SDFClaim_Master") && data.LINE_ITEM.length > 0) {
					amount = model === "SDFRClaim_Master" ? "ESTIMATE_COST" : "CLAIM_AMOUNT";
					for (var k = 0; k < (data.LINE_ITEM).length; k++) {
						oTAmount += parseFloat(data.LINE_ITEM[k][amount], 10);
					}
					if (model === "SDFRClaim_Master") {
						data.CURRENCY = data.LINE_ITEM[0].CURRENCY;
					} else {
						this.oViewData.setProperty("/ToTAL_SCH_CURR", data.LINE_ITEM[0].CURRENCY);
					}
				}
				if (model === "SDFRClaim_Master") {
					data.ORG_CLAIM_AMOUNT = oTAmount.toFixed(2);
				} else {
					this.oViewData.setProperty("/ToTAL_SCH_AMOUNT", oTAmount.toFixed(2));
				}

				if (oAppr.length === 0 && data.LINE_ITEM.length > 0) {
					this.onReceiptDate("A", data);
				}

				if (model === "OClaim_Master") {
					data.CURRENCY = data.LINE_ITEM[0].CURRENCY;
				}
				data.CLAIM_AMOUNT = oAmount.toFixed(2);
				oModel.refresh();
				if (model === "Sponsorship_Master" && data.LINE_ITEM.length > 0) {
					$.ajax({
						url: "/BenefietCAP/claim/calculateCoPayment",
						data: JSON.stringify({
							"claimCode": data.LINE_ITEM[0].CLAIM_CODE,
							"claimAmount": data.CLAIM_AMOUNT,
							"balance": 0.00
						}),
						method: "POST",
						crossDomain: true,
						headers: {
							"Accept": "application/json",
							"Content-Type": "application/json"
						},
						success: function (dataVal) {
							this.hasChange = false;
							data.CLAIM_AMOUNT = dataVal.claimAmount;
							oModel.refresh();
						}.bind(this),
						error: function (response) {
							this.handleErrorDialog(response);
						}.bind(this)
					});
				}
			}
		},

		onLineItem: function (oEvent, name, mode) {
			var oContext = oEvent.getSource().getBindingContext(name + "_Master"),
				sPath = oContext.getPath().replace(/^\D+/g, ""),
				sIndex = parseInt(sPath, 0),
				oData = oContext.getObject();
			this.oViewData.setProperty("/TMode", mode);
			this.oViewData.setProperty("/oLineItemIndex", sIndex);
			this.oViewData.setProperty("/oClaimCode", oData.CLAIM_CODE);
			if (name === "PUpload") {
				this.oViewData.setProperty("/PAYMENT", this.eDialogM.getModel(name + "_Master").getProperty("/PAYMENT"));
			}

			this.eDialog = Fragment.load({
				id: this.createId(name),
				name: "BenefitClaim.ZBenefitClaim.fragments." + name,
				controller: this
			}).then(function (oDialog) {
				this.eDialog = oDialog;
				this.getView().addDependent(this.eDialog);
				this.oLineItem = $.extend(true, {}, oData);
				this.eDialog.setModel(new JSONModel(oData), name);
				this.eDialog.getModel(name).attachPropertyChange(function (oEvt) {
					this.mDataModelChange(oEvt, oData);
				}, this);
				var sModelProperty = "RECEIPT_DATE";
				if (name === "WorkRelated" || name === "WorkRelatedHR") {
					sModelProperty = "CLAIM_DATE";
				}
				if (name === "CPClaim" || name === "OClaim" || name === "PUpload" || name === "SDFClaim") {
					sModelProperty = "INVOICE_DATE";
				}
				this.loadDatePicker(this.eDialog.getModel(name), "edit", sModelProperty, name, "datePicker");
				if (name === "Covid" || name === "Sponsorship" || name === "Transportation" || name === "WorkRelated" || name ===
					"WorkRelatedHR" || name === "CPClaim" || name === "OClaim" || name === "SDFClaim") {
					this.onDisplayFiles(oData.CLAIM_REFERENCE);
				}
				this._fnCurrencyRate(oData.CURRENCY);
				this.eDialog.open();
			}.bind(this));
		},

		_fnAppValidationLine: function (data) {
			var oCont = this.oViewData.getData().AttachValidation,
				oValCont = [];
			$.each(oCont[0], function (idx, obj) {
				if (data.parent_CLAIM_CATEGORY === "TC" || data.parent_CLAIM_CATEGORY.includes("SP") || data.parent_CLAIM_CATEGORY === "COV" ||
					data.parent_CLAIM_CATEGORY === "WRC" || data.parent_CLAIM_CATEGORY === "WRC_HR") {
					if (obj.Claim_Code === data.CLAIM_CODE && obj.Company === "MOHH") {
						oValCont.push(obj);
					}
				}
			});
			oValCont.sort(function (a, b) {
				return new Date(a.Start_Date) - new Date(b.Start_Date); // descending
			});
			return oValCont[0];

		},

		_fnIsDuplicateRecord: function (key) {
			var isValidate = false,
				oCont = this.eDialogM.getModel("WorkRelated_Master").getData().LINE_ITEM;
			if (oCont.length > 0 && oCont !== undefined) {
				var aDupRec = $.grep(oCont, function (element, index) {
					var obj1 = JSON.parse(JSON.stringify(element));
					return obj1.CLAIM_CODE === key;
				});
				if (aDupRec.length > 0) {
					isValidate = true;
					this._fnShowErrorMessage("Duplicate claim");
				}
				return isValidate;
			}
			return isValidate;
		},

		_fnIsDuplicateRecordN: function (oModel, oMasterModel) {
			var isValidate = false,
				oCont = oMasterModel.LINE_ITEM;
			if (oCont !== undefined) {
				if (oCont.length > 0) {
					var aDupRec = $.grep(oCont, function (element, index) {
						var obj1 = JSON.parse(JSON.stringify(element));
						if (obj1.CLAIM_CODE === "WRNUHSML" || obj1.CLAIM_CODE === "WRCWKONPH" || obj1.CLAIM_CODE === "WRCPHNONWD" || obj1.CLAIM_CODE ===
							"WRDPCBWD" || obj1.CLAIM_CODE === "TTPCICB" || obj1.CLAIM_CODE === "WRDPCBWE" || obj1.CLAIM_CODE === "WREDSF") {
							//
						} else {
							return obj1.CLAIM_CODE === oModel.CLAIM_CODE && obj1.CLAIM_DATE === oModel.CLAIM_DATE;
						}
					});
					if (aDupRec.length > 0) {
						isValidate = true;
						this._fnShowErrorMessage("A similar claim on the same day has been submitted earlier");
					}
					return isValidate;
				}
			}
			return isValidate;
		},

		_fnIsDuplicateRecordTC: function (oModel, oMasterModel) {
			var isValidate = false,
				oCont = oMasterModel.LINE_ITEM;
			if (oCont !== undefined) {
				if (oCont.length > 0) {
					var aDupRec = $.grep(oCont, function (element, index) {
						var obj1 = JSON.parse(JSON.stringify(element));
						return obj1.RECEIPT_NUMBER === oModel.RECEIPT_NUMBER && obj1.CLAIM_REFERENCE !== oModel.CLAIM_REFERENCE;
					});
					if (aDupRec.length > 0) {
						isValidate = true;
						this._fnShowErrorMessage("Duplicate receipt number");
					}
					return isValidate;
				}
			}
			return isValidate;
		},

		_fnIsDuplicateRecordSMS: function (oModel, oMasterModel) {
			var isValidate = false,
				oCont = oMasterModel.LINE_ITEM;
			if (oCont !== undefined) {
				if (oCont.length > 0) {
					var aDupRec = $.grep(oCont, function (element, index) {
						var obj1 = JSON.parse(JSON.stringify(element));
						return obj1.INVOICE_NUMBER === oModel.INVOICE_NUMBER && obj1.CLAIM_REFERENCE !== oModel.CLAIM_REFERENCE;
					});
					if (aDupRec.length > 0) {
						isValidate = true;
						this._fnShowErrorMessage("Duplicate invoice number");
					}
					return isValidate;
				}
			}
			return isValidate;
		},

		_fnIsValidateRecord: function (key, date, model) {
			var isValidate = false,
				oCont = this.eDialogM.getModel(model + "_Master").getData().LINE_ITEM;
			var oExpClaim = ["WRNDWDF", "WRNDWDH"],
				oExpClaims = ["WRNDWEF", "WRNDWEH"];

			if (oExpClaim.includes(key)) {
				key = key === "WRNDWDF" ? "WRNDWDH" : "WRNDWDF";
			}
			if (oExpClaims.includes(key)) {
				key = key === "WRNDWEF" ? "WRNDWEH" : "WRNDWEF";
			}
			if (oCont !== undefined) {
				if (oCont.length > 0) {
					var aDupRec = $.grep(oCont, function (element, index) {
						var obj1 = JSON.parse(JSON.stringify(element));
						return obj1.CLAIM_CODE === key && obj1.CLAIM_DATE === date;
					});
					if (aDupRec.length > 0) {
						isValidate = true;
						this._fnShowErrorMessage(key + " cannot be included in this submission, Please change the claim date");
					}
				}
			}
			return isValidate;
		},

		onClaimCatSel: function (oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem"),
				name = this.oViewData.getProperty("/oDlgName"),
				oEmpId = this.oViewData.getProperty("/EmpID"),
				oNameTile = this.oViewData.getProperty("/oTile"),
				oAdmin = this.oViewData.getProperty("/LoginID"),
				sURL = "/BenefietCAP/calclaim/getEmployeeHrChecker(EMPLOYEE_ID='" + oEmpId + "',CLAIMCODE='" + oSelectedItem.getTitle() +
				"',HR_MAKER_LOGGED='" + oAdmin + "')/Set";
			this.oViewData.setProperty("/oClaimCode", oSelectedItem.getTitle());
			this.oViewData.setProperty("/ALength", 0);
			this.oViewData.setProperty("/oLineItemIndex", "");
			this.oViewData.setProperty("/oCompute", false);

			if ((oNameTile === "Admin") && this.oViewData.getProperty("/ClaimType") !== "PAY_UP") {
				$.ajax({
					type: "GET",
					method: "GET",
					url: sURL,
					dataType: "json",
					success: function (response) {
						if (response.value.length > 0) {
							this._fnClaimOpen(oEmpId, oSelectedItem, name);
						} else {
							this._fnShowErrorMessage("You do not have access to the selected staff's claim info");
						}
					}.bind(this),
					error: function (response) {
						this.handleErrorDialog(response);
					}.bind(this)
				});
			} else {
				this._fnClaimOpen(oEmpId, oSelectedItem, name);
			}
		},

		_fnClaimOpen: function (oEmpId, oSelectedItem, name) {
			var iURL = "/BenefietCAP/claim/EmployeeEligibility(UserID='" + oEmpId + "')/Set?$filter=Claim_Code eq '" + oSelectedItem.getTitle() +
				"'";
			if (oSelectedItem.getTitle() === "HOSPD" || oSelectedItem.getTitle() === "OPTD" || oSelectedItem.getTitle() === "SPTD") {
				this.onLoadDep(oEmpId);
			}

			$.ajax({
				url: iURL,
				method: "GET",
				crossDomain: true,
				dataType: "json",
				success: function (data, oResponse) {
					var oData = data.value;
					if (oData.length === 0 || (oData[0].Entitlement === 0 && (name === "Hospitialisation" || name === "TrainingFund"))) {
						this._fnShowErrorMessage("Staff is not eligible for this claim");
					} else if (name === "Hospitialisation" || name === "TrainingFund") {
						this.oViewData.getData().oEntit = [];
						this.oViewData.getData().oEntit.push(oData[0]);
						this.fnProrationRule(oSelectedItem.getTitle(), name, oEmpId);
						this.onClaimOpen(oSelectedItem, name);
					} else {
						if (name === "PettyCash" || name === "ABcls" || name === "Ahpreim" || name === "Licence" || name === "Reimbursement" ||
							name ===
							"WorkInjury") {
							this.onClaimOpen(oSelectedItem, name);
							this.fnGetBalancAmnt(this.oViewData.getProperty("/ClaimType"), oEmpId);
						} else {
							this.onClaimOpen(oSelectedItem, name);
						}
					}
				}.bind(this),
				error: function (xhr, ajaxOptions, throwError) {
					this.getView().setBusy(false);
					this.handleErrorDialog(xhr);
				}.bind(this)
			});
			/*} else {
				this.onClaimOpen(oSelectedItem, name);
				this.fnGetBalancAmnt(this.oViewData.getProperty("/ClaimType"), oEmpId);
			}*/
		},

		fnGetBalancAmnt: function (code, emp, oEntit) {

			if (code === "SDFR") {
				$.ajax({
					url: "/BenefietCAP/calclaim/getSDFClaimBalanceDetails(USER_ID='" + emp + "')",
					method: "GET",
					crossDomain: true,
					dataType: "json",
					success: function (data, oResponse) {
						if (data) {
							this.getView().setModel(new JSONModel(data), "oEligCalData");
						} else {

						}
					}.bind(this),
					error: function (xhr, ajaxOptions, throwError) {
						this.getView().setBusy(false);
						this.handleErrorDialog(xhr);
					}.bind(this)
				});
			} else {

				$.ajax({
					url: "/BenefietCAP/calclaim/getClaimBalanceDetails(USER_ID='" + emp + "',CLAIM_YEAR='" + new Date().getFullYear() +
						"')/Set?$filter=CLAIM_CODE_VALUE eq '" +
						code + "'",
					method: "GET",
					crossDomain: true,
					dataType: "json",
					success: function (data, oResponse) {
						var oData = data.value;
						if (oData.length > 0) {
							var oBalnc, oClaim = this.oViewData.getProperty("/ClaimType");
							if (this.oViewData.getProperty("/oTile") === "Approvals" && oClaim === "PTF") {
								oBalnc = parseFloat(oData[0].ENTITLEMENT) - parseFloat(oData[0].TAKEN_AMOUNT);
								oData[0].BALANCE = parseFloat(oBalnc).toFixed(2);
								this.getView().setModel(new JSONModel(oData[0]), "oEligCalData");
								this.onCopayCal("Q", "TrainingFund", "Q", parseFloat(oBalnc).toFixed(2));
							} else {
								this.getView().setModel(new JSONModel(oData[0]), "oEligCalData");
							}
						} else {
							this.getView().setModel(new JSONModel({
								"TAKEN_AMOUNT": 0,
								"PENDING_AMOUNT": 0,
								"ENTITLEMENT": 0,
								"BALANCE": 0
							}), "oEligCalData");
						}
					}.bind(this),
					error: function (xhr, ajaxOptions, throwError) {
						this.getView().setBusy(false);
						this.handleErrorDialog(xhr);
					}.bind(this)
				});
			}
		},

		fnGetPTF: function (emp, status) {
			$.ajax({
				url: "/BenefietCAP/claim/YTDReportWithCPIAll(USER_ID='" + emp + "',CLAIM_YEAR='" + new Date().getFullYear() +
					"',PERSONAL_SUB_AREA='',PERSONAL_AREA_IN='',PAY_GRADE='',DIVISION='')",
				method: "GET",
				crossDomain: true,
				dataType: "json",
				success: function (data, oResponse) {
					$.ajax({
						url: "/BenefietCAP/claim/PRORATED_CLAIMS_YTD?$filter=EMPLOYEE eq '" + emp + "' and YEAR eq '" + new Date().getFullYear() +
							"' and CLAIM_CODE_VALUE eq 'PTF'",
						method: "GET",
						crossDomain: true,
						dataType: "json",
						success: function (odata) {
							var oData = odata.value;
							if (oData.length > 0) {
								var oBalnc;
								if (this.oViewData.getProperty("/oTile") === "Approvals") {
									oBalnc = parseFloat(oData[0].ENTITLEMENT) - parseFloat(oData[0].TAKEN_AMOUNT);
									oData[0].BALANCE = parseFloat(oBalnc).toFixed(2);
									this.getView().setModel(new JSONModel(oData[0]), "oEligCalData");
									if (!status.includes("Cancellation")) {
										this.onCopayCal("Q", "TrainingFund", "Q", parseFloat(oBalnc).toFixed(2));
									}
								} else {
									this.getView().setModel(new JSONModel(oData[0]), "oEligCalData");
								}
							} else {
								this.getView().setModel(new JSONModel({
									"TAKEN_AMOUNT": 0,
									"PENDING_AMOUNT": 0,
									"ENTITLEMENT": 0,
									"BALANCE": 0
								}), "oEligCalData");
							}
						}.bind(this),
						error: function (xhr, ajaxOptions, throwError) {
							this.getView().setBusy(false);
							this.handleErrorDialog(xhr);
						}.bind(this)
					});
				}.bind(this),
				error: function (xhr, ajaxOptions, throwError) {
					this.getView().setBusy(false);
					this.handleErrorDialog(xhr);
				}.bind(this)
			});
		},

		fnGetEntitBalnc: function (code, oEntit, emp, status) {
			$.ajax({
				url: "/BenefietCAP/claim/claimDetails",
				data: JSON.stringify({
					"claim": {
						"employeeId": emp,
						"Claim_Code": code,
						"company": this.getView().getModel("oEmpData").getData().COMPANY,
						"entitlement": oEntit,
						"taken": 0,
						"pending": 0,
						"YTDConsultation": 0,
						"YTDOthers": 0,
						"balance": 0,
						"claimDate": this._getCurrentDate(),
						"totalWardDays": 0,
						"consumedWardDays": 0.0,
						"remainingWardDays": 0,
						"pendingWardDays": 0,
						"claimAmountWW": 0,
						"claimAmountWWPending": 0
					}
				}),
				method: "POST",
				crossDomain: true,
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json"
				},
				success: function (oData, oResp) {
					this.oViewData.refresh(true);
					this.getView().setModel(new JSONModel(oData), "oEligCalData");
					if ((this.oViewData.getProperty("/oTile") === "Approvals" && !status.includes("Cancellation Pending")) || status ===
						"Pending for Submission") {
						this.onCalculateAmount("Q", "Hospitialisation");
					}
				}.bind(this),
				error: function (xhr, ajaxOptions, throwError) {
					this.handleErrorDialog(xhr);
				}.bind(this)
			});
		},

		fnProrationRule: function (code, name, emp, status) {
			var oEntit = this.oViewData.getData().oEntit;
			var Payload = {
				"UserID": emp,
				"Entitlement": oEntit[0].Entitlement === "null" ? 0 : oEntit[0].Entitlement === "" ? 0 : oEntit[0].Entitlement,
				"EmpType": "",
				"WorkingPeriod": "",
				"ClaimDetail": {
					"Date": this._getCurrentDate(),
					"Company": this.getView().getModel("oEmpData").getData().COMPANY,
					"Claim_Code": code,
					"Claim_Category": this.oViewData.getProperty("/ClaimType")
				}
			};
			$.ajax({
				url: "/BenefietCAP/claim/ProrationRule1",
				data: JSON.stringify(Payload),
				method: "POST",
				crossDomain: true,
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json"
				},
				success: function (data, oResponse) {
					oEntit[0].Entitlement = parseFloat(data.value.value).toFixed(2);
					if (name === "Hospitialisation") {
						this.fnGetEntitBalnc(code, oEntit[0].Entitlement, emp, status);
					} else if (name === "TrainingFund") {
						this.fnGetPTF(emp, status);
					} else {
						this.fnGetBalancAmnt(code, emp, oEntit[0].Entitlement);
					}
				}.bind(this),
				error: function (xhr, ajaxOptions, throwError) {
					this.handleErrorDialog(xhr);
				}.bind(this)
			});
		},

		onClaimOpen: function (oSelectedItem, name) {
			var eDialog = "_o" + name + "Dialog",
				oType = this.oViewData.getProperty("/ClaimType");
			this.hasChange = false;
			this._fnDlgBtnTxtAdd(name + " Expense");
			if (!this.oViewData.getProperty("/TMode")) {
				this.oViewData.setProperty("/TMode", "Add");
			}
			this.oViewData.setProperty("/DMode", true);
			this.eDialog = Fragment.load({
				id: this.createId(name),
				name: "BenefitClaim.ZBenefitClaim.fragments." + name,
				controller: this
			}).then(function (oDialog) {
				this.eDialog = oDialog;
				this.getView().addDependent(this.eDialog);
				this.eDialog.setModel(new JSONModel({
					"CLAIM_DATE": this._getCurrentDate(),
					"CLAIM_REFERENCE": oSelectedItem.getTitle() + new Date().getTime().toString(),
					"EMPLOYEE_ID": this.oViewData.getProperty("/EmpID"),
					"CLAIM_CODE": oSelectedItem.getTitle(),
					"CLAIM_CATEGORY": oSelectedItem.getDescription()
				}), name);
				if (name === "WorkRelated" || name === "WorkRelatedHR") {
					var odata = this.eDialog.getModel(name).getData();
					odata.CLAIM_UNIT = parseInt(1, 10);
					this.eDialog.getModel(name).refresh(true);
				} else {
					this.eDialog.getModel(name).attachPropertyChange(function (oEvt) {
						this.mDataModelChange(oEvt, odata);
					}, this);
				}
				if (name === "Ahpreim" || name === "Reimbursement" || name === "Licence") {
					var odataval = this.eDialog.getModel(name).getData();
					odataval.EXPENSE_TYPE = oSelectedItem.getTitle();
					odataval.DESCRIPTION = oSelectedItem.getDescription();
					this.eDialog.getModel(name).refresh(true);
				}
				if (name === "Sponsorship") {
					var odatavl = this.eDialog.getModel(name).getData();
					odatavl.EXCHANGE_RATE = 1.00;
					this.eDialog.getModel(name).refresh(true);
				}
				if (oType === "AHP" || oType === "CLS" || oType === "LIC" || oType === "MC" || oType === "MSR" || oType === "PC" || oType ===
					"PTF" || oType === "TIM" || oType === "WIC" || oType === "CPR") {
					var odatavle = this.eDialog.getModel(name).getData();
					odatavle.CLAIM_STATUS = "Pending for Submission";
					this.eDialog.getModel(name).refresh(true);
				}

				if (name === "CPClaim" || name === "OClaim" || name === "PRequest" || name === "SDFClaim" || name === "SDFRClaim" || name ===
					"PUpload") {
					var aURL = "/BenefietCAP/claim/BANK_ACC?$filter=externalCode eq '" + this.oViewData.getProperty("/EmpID") +
						"'&$orderby=effectiveStartDate desc";
					if (name === "PUpload") {
						var oDataPay = this.eDialogM.getModel(name + "_Master").getData();
						this._fnAccountDetaila(aURL, name, "Form", oDataPay.PAYMENT);
					} else {
						this._fnAccountDetaila(aURL, name, "Form");
					}
				}
				var sModelProperty = "RECEIPT_DATE";
				if (name === "ABcls" || name === "Hospitialisation" || name === "Reimbursement" ||
					name === "WorkInjury" || name === "Licence" || name === "Ahpreim" || name === "PettyCash" ||
					name === "Timesheet") {
					if (name === "Timesheet") {
						sModelProperty = "CLAIM_DATE";
					}
					this.loadDatePicker(this.eDialog.getModel(name), "create", sModelProperty, name, "datePicker", "A");
				} else if (name === "WorkRelated" || name === "WorkRelatedHR") {
					sModelProperty = "CLAIM_DATE";
					this.loadDatePicker(this.eDialog.getModel(name), "edit", sModelProperty, name, "datePicker");
				} else if (name === "TrainingFund") {
					sModelProperty = "START_DATE";
					this.loadDatePicker(this.eDialog.getModel(name), "create", sModelProperty, name, "datePicker1");
					sModelProperty = "END_DATE";
					this.loadDatePicker(this.eDialog.getModel(name), "create", sModelProperty, name, "datePicker2");
					sModelProperty = "RECEIPT_DATE";
					this.loadDatePicker(this.eDialog.getModel(name), "create", sModelProperty, name, "datePicker3", "A");
				} else if (name === "Transportation") {
					sModelProperty = "RECEIPT_DATE";
					this.loadDatePicker(this.eDialog.getModel(name), "create", sModelProperty, name, "datePicker", "TC");
				} else if (name === "CPClaim" || name === "OClaim" || name === "PUpload" || name === "SDFClaim") {
					sModelProperty = "INVOICE_DATE";
					this.loadDatePicker(this.eDialog.getModel(name), "create", sModelProperty, name, "datePicker");
				} else {
					this.loadDatePicker(this.eDialog.getModel(name), "create", sModelProperty, name, "datePicker");
				}
				this.eDialog.open();
			}.bind(this));

			this.eDialog.then(function (oDialog) {
				if (name === "Timesheet") {
					var odata = this.eDialog.getModel(name).getData();
					odata.CATEGORY_CODE = "TIM";
					this.onReceiptDate("A", odata);
				}
				if (name === "PRequest") {
					this.hasChange = false;
					var odata1 = this.eDialog.getModel(name).getData();
					odata1.CATEGORY_CODE = "CPR";
					this.onReceiptDate("A", odata1);
				}
			}.bind(this));

		},

		onLoadDep: function (oEmp) {
			// var oEmp = this.oViewData.getProperty("/EmpID");
			$.ajax({
				url: "/BenefietCAP/sfservice/PerPersonRelationship?$filter=personIdExternal eq '" + oEmp + "' and customString6 eq 'Yes'",
				method: "GET",
				crossDomain: true,
				success: function (data, oResponse) {
					this.getView().setModel(new JSONModel(data.value), "oDepData");
				}.bind(this),
				error: function (xhr, ajaxOptions, throwError) {
					this.handleErrorDialog(xhr);
				}.bind(this)
			});
		},
		onChangeDeped: function (oEvent) {
			var oKey = oEvent.getSource().getSelectedKey();
			this.eDialog.getModel("Hospitialisation").setProperty("/RELATION_TYPE", oKey);
			this.eDialog.getModel("Hospitialisation").refresh(true);
		},

		onCalCopay: function (data, key) {
			var oClaim;
			if (key === "A") {
				oClaim = data.LINE_ITEM[0].CLAIM_CODE;
			} else {
				oClaim = data.CLAIM_CODE;
			}
			$.ajax({
				url: "/BenefietCAP/claim/calculateCoPayment",
				data: JSON.stringify({
					"claimCode": oClaim,
					"claimAmount": data.CLAIM_AMOUNT,
					//Sahas as per my Service Change to Balance
					"balance": this.getView().getModel("oEligCalData").oData.BALANCE != null ? this.getView().getModel("oEligCalData").oData.BALANCE : 0.00
						// "balance": 0.00
						//End Sahas as per my Service Change to Balance
				}),
				method: "POST",
				crossDomain: true,
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json"
				},
				success: function (odata) {
					data.CLAIM_AMOUNT = odata.claimAmount;
				}.bind(this),
				error: function (response) {
					this.handleErrorDialog(response);
				}.bind(this)
			});
		},

		onAddData: function (oEvent, modelname, key) {
			var name = this.oViewData.getProperty("/oDlgName"),
				oClaimName = this.oViewData.getProperty("/ClaimType"),
				oClaimCode = this.oViewData.getProperty("/oClaimCode"),
				oLen = this.oViewData.getProperty("/ALength"),
				valid = this._fnAttachReq(oClaimCode);
			var oDlgData,
				oMode = this.oViewData.getProperty("/TMode"),
				iURL = this.fnPostEntity(),
				oNameTile = this.oViewData.getProperty("/oTile");

			if (oClaimName === "WRC_HR" || oClaimName === "WRC" || oClaimName === "COV" || oClaimName === "TC" || oClaimName.includes("SP") ||
				oClaimName.includes("SDF") || oClaimName === "OC" || oClaimName === "CPC" || oClaimName === "PAY_UP") {
				iURL = "/BenefietCAP/claim/" + oClaimName + "_MASTER_CLAIM";
				oDlgData = this.eDialogM.getModel(modelname).getData();
				oDlgData.CLAIM_CATEGORY = oClaimName;
				oDlgData.CATEGORY_CODE = oClaimName;
				if (valid && oLen === 0 && (oClaimName === "SDFR" || oClaimName === "PAY_UP")) {
					this._fnShowErrorMessage("Please add attachment");
					return;
				}
				if (Validator.ValidateForm(this, modelname, this.eDialogM)) {
					return;
				}
				Validator.resetValidStates(this, modelname, this.eDialogM);

				if (parseFloat(oDlgData.CLAIM_AMOUNT) === 0 || parseFloat(oDlgData.CLAIM_AMOUNT) === 0.00) {
					this._fnShowErrorMessage("Claim amount = $0 is not allowed.");
					return;
				}

				if (oClaimName === "SDFC") {
					var oAmnt = oDlgData.SDF_APPROVED_AMOUNT,
						oCalamnt = this.oViewData.getProperty("/ToTAL_SCH_AMOUNT");
					oCalamnt = parseFloat(oCalamnt, 0);
					if (oCalamnt > oAmnt) {
						this._fnShowErrorMessage("Please check SDF approved amount");
						return;
					}
				}
				if (oClaimName === "CPC") {
					var oAmntcpc = oDlgData.CPR_AMOUNT,
						oCalamntcpc = parseFloat(oDlgData.CLAIM_AMOUNT, 0);
					if (oCalamntcpc > oAmntcpc) {
						this._fnShowErrorMessage("Please check CPR approved amount");
						return;
					}
				}

				if (oClaimName === "SDFR") {
					oDlgData.COURSE_END_DATE = oDlgData.COURSE_END_DATE === null ? null : oDlgData.COURSE_END_DATE.substring(0, 10);
					oDlgData.CUMULATIVE_CAP = oDlgData.CUMULATIVE_CAP.toString();

					var oAmntS = oDlgData.ORG_CLAIM_AMOUNT,
						oEnt = this.getView().getModel("oEligCalData").getProperty("/BALANCE");
					if (parseFloat(oEnt, 2) < parseFloat(oAmntS, 2)) {
						this._fnShowErrorMessage("Total request amount exceeded SDF capped amount");
						return;
					}

				}

				if (oClaimName === "WRC" || oClaimName === "WRC_HR") {
					//
				} else {
					if (oClaimName !== "WRC_HR") {
						delete oDlgData.CLAIM_UNIT;
					}
				}
				var oPayload = [],
					data,
					pURL = "/BenefietCAP/claim/validateMultipleClaimSubmission";
				for (var j = 0; j < oDlgData.LINE_ITEM.length; j++) {
					data = {
						"employeeId": oDlgData.CATEGORY_CODE === "PAY_UP" ? oDlgData.LINE_ITEM[j].SCHOLAR_ID : oDlgData.LINE_ITEM[j].EMPLOYEE_ID,
						"claimCode": oDlgData.LINE_ITEM[j].CLAIM_CODE,
						"claimDate": oDlgData.LINE_ITEM[j].CLAIM_DATE,
						"claimReference": oDlgData.LINE_ITEM[j].CLAIM_REFERENCE,
						"receiptDate": oDlgData.LINE_ITEM[j].RECEIPT_DATE === undefined ? null : oDlgData.LINE_ITEM[j].RECEIPT_DATE,
						"receiptNumber": oDlgData.LINE_ITEM[j].RECEIPT_NUMBER === undefined ? "" : oDlgData.LINE_ITEM[j].RECEIPT_NUMBER,
						"invoiceDate": oDlgData.LINE_ITEM[j].INVOICE_DATE === undefined ? null : oDlgData.LINE_ITEM[j].INVOICE_DATE,
						"invoiceNumber": oDlgData.LINE_ITEM[j].INVOICE_NUMBER === undefined ? "" : oDlgData.LINE_ITEM[j].INVOICE_NUMBER,
						"isMode": "X",
						"isHr": (oNameTile === "Admin" || oNameTile === "AdminSch") ? "X" : "",
						"isApprover": oNameTile === "Approvals" ? "X" : "",
						"masterClaimReference": oNameTile === "Approvals" ? oDlgData.CLAIM_REFERENCE : ""
					};
					oPayload.push(data);
				}
				this._getBusyIndicator().show();
				$.ajax({
					url: pURL,
					data: JSON.stringify({
						"claims": oPayload
					}),
					method: "POST",
					crossDomain: true,
					headers: {
						"Accept": "application/json",
						"Content-Type": "application/json"
					},
					success: function (odaata) {
						if (oClaimName === "WRC" || oClaimName === "WRC_HR") {
							this._fnValidateDuplicateWRC(oNameTile, oDlgData, oMode, key, oClaimName, oClaimCode, iURL, name);
						} else {
							this._fnAddDataSubmission(oNameTile, oDlgData, oMode, key, oClaimName, oClaimCode, iURL, name);
						}
					}.bind(this),
					error: function (response) {
						this._getBusyIndicator().hide();
						this.handleErrorDialog(response);
					}.bind(this)
				});

			} else {
				if (valid && oLen === 0) {
					this._fnShowErrorMessage("Please add attachment");
					return;
				}
				if (Validator.ValidateForm(this, modelname, this.eDialog)) {
					return;
				}
				Validator.resetValidStates(this, modelname, this.eDialog);
				oDlgData = this.eDialog.getModel(modelname).getData();
				oDlgData.CATEGORY_CODE = oClaimName;

				if (this.oValidateDate(oClaimName, oDlgData)) {
					this._fnShowErrorMessage("Please select mandatory date");
					return;
				}

				if (oClaimName === "TIM" && this._fnTimeValidation(oDlgData)) {
					this._fnShowErrorMessage("Please check the start and end time");
					return;
				}

				if (oClaimName === "MC" && (parseFloat(oDlgData.RECEIPT_AMOUNT) < parseFloat(oDlgData.CONSULTATION_FEE))) {
					this._fnShowErrorMessage("Please ensure receipt amount should be equal or more than consultation fee.");
					return;
				}
				if (parseFloat(oDlgData.CLAIM_AMOUNT) === 0 || parseFloat(oDlgData.CLAIM_AMOUNT) === 0.00) {
					this._fnShowErrorMessage("Claim amount = $0 is not allowed.");
					return;
				}
				if (oClaimName === "CPR") {
					this.hasChange = false;
				}
				if (this.hasChange && oClaimName !== "TIM") {
					this._fnShowErrorMessage("Please press the Compute button again to verify the claim amount before submitting");
					return;
				}
				if (oClaimName === "PTF") {
					setTimeout(this.onCalCopay(oDlgData, "B"), 50);
				}

				this._fnAddDataSubmission(oNameTile, oDlgData, oMode, key, oClaimName, oClaimCode, iURL, name);
			}

		},

		_fnTimeValidation: function (data) {
			var isValidate = false;
			var a = data.START_TIME.split(":"),
				oStrt = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]),
				b = data.END_TIME.split(":"),
				oEnd = (+b[0]) * 60 * 60 + (+b[1]) * 60 + (+b[2]);
			if (oStrt > oEnd) {
				isValidate = true;
			} else {
				isValidate = false;
			}
			return isValidate;
		},

		_fnValidateDuplicateWRC: function (oNameTile, oDlgData, oMode, key, oClaimName, oClaimCode, eURL, name) {
			var data, oPayload = [],
				pURL = "/BenefietCAP/claim/validateMultipleDuplicateWRCClaim";
			for (var i = 0; i < oDlgData.LINE_ITEM.length; i++) {
				data = {
					"employeeId": oDlgData.LINE_ITEM[i].EMPLOYEE_ID,
					"claimCode": oDlgData.LINE_ITEM[i].CLAIM_CODE,
					"claimDate": oDlgData.LINE_ITEM[i].CLAIM_DATE,
					"claimReference": oDlgData.LINE_ITEM[i].CLAIM_REFERENCE,
					"claimCategory": oDlgData.CATEGORY_CODE
				};
				oPayload.push(data);
			}
			$.ajax({
				url: pURL,
				data: JSON.stringify({
					"claims": oPayload
				}),
				method: "POST",
				crossDomain: true,
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json"
				},
				success: function (odaata) {
					this._fngetMultipleAmount(oNameTile, oDlgData, oMode, key, oClaimName, oClaimCode, eURL, name);
					// this._fnAddDataSubmission();
				}.bind(this),
				error: function (response) {
					this._getBusyIndicator().hide();
					this.handleErrorDialog(response);
				}.bind(this)
			});
		},

		_fngetMultipleAmount: function (oNameTile, oDlgData, oMode, key, oClaimName, oClaimCode, eURL, name) {
			var data, oPayload = [],
				pURL = "/BenefietCAP/claim/getMultipleWrcClaimAmount";
			for (var i = 0; i < oDlgData.LINE_ITEM.length; i++) {
				data = {
					"employeeId": oDlgData.LINE_ITEM[i].EMPLOYEE_ID,
					"claimCode": oDlgData.LINE_ITEM[i].CLAIM_CODE,
					"claimDate": oDlgData.LINE_ITEM[i].CLAIM_DATE,
					"claimUnit": oDlgData.LINE_ITEM[i].CLAIM_UNIT
				};
				oPayload.push(data);
			}
			$.ajax({
				url: pURL,
				data: JSON.stringify({
					"lineItems": oPayload
				}),
				method: "POST",
				crossDomain: true,
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json"
				},
				success: function (odaata) {
					if (odaata.error) {
						this._getBusyIndicator().hide();
						this._fnShowErrorMessage(odaata.error);
						return;
					} else {
						this._fnAddDataSubmission(oNameTile, oDlgData, oMode, key, oClaimName, oClaimCode, eURL, name);
					}
				}.bind(this),
				error: function (response) {
					this._getBusyIndicator().hide();
					this.handleErrorDialog(response);
				}.bind(this)
			});
		},

		_fnAddDataSubmission: function (oNameTile, oDlgData, oMode, key, oClaimName, oClaimCode, eURL, name) {
			if ((oNameTile === "Admin" || oNameTile === "AdminSch") && oDlgData.CATEGORY_CODE !== "PAY_UP") {
				oDlgData.SUBMITTED_BY = this.oViewData.getProperty("/LoginID");
				oDlgData.BEHALF_FLAG = "Y";
			} else {
				oDlgData.SUBMITTED_BY = oDlgData.EMPLOYEE_ID ? oDlgData.EMPLOYEE_ID : this.oViewData.getProperty("/EmpID");
			}

			if (oClaimName === "WRC_HR" || oClaimName === "WRC" || oClaimName === "TC" ||
				oClaimName === "COV" || oClaimName === "SP" || oClaimName === "SP1" || oClaimName === "SP2" || oClaimName === "SP3" || oClaimName ===
				"SDFR" || oClaimName === "SDFC" || oClaimName === "OC" || oClaimName === "CPC" || oClaimName === "PAY_UP") {
				// oDlgData.CLAIM_STATUS = "Pending for Submission";
				var oPayData = [];
				for (var k = 0; k < oDlgData.LINE_ITEM.length; k++) {
					var oJson = {
						"CLAIM_REFERENCE": oDlgData.LINE_ITEM[k].CLAIM_REFERENCE,
						"COMPANY": this.getView().getModel("oEmpData").getProperty("/COMPANY"),
						"CLAIM_CODE": oDlgData.LINE_ITEM[k].CLAIM_CODE
					};
					oPayData.push(oJson);
				}

				$.ajax({
					url: "/BenefietCAP/browseUpload/checkAttachment",
					data: JSON.stringify({
						"listofClaim": oPayData
					}),
					method: "POST",
					crossDomain: true,
					headers: {
						"Accept": "application/json",
						"Content-Type": "application/json"
					},
					success: function (data) {
						var oMsg = "";
						if (data.value.length === 0) {
							this._fnAddData(oMode, key, oDlgData, eURL, name, oClaimName);
						} else {
							for (var p = 0; p < data.value.length; p++) {
								oMsg += data.value[p].CLAIM_CODE + " - Please add attachment \n";
							}
							this._getBusyIndicator().hide();
							this._fnShowErrorMessage(oMsg);
						}
					}.bind(this),
					error: function (response) {
						this._getBusyIndicator().hide();
						this.handleErrorDialog(response);
					}.bind(this)
				});

			} else {
				// if (oMode === "Add") {
				// oDlgData.CLAIM_STATUS = "Pending for Submission";

				oDlgData.EMPLOYEE_ID = oDlgData.EMPLOYEE_ID ? oDlgData.EMPLOYEE_ID : this.oViewData.getProperty("/EmpID");
				$.ajax({
					url: "/BenefietCAP/claim/validateClaimSubmission",
					data: JSON.stringify({
						"claimCode": oDlgData.CLAIM_CODE,
						"claimReference": oDlgData.CLAIM_REFERENCE,
						"claimDate": oDlgData.CLAIM_DATE,
						"receiptDate": oDlgData.RECEIPT_DATE === undefined ? null : oDlgData.RECEIPT_DATE,
						"receiptNumber": oDlgData.RECEIPT_NUMBER ? oDlgData.RECEIPT_NUMBER : "",
						"isHr": (oNameTile === "Admin" || oNameTile === "AdminSch") ? "X" : "",
						"employeeId": oDlgData.EMPLOYEE_ID,
						"isMode": "X"
					}),
					method: "POST",
					crossDomain: true,
					headers: {
						"Accept": "application/json",
						"Content-Type": "application/json"
					},
					success: function (data) {
						if (oClaimName === "TIM" && oClaimCode === "TSOTC_PH") {
							this.validatePublicHol(oMode, key, oDlgData, eURL, name);
						} else {
							this._fnAddData(oMode, key, oDlgData, eURL, name, oClaimName);
						}
					}.bind(this),
					error: function (response) {
						this.handleErrorDialog(response);
					}.bind(this)
				});
				// } else {
				// 	this._fnAddData(oMode, key, oDlgData, URL, name, oClaimName);
				// }
			}
		},

		_fnAddData: function (oMode, key, oDlgData, eURL, name, oClaimName) {
			var oLine = this.oViewData.getProperty("/TModeLine"),
				oTile = this.oViewData.getProperty("/oTile");
			if (!oDlgData.FIRST_LEVEL_APPROVER && (oTile === "History" || oTile === "Form" || (oTile === "Admin" && oDlgData.CATEGORY_CODE ===
					"PAY_UP"))) {
				this._fnShowErrorMessage("Please select approver");
				return;
			}

			if (oMode === "Add" && oLine !== true) {
				// oDlgData.CLAIM_STATUS = "Pending for Submission";
				// oDlgData.EMPLOYEE_ID = oDlgData.EMPLOYEE_ID === undefined ? this.oViewData.getProperty("/EmpID") : oDlgData.EMPLOYEE_ID;
				$.ajax({
					url: eURL,
					data: JSON.stringify(oDlgData),
					method: "POST",
					crossDomain: true,
					headers: {
						"Accept": "application/json",
						"Content-Type": "application/json"
					},
					success: function (odata, oResponse) {
						if (key === "H") {
							delete oDlgData.LINE_ITEM;
							var msg = "Claim/Request has been sent for approval",
								oPayload = [];
							oPayload.push(oDlgData);
							this._fnSubmitApproval(oPayload, msg, key);
						} else {
							this._fnTableData();
							this._getBusyIndicator().hide();
							this.handleSuccessDialog("Claim/Request has been saved as draft");
						}
						this.getView().setBusy(false);
						if (this.oViewData.getProperty("/isActiveClose")) {
							this.oViewData.setProperty("/DMode", true);
							if (oClaimName === "WRC_HR" || oClaimName === "WRC" || oClaimName === "TC" ||
								oClaimName === "COV" || oClaimName === "SP" || oClaimName === "SP1" || oClaimName === "SP2" || oClaimName === "SP3" ||
								oClaimName.includes("SDF") || oClaimName === "CPC" || oClaimName === "OC" || oClaimName === "PAY_UP") {
								this.onCloseDialogM(true);
							} else {
								this.onCloseDialog(true);
							}
						}
					}.bind(this),
					error: function (xhr, ajaxOptions, throwError) {
						this.getView().setBusy(false);
						this._getBusyIndicator().hide();
						this.handleErrorDialog(xhr);
					}.bind(this)
				});
			} else {
				this.oViewData.setProperty("/TMode", "Add");
				var sURL = this.fnPutEntity(oDlgData);
				$.ajax({
					url: sURL,
					data: JSON.stringify(oDlgData),
					method: "PUT",
					crossDomain: true,
					headers: {
						"Accept": "application/json",
						"Content-Type": "application/json"
					},
					success: function (data, oResponse) {
						if (key === "H") {
							delete oDlgData.LINE_ITEM;
							var msg = "Claim/Request has been sent for approval",
								oPayload = [];
							oPayload.push(oDlgData);
							this._fnSubmitApproval(oPayload, msg, key);
						} else {
							this._fnTableData();
							this._getBusyIndicator().hide();
							this.handleSuccessDialog("Claim/Request has been saved as draft");
						}
						this.getView().setBusy(false);
						if (this.oViewData.getProperty("/isActiveClose")) {
							this.oViewData.setProperty("/DMode", true);
							if (oDlgData.CLAIM_CATEGORY === "WRC_HR" || oDlgData.CLAIM_CATEGORY === "WRC" || oDlgData.CLAIM_CATEGORY === "TC" ||
								oDlgData.CLAIM_CATEGORY === "COV" || oDlgData.CLAIM_CATEGORY.includes("SP") || oDlgData.CATEGORY_CODE.includes("SDF") ||
								oDlgData.CATEGORY_CODE === "CPC" || oDlgData.CATEGORY_CODE ===
								"OC" || oDlgData.CATEGORY_CODE === "PAY_UP") {
								this.onCloseDialogM(true);
							} else {
								this.onCloseDialog(true);
							}
						}
					}.bind(this),
					error: function (xhr, ajaxOptions, throwError) {
						this.getView().setBusy(false);
						this._getBusyIndicator().hide();
						this.handleErrorDialog(xhr);
					}.bind(this)
				});
			}
		},

		onSubDetail: function (oEvent, name, data) {
			var oData;
			if (oEvent === "H") {
				oData = data;
			} else {
				oData = oEvent.getSource().getBindingContext(name).getObject();
			}
			this._fnClinicData();
			var sURL = "/BenefietCAP/claim/EmployeeEligibility(UserID='" + oData.EMPLOYEE_ID + "')/Set?$filter=Claim_Code eq '" + oData.CLAIM_CODE +
				"'";
			if (name === "Hospitialisation" || name === "TrainingFund" || oData.CLAIM_CODE === "TrvHMDSpons2" || oData.CLAIM_CODE ===
				"TrvHMDSpons1") {
				if (oData.CLAIM_CODE === "HOSPD" || oData.CLAIM_CODE === "OPTD" || oData.CLAIM_CODE === "SPTD") {
					this.onLoadDep(oData.EMPLOYEE_ID);
				}
				$.ajax({
					url: sURL,
					method: "GET",
					crossDomain: true,
					dataType: "json",
					success: function (odata, oResponse) {
						var oDataVal = odata.value;
						if (oDataVal.length === 0 || oDataVal[0].Entitlement === "0") {
							this._fnShowErrorMessage("Staff is not eligible for this claim");
						} else {
							this.oViewData.getData().oEntit = [];
							this.oViewData.getData().oEntit.push(oDataVal[0]);
							this.fnProrationRule(oData.CLAIM_CODE, name, oData.EMPLOYEE_ID, oData.CLAIM_STATUS);
						}
					}.bind(this),
					error: function (xhr, ajaxOptions, throwError) {
						this.getView().setBusy(false);
						this.handleErrorDialog(xhr);
					}.bind(this)
				});
			} else {
				this.fnGetBalancAmnt(oData.CATEGORY_CODE, oData.EMPLOYEE_ID, oData.CLAIM_STATUS);
			}
			this.oViewData.setProperty("/DMode", false);
			this.eDialog = Fragment.load({
				id: this.createId(name),
				name: "BenefitClaim.ZBenefitClaim.fragments." + name,
				controller: this
			}).then(function (oDialog) {
				this.eDialog = oDialog;
				this.getView().addDependent(this.eDialog);
				this.eDialog.setModel(new JSONModel(oData), name);
				this.eDialog.open();
				this.onDisplayFiles(oData.CLAIM_REFERENCE);
				if (oData.CLAIM_STATUS === "Pending for Submission") {
					this.onReceiptDate("A", oData);
				}
			}.bind(this));
		},

		onEdit: function (oEvent, modelname, data) {
			if (this.oViewData.getProperty("/oTile") === "History") {
				this.hasChange = true;
			} else {
				this.hasChange = false;
			}

			this._fnDlgBtnTxtSave("Eligibility Data");
			var oEmpId = this.oViewData.getProperty("/EmpID"),
				eDialog = "_o" + modelname + "Dialog",
				oData;
			if (oEvent === "H") {
				oData = data;
				this.oViewData.setProperty("/TMode", "Add");
			} else {
				this.oViewData.setProperty("/TMode", "Edit");
				var oContext = oEvent.getSource().getBindingContext(modelname),
					sPath = oContext.getPath().replace(/^\D+/g, ""),
					sIndex = parseInt(sPath, 0);
				oData = oContext.getObject();
			}
			this._fnClinicData();

			/*if(){
					var iURL = "/BenefietCAP/claim/BANK_ACC?$filter=externalCode eq '" + oSelectedItem.userId + "'",
						sURL = "/BenefietCAP/claim/INFT_SCHOLAR_SCHEME?$filter=externalCode eq '" + oSelectedItem.userId + "'";
					this._fnAccountDetaila(iURL, "PUpload");
					this._fnPayupDetaila(sURL); 
			}*/

			var sURL = "/BenefietCAP/claim/EmployeeEligibility(UserID='" + oData.EMPLOYEE_ID + "')/Set?$filter=Claim_Code eq '" + oData.CLAIM_CODE +
				"'";
			if (modelname === "Hospitialisation" || modelname === "TrainingFund" || oData.CLAIM_CODE === "TrvHMDSpons2" || oData.CLAIM_CODE ===
				"TrvHMDSpons1") {

				if (oData.CLAIM_CODE === "HOSPD" || oData.CLAIM_CODE === "OPTD" || oData.CLAIM_CODE === "SPTD") {
					this.onLoadDep(oData.EMPLOYEE_ID);
				}

				$.ajax({
					url: sURL,
					method: "GET",
					crossDomain: true,
					dataType: "json",
					success: function (odata, oResponse) {
						var oDataVal = odata.value;
						if (oDataVal.length === 0 || oDataVal[0].Entitlement === "0") {
							this._fnShowErrorMessage("Staff is not eligible for this claim");
						} else {
							this.oViewData.getData().oEntit = [];
							this.oViewData.getData().oEntit.push(oDataVal[0]);
							this.fnProrationRule(oData.CLAIM_CODE, modelname, oData.EMPLOYEE_ID, oData.CLAIM_STATUS);
						}
					}.bind(this),
					error: function (xhr, ajaxOptions, throwError) {
						this.getView().setBusy(false);
						this.handleErrorDialog(xhr);
					}.bind(this)
				});
			} else {
				this.fnGetBalancAmnt(oData.CATEGORY_CODE, oData.EMPLOYEE_ID, oData.CLAIM_STATUS);
			}
			this.oViewData.setProperty("/DMode", true);
			this.oViewData.setProperty("/eIndex", sIndex);
			this.oViewData.setProperty("/TMode", "Edit");
			this.oViewData.setProperty("/oClaimCode", oData.CLAIM_CODE);
			this.eDialog = Fragment.load({
				id: this.createId(modelname),
				name: "BenefitClaim.ZBenefitClaim.fragments." + modelname,
				controller: this
			}).then(function (oDialog) {
				this.eDialog = oDialog;
				this.getView().addDependent(this.eDialog);
				this.oMis = $.extend(true, {}, oData);
				this.eDialog.setModel(new JSONModel(oData), modelname);
				this.eDialog.getModel(modelname).attachPropertyChange(function (oEvt) {
					this.mDataModelChange(oEvt, oData);
				}, this);
				var sModelProperty = "RECEIPT_DATE";
				if (modelname === "ABcls" || modelname === "Hospitialisation" || modelname === "Reimbursement" ||
					modelname === "WorkInjury" || modelname === "Licence" || modelname === "Ahpreim" || modelname === "PettyCash" ||
					modelname === "Timesheet") {
					if (modelname === "Timesheet") {
						sModelProperty = "CLAIM_DATE";
					}
					this.loadDatePicker(this.eDialog.getModel(modelname), "edit", sModelProperty, modelname, "datePicker", "A");
				}
				if (modelname === "TrainingFund") {
					sModelProperty = "START_DATE";
					this.loadDatePicker(this.eDialog.getModel(modelname), "edit", sModelProperty, modelname, "datePicker1");
					sModelProperty = "END_DATE";
					this.loadDatePicker(this.eDialog.getModel(modelname), "edit", sModelProperty, modelname, "datePicker2");
					sModelProperty = "RECEIPT_DATE";
					this.loadDatePicker(this.eDialog.getModel(modelname), "edit", sModelProperty, modelname, "datePicker3", "A");
				} else if (name === "Transportation") {
					sModelProperty = "RECEIPT_DATE";
					this.loadDatePicker(this.eDialog.getModel(name), "edit", sModelProperty, name, "datePicker", "TC");
				} else {
					this.loadDatePicker(this.eDialog.getModel(modelname), "edit", sModelProperty, modelname, "datePicker");
				}
				this.eDialog.open();
				this.onDisplayFiles(oData.CLAIM_REFERENCE);
				if (oData.CLAIM_STATUS === "Pending for Submission" || oData.CLAIM_STATUS === "Rejected" || oData.CLAIM_STATUS === "Cancelled" ||
					oData.CLAIM_STATUS === "Cancellation Approved") {
					this.onReceiptDate("A", oData, "E");
				}
			}.bind(this));
		},

		onDelete: function (tableid, model) {
			var oTable = this.getView().byId(tableid),
				selectedItems = oTable.getSelectedItems(),
				payLoad = [],
				oData = "";
			this.fnPostEntity();
			if (selectedItems.length === 0) {
				sap.m.MessageToast.show("Please select a row to delete");
			} else {
				oData = oTable.getModel(model).getData();
				for (var j = selectedItems.length - 1; j >= 0; j--) {
					var jdx = oTable.indexOfItem(selectedItems[j]);
					payLoad.push(oData[jdx]);
				}
				var oValue = {
					"deleteItems": JSON.stringify(payLoad),
					"table_Name": this.oViewData.getProperty("/oTableDelName")
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
						this._fnTableData();
						this.handleSuccessDialog("Selected record(s) has been deleted");
						this.getView().setBusy(false);
					}.bind(this),
					error: function (xhr, ajaxOptions, throwError) {
						this.getView().setBusy(false);
						this.handleErrorDialog(xhr);
					}.bind(this)
				});
				oTable.getModel(model).refresh(true);
				oTable.removeSelections(true);
			}
		},

		_fnClaimCategoryOpen: function (oData) {
			var oView = this.getView();
			if (!this.byId("dlgClaimCategory")) {
				Fragment.load({
					id: oView.getId(),
					controller: this,
					name: "BenefitClaim.ZBenefitClaim.fragments.ClaimCategory"
				}).then(function (oDialog) {
					oView.addDependent(oDialog);
					oDialog.setModel(new JSONModel(oData), "oClaimCat");
					oDialog.open();
				});
			} else {
				this.byId("dlgClaimCategory").setModel(new JSONModel(oData), "oClaimCat");
				this.byId("dlgClaimCategory").open();
			}

		},

		onAddWRC: function (name) {
			if ((name === "Sponsorship" || name === "WorkRelated" || name === "WorkRelatedHR" || name === "PUpload") && this.oViewData.getProperty(
					"/oTile") !== "Approvals") {
				if (Validator.ValidateForm(this, name, this.eDialogM)) {
					return;
				}
				Validator.resetValidStates(this, name, this.eDialogM);
				if (name === "Sponsorship") {
					var oData = this.eDialogM.getModel("Sponsorship_Master").getData();
					if (!oData.START_DATE || !oData.END_DATE) {
						this._fnShowErrorMessage("Please select mandatory date");
						return;
					}
					/*if (oData.START_DATE < new Date().toISOString().substring(0, 10)) {
						this._fnShowErrorMessage("Start date should be future date");
						return;
					}
					if (oData.END_DATE < new Date().toISOString().substring(0, 10)) {
						this._fnShowErrorMessage("End date should be future date");
						return;
					}*/
					if (oData.START_DATE > oData.END_DATE) {
						this._fnShowErrorMessage("End date should be greater than start date");
						return;
					}
				}
			}
			this.onDialogOpen(name);
		},

		onCloseLineDialog: function (name) {
			if (this.oMode) {
				this.oMode = false;
				this.oViewData.setProperty("/DMode", true);
			}
			if (this.oViewData.getProperty("/TMode") === "Edit" && name !== true) {
				var oIndx = this.oViewData.getProperty("/oLineItemIndex");
				// this.eDialogM.getModel(name).setData(this.oMaster);
				this.eDialogM.getModel(name).getData().LINE_ITEM[oIndx] = this.oLineItem;
				this.eDialogM.getModel(name).refresh(true);
			}
			this.eDialog.close();
			this.eDialog.destroy();
			this.eDialog = undefined;
		},

		onSubmitApproval: function () {
			this.fnPostEntity();
			var tableid = this.oViewData.getProperty("/oTableid"),
				oTable = this.getView().byId(tableid),
				selectedItems = oTable.getSelectedItems(),
				payLoad = [],
				oData = "",
				msg,
				model = this.oViewData.getProperty("/oModelName");

			if (selectedItems.length === 0) {
				sap.m.MessageToast.show("Please select a row to delete");
			} else if (selectedItems.length > 1) {
				sap.m.MessageToast.show("Only One Claim Can Submit for Approval");
			} else {
				oData = oTable.getModel(model).getData();
				for (var j = selectedItems.length - 1; j >= 0; j--) {
					var jdx = oTable.indexOfItem(selectedItems[j]);
					if (oData[jdx].CLAIM_CATEGORY === "WRC" || oData[jdx].CLAIM_CATEGORY === "WRC_HR" || oData[jdx].CLAIM_CATEGORY === "TC" ||
						oData[jdx].CLAIM_CATEGORY === "COV" || oData[jdx].CLAIM_CATEGORY.includes("SP")) {
						delete oData[jdx].LINE_ITEM;
					}
					payLoad.push(oData[jdx]);
				}
				msg = "Claim/Request has been sent for approval";
				this._fnSubmitApproval(payLoad, msg);
				oTable.getModel(model).refresh(true);
				oTable.removeSelections(true);
			}
		},

		onStartTime: function (oEvent, model) {
			var oETime = this._getFragmentTextPos(model, "tpEtime").getDateValue().getTime(),
				oSTime = this._getFragmentTextPos(model, "tpStime").getDateValue().getTime();
			if (oETime !== null || oETime !== "") {
				var oHour = ((oETime - oSTime) / (1000 * 60 * 60));
				if (oHour < 0) {
					oHour = 24 + oHour;
				}
				this.eDialog.getModel(model).setProperty("/WORK_HOURS_ACTUAL", parseFloat(oHour, 10).toFixed(2));
				this.eDialog.getModel(model).setProperty("/WORK_HOURS_PAID", parseFloat(oHour, 10).toFixed(2));
				this.eDialog.getModel(model).refresh(true);
			}
		},

		onEndTime: function (oEvent, model) {
			var oSTime = this._getFragmentTextPos(model, "tpStime").getDateValue().getTime(),
				oETime = this._getFragmentTextPos(model, "tpEtime").getDateValue().getTime();
			if (oSTime !== null || oSTime !== "") {
				var oHour = ((oETime - oSTime) / (1000 * 60 * 60));
				if (oHour < 0) {
					oHour = 24 + oHour;
				}
				this.eDialog.getModel(model).setProperty("/WORK_HOURS_ACTUAL", parseFloat(oHour, 10).toFixed(2));
				this.eDialog.getModel(model).setProperty("/WORK_HOURS_PAID", parseFloat(oHour, 10).toFixed(2));
				this.eDialog.getModel(model).refresh(true);
			}
		},

		onDedBrk: function (oEvent, model) {
			var key = oEvent.getSource().getValue(),
				oHour = this.eDialog.getModel(model).getProperty("/WORK_HOURS_ACTUAL");
			if (key === "Yes") {
				this.eDialog.getModel(model).setProperty("/WORK_HOURS_PAID", parseFloat(oHour - 1.00).toFixed(2));
			} else {
				this.eDialog.getModel(model).setProperty("/WORK_HOURS_PAID", parseFloat(oHour, 10).toFixed(2));
			}
		},

		onCalculateOther: function (oEvent) {
			this.onValidateNumericValue(oEvent);
			var othercost,
				oModel = oEvent.getSource().getModel("Hospitialisation"),
				oConsult = this._getFragmentTextPos("Hospitialisation", "inpConsult").getValue(),
				oCash = this._getFragmentTextPos("Hospitialisation", "inpCashamnt").getValue(),
				oMedsave = this._getFragmentTextPos("Hospitialisation", "inpMedsaveamnt").getValue(),
				oMedishield = this._getFragmentTextPos("Hospitialisation", "inpMedshieldamnt").getValue(),
				oPrvinsur = this._getFragmentTextPos("Hospitialisation", "inpPrvinsuramnt").getValue();
			oConsult = oConsult === "" ? 0 : oConsult;
			oCash = oCash === "" ? 0 : oCash;
			oMedsave = oMedsave === "" ? 0 : oMedsave;
			oMedishield = oMedishield === "" ? 0 : oMedishield;
			oPrvinsur = oPrvinsur === "" ? 0 : oPrvinsur;
			var oAmount = parseFloat(oCash, 10) + parseFloat(oMedsave, 10) + parseFloat(oMedishield, 10) + parseFloat(
				oPrvinsur, 10);
			oModel.setProperty("/RECEIPT_AMOUNT", parseFloat(oAmount, 10).toFixed(2));
		},

		onCalculateTamt: function (oEvent, model) {
			this.hasChange = false;
			if (Validator.ValidateForm(this, model, this.eDialog)) {
				return;
			}
			Validator.resetValidStates(this, model, this.eDialog);
			var oData = this.eDialog.getModel(model).getData();
			oData.LINE_ITEM_REFERENCE_NUMBER = oData.LINE_ITEM_REFERENCE_NUMBER === undefined ? new Date().getTime().toString() : oData.LINE_ITEM_REFERENCE_NUMBER;
			oData.EMPLOYEE_ID = oData.EMPLOYEE_ID ? oData.EMPLOYEE_ID : this.oViewData.getProperty("/EmpID");
			$.ajax({
				url: "/BenefietCAP/claim/calulationTransportClaim",
				data: JSON.stringify({
					"lineitem": oData
				}),
				method: "POST",
				crossDomain: true,
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json"
				},
				success: function (data) {
					if (data.CLAIM_AMOUNT) {
						oData.CLAIM_AMOUNT = data.CLAIM_AMOUNT;
					} else {
						oData.CLAIM_AMOUNT = 0.00;
					}
					this.eDialog.getModel(model).refresh(true);
				}.bind(this),
				error: function (response) {
					oData.CLAIM_AMOUNT = 0.00;
					this.eDialog.getModel(model).refresh(true);
					this.handleErrorDialog(response);
				}.bind(this)
			});
		},

		/*******************Attachment upload/download**************************/

		onChange: function (oEvent, claimnumb) {
			var that = this,
				oLength = oEvent.getParameter("files").length,
				sFileName = oEvent.getParameter("files")[0].name;
			if (oEvent.getSource().getItems().length < 5) {
				var reader = new FileReader();
				var file = oEvent.getParameter("files")[0];
				var oPromise = new Promise(function (resolve, reject) {
					reader.onload = function (e) {
						resolve(e.target.result);
					};
				});
				reader.onerror = function (e) {
					sap.m.MessageToast.show("error");
				};
				reader.readAsDataURL(file);
				oPromise.then(function (resolve) {
					that.onStartUpload(sFileName, resolve, claimnumb, oLength);
				});
			} else {
				that._fnShowErrorMessage("Maximum of 5 attachments allowed");
			}

		},

		onStartUpload: function (fileName, base64data, claimnumb, len) {
			var oPayload = {
				fileID: claimnumb,
				appName: this.oViewData.getProperty("/ClaimType"),
				Items: [{
					fileID: claimnumb,
					itemsNo: len.toString(),
					fileName: fileName,
					mediaType: "application/octet-stream",
					content: base64data,
					createdName: this.getView().getModel("oEmpData").getProperty("/FULLNAME")
				}]
			};
			oPayload = JSON.stringify(oPayload);
			$.ajax({
				url: "/BenefietCAP/browseUpload/FileHeader",
				data: oPayload,
				method: "POST",
				crossDomain: true,
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json"
				},
				success: function (oData) {
					sap.m.MessageToast.show("File uploaded");
					this.onDisplayFiles(claimnumb);
				}.bind(this),
				error: function (xhr, ajaxOptions, throwError) {
					this.getView().setBusy(false);
					this.handleErrorDialog(xhr);
				}.bind(this)
			});
		},

		//********* History *************///

		onSearchs: function (key) {
			var odata = this.oViewData.getData(),
				oFilter = [],
				oTableid = key === "A" ? "tbApprovalDetails" : key === "AB" ? "tbApprovalDetailsHistory" : key === "AC" ?
				"tbApprovalDelegateDetails" : "tbClaimHistory";
			if (odata.ClaimCate) {
				oFilter.push(new Filter("CLAIM_TYPE", FilterOperator.EQ, odata.ClaimCate));
			}
			if (odata.ClaimCateg) {
				oFilter.push(new Filter("CATEGORY_CODE", FilterOperator.Contains, odata.ClaimCateg));
			}
			if (odata.Status) {
				oFilter.push(new Filter("CLAIM_STATUS", FilterOperator.EQ, odata.Status));
			}
			if (odata.Sdate) {
				oFilter.push(new Filter("CLAIM_DATE", FilterOperator.BT, odata.Sdate, odata.Edate));
			}
			if (odata.EmpID_App) {
				oFilter.push(new Filter("CLAIM_OWNER_ID", FilterOperator.EQ, odata.EmpID_App));
			}
			if (odata.ClaimNo) {
				oFilter.push(new Filter("CLAIM_REFERENCE", FilterOperator.Contains, odata.ClaimNo));
			}
			if (odata.Claim_Owner) {
				oFilter.push(new Filter("CLAIM_OWNER_ID", FilterOperator.Contains, odata.Claim_Owner));
			}
			/*if (odata.Sdate) {
				oFilter.push(new Filter("RECEIPT_DATE", FilterOperator.BT, odata.Sdate, odata.Edate));
			}*/
			var oTable = this.getView().byId(oTableid).getBinding("items");
			oTable.filter(oFilter, true);
			this.oViewData.setProperty("/" + oTableid, oTable.iLength);
		},
		onTableCount: function (oEvent, key) {
			this.oViewData.setProperty("/" + key, oEvent.getSource().getBinding("items").iLength);
		},

		onClear: function (key) {
			this.oViewData.setProperty("/ClaimCate", "");
			this.oViewData.setProperty("/ClaimCateg", "");
			this.oViewData.setProperty("/ClaimNo", "");
			this.oViewData.setProperty("/Claim_Owner", "");
			this.oViewData.setProperty("/EmpID_App", "");
			this.oViewData.setProperty("/Status", "");
			this.oViewData.setProperty("/Sdate", null);
			this.oViewData.setProperty("/Edate", null);
			this.oViewData.setProperty("/oRecp", null);
			$(".HisdatePicker1").val(null);
			$(".HisdatePicker2").val(null);
			$(".ReceiptDate").val(null);
			this.onSearchs(key);
		},

		onSelectItem: function (oEvent, key, model, val) {
			this.eDialog = undefined;
			var oData = oEvent.getSource().getBindingContext(model).getObject();
			this.oViewData.setProperty("/ClaimType", oData.CATEGORY_CODE);
			this.oViewData.setProperty("/oClaimCode", oData.CLAIM_TYPE);
			this.oViewData.setProperty("/oHisKey", key);
			if (oData.CLAIM_STATUS === "Rejected" || oData.CLAIM_STATUS === "Cancelled" || oData.CLAIM_STATUS === "Cancellation Approved") {
				this.oViewData.setProperty("/DMode", true);
				this.oViewData.setProperty("/App", true);
				this.oViewData.setProperty("/oHis", true);
				this.oViewData.setProperty("/oTabValue", "History");
				this.oViewData.setProperty("/oCan", false);
			} else if (oData.CLAIM_STATUS === "Approved" || oData.CLAIM_STATUS.includes("Pending")) {
				this.oViewData.setProperty("/oCan", true);
				this.oViewData.setProperty("/App", false);
				this.oViewData.setProperty("/DMode", false);
				this.oViewData.setProperty("/oTabValue", "History");
				this.oViewData.setProperty("/oHis", false);
			} else {
				this.oViewData.setProperty("/oCan", false);
				this.oViewData.setProperty("/App", false);
				this.oViewData.setProperty("/DMode", false);
				this.oViewData.setProperty("/oTabValue", "History");
				this.oViewData.setProperty("/oHis", false);
			}
			this._fnEmail(oData, "H");
			var oURL = this._fnGenPutEntity(oData);
			this._fnHistory(oURL, val);

		},
		_fnHistory: function (oURL, key) {
			$.ajax({
				method: "GET",
				url: oURL,
				dataType: "json",
				success: function (response) {
					if (key === "C") {
						var lineitem = "";
						if (response.LINE_ITEM) {
							if (response.LINE_ITEM.length === 0 && response.CLAIM_STATUS === "Approved") {
								this._fnShowErrorMessage("Claim cancellation is in progess.");
								return;
							} else {
								lineitem = response.LINE_ITEM[0].CLAIM_REFERENCE;
							}
						}
						$.ajax({
							method: "GET",
							url: "/BenefietCAP/claim/validateClaimCancellation(CLAIM_REFERENCE='" + response.CLAIM_REFERENCE +
								"',LINEITEM_CLAIM_REFERENCE='" + lineitem + "')",
							dataType: "json",
							success: function (data) {
								this.fnOpenFragment(response);
								this._fnAppRemarks(response);
								this._fnCancelClaim(response);
							}.bind(this),
							error: function (error) {
								this.handleErrorDialog(error);
							}.bind(this)
						});
					} else {
						this.fnOpenFragment(response);
						this._fnAppRemarks(response);
						this._fnCancelClaim(response);
					}
				}.bind(this),
				error: function (response) {
					this.handleErrorDialog(response);
				}.bind(this)
			});
		},

		_fnAppRemarks: function (data) {
			$.ajax({
				url: "/BenefietCAP/claim/claimstatus_ext?$filter=Claim_Reference eq '" + data.CLAIM_REFERENCE + "'",
				method: "GET",
				crossDomain: true,
				success: function (datas, oResponse) {
					var oData = datas.value[0];
					if (oData) {
						var oVal = {
							"SUBMITTED_BY": oData.Submitted_By,
							"SUBMITTEDBY_FullName": oData.SUBMITTEDBY_FullName,
							"SUBMITTED_ON": oData.Submit_Date,
							"EMPLOYEE_ID": oData.Employee_Id,
							"Employee_FullName": oData.Employee_FullName,
							"CLAIM_STATUS": oData.Status,
							"REMARKS_REJECTION": oData.REMARKS_REJECTION,
							LINE_ITEM: [{
								"APPROVER": oData.Approver1,
								"APP_FNAME": oData.APPROVER1_FullName,
								"DELEGATION": oData.Delegation1,
								"DELEG_FNAME": oData.DELEGATOR1_FullName,
								"APPROVED_ON": oData.FIRST_LEVEL_APPROVED_ON,
								"APP_REMARKS": oData.REMARKS_APPROVER1
							}, {
								"APPROVER": oData.Approver2,
								"APP_FNAME": oData.APPROVER2_FullName,
								"DELEGATION": oData.Delegation2,
								"DELEG_FNAME": oData.DELEGATOR2_FullName,
								"APPROVED_ON": oData.SECOND_LEVEL_APPROVED_ON,
								"APP_REMARKS": oData.REMARKS_APPROVER2
							}, {
								"APPROVER": oData.Approver3,
								"APP_FNAME": oData.APPROVER3_FullName,
								"DELEGATION": oData.Delegation3,
								"DELEG_FNAME": oData.DELEGATOR3_FullName,
								"APPROVED_ON": oData.THIRD_LEVEL_APPROVED_ON,
								"APP_REMARKS": oData.REMARKS_APPROVER3
							}, {
								"APPROVER": oData.Approver4,
								"APP_FNAME": oData.APPROVER4_FullName,
								"DELEGATION": oData.Delegation4,
								"DELEG_FNAME": oData.DELEGATOR4_FullName,
								"APPROVED_ON": oData.FOURTH_LEVEL_APPROVED_ON,
								"APP_REMARKS": oData.REMARKS_APPROVER4
							}]
						};
					}
					oVal.LINE_ITEM = $.grep(oVal.LINE_ITEM, function (obj, index) {
						return obj.APPROVER !== "N/A";
					});
					console.log(oVal);
					this.getView().setModel(new JSONModel(oVal), "oAppRemarks");
				}.bind(this),
				error: function (xhr, ajaxOptions, throwError) {
					this.handleErrorDialog(xhr);
				}.bind(this)
			});
		},

		_fnCancelClaim: function (data) {
			var eURL = "/BenefietCAP/claim/CLAIM_CANCEL_MASTER?$filter=parent_Claim_Reference eq '" + data.CLAIM_REFERENCE + "'";
			$.ajax({
				url: eURL,
				method: "GET",
				crossDomain: true,
				dataType: "json",
				success: function (odata, oResponse) {
					if (odata.value.length > 0) {
						this.getView().setModel(new JSONModel(odata.value), "oCancelClaims");
					}
				}.bind(this),
				error: function (xhr, ajaxOptions, throwError) {
					this.handleErrorDialog(xhr);
				}.bind(this)
			});

		},

		fnOpenFragment: function (oData) {
			var name = this.oViewData.getProperty("/oModelName"),
				oKey = this.oViewData.getProperty("/oHisKey");
			if (oKey === false) {
				this.oViewData.setProperty("/oCan", false);
			}
			if (oData.CATEGORY_CODE === "WRC_HR" || oData.CATEGORY_CODE === "WRC" || oData.CATEGORY_CODE === "COV" || oData.CATEGORY_CODE.includes(
					"SP") || oData.CATEGORY_CODE === "TC" || oData.CATEGORY_CODE.includes("SDF") || oData.CATEGORY_CODE === "CPC" || oData.CATEGORY_CODE ===
				"OC" || oData.CATEGORY_CODE === "PAY_UP") {
				if ((oData.CLAIM_STATUS === "Rejected" || oData.CLAIM_STATUS === "Cancelled" || oData.CLAIM_STATUS === "Cancellation Approved") &&
					oKey) {
					if (oData.postingCutoffDate <= new Date().toISOString().substring(0, 10)) {
						this._fnShowErrorMessage("Cancellation not allowed after posting cut-off period");
						return;
					} else {
						this.onEditWRC("H", name, name + "_Master", oData);
						this._fnClearCopy(oData);
						for (var i = 0; i < oData.LINE_ITEM.length; i++) {
							oData.LINE_ITEM[i].CLAIM_REFERENCE = oData.LINE_ITEM[i].CLAIM_CODE + new Date().getTime().toString() + i;
							oData.LINE_ITEM[i].LINE_ITEM_REFERENCE_NUMBER = new Date().getTime().toString() + i;
							delete oData.LINE_ITEM[i].parent_CLAIM_CATEGORY;
							delete oData.LINE_ITEM[i].parent_CLAIM_DATE;
							delete oData.LINE_ITEM[i].parent_CLAIM_REFERENCE;
							delete oData.LINE_ITEM[i].parent_EMPLOYEE_ID;
						}
					}
				} else {
					this.onSubDetailWRC("H", name, name + "_Master", oData);
				}
			} else {
				if ((oData.CLAIM_STATUS === "Rejected" || oData.CLAIM_STATUS === "Cancelled" || oData.CLAIM_STATUS === "Cancellation Approved") &&
					oKey) {
					if (oData.postingCutoffDate <= new Date().toISOString().substring(0, 10)) {
						this._fnShowErrorMessage("Cancellation not allowed after posting cut-off period");
						return;
					} else {
						this.onEdit("H", name, oData);
						this._fnClearCopy(oData);
					}
				} else {
					this.onSubDetail("H", name, oData);
				}
			}

		},

		onSelectItemCancel: function (oEvent, model) { 
			oEvent.getSource().setEnabled(false);
			this.oSource = oEvent.getSource();
			var oData = model.includes("_Master") ? this.eDialogM.getModel(model).getData() : this.eDialog.getModel(model).getData();
			this.oViewData.setProperty("/oCancelModel", model);
			var payload = {
				"CLAIM_REFERENCE": oData.CLAIM_REFERENCE,
				"EMPLOYEE_ID": oData.EMPLOYEE_ID,
				"EMPLOYEE_NAME": oData.EMPLOYEE_ID,
				"CLAIM_TYPE": oData.CLAIM_CODE,
				"CLAIM_DATE": (oData.CATEGORY_CODE === "TIM" || oData.CATEGORY_CODE === "WRC" || oData.CATEGORY_CODE === "WRC_HR" || oData.CATEGORY_CODE ===
						"COV" || oData.CATEGORY_CODE.includes("SP") || oData.CATEGORY_CODE === "TC" || oData.CATEGORY_CODE.includes("SDF") || oData.CATEGORY_CODE
						.includes("CP") || oData.CATEGORY_CODE === "OC" || oData.CATEGORY_CODE === "PAY_UP") ? oData.CLAIM_DATE : oData
					.RECEIPT_DATE,
				"AMOUNT": oData.CLAIM_AMOUNT,
				"CLAIM_STATUS": oData.CLAIM_STATUS,
				"CATEGORY_CODE": oData.CATEGORY_CODE,
				"CLAIM_OWNER_ID": oData.EMPLOYEE_ID,
				"CLAIM_CATEGORY": oData.CLAIM_CATEGORY,
				"SUBMITTED_BY": null,
				"ESTIMATEPAYMENTDATE": null
			};
			var oModel = new JSONModel({
				"Title": "Confirmation",
				"State": "Error",
				"Remarks": false,
				"lbl": "Employee Remarks",
				"SubTitle": "Selected Record to be Cancellation?",
				"Key": oData.CLAIM_STATUS === "Approved" ? "AP" : "RE",
				"DM": model.includes("_Master") ? true : false,
				"model": payload
			});
			this._fnRejectionDialog(oModel);
		},

		_fnWorkflowDataSubmit: function (oEvent, key) {
			oEvent.getSource().setEnabled(false);
			var oPayLoad = [],
				oMainDt = this._oDialogReject.getModel("oRej").getData(),
				oMsg, oValue,
				oTabKey = this.getView().byId("idIconTabBarNoIcons").getSelectedKey();
			if (oMainDt.Key === "V") {
				var oTable = this.getView().byId("tbApprovalDetails"),
					selectedItems = oTable.getSelectedItems(),
					oDataModel = "";
				oDataModel = oTable.getModel("ApprovalModel").getData();
				oMsg = key === "Warning" ? "Claim/Request has been approved successfully" : "Claim/Request has been rejected successfully";
				for (var j = selectedItems.length - 1; j >= 0; j--) {
					var jdx = oTable.indexOfItem(selectedItems[j]);
					var payload = {
						"AMOUNT": oDataModel[jdx].AMOUNT,
						"CATEGORY_CODE": oDataModel[jdx].CATEGORY_CODE,
						"CLAIM_DATE": (oDataModel[jdx].CATEGORY_CODE === "TIM" || oDataModel[jdx].CATEGORY_CODE === "WRC" || oDataModel[jdx].CATEGORY_CODE ===
								"WRC_HR" || oDataModel[jdx].CATEGORY_CODE ===
								"COV" || oDataModel[jdx].CATEGORY_CODE.includes("SP") || oDataModel[jdx].CATEGORY_CODE === "TC" || oData.CATEGORY_CODE.includes(
									"SDF") || oData.CATEGORY_CODE.includes("CP") || oData.CATEGORY_CODE ===
								"OC" || oData.CATEGORY_CODE === "PAY_UP") ? oDataModel[jdx].CLAIM_DATE : oDataModel[
								jdx]
							.RECEIPT_DATE,
						"CLAIM_OWNER_ID": oDataModel[jdx].EMPLOYEE_ID,
						"CLAIM_REFERENCE": oDataModel[jdx].CLAIM_REFERENCE,
						"CLAIM_STATUS": oDataModel[jdx].CLAIM_STATUS = key === "Warning" ? "Approved" : "Rejected",
						"CLAIM_TYPE": oDataModel[jdx].CLAIM_TYPE,
						"EMPLOYEE_ID": oDataModel[jdx].EMPLOYEE_ID,
						"EMPLOYEE_NAME": oDataModel[jdx].EMPLOYEE_ID
					};
					oPayLoad.push(payload);
				}
				oValue = {
					"listofClaims": JSON.stringify(oPayLoad),
					"ARF": key === "Error" ? "R" : "",
					"APP_COMMENT": oMainDt.AppRemarks
				};
				this._fnCancellationAppRej(oMsg, oValue, oMainDt);
			} else if (oMainDt.Key === "D") {
				oMsg = key === "Warning" ? "Claim/Request has been approved successfully" : "Claim/Request has been rejected successfully";
				oPayLoad.push(oMainDt.model);
				if (oTabKey !== "Delegate") {
					oValue = {
						"listofClaims": JSON.stringify(oPayLoad),
						"ARF": key === "Error" ? "R" : "",
						"APP_COMMENT": oMainDt.AppRemarks
					};
					this._fnCancellationAppRej(oMsg, oValue, oMainDt);
				} else {
					oValue = {
						"listofClaims": JSON.stringify(oPayLoad),
						"APP_COMMENT": oMainDt.AppRemarks,
						"DELEGATE_APPROVER": this.oViewData.getProperty("/EmpID"),
						"VAR_ARF": key === "Error" ? "R" : ""
					};
					this._fnDelegateAppRej(oMsg, oValue, oMainDt);
				}
			} else if (oMainDt.Key === "RE") {
				oMsg = "Selected record(s) has been cancelled";
				oPayLoad.push(oMainDt.model);
				if (oTabKey !== "Delegate") {
					oValue = {
						"listofClaims": JSON.stringify(oPayLoad),
						"ARF": "C",
						"APP_COMMENT": oMainDt.AppRemarks
					};
					this._fnCancellationAppRej(oMsg, oValue, oMainDt);
				} else {
					oValue = {
						"listofClaims": JSON.stringify(oPayLoad),
						"APP_COMMENT": oMainDt.AppRemarks,
						"DELEGATE_APPROVER": this.oViewData.getProperty("/EmpID"),
						"VAR_ARF": "C"
					};
					this._fnDelegateAppRej(oMsg, oValue, oMainDt);
				}

			} else {
				this._fnCancellation();
			}

		},

		_fnCancellationAppRej: function (oMsg, oValue, oMainDt) {
			this.getView().setBusy(true);
			$.ajax({
				url: "/BenefietCAP/claim/claimApprovalOrReject",
				data: JSON.stringify(oValue),
				method: "POST",
				crossDomain: true,
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json"
				},
				success: function (data, oResponse) {
					this.getView().setBusy(false);
					if (data.value.results.length === 0) {
						this.fnOnCancelRejectDialog();
						this.handleSuccessDialog(oMsg);
						if (oMainDt.Key === "D" || oMainDt.Key === "RE" || oMainDt.Key === "AP") {
							if (this.oViewData.getProperty("/oML") || oMainDt.DM) {
								this.onCloseDialogM(true);
							} else {
								this.onCloseDialog(true);
							}
						}
						this._fnEmailNotification(oValue);
						this.objectMatched();
					} else {
						this._fnShowErrorMessage("Please check your claim posting cut off date");
					}
				}.bind(this),
				error: function (xhr, ajaxOptions, throwError) {
					this.getView().setBusy(false);
					this.handleErrorDialog(xhr);
				}.bind(this)
			});
		},

		_fnDelegateAppRej: function (oMsg, oValue, oMainDt) {
			this.getView().setBusy(true);
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
					this.fnOnCancelRejectDialog();
					this.handleSuccessDialog(oMsg);
					this._fnDelegateData();
					if (oMainDt.Key === "D" || oMainDt.Key === "RE" || oMainDt.Key === "AP") {
						if (this.oViewData.getProperty("/oML") || oMainDt.DM) {
							this.onCloseDialogM(true);
						} else {
							this.onCloseDialog(true);
						}
					}
					this._fnEmailNotification(oValue);
				}.bind(this),
				error: function (xhr, ajaxOptions, throwError) {
					this.getView().setBusy(false);
					this.handleErrorDialog(xhr);
				}.bind(this)
			});
		},

		_fnCancellation: function () {
			var payLoad, model = this.oViewData.getProperty("/oCancelModel");
			if (model.includes("_Master")) {
				payLoad = this.eDialogM.getModel(model).getData();
				this.oViewData.setProperty("/oML", true);
			} else {
				this.oViewData.setProperty("/oML", false);
				payLoad = this.eDialog.getModel(model).getData();
			}
			delete payLoad["@odata.context"];
			this.fnPostEntity(payLoad);
			payLoad.REMARKS_EMPLOYEE = this._oDialogReject.getModel("oRej").getData().AppRemarks;
			payLoad.BEHALF_FLAG = (this.oViewData.getProperty("/oTile") === "Admin" || this.oViewData.getProperty("/oTile") === "AdminSch") ?
				"Y" : "";
			this.getView().setBusy(true);
			$.ajax({
				url: "/BenefietCAP/claim/cancelApproval",
				data: JSON.stringify({
					"listofClaims": JSON.stringify(payLoad),
					"table_Name": this.oViewData.getProperty("/oTableDelName")
				}),
				method: "POST",
				crossDomain: true,
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json"
				},
				success: function (data, oResponse) {
					this.getView().setBusy(false);
					if (data === undefined || data.value === "" || data.value === undefined) {
						this._fnShowErrorMessage("Cancellation Error !!");
					} else {
						if (this.oViewData.getProperty("/oML")) {
							this.onCloseDialogM(true);
						} else {
							this.onCloseDialog(true);
						}
						this.objectMatched();
						this.fnOnCancelRejectDialog();
						this._fnEmailNotification(payLoad, "C");
						this.handleSuccessDialog(data.value);
					}
				}.bind(this),
				error: function (xhr, ajaxOptions, throwError) {
					this.getView().setBusy(false);
					this.handleErrorDialog(xhr);
				}.bind(this)
			});
		},

		_fnEmail: function (oCont, key) {
			this.oViewData.getData().EmailData = [];
			this.oViewData.setProperty("/ClaimType", oCont.CATEGORY_CODE);
			var oName, oClaim;
			if (key === "H" || key === "SA") {
				oName = this.getModel("oEmpData").getProperty("/FULLNAME");
				oClaim = key === "SA" ? oCont.CATEGORY_CODE : oCont.CLAIM_TYPE;
			} else {
				oName = oCont.Claim_Owner_FullName;
				oClaim = oCont.CATEGORY_CODE;
			}

			if (oCont.CLAIM_STATUS === "Pending for Submission") {
				this.oViewData.setProperty("/oEmailStatus", "Pending for approval");
			} else {
				if (oCont.Total_Level === oCont.Current_Level) {
					if ((oCont.CLAIM_STATUS.includes("Cancellation") || oCont.CLAIM_STATUS.includes("Pending")) && key === "H") {
						this.oViewData.setProperty("/oEmailStatus", "Cancelled");
					} else if (oCont.CLAIM_STATUS.includes("Cancellation")) {
						this.oViewData.setProperty("/oEmailStatus", "CAR");
					} else {
						this.oViewData.setProperty("/oEmailStatus", "AR");
					}
				} else {
					if (oCont.CLAIM_STATUS.includes("Cancellation")) {
						this.oViewData.setProperty("/oEmailStatus", "CP");
					} else {
						this.oViewData.setProperty("/oEmailStatus", "PAR");
					}
				}
			}
			this.fnPostEntity();
			var oPayload = {
				"CLAIM_REFERENCE": oCont.CLAIM_REFERENCE,
				"CATEGORY_CODE": oCont.CATEGORY_CODE,
				"CATEGORY_NAME": formatter.oClaimDesc(oCont.CATEGORY_CODE),
				"CLAIM_CODE": oClaim,
				"CLAIM_NAME": oCont.CLAIM_CATEGORY,
				"CLAIM_STATUS": this.oViewData.getProperty("/oEmailStatus"),
				"CLAIM_DATE": oCont.CLAIM_DATE,
				"CLAIM_OWNER_ID": oCont.CLAIM_OWNER_ID,
				"CLAIM_OWNER_NAME": oName,
				"TABLE_NAME": this.oViewData.getProperty("/oTableAppName"),
				"LINEITEM_TABLE_NAME": this.oViewData.getProperty("/oTableAppLineName")
			};
			this.oViewData.getData().EmailData.push(oPayload);
		},

		_fnEmailNotification: function (oVal, key) {
			var oValue = this.oViewData.getData().EmailData[0];
			if (oValue.CLAIM_STATUS === "AR" && key === undefined) {
				oValue.CLAIM_STATUS = (oVal.ARF || oVal.VAR_ARF) === "R" ? "Rejected" : "Approved";
			} else if (oValue.CLAIM_STATUS === "CAR") {
				oValue.CLAIM_STATUS = (oVal.ARF || oVal.VAR_ARF) === "R" ? "Cancellation Rejected" : "Cancellation Approved";
			} else if (oValue.CLAIM_STATUS === "CP") {
				oValue.CLAIM_STATUS = (oVal.ARF || oVal.VAR_ARF) === "R" ? "Cancellation Rejected" : "Cancellation Pending for approval";
			} else if (oValue.CLAIM_STATUS === "PAR") {
				oValue.CLAIM_STATUS = (oVal.ARF || oVal.VAR_ARF) === "R" ? "Rejected" : oVal.ARF === "C" ? "Cancelled" : "Pending for approval";
			} else if (key === "C") {
				oValue.CLAIM_STATUS = "Cancellation Pending for approval";
			}

			$.ajax({
				url: "/BenefietCAP/claim/sendEmailNotification",
				data: JSON.stringify(oValue),
				method: "POST",
				crossDomain: true,
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json"
				},
				success: function (data) {
					sap.m.MessageToast.show("Email Sent");
				}.bind(this),
				error: function (response) {
					// this.handleErrorDialog(response);
				}.bind(this)
			});
		},

		///// ********* Approvals ********* //////////

		onSearchHistoryClaim: function () {
			var odata = this.oViewData.getData(),
				oFilter = [];
			if (odata.oHisClaimType) {
				oFilter.push(new Filter("CATEGORY_CODE", FilterOperator.Contains, odata.oHisClaimType));
			}
			if (odata.oHisSdate) {
				oFilter.push(new Filter("CLAIM_DATE", FilterOperator.BT, odata.oHisSdate.toISOString().substring(0, 10), odata.oHisEdate.toISOString()
					.substring(0, 10)));
			}
			var oTable = this.getView().byId("tbApprovalDetailsHistory").getBinding("items");
			oTable.filter(oFilter, true);
		},

		onSearchDelegate: function () {
			var oEmp = this.oViewData.getProperty("/Del_EmpID"),
				oSdate = this.oViewData.getProperty("/Del_oSdate").toString(),
				oEdate = this.oViewData.getProperty("/Del_oEdate").toString();
			if (oEmp) {
				$.ajax({
					method: "GET",
					url: "/BenefietCAP/claim/app_histwithCancel?$top=100000&$filter=EMPLOYEE_ID eq '" + oEmp +
						"' and CLAIM_DATE ge " + oSdate + " and CLAIM_DATE le " + oEdate +
						" and CLAIM_STATUS ne 'Approved' and CLAIM_STATUS ne 'Cancellation Approved' and CLAIM_STATUS ne 'Rejected' and CLAIM_STATUS ne 'Cancelled'",
					dataType: "json",
					success: function (data) {
						if (data.value.length > 0) {
							var oModel = this._getSizeLimit(data.value);
							this.getView().setModel(oModel, "ApprovalDelegModel");
						} else {
							this.getView().setModel(new JSONModel([]), "ApprovalDelegModel");
						}
					}.bind(this),
					error: function (response) {
						this.handleErrorDialog(response);
					}.bind(this)
				});
			} else {
				this._fnShowErrorMessage("Please select delegator");
			}
		},

		_fnDelegateData: function (oEmpId) {
			if (!oEmpId) {
				oEmpId = this.oViewData.getProperty("/EmpID");
			}
			var soURL = "/BenefietCAP/claim/app_delegation(delegator_id='" + oEmpId +
				"')/Set?$top=100000&$filter=CLAIM_STATUS ne 'Approved' and CLAIM_STATUS ne 'Cancellation Approved' and CLAIM_STATUS ne 'Rejected' and CLAIM_STATUS ne 'Cancelled'";
			$.ajax({
				method: "GET",
				url: soURL,
				dataType: "json",
				success: function (data) {
					if (data.value.length > 0) {
						var oModel = this._getSizeLimit(data.value);
						this.getView().setModel(oModel, "ApprovalDelegModel");
					} else {
						this.getView().setModel(new JSONModel([]), "ApprovalDelegModel");
					}
				}.bind(this),
				error: function (response) {
					this.handleErrorDialog(response);
				}.bind(this)
			});
		},

		onTotalAmounts: function (oEvent, model) {
			var oAmount = 0.00,
				data = oEvent.getSource().getModel(model).getData();
			for (var i = 0; i < data.length; i++) {
				if (data[i].AMOUNT !== null) {
					oAmount += parseFloat(data[i].AMOUNT, 10);
				}
			}
			if (model === "ApprovalModel") {
				this.oViewData.setProperty("/TotalClaim", oAmount.toFixed(2));
			} else {
				this.oViewData.setProperty("/TotalClaimHistory", oAmount.toFixed(2));
			}
		},

		_fnAdminValidation: function (data) {
			this.oViewData.getData().Approvers = [];
			var oCont = this.oViewData.getData().AttachValidation,
				oValCont = [];
			$.each(oCont[0], function (idx, obj) {
				if (data.CLAIM_TYPE === "TC" || data.CLAIM_TYPE.includes("SP") || data.CLAIM_TYPE === "COV" || data.CLAIM_TYPE === "WRC" || data
					.CLAIM_TYPE === "WRC_HR") {
					if (obj.Claim_Category === data.CATEGORY_CODE && obj.Company === "MOHH") {
						oValCont.push(obj);
					}
				} else {
					if (obj.Claim_Code === data.CLAIM_TYPE && obj.Company === "MOHH") {
						oValCont.push(obj);
					}
				}
			});
			this.oViewData.getData().Approvers.push(oValCont);
			oValCont.sort(function (a, b) {
				return new Date(a.Start_Date) - new Date(b.Start_Date); // descending
			});
			return oValCont[0];

		},

		onSelectItemApproval: function (oEvent, model, mode) {
			var oData = oEvent.getSource().getBindingContext(model).getObject();
			this.oViewData.setProperty("/ClaimType", oData.CATEGORY_CODE);
			this.oViewData.setProperty("/oHis", false);
			//Allow_Approver, Show_Entitlement
			var oCont = this._fnAdminValidation(oData);
			// this.oViewData.setProperty("/oMod_Entit", oCont.Show_Entitlement);

			if (oData.CLAIM_STATUS === "Approved" || oData.CLAIM_STATUS === "Rejected" || oData.CLAIM_STATUS === "Cancelled" || oData.CLAIM_STATUS ===
				"Cancellation Approved" || !mode) {
				this.oViewData.setProperty("/App", false);
				this.oViewData.setProperty("/DMode", false);
			} else {
				if (oData.CATEGORY_CODE === "SDFR" || oData.CATEGORY_CODE ===
					"SDFC" || oData.CATEGORY_CODE === "OC" || oData.CATEGORY_CODE === "PAY_UP" || oData.CATEGORY_CODE === "CPC" || oData.CATEGORY_CODE ===
					"CPR") {
					this.oViewData.setProperty("/DMode", false);
				} else {
					this.oViewData.setProperty("/DMode", true);
				}
				this.oViewData.setProperty("/App", true);
			}
			if (oCont) {
				if (oCont.Allow_Approver === "No") {
					this.oViewData.setProperty("/DMode", false);
				}
			}

			this._fnEmail(oData);
			var oURL = this._fnGenPutEntity(oData);
			$.ajax({
				method: "GET",
				url: oURL,
				dataType: "json",
				success: function (response) {
					this.fnOpenFragmentApp(response, oData.CLAIM_STATUS);
					this._fnAppRemarks(response);
					this._fnCancelClaim(response);
				}.bind(this),
				error: function (response) {
					this.handleErrorDialog(response);
				}.bind(this)
			});

		},

		fnOpenFragmentApp: function (oData, key) {
			var name = this.oViewData.getProperty("/oModelName"),
				oVal = key.includes("Pending");
			if (oData.CATEGORY_CODE === "WRC_HR" || oData.CATEGORY_CODE === "WRC" || oData.CATEGORY_CODE === "COV" || oData.CATEGORY_CODE.includes(
					"SP") || oData.CATEGORY_CODE === "TC" || oData.CATEGORY_CODE.includes("SDF") || oData.CATEGORY_CODE === "CPC" || oData.CATEGORY_CODE ===
				"OC" || oData.CATEGORY_CODE === "PAY_UP") {
				if (oVal && this.oViewData.getProperty("/DMode")) {
					this.onEditWRC("H", name, name + "_Master", oData);
				} else {
					this.onSubDetailWRC("H", name, name + "_Master", oData);
				}
			} else {
				if (oVal && this.oViewData.getProperty("/DMode")) {
					this.onEdit("H", name, oData);
				} else {
					this.onSubDetail("H", name, oData);
				}
			}
		},

		onSubmit: function (oEvent, key) {
			var oTable = this.getView().byId("tbApprovalDetails"),
				selectedItems = oTable.getSelectedItems();
			if (selectedItems.length === 0) {
				sap.m.MessageToast.show("Please select a claim to Approve/Reject");
			} else {
				var oModel = new JSONModel({
					"Title": "Confirmation",
					"lbl": "Approver Remarks",
					"State": key === "A" ? "Warning" : "Error",
					"Remarks": key === "A" ? true : false,
					"SubTitle": key === "A" ? "Selected record(s) to be approved?" : "Selected record(s) to be rejected?",
					"Key": "V"
				});
				this._fnRejectionDialog(oModel);
			}
		},
		onSubmitD: function (oEvent, code, model, key) {
			oEvent.getSource().setEnabled(false);
			this.oSource = oEvent.getSource();
			this.oViewData.setProperty("/btnEvent", oEvent);
			var payLoad, oNameTile = this.oViewData.getProperty("/oTile");
			this.oViewData.setProperty("/oAppRejKey", key);
			if (code === "WRC_HR" || code === "WRC" || code === "COV" || code.includes("SP") || code === "TC" || code.includes("SDF") || code ===
				"OC" || code === "CPC" || code === "PAY_UP") {
				payLoad = this.eDialogM.getModel(model).getData();
				this.oViewData.setProperty("/oML", true);
			} else {
				if (this.hasChange && code !== "TIM" && key === "A") {
					this._fnShowErrorMessage("Please press the Compute button again to verify the claim amount before submitting");
					this.oSource.setEnabled(true);
					return;
				}
				payLoad = this.eDialog.getModel(model).getData();
				this.oViewData.setProperty("/oML", false);
			}
			if (key === "A" && (parseFloat(payLoad.CLAIM_AMOUNT) <= 0 || parseFloat(payLoad.CLAIM_AMOUNT) <= 0.00) && code !== "PAY_UP") {
				this._fnShowErrorMessage("Claim amount = $0 is not allowed.");
				this.oSource.setEnabled(true);
				return;
			}
			if (code === "SDFR") {
				payLoad.COURSE_END_DATE = payLoad.COURSE_END_DATE === null ? null : payLoad.COURSE_END_DATE.substring(0, 10);
				payLoad.CUMULATIVE_CAP = payLoad.CUMULATIVE_CAP.toString();
			}

			this.oViewData.setProperty("/oDlgName", model);
			var sURL = this.fnPutEntity(payLoad),
				oData = {
					"AMOUNT": payLoad.CLAIM_AMOUNT,
					"CATEGORY_CODE": payLoad.CATEGORY_CODE,
					"CLAIM_DATE": payLoad.CLAIM_DATE,
					"CLAIM_OWNER_ID": payLoad.EMPLOYEE_ID,
					"CLAIM_REFERENCE": payLoad.CLAIM_REFERENCE,
					"CLAIM_STATUS": key === "A" ? "Approved" : "Rejected",
					"CLAIM_TYPE": payLoad.CLAIM_CODE,
					"EMPLOYEE_ID": this.oViewData.getProperty("/EmpID"),
					"EMPLOYEE_NAME": this.oViewData.getProperty("/FULLNAME")
				},
				oModel = new JSONModel({
					"Title": "Confirmation",
					"State": key === "A" ? "Warning" : "Error",
					"Remarks": key === "A" ? true : false,
					"lbl": "Approver Remarks",
					"SubTitle": key === "A" ? "Claim record to be approved?" : "Claim record to be rejected?",
					"model": oData,
					"Key": "D"
				});
			// Amrit added this condition as per KM requirement
			if (payLoad.CLAIM_STATUS.includes("Cancellation Pending") || key === "R") {
				this._fnClaimSubmitApp(payLoad, sURL, oModel);
			} else {
				$.ajax({
					url: "/BenefietCAP/claim/validateClaimSubmission",
					data: JSON.stringify({
						"claimCode": payLoad.CLAIM_CODE,
						"claimReference": (key === "R") ? "" : payLoad.CLAIM_REFERENCE,
						"claimDate": payLoad.CLAIM_DATE,
						"receiptDate": payLoad.RECEIPT_DATE === undefined ? null : payLoad.RECEIPT_DATE,
						"receiptNumber": payLoad.RECEIPT_NUMBER ? payLoad.RECEIPT_NUMBER : "",
						"isHr": (oNameTile === "Admin" || oNameTile === "AdminSch" || payLoad.BEHALF_FLAG === "Y" || oNameTile ===
							"SMSApprovals") ? "X" : "",
						"employeeId": payLoad.EMPLOYEE_ID,
						"isMode": "X"
					}),
					method: "POST",
					crossDomain: true,
					headers: {
						"Accept": "application/json",
						"Content-Type": "application/json"
					},
					success: function (datap) {
						if (this.oViewData.getProperty("/oML")) {
							this._fnAttachCheck(payLoad, sURL, oModel);
						} else {
							this._fnClaimSubmitApp(payLoad, sURL, oModel);
						}
					}.bind(this),
					error: function (response) {
						var oMessage = JSON.parse(response.responseText).error.message;
						if (oMessage.includes(payLoad.CLAIM_REFERENCE)) {
							this._fnClaimSubmitApp(payLoad, sURL, oModel);
						} else {
							this.oSource.setEnabled(true);
							this.handleErrorDialog(response);
						}
					}.bind(this)
				});
			}

		},

		_fnAttachCheck: function (payLoad, sURL, oModel) {
			var oPayData = [];
			for (var k = 0; k < payLoad.LINE_ITEM.length; k++) {
				var oJson = {
					"CLAIM_REFERENCE": payLoad.LINE_ITEM[k].CLAIM_REFERENCE,
					"COMPANY": this.getView().getModel("oEmpData").getProperty("/COMPANY"),
					"CLAIM_CODE": payLoad.LINE_ITEM[k].CLAIM_CODE
				};
				oPayData.push(oJson);
			}

			$.ajax({
				url: "/BenefietCAP/browseUpload/checkAttachment",
				data: JSON.stringify({
					"listofClaim": oPayData
				}),
				method: "POST",
				crossDomain: true,
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json"
				},
				success: function (data) {
					if (data.value.length === 0) {
						this._fnClaimSubmitApp(payLoad, sURL, oModel);
					} else {
						this.oSource.setEnabled(true);
						this._fnShowErrorMessage("Line Item attachment missing");
					}
				}.bind(this),
				error: function (response) {
					this.oSource.setEnabled(true);
					this.handleErrorDialog(response);
				}.bind(this)
			});

		},

		_fnClaimSubmitApp: function (payLoad, sURL, oModel) {
			$.ajax({
				url: sURL,
				data: JSON.stringify(payLoad),
				method: "PUT",
				crossDomain: true,
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json"
				},
				success: function (data, resp) {
					this._fnClaimStatusUpdate(payLoad, oModel);
				}.bind(this),
				error: function (xhr, ajaxOptions, throwError) {
					this.getView().setBusy(false);
					this.oSource.setEnabled(true);
					this.handleErrorDialog(xhr);
				}.bind(this)
			});
		},

		_fnClaimStatusUpdate: function (oPayload, oModel) {
			var eURL = "/BenefietCAP/claim/approval(CLAIM_REFERENCE='" + oPayload.CLAIM_REFERENCE + "')";
			$.ajax({
				url: eURL,
				method: "GET",
				crossDomain: true,
				success: function (data, resp) {
					delete data["@odata.context"];
					data.AMOUNT = oPayload.CLAIM_AMOUNT;
					$.ajax({
						url: eURL,
						data: JSON.stringify(data),
						method: "PUT",
						crossDomain: true,
						headers: {
							"Accept": "application/json",
							"Content-Type": "application/json"
						},
						success: function (oData) {
							this._fnRejectionDialog(oModel);
						}.bind(this),
						error: function (xhr, ajaxOptions, throwError) {
							this.getView().setBusy(false);
							this.oSource.setEnabled(true);
							this.handleErrorDialog(xhr);
						}.bind(this)
					});
				}.bind(this),
				error: function (xhr, ajaxOptions, throwError) {
					this.getView().setBusy(false);
					this.handleErrorDialog(xhr);
				}.bind(this)
			});
		},

		onSelfPress: function (oEvent) {
			this.oViewData.setProperty("/oDelegID", false);
			this.oViewData.setProperty("/oSelf", false);
			this.oViewData.setProperty("/oDeleg", true);
			this.oViewData.setProperty("/Del_EmpID", "");
		},

		onDelPress: function (oEvent) {
			this.oViewData.setProperty("/oDelegID", true);
			this.oViewData.setProperty("/oSelf", true);
			this.oViewData.setProperty("/oDeleg", false);
		},

		onCopyData: function (key) {
			var oValue = this._fnModel(key),
				oModelData = this.eDialogM.getModel(oValue).getData();
			delete oModelData["@odata.context"];

			var oPayload = {
				"masterClaim": JSON.stringify(oModelData),
				"cancelClaim": this.getModel("oCancelClaims").getData(),
				"table_Name": this.oViewData.getProperty("/oCancelClaim")
			};
			$.ajax({
				url: "/BenefietCAP/claim/copyLineItems",
				data: JSON.stringify(oPayload),
				method: "POST",
				crossDomain: true,
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json"
				},
				success: function (oData) {
					this.onCloseDialogM(true);
					this.handleSuccessDialog(oData.value);
				}.bind(this),
				error: function (xhr, ajaxOptions, throwError) {
					this.handleErrorDialog(xhr);
				}.bind(this)
			});
		},

		/////////// Admin History Report //////////////

		onHistoryClaim: function (key) {
			if (this.oViewData.getProperty("/IntSdate") && this.oViewData.getProperty(
					"/IntEdate")) {
				this._getBusyIndicator().show();
				var oPernr = this.getView().byId("inpEmpIDHis").getTokens(),
					oKey = [],
					oURL,
					oFilt = "",
					oAdmin = this.oViewData.getProperty("/LoginID"),
					oPA = this.oCompany,
					oPSA = this.oViewData.getProperty("/IntPSA"),
					oSdate = this.oViewData.getProperty("/IntSdate"),
					oEdate = this.oViewData.getProperty("/IntEdate"),
					oCateg = this.oViewData.getProperty("/ClaimCateg") ? this.oViewData.getProperty("/ClaimCateg") : "",
					oClaimT = this.oViewData.getProperty("/ClaimCate") ? this.oViewData.getProperty("/ClaimCate") : "",
					oStatus = this.oViewData.getProperty("/Status") ? this.oViewData.getProperty("/Status") : "",
					oEmp = this.oViewData.getProperty("/EmpID_App_Rep"),
					oRecp = this.oViewData.getProperty("/oReceiptdate");

				if (oPernr.length > 0) {
					for (var i = 0; i < oPernr.length; i++) {
						oKey.push(oPernr[i].getKey());
					}
					oKey = JSON.stringify(oKey);
				}

				if (oEmp) {
					oKey.push(oEmp);
					oKey = JSON.stringify(oKey);
				}
				if (oRecp) {
					oFilt = "?$filter=RECEIPT_DATE eq " + oRecp + "";
				}

				if (key === "D") {
					oURL = "/BenefietCAP/calclaim/exportExcelClaim(USERID='" + oKey + "',fromDate=" + oSdate + ",toDate=" + oEdate +
						",CORDIN='',Personnel_Area='" + oPA + "',Personal_Subarea='" + oPSA + "',Pay_Grade='',Division='',HR_ADMIN='" + oAdmin +
						"',CLAIM_STATUS='" + oStatus + "',CLAIM_TYPE='" + oClaimT + "',CATEGORY_CODE='" + oCateg +
						"')";
				} else {
					// oURL = "/BenefietCAP/claim/app_histwithCancel?$filter=EMPLOYEE_ID eq '" + oKey + "' or CLAIM_DATE ge " + oSdate +
					// 	" and CLAIM_DATE le " + oEdate + " and Personel_Area eq '" + oPA + "' and Personel_SubArea eq '" + oPSA + "' or payGrade eq '" +
					// 	oPay + "' or division eq '" + oDiv + "'";
					oURL = "/BenefietCAP/claim/ApprovalHistory(USERID='" + oKey + "',fromDate=" + oSdate + ",toDate=" + oEdate +
						",CORDIN='',Personnel_Area='" + oPA + "',Personal_Subarea='" + oPSA + "',Pay_Grade='',Division='',HR_ADMIN='" + oAdmin +
						"',CLAIM_STATUS='" + oStatus + "',CLAIM_TYPE='" + oClaimT + "',CATEGORY_CODE='" + oCateg +
						"')" + oFilt;
				}
				$.ajax({
					method: "GET",
					url: oURL,
					dataType: "json",
					success: function (data) {
						this._getBusyIndicator().hide();
						if (key === "D") {
							var href = "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64," + data.value,
								element = document.createElement('a');
							element.setAttribute('href', href);
							element.setAttribute('download', "ClaimReport.xlsx");
							element.style.display = 'none';
							document.body.appendChild(element);
							element.click();
							document.body.removeChild(element);
						} else {
							this._fnHistoryData(data);
						}
					}.bind(this),
					error: function (response) {
						this._getBusyIndicator().hide();
						this.handleErrorDialog(response);
					}.bind(this)
				});
			} else {
				this._fnShowErrorMessage("No data");
			}
		},

		_fnHistoryData: function (data) {
			if (data.value.length > 0) {
				var oModel = this._getSizeLimit(data.value);
				this.getView().setModel(oModel, "ApprovalModel");
			} else {
				this.getView().setModel(new JSONModel([]), "ApprovalModel");
				this._fnShowErrorMessage("No data");
			}
		},

		onClearRep: function () {
			this.getView().byId("inpEmpIDHis").setTokens([]);
			this.getView().setModel(new JSONModel([]), "ApprovalModel");
			this.oViewData.setProperty("/IntPA", "");
			this.oViewData.setProperty("/IntPSA", "");
			this.oViewData.setProperty("/ClaimCateg", "");
			this.oViewData.setProperty("/ClaimCate", "");
			this.oViewData.setProperty("/Status", "");
			this.oViewData.setProperty("/EmpID_App_Rep", "");
			// var osDate = new Date().getFullYear() + "-01-01",
			// 	oeDate = new Date().getFullYear() + "-12-31";
			this.oViewData.setProperty("/IntSdate", null);
			this.oViewData.setProperty("/IntEdate", null);
			$(".datePicker1").val(null);
			$(".datePicker2").val(null);
			$(".receiptdate").val(null);
		},

		onSearchReroute: function () {
			var oEmpId = this.oViewData.getProperty("/oReRouteEmp");
			if (oEmpId) {
				$.ajax({
					method: "GET",
					url: "/BenefietCAP/claim/app_histwithCancel?$top=100000&$filter=EMPLOYEE_ID eq '" + oEmpId +
						"' and CLAIM_STATUS ne 'Approved' and CLAIM_STATUS ne 'Cancellation Approved' and CLAIM_STATUS ne 'Rejected' and CLAIM_STATUS ne 'Cancelled'",
					dataType: "json",
					success: function (data) {
						if (data.value.length > 0) {
							var oModel = this._getSizeLimit(data.value);
							this.getView().setModel(oModel, "AdminApprovalModel");
						} else {
							this.getView().setModel(new JSONModel([]), "AdminApprovalModel");
						}
					}.bind(this),
					error: function (response) {
						this.handleErrorDialog(response);
					}.bind(this)
				});
			} else {
				this._fnShowErrorMessage("Please select approver");
			}
		},

		onSearchkey: function (oEvent) {
			var key = oEvent.getSource().getValue(),
				oEmpId = this.oViewData.getProperty("/EmpID"),
				oURL = "/BenefietCAP/claim/app_histwithlineItem_ClaimSearch(EMP_LINEITEM='" + oEmpId +
				"')/Set?$top=100000&$filter=Line_claim_reference eq '" + key + "'";
			this._fnApprovalModel(oURL);
			if (oEvent.getParameters().clearButtonPressed) {
				this.onSearchs("H");
			}
		}

	});

});