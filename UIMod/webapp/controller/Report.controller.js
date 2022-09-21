sap.ui.define([
	"BenefitClaim/ZBenefitClaim/controller/BaseController",
	"sap/m/MessageToast",
	"sap/ui/core/Fragment",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"../utils/Validator",
	"../model/formatter"
], function (BaseController, MessageToast, Fragment, JSONModel, Filter, FilterOperator, Validator, formatter) {
	"use strict";

	return BaseController.extend("BenefitClaim.ZBenefitClaim.controller.Report", {
		formatter: formatter,
		onInit: function () {
			this.getOwnerComponent().getRouter().getRoute("ReportRouteName").attachPatternMatched(this.objectMatched, this);
			this.oViewData = this.getOwnerComponent().getModel("ViewData");
			this.getOwnerComponent().setModel(new JSONModel({}), "oEmailReport");
			this.getOwnerComponent().setModel(new JSONModel([]), "oReportDetails");
			this.oViewData.setProperty("/ClaimCateg", "");
			this.oViewData.setProperty("/ClaimCate", "");
			this.oViewData.setProperty("/Status", "");
			this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			setTimeout(this._fnDropdowns(), 50);
			this._fnEmpJob();
			this.onLoadYear();
		},
		objectMatched: function () {
			if (this.oViewData.getProperty("/oTile") === "SMSRep") {
				var oFilterInt = this.getView().byId("fbFilterSMS");
				oFilterInt._oSearchButton.setProperty("text", "SEARCH");
				oFilterInt._oClearButtonOnFB.setProperty("text", "CLEAR");
				this.getView().setBusy(true);
				this.loadDatePicker(this.oViewData, "create", "InvDateSMS", "ViewData", "InvDateSMS");
				this.loadDatePicker(this.oViewData, "create", "PostdateSMS", "ViewData", "PostdateSMS");
				this.oViewData.setProperty("/Emp_SMS", "");
				this.oViewData.setProperty("/ClaimNoSMS", "");
				this.oViewData.setProperty("/ClaimLineNoSMS", "");
				this.oViewData.setProperty("/StatusSMS", "");
				this.oViewData.setProperty("/ClaimCategSMS", "");
				this.oViewData.setProperty("/InvDateSMS", null);
				this.oViewData.setProperty("/PostdateSMS", null);
				$(".InvDateSMS").val(null);
				$(".PostdateSMS").val(null);
				$.ajax({
					url: "/BenefietCAP/claim/SMS_PAYMENT_REPORT",
					method: "GET",
					crossDomain: true,
					success: function (odata, oResponse) {
						this.getOwnerComponent().setModel(new JSONModel(odata.value), "oSMSDetails");
						this.getView().setBusy(false);
					}.bind(this),
					error: function (xhr, ajaxOptions, throwError) {
						this.getOwnerComponent().setModel(new JSONModel([]), "oSMSDetails");
						this.getView().setBusy(false);
						this.handleErrorDialog(xhr);
					}.bind(this)
				});
			}
			if (this.oViewData.getProperty("/oTile") === "Ring") {
				this.getOwnerComponent().setModel(new JSONModel([]), "oRingAmntDetails");
				this.oViewData.setProperty("/ClaimCate", "");
				this.oViewData.setProperty("/EmpIDring", "");
				this.oViewData.setProperty("/tb_Ringfence", 0);
			} else {
				this.loadDatePicker(this.oViewData, "create", "oRepSdate", "ViewData", "datePicker1");
				this.loadDatePicker(this.oViewData, "create", "oRepEdate", "ViewData", "datePicker2");
			}
		},

		onAfterRendering: function () {
			var oFilter = this.getView().byId("fbFilter");
			oFilter._oSearchButton.setProperty("text", "SEARCH");
			oFilter._oClearButtonOnFB.setProperty("text", "CLEAR");
			if (this.oViewData.getProperty("/oTile") === undefined) {
				this._oRouter.navTo("home");
			}
		},

		onSearchRep: function () { // oRepCateg
			var oURL, payLoad, year = this.oViewData.getProperty("/oRepYear"),
				EmployeeId = this.getView().getModel("oEmpData").getProperty("/USERID"),
				oEmpId = this.oViewData.getProperty("/oTile") === "Report" ? EmployeeId : this.oViewData.getProperty(
					"/oRepEmp");
			if (this.oViewData.getProperty("/oTile") === "Report") {
				if (this.oViewData.getProperty("/oRepYear") === "" || !this.oViewData.getProperty("/oRepYear")) {
					this._fnShowErrorMessage("Please select year");
				} else {
					var oCategoryIN = this.oViewData.getProperty("/ClaimCate"),
						oValuei = "";
					if (oCategoryIN) {
						oValuei = " and CLAIM_CODE_VALUE eq '" + oCategoryIN + "'";
					}
					oURL = "/BenefietCAP/claim/PRORATED_CLAIMS_YTD?$filter=YEAR eq '" + year + "' and EMPLOYEE eq '" + oEmpId + "'" + oValuei;
					this._fnADReport(oURL, "EMP");
				}
			} else if (this.oViewData.getProperty("/oTile") === "ADReport") {
				if (!this.oViewData.getProperty("/ClaimCate") || !this.oViewData.getProperty("/oRepYear")) {
					this._fnShowErrorMessage("Please select all mandatory field");
				} else {
					var oCategory = this.oViewData.getProperty("/ClaimCate"),
						oValue = "",
						seURL;
					if (oCategory) {
						oValue = " and CLAIM_CODE_VALUE eq '" + oCategory + "'";
					}
					oURL = "/BenefietCAP/claim/PRORATED_CLAIMS_YTD/$count?$filter=YEAR eq '" + year + "'";
					seURL = "&$filter=YEAR eq '" + year + "'" + oValue;
					this._fnADReport(oURL, "SP", seURL);
				}
			} else if (this.oViewData.getProperty("/oTile") === "INReport") {
				this.onEmReport();
			} else {
				if (this.oViewData.getProperty("/oRepYear")) {
					var key = "",
						oUrl = "/BenefietCAP/calclaim/MEDISAVE_REPORT?$filter=YEAR eq '" + year + "'";
					if (this.oViewData.getProperty("/ClaimCate")) {
						key = " and CLAIM_CODE_VALUE eq '" + this.oViewData.getProperty(
							"/ClaimCate") + "'";
					}
					if (this.oViewData.getProperty("/EmpIDring")) {
						key = " and EMPLOYEE eq '" + this.oViewData.getProperty(
							"/EmpIDring") + "'";
					}
					if (this.oViewData.getProperty("/ClaimCate") && this.oViewData.getProperty("/EmpIDring")) {
						key = " and CLAIM_CODE_VALUE eq '" + this.oViewData.getProperty(
							"/ClaimCate") + "' and EMPLOYEE eq '" + this.oViewData.getProperty(
							"/EmpIDring") + "'";
					}
					this._getBusyIndicator().show();
					$.ajax({
						url: oUrl + key,
						method: "GET",
						crossDomain: true,
						success: function (odata, oResponse) {
							var oModel = this._getSizeLimit(odata.value);
							this.getView().setModel(oModel, "oRingAmntDetails");
							this._getBusyIndicator().hide();
						}.bind(this),
						error: function (xhr, ajaxOptions, throwError) {
							this._getBusyIndicator().hide();
							this.getOwnerComponent().setModel(new JSONModel([]), "oRingAmntDetails");
							this.handleErrorDialog(xhr);
						}.bind(this)
					});
				} else {
					this._fnShowErrorMessage("Please select year");
				}
			}
		},

		onSearchs: function (key) {
			var odata = this.oViewData.getData(),
				oFilter = [];

			if (odata.ClaimCategSMS) {
				oFilter.push(new Filter("CLAIM_CATEGORY", FilterOperator.EQ, odata.ClaimCategSMS));
			}
			if (odata.StatusSMS) {
				oFilter.push(new Filter("CLAIM_STATUS", FilterOperator.EQ, odata.StatusSMS));
			}
			if (odata.InvDateSMS) {
				oFilter.push(new Filter("INVOICE_DATE", FilterOperator.EQ, odata.InvDateSMS));
			}
			if (odata.PostdateSMS) {
				oFilter.push(new Filter("POST_DATE", FilterOperator.EQ, odata.PostdateSMS));
			}
			if (odata.ClaimNoSMS) {
				oFilter.push(new Filter("CLAIM_REFERENCE", FilterOperator.Contains, odata.ClaimNoSMS));
			}
			if (odata.ClaimLineNoSMS) {
				oFilter.push(new Filter("LINE_ITEM_REFERENCE_NUMBER", FilterOperator.Contains, odata.ClaimLineNoSMS));
			}
			if (odata.Emp_SMS) {
				oFilter.push(new Filter("EMPLOYEE_ID", FilterOperator.EQ, odata.Emp_SMS));
			}
			var oTable = this.getView().byId("tbSMSDetails").getBinding("items");
			oTable.filter(oFilter, true);
			this.oViewData.setProperty("/tbSMSDetails", oTable.iLength);
		},

		onClear: function () {
			this.oViewData.setProperty("/Emp_SMS", "");
			this.oViewData.setProperty("/ClaimNoSMS", "");
			this.oViewData.setProperty("/ClaimLineNoSMS", "");
			this.oViewData.setProperty("/StatusSMS", "");
			this.oViewData.setProperty("/ClaimCategSMS", "");
			this.oViewData.setProperty("/InvDateSMS", null);
			this.oViewData.setProperty("/PostdateSMS", null);
			$(".InvDateSMS").val(null);
			$(".PostdateSMS").val(null);
			this.onSearchs();
		},

		_fnjobschedule: function (sURL, oURL, payLoad, oSurl, timerId) {
			$.ajax({
				url: sURL,
				method: "GET",
				crossDomain: true,
				success: function (odata, oResponse) {
					if (odata.value.length > 0) {
						if (odata.value[0].job_status === "Y") {
							this.getView().setBusy(false);
							this._fnADReport(oURL, payLoad, "SP");
							clearInterval(timerId);
						} else {
							//
						}
					} else {
						this._fnYTDspawn(oSurl);
					}
				}.bind(this),
				error: function (xhr, ajaxOptions, throwError) {
					this.getView().setBusy(false);
					this.handleErrorDialog(xhr);
				}.bind(this)
			});
		},

		_fnYTDspawn: function (oSurl) {
			$.ajax({
				url: oSurl,
				method: "GET",
				crossDomain: true,
				success: function (odata, oResponse) {
					// this.getOwnerComponent().setModel(new JSONModel(odata.value), "oRingAmntDetails");
				}.bind(this),
				error: function (xhr, ajaxOptions, throwError) {
					this.handleErrorDialog(xhr);
				}.bind(this)
			});
		},

		onClearRep: function () {
			this.oViewData.setProperty("/oRepYear", "");
			if (this.oViewData.getProperty("/oTile") === "Report") {
				this.oViewData.setProperty("/EmpID", "");
				this.getView().setModel(new JSONModel([]), "oReportDetails");
			} else if (this.oViewData.getProperty("/oTile") === "INReport") {
				this.oViewData.setProperty("/oRepSdate", null);
				this.oViewData.setProperty("/oRepEdate", null);
				$(".datePicker1").val(null);
				$(".datePicker2").val(null);
				this.getOwnerComponent().setModel(new JSONModel([]), "oEmailReport");
			} else if (this.oViewData.getProperty("/oTile") === "ADReport") {
				this.getView().byId("inpEmpIDHisAD").setTokens([]);
				this.getView().setModel(new JSONModel([]), "oReportDetails");
				this.oViewData.setProperty("/oRepYear", "");
				this.oViewData.setProperty("/IntPAHR", "");
				this.oViewData.setProperty("/IntPSAHR", "");
				this.oViewData.setProperty("/IntPayGradeHR", "");
				this.oViewData.setProperty("/IntDivisionHR", "");
				this.oViewData.setProperty("/ClaimCateg", "");
				this.oViewData.setProperty("/ClaimCate", "");
				this.oViewData.setProperty("/Status", "");
			} else if (this.oViewData.getProperty("/oTile") === "Ring") {
				this.oViewData.setProperty("/ClaimCate", "");
				this.oViewData.setProperty("/EmpIDring", "");
				this.oViewData.setProperty("/oRepYear", new Date().getFullYear());
				this.onSearchRep();
			} else {
				this.oViewData.setProperty("/oRepEmp", "");
			}
		},

		onLoadYear: function () {
			var oYear = new Date().getFullYear(),
				oYearData = [];
			this.oViewData.setProperty("/oRepYear", oYear);
			for (var i = 9; i >= 0; i--) {
				var oData = {
					"Year": oYear - i
				};
				oYearData.push(oData);
			}
			this.getView().setModel(new JSONModel(oYearData), "oYearDetails");
		},

		_fnADReport: function (oURL, key, fURL) {
			this.getView().setBusy(true);
			if (key === "SP") {
				$.ajax({
					url: oURL,
					method: "GET",
					crossDomain: true,
					headers: {
						"Accept": "application/json",
						"Content-Type": "application/json"
					},
					success: function (data, oResponse) {
						var oCount = data,
							oReport = [];
						this._fnReportLoop(oCount, 0, oReport, fURL);
					}.bind(this),
					error: function (xhr, ajaxOptions, throwError) {
						this.getOwnerComponent().setModel(new JSONModel({}), "oReportAdminDetails");
						this.getView().setBusy(false);
						this.handleErrorDialog(xhr);
					}.bind(this)
				});
			} else {
				$.ajax({
					url: oURL,
					// data: JSON.stringify(payLoad),
					method: "GET",
					crossDomain: true,
					headers: {
						"Accept": "application/json",
						"Content-Type": "application/json"
					},
					success: function (data, oResponse) {
						// var oModel = this._getSizeLimit();
						this.getOwnerComponent().setModel(new JSONModel(data.value), "oReportDetails");
						this.getView().setBusy(false);
					}.bind(this),
					error: function (xhr, ajaxOptions, throwError) {
						this.getOwnerComponent().setModel(new JSONModel({}), "oReportDetails");
						this.getView().setBusy(false);
						this.handleErrorDialog(xhr);
					}.bind(this)
				});
			}
		},

		_fnReportLoop: function (count, i, oReport, value) {
			var oURL = "BenefietCAP/claim/PRORATED_CLAIMS_YTD?$skip=" + i + "&$top=100000" + value;
			$.ajax({
				url: oURL,
				method: "GET",
				crossDomain: true,
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json"
				},
				success: function (data, oResponse) {
					oReport = oReport.concat(data.value);
					// if()    
					if (i < count) {
						i = i + 100000;
						this._fnReportLoop(count, i, oReport, value);
					} else {
						this.getView().setBusy(false);
						this.getOwnerComponent().setModel(new JSONModel(oReport), "oReportAdminDetails");
					}
				}.bind(this),
				error: function (xhr, ajaxOptions, throwError) {
					this.getOwnerComponent().setModel(new JSONModel({}), "oReportAdminDetails");
					this.getView().setBusy(false);
					this.handleErrorDialog(xhr);
				}.bind(this)
			});
		},

		onEmReport: function () {
			var oSdate = this.oViewData.getProperty("/oRepSdate"),
				oEdate = this.oViewData.getProperty("/oRepEdate");
			if (!oSdate || !oEdate) {
				this._fnShowErrorMessage("Please select date");
			} else {
				var oData = [];
				$.ajax({
					url: "/BenefietCAP/claim/claimstatus_ext?$top=10000&$filter=Submit_Date ge " + oSdate + " and Submit_Date le " + oEdate +
						" and Status ne 'Approved' and Status ne 'Cancellation Approved' and Status ne 'Rejected' and Status ne 'Cancelled'",
					method: "GET",
					crossDomain: true,
					success: function (data, oResponse) {
						var oModel = this._getSizeLimit(data.value);
						if (oModel.getData().length > 0) {
							for (var i = 0; i < oModel.getData().length; i++) {
								var aReqFields = ['CLAIM_CATEGORY', 'Cancel_flag', 'Current_Level',
									'Owner', 'REMARKS_APPROVER1', 'REMARKS_APPROVER2', 'REMARKS_APPROVER3', 'REMARKS_EMPLOYEE', 'REMARKS_REJECTION',
									'Response_Date', 'Total_Level'
								];
								var oItem = this._fnGetObjWithSelectedKey(oModel.getData()[i], aReqFields);
								oData.push(oItem);
							}
							this.getOwnerComponent().setModel(new JSONModel(oData), "oEmailReport");
						} else {
							this.getOwnerComponent().setModel(new JSONModel([]), "oEmailReport");
						}
					}.bind(this),
					error: function (xhr, ajaxOptions, throwError) {
						this.getOwnerComponent().setModel(new JSONModel({}), "oEmailReport");
						this.handleErrorDialog(xhr);
					}.bind(this)
				});
			}
		},

		_fnGetObjWithSelectedKey: function (OrgData, req) {
			for (var i = 0; i < req.length; i++) {
				if (OrgData.hasOwnProperty(req[i])) {
					delete OrgData[req[i]];
				}
			}
			return OrgData;
		},

		onSubmitMedisave: function () {
			var oPayLoad,
				oTable = this.getView().byId("tb_Ringfence"),
				selectedItems = oTable.getSelectedItems(),
				oDataModel = "";
			oDataModel = oTable.getModel("oRingAmntDetails").getData();
			if (selectedItems.length === 0) {
				sap.m.MessageToast.show("Please select one data");
			} else {
				for (var j = selectedItems.length - 1; j >= 0; j--) {
					var jdx = oTable.indexOfItem(selectedItems[j]);
					oPayLoad = {
						"ringData": []
					};
					oPayLoad.ringData.push({
						"DEPENDENT_CLAIM_CODE": oDataModel[jdx].Claim_Code,
						"EMPLOYEE_ID": oDataModel[jdx].employeeId,
						"claimYear": "2021",
						"ref_num": oDataModel[jdx].Claim_Code + "-2021",
						"PAY_COMPONENT": "C048",
						"EFFECTIVE_DATE": "2021-10-26",
						"Ring_Fenced_Claim_Amount": oDataModel[jdx].Ring_Fenced_Claim_Amount
					});
				}
				oPayLoad = JSON.stringify(oPayLoad);

				$.ajax({
					url: "/BenefietCAP/claim/postRingFencing",
					data: oPayLoad,
					method: "POST",
					crossDomain: true,
					headers: {
						"Accept": "application/json",
						"Content-Type": "application/json"
					},
					success: function (data, oResponse) {
						this.getView().setBusy(false);
						this.handleSuccessDialog("Selected Record(s) Submitted Successfully");
					}.bind(this),
					error: function (xhr, ajaxOptions, throwError) {
						this.getView().setBusy(false);
						this.handleErrorDialog(xhr);
					}.bind(this)
				});
			}
		}
	});

});