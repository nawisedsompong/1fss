sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/ui/core/UIComponent",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/Fragment",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"../utils/Validator",
	"sap/ui/Device"
], function (Controller, History, UIComponent, Filter, FilterOperator, Fragment, JSONModel, MessageBox, Validator, Device) {
	"use strict";

	return Controller.extend("BenefitClaim.ZBenefitClaim.controller.BaseController", {

		/**
		 * Convenience method for accessing the router.
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		getRouter: function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},

		/**
		 * Convenience method for getting the view model by name.
		 * @public
		 * @param {string} [sName] the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel: function (sName) {
			return this.getView().getModel(sName);
		},

		/**
		 * Convenience method for setting the view model.
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel: function (oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		loadDatePicker: function (oModel, mode, modelProperty, modelName, controlClass, key) {
			$.datepicker.setDefaults({
				showOn: "both",
				buttonImageOnly: true,
				buttonImage: "images/calendar.png",
				buttonText: "Calendar"
			});
			$(function () {
				$("." + controlClass).datepicker({
					dateFormat: "dd.mm.yy"
				});
				$("." + controlClass).datepicker().on("change", function (oEvent) {
					var sDate = oEvent.target.value;
					var sSelectedDate = "";
					var aSplittedDate = sDate.split(".");
					if (aSplittedDate.length === 3) {
						sSelectedDate = aSplittedDate[2] + "-" + aSplittedDate[1] + "-" + aSplittedDate[0];
					}
					oModel.setProperty("/" + modelProperty, sSelectedDate);
					if (key === "A") {
						var oEvent = {
							getSource: function () {
								return this;
							},
							getModel: function () {
								return oModel;
							}
						};
						this.onReceiptDate(oEvent, modelName);
					}

					if (key === "TC") {
						var oEvent = {
							getSource: function () {
								return this;
							},
							getModel: function () {
								return oModel;
							}
						};
						this.onChangeTCdate(oEvent);
					}
				}.bind(this));
				if (mode === "edit") {
					var sReceiptDate = oModel.getProperty("/" + modelProperty);
					var aSplittedDate = sReceiptDate.split("-");
					if (aSplittedDate.length === 3) {
						sReceiptDate = aSplittedDate[2] + "." + aSplittedDate[1] + "." + aSplittedDate[0];
					}
					$("." + controlClass).val(sReceiptDate);
				}
			}.bind(this));
		},

		/**
		 * Getter for the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle: function () {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		_getCurrentDate: function () {
			return new Date().toISOString().substring(0, 10);
		},

		_getFragmentTextPos: function (sFragId, id) {
			return sap.ui.core.Fragment.byId(this.createId(sFragId), id);
		},

		_getSizeLimit: function (data) {
			var oModel = new JSONModel(data);
			oModel.setSizeLimit(500000);
			return oModel;
		},

		_getBusyIndicator: function () {
			return sap.ui.core.BusyIndicator
		},

		onCloseDialog: function (name) {
			this.getView().setModel(new JSONModel([]), "oLocationRO");
			this.getView().setModel(new JSONModel([]), "oApprovers");
			this.getView().setModel(new JSONModel([]), "oAppRemarks");
			var oIndx = this.oViewData.getProperty("/eIndex") ? this.oViewData.getProperty("/eIndex") : "";
			if (this.oViewData.getProperty("/TMode") === "Edit" && name !== true && oIndx !== "") {
				this.getView().getModel(name).getData()[oIndx] = this.oMis;
				this.getView().getModel(name).refresh(true);
			}
			this.eDialog.close();
			this.oViewData.setProperty("/eIndex", "");
			this.eDialog.destroyContent();
			this.eDialog = undefined;
		},

		onCloseDialogM: function (name) {
			this.getView().setModel(new JSONModel([]), "oLocationRO");
			this.getView().setModel(new JSONModel([]), "oApprovers");
			this.getView().setModel(new JSONModel([]), "oAppRemarks");
			var oIndx = this.oViewData.getProperty("/eIndex") ? this.oViewData.getProperty("/eIndex") : "";
			if (this.oViewData.getProperty("/TMode") === "Edit" && name !== true && oIndx !== "") {
				name = name.replace('_Master', '');
				this.getView().getModel(name).getData()[oIndx] = this.oMaster;
				this.getView().getModel(name).refresh(true);
			}
			this.eDialogM.close();
			this.oViewData.setProperty("/eIndex", "");
			this.eDialogM.destroyContent();
			this.eDialogM = undefined;
		},

		onFutureDate: function (oEvent) {
			if (oEvent.getSource().getDateValue() > new Date() || oEvent.getSource().getDateValue().toDateString() === new Date().toDateString()) {
				oEvent.getSource().setValueState(sap.ui.core.ValueState.None);
			} else {
				oEvent.getSource().setValue();
				oEvent.getSource().setValueState(sap.ui.core.ValueState.Error);
				oEvent.getSource().setValueStateText("should be a future date");
			}
		},

		onNoFutureDate: function (oEvent) {
			if (oEvent.getSource().getDateValue() < new Date() || oEvent.getSource().getDateValue().toDateString() === new Date().toDateString()) {
				oEvent.getSource().setValueState(sap.ui.core.ValueState.None);
			} else {
				oEvent.getSource().setValueState(sap.ui.core.ValueState.Error);
				oEvent.getSource().setValueStateText("should not be a future date");
			}
		},

		onValidateSpecialChar: function (oEvent) {
			var oKey = oEvent.getSource().getValue();
			if (oKey.includes('—') || oKey.includes('*')) {
				oEvent.getSource().setValueStateText(this.getResourceBundle().getText("* — not allowed"));
				oEvent.getSource().setValueState(sap.ui.core.ValueState.Error);
				oEvent.getSource().setValue(oKey.slice(0, -1));
				return false;
			} else {
				oEvent.getSource().setValueState(sap.ui.core.ValueState.None);
				return true;
			}
		},

		_convertToUTC: function (o) {
			if (!o) {
				return o;
			}
			var _ = new Date(o.getTime());
			_.setMinutes(_.getMinutes() - o.getTimezoneOffset());
			return _;
		},

		onValidDate: function (oEvent) {
			if (!oEvent.getParameter("valid")) {
				oEvent.getSource().setValueStateText(this.getResourceBundle().getText("Invalid Date Format"));
				oEvent.getSource().setValueState(sap.ui.core.ValueState.Error);
				// oEvent.getSource().setValue();
				return;
			} else {
				oEvent.getSource().setValueState(sap.ui.core.ValueState.None);
			}
		},

		_fnvalidStartDate: function (oStartDate, oEndDate, oEvent) {
			if (!oEvent.getParameter("value")) {
				oEvent.getSource().setValueState(sap.ui.core.ValueState.Error);
				oEvent.getSource().setValue();
				oEvent.getSource().setValueStateText("Enter start date");
				return;
			} else if (!oEvent.getParameter("valid")) {
				oEvent.getSource().setValueState(sap.ui.core.ValueState.Error);
				oEvent.getSource().setValue();
				oEvent.getSource().setValueStateText("Start date should be less than end date");
				return;
			} else if (oStartDate.getDateValue() > oEndDate.getDateValue()) {
				if (oEndDate.getValue() !== "") {
					oEvent.getSource().setValueState(sap.ui.core.ValueState.Error);
					oEvent.getSource().setValue();
					oEvent.getSource().setValueStateText("Start date should be less than end date");
					// oEndDate.setValueState(sap.ui.core.ValueState.None);
					return;
				}
			} else {
				oEvent.getSource().setValueState(sap.ui.core.ValueState.None);
				oEvent.getSource().setValueStateText("Enter start date");
			}
			if (!(oStartDate.getDateValue() > oEndDate.getDateValue())) {
				oEndDate.setValueState(sap.ui.core.ValueState.None);
			}
		},

		_fnvalidEndDate: function (oStartDate, oEndDate, oEvent) {
			if (!oEvent.getParameter("value")) {
				oEvent.getSource().setValueState(sap.ui.core.ValueState.Error);
				oEvent.getSource().setValue();
				oEvent.getSource().setValueStateText("Enter end date");
				return;
			} else if (!oEvent.getParameter("valid")) {
				oEvent.getSource().setValueState(sap.ui.core.ValueState.Error);
				oEvent.getSource().setValue();
				oEvent.getSource().setValueStateText("End date should be greater than start date");
				return;
			} else if (oEndDate.getDateValue() < oStartDate.getDateValue()) {
				oEvent.getSource().setValueState(sap.ui.core.ValueState.Error);
				oEvent.getSource().setValue();
				oEvent.getSource().setValueStateText("End date should be greater than start date");
				// oStartDate.setValueState(sap.ui.core.ValueState.None);
				return;
			} else {
				oEvent.getSource().setValueState(sap.ui.core.ValueState.None);
				oEvent.getSource().setValueStateText("Enter end date");
			}
			if (!(oEndDate.getDateValue() < oStartDate.getDateValue())) {
				oStartDate.setValueState(sap.ui.core.ValueState.None);
			}
		},

		onValidData: function (oEvent) {
			var oVartext = oEvent.getSource().getValue();
			var omodelText = oEvent.getSource().getItems();
			var bExists = false;
			for (var i = 0; i < omodelText.length; i++) {
				var itemText = omodelText[i].getText();
				if (itemText === oVartext || itemText.startsWith(oVartext)) {
					bExists = true;
					break;
				}
			}
			if (bExists) {
				oEvent.getSource().setValueState("None");
			} else {
				oEvent.getSource().setValueState("Error");
				oEvent.getSource().setValueStateText("Select Valid Data");
				oEvent.getSource().setValue("");
			}
		},

		onReceiptNumb: function (oEvent) {
			var value = oEvent.getSource().getValue();
			if (/^[a-zA-Z0-9,-_./:!@#$&*]+$/.test(value)) {
				oEvent.getSource().setValueState(sap.ui.core.ValueState.None);
				return true;
			} else {
				oEvent.getSource().setValueStateText(this.getResourceBundle().getText("ERROR_inpRecNumb"));
				oEvent.getSource().setValueState(sap.ui.core.ValueState.Error);
				oEvent.getSource().setValue(value.slice(0, -1));
				return false;
			}
		},

		onValidateNumericValue: function (oEvent) {
			var value = oEvent.getSource().getValue();
			if (/\s/g.test(value)) {
				oEvent.getSource().setValue(value.slice(0, -1));
				return false;
			}
			var bNotnumber = isNaN(value);
			if (bNotnumber === false) {
				oEvent.getSource().setValueState(sap.ui.core.ValueState.None);
				return true;
			} else {
				oEvent.getSource().setValueStateText(this.getResourceBundle().getText("ERROR_NO_NUMBER"));
				oEvent.getSource().setValueState(sap.ui.core.ValueState.Error);
				oEvent.getSource().setValue(value.slice(0, -1));
				return false;
			}
		},

		onValidateMinusNumericValue: function (oEvent) {
			var value = oEvent.getSource().getValue();
			var bNotnumber = isNaN(value);
			if (isNaN(value) === false || value.substring(0, 1) === "-") {
				oEvent.getSource().setValueState(sap.ui.core.ValueState.None);
				return true;
			} else {
				oEvent.getSource().setValueStateText(this.getResourceBundle().getText("ERROR_NO_NUMBER"));
				oEvent.getSource().setValueState(sap.ui.core.ValueState.Error);
				oEvent.getSource().setValue(value.slice(0, -1));
				return false;
			}
		},

		onValidateDecimalValue: function (oEvent) {
			this.onValidateNumericValue(oEvent);
			var ovalue = oEvent.getSource().getValue();
			var regex = /^(?:\d*\.\d{1,2}|\d+)$/;
			if (ovalue && !isNaN(ovalue) && !regex.test(ovalue)) {
				if ((ovalue % 1) != 0) {
					var decimalCount = ovalue.toString().split(".")[1].length;
					if (decimalCount > 2) {
						var sValueStr = ovalue.toString();
						sValueStr = sValueStr.substring(0, sValueStr.length - 1);
						oEvent.getSource().setValue(sValueStr);
					}
				}
			}
		},

		onValidateNegative: function (oEvent) {
			var ovalue = oEvent.getSource().getValue();
			var regex = /^-?\d*\.?\d{0,9}$/;
			if (regex.test(ovalue)) {
				oEvent.getSource().setValueState(sap.ui.core.ValueState.None);
				return true;
			} else {
				oEvent.getSource().setValueStateText("Not Valid");
				oEvent.getSource().setValueState(sap.ui.core.ValueState.Error);
				return false;
			}

		},

		onUnitHR: function (oEvent, model) {
			this.onValidateNumericValue(oEvent);
			var oValue = oEvent.getSource().getValue();
			this.eDialog.getModel(model).setProperty("/CLAIM_AMOUNT", parseFloat(oValue, 10).toFixed(2));
		},

		onWarddayschange: function (oEvent, oVal) {
			var value = oEvent.getSource().getValue();
			var bNotnumber = isNaN(value);
			var regex = /^(?:\d*\.\d{1,1}|\d+)$/;
			if (bNotnumber) {
				oEvent.getSource().setValueStateText(this.getResourceBundle().getText("ERROR_NO_NUMBER"));
				oEvent.getSource().setValueState(sap.ui.core.ValueState.Error);
				oEvent.getSource().setValue("");
				return false;
			} else if (value && !isNaN(value) && !regex.test(value)) {
				if ((value % 1) != 0) {
					var oIntval = value.toString().split(".")[1];
					if (oIntval.length > 1) {
						var sValueStr = value.toString();
						sValueStr = sValueStr.substring(0, sValueStr.length - 1);
						oEvent.getSource().setValue(sValueStr);
						oEvent.getSource().setValueStateText("Wardays allow '.0' or '.5'");
						oEvent.getSource().setValueState(sap.ui.core.ValueState.Error);
					} else {
						var sValueStr = value.toString();
						sValueStr = sValueStr.substring(0, sValueStr.length - 1);
						oEvent.getSource().setValue(sValueStr);
					}
				}
			} else {
				if (parseFloat(value, 1) > oVal) {
					oEvent.getSource().setValueStateText("Enter Ward Days below " + oVal);
					oEvent.getSource().setValueState(sap.ui.core.ValueState.Error);
					oEvent.getSource().setValue("");
					return false;
				} else {
					oEvent.getSource().setValueState(sap.ui.core.ValueState.None);
					oEvent.getSource().setValueStateText("");
				}
				var oIntval = value.toString().split(".")[1];
				if ((parseInt(oIntval) !== 5) && oIntval) {
					oEvent.getSource().setValueStateText("Wardays allow '.0' or '.5'");
					oEvent.getSource().setValueState(sap.ui.core.ValueState.Error);
				}
				if ((parseInt(oIntval) === 0) && oIntval) {
					oEvent.getSource().setValueState(sap.ui.core.ValueState.None);
				}
			}
		},

		onSP_date: function (oEvent, model) {
			var strtdate = this.eDialogM.getModel(model).getProperty("/START_DATE"),
				enddate = this.eDialogM.getModel(model).getProperty("/END_DATE");
			if (strtdate === undefined || strtdate === "") {
				this.eDialogM.getModel(model).setProperty("/LENGTH_OF_STAY", 0);
			} else if (enddate === undefined || enddate === "") {
				this.eDialogM.getModel(model).setProperty("/LENGTH_OF_STAY", 0);
			} else {
				this._fnLengthStay(strtdate, enddate, model);
			}
		},

		_fnLengthStay: function (startDate, endDate, model) {
			var diffInMs = new Date(endDate) - new Date(startDate),
				diffInDays = diffInMs / (1000 * 60 * 60 * 24);
			this.eDialogM.getModel(model).setProperty("/LENGTH_OF_STAY", diffInDays);
		},

		onConvertAmount: function (oEvent, model) {
			var oReceipt = this._getFragmentTextPos(model, "inp_SPreceiptamnt").getValue(),
				oExchange = this._getFragmentTextPos(model, "inp_SPexchange").getValue();
			if (oReceipt === "" || oExchange === "") {
				this.eDialog.getModel(model).setProperty("/CONVERT_RECEIPT_AMOUNT", 0);
			} else {
				var oRecConv = parseFloat(oReceipt.replace(/\,/g, ''), 2) * parseFloat(oExchange.replace(/\,/g, ''), 2);
				this.eDialog.getModel(model).setProperty("/CONVERT_RECEIPT_AMOUNT", parseFloat(oRecConv, 2).toFixed(2));
			}
		},

		onChangeDateN: function (oEvent) {
			var sol = oEvent.getSource().isOpen();
			console.log(sol)
		},

		onSortPress: function () {
			var oView = this.getView();
			Fragment.load({
				id: oView.getId(),
				controller: this,
				name: "BenefitClaim.ZBenefitClaim.fragments.Sorting"
			}).then(function (oDialog) {
				oView.addDependent(oDialog);
				oDialog.addStyleClass("sapUiSizeCompact");
				oDialog.open();
			});

		},

		_fnUserInfo: function (oEmpId) {
			$.ajax({
				url: "/BenefietCAP/claim/EmployeeDetailsFetch(USERID='" + oEmpId + "')",
				method: "GET",
				crossDomain: true,
				success: function (data, oResponse) {
					var oData = JSON.parse(data.value);
					this.getOwnerComponent().setModel(new JSONModel(oData[0]), "oEmpData");
					this._fnTableData();
				}.bind(this),
				error: function (xhr, ajaxOptions, throwError) {
					this.handleErrorDialog(xhr);
				}.bind(this)
			});
		},

		onCopayCal: function (oEvent, model, index, balnc) {
			var oReceipt,
				oData,
				oCompany = this.getView().getModel("oEmpData").getProperty("/COMPANY");
			if (index) {
				oData = oEvent.getSource().getModel(model)[index];
			} else if (oEvent === "Q") {
				oData = this.eDialog.getModel(model);
			} else if (oEvent === "L") {
				oData = this.eDialogM.getModel(model);
			} else {
				oData = oEvent.getSource().getModel(model);
			}

			if (model === "Sponsorship_Master") {
				oReceipt = oData.getProperty("/CLAIM_AMOUNT");
			} else if (oCompany === "MOHHSCH") {
				if (model === "SDFRClaim") {
					oReceipt = oData.getProperty("/ESTIMATE_COST");
				} else {
					oReceipt = parseFloat(oData.getProperty("/CLAIM_AMOUNT_SGD")) * parseFloat(oData.getProperty("/EXCHANGE_RATE"));
				}
			} else {
				oReceipt = oData.getProperty("/RECEIPT_AMOUNT");
			}

			/*if (model === "TrainingFund" && this.oViewData.getProperty("/oTile") === "Approvals") {
				oData = this.eDialog.getModel(model);
				var oVal = this.getView().getModel("oEligCalData").getData(),
					balnc = parseFloat(oVal.ENTITLEMENT) - parseFloat(oVal.TAKEN_AMOUNT);
			}*/

			$.ajax({
				url: "/BenefietCAP/claim/calculateCoPayment",
				data: JSON.stringify({
					"claimCode": oData.getProperty("/CLAIM_CODE"),
					"claimAmount": oReceipt,
					"balance": (!balnc) ? 0.00 : parseFloat(balnc).toFixed(2)
				}),
				method: "POST",
				crossDomain: true,
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json"
				},
				success: function (data) {
					this.hasChange = false;
					oData.setProperty("/CLAIM_AMOUNT", data.claimAmount);
				}.bind(this),
				error: function (response) {
					oData.setProperty("/CLAIM_AMOUNT", oData.getProperty(oReceipt));
					this.handleErrorDialog(response);
				}.bind(this)
			});
			oData.refresh(true);
		},

		onSponsAmnt: function (oEvent) {
			var oData = this.eDialog.getModel("Sponsorship");
			oData.setProperty("/CLAIM_AMOUNT", oData.getProperty("/CONVERT_RECEIPT_AMOUNT"));
			oData.refresh(true);
			this.hasChange = false;
		},

		onSchCal: function (oEvent, model) {
			var amnt, f_amnt;
			if (model === "SDFClaim") {
				amnt = "/CLAIM_AMOUNT";
				f_amnt = "/CLAIM_AMOUNT_SGD";
			} else {
				amnt = "/ESTIMATE_COST";
				f_amnt = "/CLAIM_AMOUNT";
			}
			var oModel = this.eDialog.getModel(model),
				oRate = this.oViewData.getProperty("/RATE"),
				oAmnt = oModel.getProperty(amnt);

			if (!oRate) {
				oRate = 1.00;
			}

			var oValue = oAmnt * oRate;
			oModel.setProperty(f_amnt, parseFloat(oValue).toFixed(2));
		},

		onReceiptDate: function (oEvent, model, active) {
			var oDate,
				claim_code,
				oEmpId = this.oViewData.getProperty("/EmpID"),
				oData = oEvent === "A" ? model : oEvent.getSource().getModel(model).getData(),
				oBehalf = (this.oViewData.getProperty("/oTile") === "Admin" || this.oViewData.getProperty("/oTile") === "AdminSch") ? "Y" : "",
				oCompany = this.getView().getModel("oEmpData").getProperty("/COMPANY"),
				oModel = this.oViewData.getProperty("/oModelName"),
				oDlg;
			if (oData.LINE_ITEM) {
				oDlg = this.eDialogM.getModel(oModel + "_Master");
				oCode = oDlg.getProperty("/CATEGORY_CODE");
				if (oData.CATEGORY_CODE === "PAY_UP") {
					oBehalf = "";
					claim_code = oData.LINE_ITEM[0].CLAIM_CODE;
					oDate = oData.LINE_ITEM[0].CLAIM_DATE;
				} else {
					var oCode = oData.CATEGORY_CODE;
					claim_code = oData.LINE_ITEM[0].CLAIM_CODE;
					oDate = (oCode === "TC" || oCode === "COV" || oCode.includes("SP")) ? oData.LINE_ITEM[0].RECEIPT_DATE : oData.LINE_ITEM[
						0].CLAIM_DATE; // PRD VK change
				}
			} else {
				oDlg = this.eDialog.getModel(oModel);
				oCode = oDlg.getProperty("/CATEGORY_CODE");
				if (oData.CATEGORY_CODE === "CPR") {
					claim_code = oData.CLAIM_CODE;
					oDate = oData.CLAIM_DATE;
				} else {
					claim_code = oData.CLAIM_CODE;
					oDate = oData.CATEGORY_CODE === "TIM" ? oData.CLAIM_DATE : oData.RECEIPT_DATE;
				}
			}

			if (this.oViewData.getProperty("/ClaimType") === "MC") {
				this.hasChange = true;
			}

			if (oEvent !== "A") {
				var oLoad = oEvent.getSource().getModel(model);
				oLoad.updateBindings(true);
				if (oCode === "AHP" || oCode === "CLS" || oCode === "LIC" || oCode === "MC" || oCode === "MSR" || oCode === "PC" || oCode ===
					"PTF" || oCode === "WIC") {
					this.hasChange = true;
				}
			}

			if (oCode === "PAY_UP" || oCode === "OC" || oCode === "CPR" || oCode === "CPC" || oCode === "SDFC" || oCode === "SDFR") {
				oDate = new Date().toISOString().substring(0, 10);
			}

			$.ajax({
				url: "/BenefietCAP/claim/employeeSelectApproverList(Owner='" + oEmpId + "',Claim_code='" + claim_code + "',Receipt_Date=" +
					oDate + ",behalf='" + oBehalf + "')",
				method: "GET",
				dataType: "json",
				success: function (data) {
					if (data.value.length > 0) {
						var oModel = this._getSizeLimit(data.value);
						if (oData.CATEGORY_CODE === "PAY_UP") {
							var newArray = this.removeDuplicate(oModel.getData(), "EMPLOYEE_ID");
							var filtered = newArray.filter(function (value, index, arr) {
								return value.EMPLOYEE_ID !== oEmpId;
							});
							this.getView().setModel(new JSONModel(filtered), "oApprovers");
						} else {
							this.getView().setModel(oModel, "oApprovers");
						}
						if (data.value.length === 1) {
							oData.FIRST_LEVEL_APPROVER = data.value[0].EMPLOYEE_ID;
							oDlg.refresh(true);
						}

						if (active === "E") {
							this._fnValidActiveEmp(oData.FIRST_LEVEL_APPROVER);
						}
					}
					/*else {
						this.getView().setModel([], "oApprovers");
					}*/
				}.bind(this),
				error: function (response) {
					this.handleErrorDialog(response);
				}.bind(this)
			});

			if (oBehalf === "Y") {
				oDate = new Date().toISOString().substring(0, 10);
				var ourl = "/BenefietCAP/claim/employeeSelectApproverList(Owner='" + oEmpId + "',Claim_code='" + claim_code + "',Receipt_Date=" +
					oDate + ",behalf='Y')";
				this._fnHRCheckerDisp(ourl, oData, oDlg);
			}
		},

		_fnHRCheckerDisp: function (url, oData, oDlg) {
			$.ajax({
				url: url,
				method: "GET",
				dataType: "json",
				success: function (data) {
					if (data.value.length > 0) {
						var oModel = this._getSizeLimit(data.value);
						this.getView().setModel(oModel, "oApprovers");
						oData.FIRST_LEVEL_APPROVER = data.value[0].EMPLOYEE_ID;
						this._fnValidActiveEmp(data.value[0].EMPLOYEE_ID);
						this.oViewData.setProperty("/oHRCheckerID", data.value[0].EMPLOYEE_ID);
						this.oViewData.setProperty("/HRcheckfname", data.value[0].FIRSTNAME);
						this.oViewData.setProperty("/HRchecklname", data.value[0].LASTNAME);
						this.oViewData.refresh(true);
						oDlg.refresh(true);
					} else {
						this.oViewData.setProperty("/oHRCheckerID", "");
						this.oViewData.setProperty("/HRcheckfname", "");
						this.oViewData.setProperty("/HRchecklname", "");
					}
				}.bind(this),
				error: function (response) {
					this.handleErrorDialog(response);
				}.bind(this)
			});
		},

		oValidateDate: function (model, oData) {
			var isValidate = false;
			// lineitem form
			if (model === "WorkRelated" || model === "WorkRelated_HR") {
				if (!oData.CLAIM_DATE) {
					isValidate = true;
				}
			}
			if (model === "Transportation" || model === "Covid" || model === "Sponsorship") {
				if (!oData.RECEIPT_DATE) {
					isValidate = true;
				}
			}
			if (model === "CPClaim" || model === "OClaim" || model === "PUpload" || model === "SDFClaim") {
				if (!oData.INVOICE_DATE) {
					isValidate = true;
				}
			}
			//single submission form
			if (model === "CLS" || model === "AHP" || model === "MC" || model === "LIC" || model === "PC" || model === "MSR" || model ===
				"PTF" || model === "WIC") {
				if (!oData.RECEIPT_DATE) {
					isValidate = true;
				}
			}
			if (model === "PTF") {
				if (!oData.START_DATE || !oData.END_DATE) {
					isValidate = true;
				}
			}
			if (model === "TIM") {
				if (!oData.CLAIM_DATE) {
					isValidate = true;
				}
			}
			return isValidate;
		},

		ValidateLineItemClaim: function (oMode, oModel, oMasterData, oNameTile, model, Dmodel, name, oIndex) {
			var oLineItemData = [],
				oLocSelData,
				isValidate = false,
				oLineItem = oMasterData.LINE_ITEM,
				oLocRo = this.getView().getModel("oLocationRO").getData();
			$.each(oLineItem, function (idx, obj) {
				oLineItemData.push({
					"claimDate": obj.CLAIM_DATE + "T00:00:00-00:00"
				});
			});
			oLineItemData.push({
				"claimDate": oModel.CLAIM_DATE + "T00:00:00-00:00"
			})
			$.each(oLocRo, function (idx, obj) {
				if (obj.LOCATION_RO_EMPLOYEEID === oMasterData.FIRST_LEVEL_APPROVER) {
					oLocSelData = obj;
				}
			});
			var oValue = {
				"employeeId": this.oViewData.getProperty("/EmpID"),
				"department": oLocSelData.DEPARTMENT,
				"division": oLocSelData.DIVISION,
				"locationRO": oMasterData.FIRST_LEVEL_APPROVER,
				"lineItems": oLineItemData
			};
			$.ajax({
				url: "/BenefietCAP/claim/validateWRCClaimLineItem",
				data: JSON.stringify(oValue),
				method: "POST",
				crossDomain: true,
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json"
				},
				success: function (data) {
					this._fnAddInLineWRC(oMode, oModel, oMasterData, oNameTile, model, Dmodel, name, oIndex);
				}.bind(this),
				error: function (response) {
					this.handleErrorDialog(response);
				}.bind(this)
			});
		},

		ValidateLineItemWR: function (oData) {
			this.getView().setBusy(true);
			var oPayload = [],
				isValidate = false,
				data;
			for (var i = 0; i < oData.LINE_ITEM.length; i++) {
				data = {
					"employeeId": oData.LINE_ITEM[i].EMPLOYEE_ID,
					"claimCode": oData.LINE_ITEM[i].CLAIM_CODE,
					"claimDate": oData.LINE_ITEM[i].CLAIM_DATE,
					"claimCategory": oData.CATEGORY_CODE
				}
				oPayload.push(data);
			}

			$.ajax({
				url: "/BenefietCAP/claim/validateMultipleDuplicateWRCClaim",
				data: JSON.stringify({
					"claims": oPayload
				}),
				method: "POST",
				crossDomain: true,
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json"
				},
				success: function (data) {
					isValidate = false;
					this.getView().setBusy(false);
				}.bind(this),
				error: function (response) {
					isValidate = true;
					this.getView().setBusy(false);
					this.handleErrorDialog(response);
				}.bind(this)
			});
			return isValidate;

		},

		onTextAreaChange: function (oEvent) {
			var oTextArea = oEvent.getSource(),
				iValueLength = oTextArea.getValue().length,
				iMaxLength = oTextArea.getMaxLength(),
				sState = iValueLength > iMaxLength ? sap.ui.core.ValueState.Error : sap.ui.core.ValueState.None;
			oTextArea.setValueState(sState);
		},

		onUpdateSpons: function (oEvent) {
			var data = oEvent.getSource().getModel("Sponsorship").getData();
			if (data) {
				this.getView().getModel("ViewData").setProperty("/SP_Length", data.length);
			} else {
				this.getView().getModel("ViewData").setProperty("/SP_Length", 0);
			}
		},

		mDataModelChange: function (oEvt, data) {
			if (oEvt.getParameters().path === "/REMARKS_EMPLOYEE" || oEvt.getParameters().path === "/FIRST_LEVEL_APPROVER") {
				// this.hasChange = true;
			} else {
				this.hasChange = true;
			}
		},

		onChangeData: function (oEvent) {
			var cellValue = oEvent.getSource().getValue();
			if (cellValue !== null && "=-+@".indexOf(cellValue.charAt(0)) >= 0) {
				oEvent.getSource().setValueStateText("Enter Data should not start with =-+@ ");
				oEvent.getSource().setValueState(sap.ui.core.ValueState.Error);
				oEvent.getSource().setValue("");
				return;
			} else {
				oEvent.getSource().setValueState(sap.ui.core.ValueState.None);
			}
		},

		onChangeDataSpl: function (oEvent) {
			var cellValue = oEvent.getSource().getValue();
			if (cellValue !== null && "=-+@".indexOf(cellValue.charAt(0)) >= 0) {
				oEvent.getSource().setValueStateText("Enter Data should not start with =-+@ ");
				oEvent.getSource().setValueState(sap.ui.core.ValueState.Error);
				oEvent.getSource().setValue("");
				return;
			}
			if (cellValue.includes('—') || cellValue.includes('*')) {
				oEvent.getSource().setValueStateText(this.getResourceBundle().getText("* — not allowed"));
				oEvent.getSource().setValueState(sap.ui.core.ValueState.Error);
				oEvent.getSource().setValue(cellValue.slice(0, -1));
				return false;
			} else {
				oEvent.getSource().setValueState(sap.ui.core.ValueState.None);
				return true;
			}
		},

		onClaimTypeOpen: function (oVal) {
			var key = this.oViewData.getProperty("/ClaimCateg"),
				oData = this.getView().getModel("ComboDetails").getData(),
				oView = this.getView(),
				oClaimType = [],
				oCompany = this.getView().getModel("oEmpData").getProperty("/COMPANY");
			if (this.oViewData.getProperty("/oTile") === "SMSApprovals") {
				oCompany = "MOHHSCH";
			}
			if (this.oViewData.getProperty("/oTile") === "Ring" && oVal === "YTD") {
				$.each(oData.COMPANY_CLAIM_CATEGORY, function (idx, obj) {
					if (obj.Category_Code === "MC" && obj.Company === oCompany) {
						oClaimType.push(obj);
					}
				});
			} else if (oVal === "YTD" && this.oViewData.getProperty("/oTile") !== "Ring") {
				$.each(oData.COMPANY_CLAIM_CATEGORY, function (idx, obj) {
					if (obj.Company === oCompany) {
						oClaimType.push(obj);
					}
				});
			} else {
				$.each(oData.COMPANY_CLAIM_CATEGORY, function (idx, obj) {
					if (obj.Category_Code === key && obj.Company === oCompany) {
						oClaimType.push(obj);
					}
				});
			}

			if (!this.byId("dlgClaimCategoryFil")) {
				Fragment.load({
					id: oView.getId(),
					controller: this,
					name: "BenefitClaim.ZBenefitClaim.fragments.ClaimCategoryFil"
				}).then(function (oDialog) {
					oView.addDependent(oDialog);
					oDialog.setModel(new JSONModel(oClaimType), "oClaimTypes");
					oDialog.open();
				});
			} else {
				this.byId("dlgClaimCategoryFil").setModel(new JSONModel(oClaimType), "oClaimTypes");
				this.byId("dlgClaimCategoryFil").open();
			}
		},

		// Success Popup

		handleSuccessDialog: function (msg) {
			this.oSuccessMessageDialog = new sap.m.Dialog({
				type: sap.m.DialogType.Message,
				title: "Success",
				state: sap.ui.core.ValueState.Success,
				content: new sap.m.Text({
					text: msg
				}),
				beginButton: new sap.m.Button({
					type: sap.m.ButtonType.Emphasized,
					text: "OK",
					press: function () {
						this.oSuccessMessageDialog.close();
					}.bind(this)
				})
			});
			this.oSuccessMessageDialog.open();
		},

		handleErrorDialog: function (e) {
			var oMessage;
			try {
				oMessage = JSON.parse(e.responseText).error.details[0].message;
			} catch (er) {
				try {
					oMessage = JSON.parse(e.responseText).error.message;
				} catch (er) {
					try {
						oMessage = $.parseXML(e.responseText).getElementsByTagName("message")[0].innerHTML;
					} catch (s) {
						try {
							oMessage = JSON.parse(e.responseText).error.message.value;
						} catch (e) {
							oMessage = e.responseText;
						}
					}
				}
			}
			if (oMessage === "Entity already exists") {
				oMessage = "Entry already exists";
			}

			this.oErrorMessageDialog = new sap.m.Dialog({
				type: sap.m.DialogType.Message,
				title: "Error",
				state: sap.ui.core.ValueState.Error,
				content: new sap.m.Text({
					text: oMessage
				}),
				beginButton: new sap.m.Button({
					type: sap.m.ButtonType.Emphasized,
					text: "OK",
					press: function () {
						this.oErrorMessageDialog.close();
					}.bind(this)
				})
			});
			if (oMessage !== "" && oMessage !== undefined) {
				this.oErrorMessageDialog.open();
			}
		},

		_fnShowErrorMessage: function (sMsg) {
			this.oErrorMessageDialog = new sap.m.Dialog({
				type: sap.m.DialogType.Message,
				title: "Error",
				state: sap.ui.core.ValueState.Error,
				content: new sap.m.Text({
					text: sMsg
				}),
				beginButton: new sap.m.Button({
					type: sap.m.ButtonType.Emphasized,
					text: "OK",
					press: function () {
						this.oErrorMessageDialog.close();
					}.bind(this)
				})
			});
			this.oErrorMessageDialog.open();
		},

		_fnDlgBtnTxtAdd: function (key) {
			var oBtntxt = this.getResourceBundle().getText("txtaddbtn");
			this.getView().getModel("ViewData").setProperty("/BtnTxt", oBtntxt);
			this.getView().getModel("ViewData").setProperty("/TitDlg", "Add " + key);
		},

		_fnDlgBtnTxtSave: function (key) {
			var oBtntxt = this.getResourceBundle().getText("txtsavebtn");
			this.getView().getModel("ViewData").setProperty("/BtnTxt", oBtntxt);
			this.getView().getModel("ViewData").setProperty("/TitDlg", "Update " + key);
		},

		_fnDlgBtnTxtCopy: function (key) {
			var oBtntxt = this.getResourceBundle().getText("txtcopybtn");
			this.getView().getModel("ViewData").setProperty("/BtnTxt", oBtntxt);
			this.getView().getModel("ViewData").setProperty("/TitDlg", "Copy " + key);
		},

		onSearch: function (oEvent, key, key1) {
			var oBinding, filters = [],
				oFilter,
				sValue = oEvent.getParameter("value");
			if (sValue !== "" && key1) {
				oFilter = [new Filter(key, FilterOperator.Contains, sValue),
					new Filter(key1, FilterOperator.Contains, sValue)
				];
			} else if (sValue !== "" && key) {
				oFilter = [new Filter(key, FilterOperator.Contains, sValue)];
			} else {
				oFilter = "";
			}
			filters = new Filter(oFilter, false);
			oBinding = oEvent.getParameter("itemsBinding");
			oBinding.filter(filters);
		},

		onSelect: function (oEvent, key) {
			var sValue = oEvent.getSource().getValue();
			oEvent.getSource().getModel("oClaimData").setProperty(key, sValue);
		},

		onEligibleOpen: function (oEvent) {
			var oButton = oEvent.getSource(),
				oView = this.getView();

			// create popover
			if (!this._pPopover) {
				this._pPopover = Fragment.load({
					id: oView.getId(),
					name: "BenefitClaim.ZBenefitClaim.fragments.EligibilityPopover",
					controller: this
				}).then(function (oPopover) {
					oView.addDependent(oPopover);
					return oPopover;
				});
			}

			this._pPopover.then(function (oPopover) {
				oPopover.openBy(oButton);
			});
		},

		onhandleClose: function () {
			this.byId("myPopover").close();
		},

		onDelSearchOpen: function (model, key) {
			var oEmp = this.oViewData.getProperty("/EmpID");
			this.getView().setBusy(true);
			this.getOwnerComponent().getModel("ViewData").setProperty("/okey", key);
			$.ajax({
				method: "GET",
				url: "/BenefietCAP/claim/DELEGATOR?$filter=DELEGATOR_ID eq '" + oEmp + "'&$top=10000",
				dataType: "json",
				success: function (data) {
					this.getView().setBusy(false);
					var oModel = this._getSizeLimit(data.value);
					this._fnOpenDelData(oModel.getData());
				}.bind(this),
				error: function (response) {
					this.getView().setBusy(false);
					sap.m.MessageToast.show(response.statusText);
				}
			});
		},

		onTabSelect: function (oEvent) {
			var val = oEvent.getSource().getSelectedKey();
			this.oViewData.setProperty("/oTabValue", val);
			this.getView().setModel(new JSONModel([]), "oDelegData");
		},

		onEmpSearchOpen: function (model, status, key, mode) {
			this.getOwnerComponent().getModel("ViewData").setProperty("/Empmodel", model);
			this.getOwnerComponent().getModel("ViewData").setProperty("/okey", key);
			var oTile = this.getOwnerComponent().getModel("ViewData").getProperty("/oTile"),
				sURL;
			if (key === "TR") {
				var oTable = this._getFragmentTextPos("fgRoute", "tbAdminApprovalDetails"),
					selectedItems = oTable.getSelectedItems();
				if (selectedItems.length === 0) {
					this._fnShowErrorMessage("Please select claim to continue");
					return;
				}
			}
			this.getView().setBusy(true);
			if (status === "Inactive") {
				sURL = "/BenefietCAP/sfservice/EmpJobPayCompRecurring?$top=100000";
			} else if (key === "SCH") {
				sURL = "/BenefietCAP/sfservice/EmpJobPayCompRecurring?$filter=UserStatus eq 'X' and Personal_Area eq 'MOHHSCH'&top=100000";
			} else {
				sURL = "/BenefietCAP/sfservice/EmpJobPayCompRecurring?$filter=UserStatus eq 'X'&top=100000";
			}
			$.ajax({
				method: "GET",
				url: sURL,
				dataType: "json",
				success: function (data) {
					this.getView().setBusy(false);
					var oModel = this._getSizeLimit(data.value);
					if (model === "oApprovalData") {
						this._fnaddEmpValue(oModel.getData(), mode);
					} else {
						if (mode === "MHR") {
							this._fnFiltEmpData(oModel.getData(), mode);
						} else {
							this._fnOpenEmpData(oModel.getData(), mode);
						}
					}
				}.bind(this),
				error: function (response) {
					this.getView().setBusy(false);
					sap.m.MessageToast.show(response.statusText);
				}
			});
		},

		_fnaddEmpValue: function (data, mode) {
			var json = [{
				"userId": "LocationRO"
			}, {
				"userId": "ClaimAdministrator"
			}, {
				"userId": "RO"
			}];
			$.each(json, function (key, model) {
				data.push(model);
			});
			this._fnOpenEmpData(data, mode);
		},

		_fnFiltEmpData: function (data, mode) {
			var oPA = this.oViewData.getProperty("/IntPA"),
				oPSA = this.oViewData.getProperty("/IntPSA"),
				oPAHR = this.oViewData.getProperty("/IntPAHR"),
				oPSAHR = this.oViewData.getProperty("/IntPSAHR"),
				oEmp = [];
			if (oPSA) {
				$.each(data, function (idx, obj) {
					if (obj.Personal_Area === "MOHH" && obj.Personal_Sub_Area === oPSA) {
						oEmp.push(obj);
					}
				});
				this._fnOpenEmpData(oEmp, mode);
			} else if (oPSAHR && mode === "MHR") {
				$.each(data, function (idx, obj) {
					if (obj.Personal_Area === "MOHH" && obj.Personal_Sub_Area === oPSAHR) {
						oEmp.push(obj);
					}
				});
				this._fnOpenEmpData(oEmp, mode);
			} else {
				this._fnShowErrorMessage("Please select PSA");
			}
		},

		_fnOpenEmpData: function (response, mode) {
			this.getView().setModel(new JSONModel([]), "oEmployeeData");
			var oView = this.getView(),
				oName = mode === "M" ? "MEmployeeData" : mode === "MHR" ? "MEmployeeData" : "EmployeeData",
				oKey = this.getOwnerComponent().getModel("ViewData").getProperty("/okey");
			if (oKey === "HRM") {
				var oTokenlist = this._oApproverDialog.getModel("oApprovalData").getProperty("/HR_maker");
			}
			if (oKey === "EMPCOOR") {
				response.push({
					"userId": "N/A"
				});
			}
			this.oEmployee = Fragment.load({
				id: this.createId(oName),
				controller: this,
				name: "BenefitClaim.ZBenefitClaim.fragments." + oName
			}).then(function (oDialog) {
				this.oEmployee = oDialog;
				oView.addDependent(this.oEmployee);
				if (oKey === "HRM") {
					for (var i = 0; i < response.length; i++) {
						var flag = false;
						if (oTokenlist) {
							for (var j = 0; j < oTokenlist.length; j++) {
								if (response[i].userId === oTokenlist[j].UserID) {
									response[i].selected = true;
									flag = true;
									break;
								}
							}
							if (!flag) {
								response[i].selected = false;
							}
						} else {
							response[i].selected = false;
						}
					}
				}
				this.oEmployee.setModel(new JSONModel(response), "oEmployeeData");
				this.oEmployee.open();
			}.bind(this));
		},

		onCoordEmpSearchOpen: function () {
			this.getView().setBusy(true);
			var oEmp = this.oViewData.getProperty("/LoginID");
			$.ajax({
				type: "GET",
				method: "GET",
				url: "/BenefietCAP/claim/claim_coord_employee(claim_Cordinator='" + oEmp + "')/Set?$top=100000&$filter=SUBMIT eq 'Yes'",
				dataType: "json",
				success: function (data) {
					this.getView().setBusy(false);
					this.onCoordEmpSearchData(data.value);
				}.bind(this),
				error: function (response) {
					this.getView().setBusy(false);
					this.handleErrorDialog(response);
				}.bind(this)
			});
		},
		onCoordEmpSearchData: function (response) {
			var oView = this.getView();
			if (!this.byId("dlgCoordData")) {
				Fragment.load({
					id: oView.getId(),
					controller: this,
					name: "BenefitClaim.ZBenefitClaim.fragments.Coordinator"
				}).then(function (oDialog) {
					oView.addDependent(oDialog);
					oDialog.setModel(new JSONModel(response), "oCoordEmployeeData");
					oDialog.open();
				});
			} else {
				this.byId("dlgCoordData").open();
			}
		},

		onCoordEmpClose: function (oEvent) {
			this.oViewData = this.getOwnerComponent().getModel("ViewData");
			var oSelectedItem = oEvent.getParameter("selectedItem").getBindingContext("oCoordEmployeeData").getObject();
			this.oViewData.setProperty("/EmpID", oSelectedItem.EmployeeID);
		},

		_fnOpenDelData: function (response, mode) {
			var oView = this.getView();

			this.oDelegate = Fragment.load({
				id: oView.getId(),
				controller: this,
				name: "BenefitClaim.ZBenefitClaim.fragments.DelegatorData"
			}).then(function (oDialog) {
				oView.addDependent(oDialog);
				oDialog.setModel(new JSONModel(response), "oDelegData");
				oDialog.open();
			});

		},

		onEmpClose: function (oEvent, model) {
			this.oViewData = this.getOwnerComponent().getModel("ViewData");
			var oSelectedItem = oEvent.getParameter("selectedItem").getBindingContext(model).getObject(),
				oModel = this.oViewData.getProperty("/Empmodel"),
				key = this.oViewData.getProperty("/okey");
			if (oModel === "ViewData") {
				if (key === "R") {
					this.oViewData.setProperty("/oRepEmp", oSelectedItem.userId);
				} else if (key === "RE") {
					this.oViewData.setProperty("/oReRouteEmp", oSelectedItem.userId);
				} else if (key == "TR") {
					this.oViewData.setProperty("/TR_EmpID", oSelectedItem.userId);
					this.oViewData.setProperty("/TR_EmpID_Fname", oSelectedItem.fullName);
					this._fnTransfer();
				} else if (key === "App") {
					this.oViewData.setProperty("/EmpID_App", oSelectedItem.userId);
				} else if (key === "ClmOwn") {
					this.oViewData.setProperty("/Claim_Owner", oSelectedItem.userId);
				} else if (key === "SMS") {
					this.oViewData.setProperty("/Emp_SMS", oSelectedItem.userId);
				} else if (key === "HR") {
					this.oViewData.setProperty("/EmpID_App_Rep", oSelectedItem.userId);
				} else if (key === "FIN") {
					this.oViewData.setProperty("/Emp_SMS_finance", oSelectedItem.userId);
				} else if (key === "RG") {
					this.oViewData.setProperty("/EmpIDring", oSelectedItem.userId);
				} else {
					this.oViewData.setProperty("/EmpID", oSelectedItem.userId);
				}
			} else {
				if (key === "A") {
					this._oApproverDialog.getModel(oModel).setProperty("/First_Level_Approver", oSelectedItem.userId);
					this._oApproverDialog.getModel(oModel).setProperty("/First_Level_Approver_Name", oSelectedItem.fullName);
				} else if (key === "B") {
					this._oApproverDialog.getModel(oModel).setProperty("/Second_Level_Approver", oSelectedItem.userId);
					this._oApproverDialog.getModel(oModel).setProperty("/Second_Level_Approver_Name", oSelectedItem.fullName);
				} else if (key === "C") {
					this._oApproverDialog.getModel(oModel).setProperty("/Third_Level_Approver", oSelectedItem.userId);
					this._oApproverDialog.getModel(oModel).setProperty("/Third_Level_Approver_Name", oSelectedItem.fullName);
				} else if (key === "D4") {
					this._oApproverDialog.getModel(oModel).setProperty("/Fourth_Level_Approver", oSelectedItem.userId);
					this._oApproverDialog.getModel(oModel).setProperty("/Fourth_Level_Approver_Name", oSelectedItem.fullName);
				} else if (key === "D") {
					this._oCreateValue.getModel(oModel).setProperty("/Admin", oSelectedItem.userId);
				} else if (key === "RO") {
					this._oCreateValue.getModel(oModel).setProperty("/Location_RO_EmployeeID", oSelectedItem.userId);
					this._oCreateValue.getModel(oModel).setProperty("/Location_RO_Name", oSelectedItem.fullName);
				} else if (key === "HRM") {
					this._oApproverDialog.getModel(oModel).setProperty("/HR_maker/0/UserID", oSelectedItem.userId);
					this._oApproverDialog.getModel(oModel).setProperty("/HR_maker/0/Full_Name", oSelectedItem.fullName);
				} else if (key === "EA") {
					this._oCreateValue.getModel("oValueTable").setProperty("/emp_Id", oSelectedItem.userId);
					this._oCreateValue.getModel("oValueTable").setProperty("/Emp_Name", oSelectedItem.fullName);
				} else if (key == "DE") {
					this.oDelDialog.getModel("oDelegate").setProperty("/DELEGATOR_ID", oSelectedItem.userId);
					this.oDelDialog.getModel("oDelegate").setProperty("/FIRST_NAME", oSelectedItem.fullName);
				} else if (key == "ADDE") {
					this.oDelDialog.getModel("oDelegate").setProperty("/APPROVER_ID", oSelectedItem.userId);
					this.oDelDialog.getModel("oDelegate").setProperty("/APP_FIRST_NAME", oSelectedItem.fullName);
				} else if (key == "DL") {
					this.oViewData.setProperty("/Del_EmpID", oSelectedItem.APPROVER_ID);
					this.oViewData.setProperty("/Del_oSdate", oSelectedItem.START_DATE);
					this.oViewData.setProperty("/Del_oEdate", oSelectedItem.END_DATE);
				} else if (key === "EMPCOOR") {
					this._oCoordinDialog.getModel(oModel).setProperty("/EMPLOYEE_ID", oSelectedItem.userId);
					this._oCoordinDialog.getModel(oModel).setProperty("/EMP_FNAME", oSelectedItem.fullName);
					if (oSelectedItem.userId === "N/A") {
						this._oCoordinDialog.getModel(oModel).setProperty("/PERSONNEL_AREA", "ALL");
						this._oCoordinDialog.getModel(oModel).setProperty("/PERSONAL_SUBAREA", "ALL");
						this._oCoordinDialog.getModel(oModel).setProperty("/EMPLOYEE_DEPARTMENT", "ALL");
						this._oCoordinDialog.getModel(oModel).setProperty("/EMPLOYEE_DIVISION", "ALL");
						this._oCoordinDialog.getModel(oModel).setProperty("/PAY_GRADE", "ALL");
						this._oCoordinDialog.getModel(oModel).setProperty("/SPECIALISATION", "ALL");
						this._oCoordinDialog.getModel(oModel).setProperty("/SPONSOR_INSTITUTION", "ALL");
					}
				} else if (key === "COORD") {
					this._oCoordinDialog.getModel(oModel).setProperty("/COORDINATOR", oSelectedItem.userId);
					this._oCoordinDialog.getModel(oModel).setProperty("/COORD_FNAME", oSelectedItem.fullName);
				} else if (key === "EMP_ID") {
					this._oRoleDialog.getModel(oModel).setProperty("/EMPLOYEE_ID", oSelectedItem.userId);
					this._oRoleDialog.getModel(oModel).setProperty("/FIRSTNAME", oSelectedItem.fullName);
				} else if (key === "PU") {
					this.eDialog.getModel(oModel).setProperty("/SCHOLAR_ID", oSelectedItem.userId);
					this.eDialog.getModel(oModel).setProperty("/SCHOLAR_NAME", oSelectedItem.fullName);
					var iURL = "/BenefietCAP/claim/BANK_ACC?$filter=externalCode eq '" + oSelectedItem.userId + "'",
						sURL = "/BenefietCAP/claim/SCHOLAR_SCHEME?$filter=externalCode eq '" + oSelectedItem.userId + "'",
						oURL = "/BenefietCAP/claim/INFT_SCHOLAR_SCHEME?$filter=externalCode eq '" + oSelectedItem.userId +
						"'&$orderby=effectiveStartDate desc";
					this._fnAccountDetaila(iURL, "PUpload", "Form");
					this._fnInflightScholar(oURL, oModel);
					this._fnPayupDetaila(sURL, oModel);
				} else if (key === "M_PU") {
					// this.eDialogM.getModel(oModel).setProperty("/PAYMENT", oSelectedItem.userId);
				} else {
					this._oApproverDialog.getModel(oModel).setProperty("/HR_checker/UserID", oSelectedItem.userId);
					this._oApproverDialog.getModel(oModel).setProperty("/HR_checker/Full_Name", oSelectedItem.fullName);
				}
			}
			oEvent.getSource().getBinding("items").filter([]);
			this.oEmployee.close();
			this.oEmployee.destroy();
		},

		_fnClaimCategory: function (oEmp, oPSA) {
			$.ajax({
				type: "GET",
				method: "GET",
				url: "/BenefietCAP/claim/EmployeeEligibility(UserID='" + oEmp + "')/Set?$filter=Personal_Sub_Area eq '" + oPSA +
					"' or Personal_Sub_Area eq 'ALL'",
				dataType: "json",
				success: function (response) {
					this.getOwnerComponent().setModel(new JSONModel(response.value), "oClaimCatNew");
					var newArray = this.removeDuplicate(response.value, "Category_Code");
					this.getView().setModel(new JSONModel(newArray), "oClaimCat");
				}.bind(this),
				error: function (response) {
					this.handleErrorDialog(response);
				}.bind(this)
			});
		},

		removeDuplicate: function (arr, prop) {
			var oArray = [],
				lookup = {},
				oTile = this.oViewData.getProperty("/oTile");
			for (var i in arr) {
				lookup[arr[i][prop]] = arr[i];
			}
			for (i in lookup) {
				if (oTile !== "Admin" || oTile !== "Upload") {
					delete lookup.WRC_HR;
				}
				if (lookup[i]) {
					oArray.push(lookup[i]);
				}
			}
			return oArray;
		},

		_fnTransfer: function () {
			var oReApp = this.oViewData.getProperty("/TR_EmpID"),
				oRepName = this.oViewData.getProperty("/TR_EmpID_Fname"),
				oTable = this._getFragmentTextPos("fgRoute", "tbAdminApprovalDetails"),
				selectedItems = oTable.getSelectedItems(),
				oDataModel = "",
				oPayLoad = [];
			oDataModel = oTable.getModel("AdminApprovalModel").getData();
			if (selectedItems.length > 0) {
				for (var j = 0; j < selectedItems.length; j++) {
					var jdx = selectedItems[j].getBindingContext("AdminApprovalModel").getObject();
					var payload = {
						"AMOUNT": jdx.AMOUNT,
						"CATEGORY_CODE": jdx.CATEGORY_CODE,
						"CLAIM_DATE": (jdx.CATEGORY_CODE === "TIM" || jdx.CATEGORY_CODE === "WRC" || jdx.CATEGORY_CODE ===
								"WRC_HR" || jdx.CATEGORY_CODE === "COV" || jdx.CATEGORY_CODE.includes("SP") || jdx.CATEGORY_CODE === "TC") ? jdx.CLAIM_DATE : jdx
							.RECEIPT_DATE,
						"CLAIM_OWNER_ID": jdx.CLAIM_OWNER_ID,
						"CLAIM_REFERENCE": jdx.CLAIM_REFERENCE,
						"CLAIM_STATUS": jdx.CLAIM_STATUS,
						"CLAIM_TYPE": jdx.CLAIM_TYPE,
						"EMPLOYEE_ID": jdx.EMPLOYEE_ID,
						"EMPLOYEE_NAME": jdx.EMPLOYEE_ID
					};
					oPayLoad.push(payload);
				}

				var oMsg = "Selected claim(s) re-route to " + oReApp + " - " + oRepName + " ?";
				if (!this.oSubmitDialog) {
					this.oSubmitDialog = new sap.m.Dialog({
						type: sap.m.DialogType.Message,
						title: "Confirm",
						content: [
							new sap.m.Label({
								text: oMsg
							}),
							new sap.m.TextArea("submissionNote", {
								width: "100%"
							})
						],
						beginButton: new sap.m.Button({
							type: sap.m.ButtonType.Emphasized,
							text: "OK",
							press: function () {
								var sText = sap.ui.getCore().byId("submissionNote").getValue();
								var oValue = {
									"listofClaims": JSON.stringify(oPayLoad),
									"VAR_ARF": "",
									"APP_COMMENT": sText,
									"REROUTE_APPROVER": oReApp,
									"REROUTE_BY": this.oViewData.getProperty("/EmpID")
								};
								this._fnTransferApprover(oValue);
								sap.ui.getCore().byId("submissionNote").setValue("");
								this.oSubmitDialog.close();
								this.oSubmitDialog.destroyContent();
								this.oSubmitDialog = undefined;
							}.bind(this)
						}),
						endButton: new sap.m.Button({
							text: "Cancel",
							press: function () {
								sap.ui.getCore().byId("submissionNote").setValue("");
								this.oSubmitDialog.close();
								this.oSubmitDialog.destroyContent();
								this.oSubmitDialog = undefined;
							}.bind(this)
						})
					});
				}
				this.oSubmitDialog.addStyleClass("sapUiSizeCompact");
				this.oSubmitDialog.open();
			} else {
				this._fnShowErrorMessage("Please select claim to continue");
			}
		},
		_fnTransferApprover: function (oValue) {
			this.getView().setBusy(true);
			$.ajax({
				url: "/BenefietCAP/claim/rerouteApprover",
				data: JSON.stringify(oValue),
				method: "POST",
				crossDomain: true,
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json"
				},
				success: function (data, oResponse) {
					this.getView().setBusy(false);
					this.onSearchReroute();
					this.oViewData.setProperty("/TR_EmpID", "");
					this.handleSuccessDialog("Claim(s) has been Re-Routed successfully");
				}.bind(this),
				error: function (xhr, ajaxOptions, throwError) {
					this.getView().setBusy(false);
					this.handleErrorDialog(xhr);
				}.bind(this)
			});
		},

		_fnDelegation: function (oEmp, oSdate, oEdate) {
			this.getView().setBusy(true);
			var oKey = this.oViewData.getProperty("/EmpID"),
				oURL = "/BenefietCAP/claim/app_histwithCancel?$filter=EMPLOYEE_ID eq '" + oKey + "' and CLAIM_DATE ge " + oSdate +
				" and CLAIM_DATE le " + oEdate +
				" and CLAIM_STATUS ne 'Approved' and CLAIM_STATUS ne 'Cancellation Approved' and CLAIM_STATUS ne 'Rejected' and CLAIM_STATUS ne 'Cancelled'";
			$.ajax({
				method: "GET",
				url: oURL + "&$top=100000",
				dataType: "json",
				success: function (data) {
					if (data.value.length > 0) {
						var oPayLoad = [],
							oDataModel = data.value;
						for (var j = oDataModel.length - 1; j >= 0; j--) {
							var payload = {
								"AMOUNT": oDataModel[j].AMOUNT,
								"CATEGORY_CODE": oDataModel[j].CATEGORY_CODE,
								/*"CLAIM_DATE": (oDataModel[j].CATEGORY_CODE === "TIM" || oDataModel[j].CATEGORY_CODE === "WRC" || oDataModel[j].CATEGORY_CODE ===
									"WRC_HR" || oDataModel[j].CATEGORY_CODE === "COV" || oDataModel[j].CATEGORY_CODE.includes("SP") ||
									oDataModel[j].CATEGORY_CODE === "TC") ? oDataModel[j].CLAIM_DATE : oDataModel[j].RECEIPT_DATE,*/
								"CLAIM_DATE": new Date(),
								"CLAIM_OWNER_ID": oDataModel[j].CLAIM_OWNER_ID,
								"CLAIM_REFERENCE": oDataModel[j].CLAIM_REFERENCE,
								"CLAIM_STATUS": "",
								"CLAIM_TYPE": oDataModel[j].CLAIM_TYPE,
								"EMPLOYEE_ID": oDataModel[j].EMPLOYEE_ID,
								"EMPLOYEE_NAME": oDataModel[j].EMPLOYEE_ID
							};
							oPayLoad.push(payload);
						}
						var oMsg = data.value.length + " claim(s) want to delegate?"
						MessageBox.confirm(oMsg, {
							actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
							emphasizedAction: MessageBox.Action.OK,
							onClose: function (sAction) {
								var oValue = {
									"listofClaims": JSON.stringify(oPayLoad),
									"APP_COMMENT": "",
									"DELEGATE_APPROVER": oEmp
								};
								this._fnDelegateApprover(oValue);
							}.bind(this)
						});
					}
					this.getView().setBusy(false);
				}.bind(this),
				error: function (response) {
					this.getView().setBusy(false);
					this.handleErrorDialog(response);
				}.bind(this)
			});

		},

		_fnClaimTypes: function () {
			var oClaimCatg = [],
				oCompany = this.getView().getModel("oEmpData").getProperty("/COMPANY"),
				oResp = this.getView().getModel("ComboDetails").getData();
			if (this.oViewData.getProperty("/oTile") === "SMSApprovals" || this.oViewData.getProperty("/oTile") === "SMSRep") {
				oCompany = "MOHHSCH";
			}
			$.each(oResp.CLAIM_CATEGORY, function (idx, obj) {
				if (obj.Company === oCompany) {
					oClaimCatg.push(obj);
				}
			});
			this.getView().setModel(new JSONModel(oClaimCatg), "oClaimCatg");
		},

		_fnAddAll: function () {
			var oClaimCatg = [],
				oCompany = this.getView().getModel("oEmpData").getProperty("/COMPANY"),
				oResp = this.getView().getModel("ComboDetails").getData(),
				oComp = (this.oViewData.getProperty("/oTile") === "HistoryCoord" || this.oViewData.getProperty("/oTile") === "Coordinat") ?
				"MOHH" : "MOHHSCH";
			$.each(oResp.CLAIM_CATEGORY, function (idx, obj) {
				if (obj.Company === oComp) {
					oClaimCatg.push(obj);
				}
			});
			this.getView().setModel(new JSONModel(oClaimCatg), "oClaimCatg");
		},

		_fnClinicData: function () {
			var oJson = this.getView().getModel("ComboDetails").getData(),
				oCompany = this.getView().getModel("oEmpData").getProperty("/COMPANY"),
				oClinicMaster = [];
			$.each(oJson.CLINIC_MASTER, function (idx, obj) {
				if (obj.Company === oCompany) {
					oClinicMaster.push(obj);
				}
			});
			this.getView().setModel(new JSONModel(oClinicMaster), "ClinicData");
		},

		onEmpCloseM: function (oEvent) {
			var aContexts = oEvent.getParameter("selectedContexts"),
				oFilEmp = [],
				key = this.oViewData.getProperty("/okey");;
			if (aContexts && aContexts.length && key !== "HRM") {
				$.each(aContexts, function (idx, obj) {
					oFilEmp.push(obj.getObject());
				});
				this.getView().setModel(new JSONModel(oFilEmp), "oFilEmp");
			} else {
				var oMaker = this._oApproverDialog.getModel("oApprovalData").getData().HR_maker,
					aData = this._oApproverDialog.getModel("oApprovalData");
				$.each(aContexts, function (idx, obj) {
					var oJson = {
						"Claim_Claim_code": aData.getProperty("/Claim_code"),
						"Claim_Sequence_of_check": 1,
						"Full_Name": obj.getObject().fullName,
						"UserID": obj.getObject().userId
					}
					oMaker.push(oJson);
				});
				aData.refresh(true);
			}
			this.oEmployee.close();
			this.oEmployee.destroy();
		},

		onPayCompOpen: function () {
			var oView = this.getView();
			if (!this.byId("dlgPGService")) {
				Fragment.load({
					id: oView.getId(),
					controller: this,
					name: "BenefitClaim.ZBenefitClaim.fragments.PayComponent"
				}).then(function (oDialog) {
					oView.addDependent(oDialog);
					oDialog.open();
				});
			} else {
				this.byId("dlgPGService").open();
			}
		},

		onPayCompClose: function (oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			this._oCreateBenefitDialog.getModel("oClaimData").setProperty("/Pay_Component", oSelectedItem.getTitle());
			this._oCreateBenefitDialog.getModel("oClaimData").refresh(true);
		},

		onPGOpen: function (oEvent, model, key) {
			this.oViewData.setProperty("/model", model);
			this.oViewData.setProperty("/oPGkey", key);
			var oCompany = this.getView().getModel("oEmpData").getProperty("/COMPANY");
			$.ajax({
				method: "GET",
				url: "/BenefietCAP/claim/Claim_Pay_Grade?$filter=Company eq '" + oCompany + "'",
				dataType: "json",
				success: function (data) {
					this.getView().setBusy(false);
					var oModel = this._getSizeLimit(data.value);
					if (this.oViewData.getProperty("/oTile") === "Coord") {
						oModel.getData().push({
							"PayGrade_ID": "ALL"
						});
					}
					this.getView().setModel(oModel, "oPayGrade");
				}.bind(this),
				error: function (response) {
					this.getView().setBusy(false);
					sap.m.MessageToast.show(response.statusText);
				}
			});

			var oView = this.getView();
			if (!this.byId("dlgPGService")) {
				Fragment.load({
					id: oView.getId(),
					controller: this,
					name: "BenefitClaim.ZBenefitClaim.fragments.PayGrade"
				}).then(function (oDialog) {
					oView.addDependent(oDialog);
					oDialog.open();
				});
			} else {
				this.byId("dlgPGService").open();
			}
		},

		onPGClose: function (oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem"),
				model = this.oViewData.getProperty("/model");
			if (model === "oEligibileData") {
				this._oEligibleDialog.getModel(model).setProperty("/Pay_Grade", oSelectedItem.getTitle());
			} else if (model === "oValueTable") {
				this._oCreateValue.getModel(model).setProperty("/PAY_GRADE", oSelectedItem.getTitle());
			} else if (model === "ViewData") {
				if (this.oViewData.getProperty("/oPGkey") === "H") {
					this.oViewData.setProperty("/IntPayGrade", oSelectedItem.getTitle());
				} else {
					this.oViewData.setProperty("/IntPayGradeHR", oSelectedItem.getTitle());
				}
			} else if (model === "oCoordinData") {
				this._oCoordinDialog.getModel(model).setProperty("/PAY_GRADE", oSelectedItem.getTitle());
			} else {
				this._oApproverDialog.getModel(model).setProperty("/Pay_Grade", oSelectedItem.getTitle());
			}
		},

		onSPClose: function (oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem"),
				model = this.oViewData.getProperty("/model");
			if (model === "oEligibileData") {
				this._oEligibleDialog.getModel(model).setProperty("/Specialisation", oSelectedItem.getDescription());
			} else if (model === "oCoordinData") {
				this._oCoordinDialog.getModel(model).setProperty("/SPECIALISATION", oSelectedItem.getTitle());
			} else {
				this._oApproverDialog.getModel(model).setProperty("/Specialisation", oSelectedItem.getDescription());
			}
		},

		onNavBack: function () {
			if (this.oViewData.getProperty("/oTile") === "Coord") {
				var oEmp = this.oViewData.getProperty("/EmpID");
				$.ajax({
					url: "/BenefietCAP/claim/CLAIM_COORDINATOR?$filter=COORDINATOR eq '" + oEmp + "'",
					type: "GET",
					method: "GET",
					crossDomain: true,
					success: function (data, oResponse) {
						var oData = data.value;
						if (oData) {
							for (var i = 0; i < oData.length; i++) {
								if (oData[i].REPORT === "Yes") {
									this.oViewData.setProperty("/oVisReport", "Yes");
								}
								if (oData[i].SUBMIT === "Yes") {
									this.oViewData.setProperty("/oVisSubmit", "Yes");
								}
							}
							this.oViewData.refresh(true);
						}
					}.bind(this),
					error: function (response) {

					}.bind(this)
				});
			}
			this.getRouter().navTo("home");
		},

		ValidateClaim: function (oData, isValidate) {
			this.getView().setBusy(true);
			$.ajax({
				url: "/BenefietCAP/claim/validateClaimSubmission",
				data: JSON.stringify({
					"claimCode": oData.CATEGORY_CODE,
					"claimDate": oData.CLAIM_DATE,
					"employeeId": oData.EMPLOYEE_ID,
					"isMode": "X"
				}),
				method: "POST",
				crossDomain: true,
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json"
				},
				success: function (data) {
					this.getView().setBusy(false);
					isValidate = false;
				}.bind(this),
				error: function (response) {
					isValidate = true;
					this.getView().setBusy(false);
					this.handleErrorDialog(response);
				}.bind(this)
			});
			return isValidate;
		},

		validatePublicHol: function (oMode, key, oDlgData, eURL, name) {
			$.ajax({
				url: "/BenefietCAP/claim/validatePublicHolidayClaim",
				data: JSON.stringify({
					"claimCode": oDlgData.CLAIM_CODE,
					"claimDate": oDlgData.CLAIM_DATE + "T00:00:00Z"
				}),
				method: "POST",
				crossDomain: true,
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json"
				},
				success: function (data) {
					if (oDlgData.CLAIM_CODE === "TSOTC_PH") {
						this._fnAddData(oMode, key, oDlgData, eURL, name);
					} else {
						this._fnAddlineWRC(oDlgData, oMode, key, eURL, name);
					}
				}.bind(this),
				error: function (response) {
					this.handleErrorDialog(response);
				}.bind(this)
			});
		},

		onWRCSubmissiondate: function (data, model, oDlg) {
			var oLocRo = this.getView().getModel("oLocationRO").getData(),
				oLoad = this.eDialogM.getModel(model),
				eURL = "/BenefietCAP/claim/getLocationROs(employeeId='" + data.EMPLOYEE_ID + "',submissionDate=" + data.CLAIM_DATE + ")";
			$.ajax({
				url: eURL,
				method: "GET",
				dataType: "json",
				success: function (data) {
					if (data.value.length > 0) {
						this.oViewData.setProperty("/oEnableRO", true);
						var oModel = this._getSizeLimit(data.value);
						this.getView().setModel(oModel, "oLocationRO");
						if (oLocRo.length === 0 && data.value.length === 1) {
							oLoad.getData().FIRST_LEVEL_APPROVER = data.value[0].LOCATION_RO_EMPLOYEEID;
							oLoad.refresh(true);
							this._fnValidActiveEmp(data.value[0].LOCATION_RO_EMPLOYEEID);
						}
						this.getView().getModel("oLocationRO").refresh(true);
					} else {
						this.getView().setModel(new JSONModel([]), "oLocationRO");
					}

				}.bind(this),
				error: function (response) {
					this.oViewData.setProperty("/oEnableRO", false);
					this.handleErrorDialog(response);
				}.bind(this)
			});

			if (this.oViewData.getProperty("/oTile") === "Admin" || this.oViewData.getProperty("/oTile") === "AdminSch") {
				var odate = new Date().toISOString().substring(0, 10),
					ourl = "/BenefietCAP/claim/employeeSelectApproverList(Owner='" + data.EMPLOYEE_ID + "',Claim_code='" + data.CLAIM_CODE +
					"',Receipt_Date=" + odate + ",behalf='Y')";
				this._fnHRCheckerDisp(ourl, oLoad.getData(), oDlg);
			}

		},

		_fnAttachValidation: function () {
			this.getView().setBusy(true);
			this.oViewData.getData().AttachValidation = [];
			var oDate = new Date().toISOString().substring(0, 10);
			var eURL = "/BenefietCAP/claim/Benefit_Claim_Admin?$filter=Start_Date le " +
				oDate + " and End_Date ge " + oDate + "";
			$.ajax({
				url: eURL,
				method: "GET",
				dataType: "json",
				success: function (data) {
					this.getView().setBusy(false);
					this.oViewData.getData().AttachValidation.push(data.value);
				}.bind(this),
				error: function (response) {
					this.getView().setBusy(false);
					this.handleErrorDialog(response);
				}.bind(this)
			});
		},

		_fnAttachReq: function (key) {
			var isValidate = false,
				oCont = this.oViewData.getData().AttachValidation;
			$.each(oCont[0], function (idx, obj) {
				if (obj.Claim_Code === key && obj.Attachment_Allowed === "Required") {
					isValidate = true;
				}
			});
			return isValidate;
		},

		fnPostEntity: function () {
			var oClaim = this.oViewData.getProperty("/ClaimType"),
				oEntity = "";
			switch (oClaim) {
			case "MC":
				oEntity = "/BenefietCAP/claim/Medical_Claim";
				this.oViewData.setProperty("/oModelName", "Hospitialisation");
				this.oViewData.setProperty("/oTableAppName", "BENEFIT_MEDICAL_CLAIM");
				this.oViewData.setProperty("/oTableAppLineName", "");
				this.oViewData.setProperty("/oTableid", "oTableHospital");
				this.oViewData.setProperty("/oTableDelName", "Medical_Claim");
				break;
			case "WRC":
				oEntity = "/BenefietCAP/claim/WRC_MASTER_CLAIM?$expand=LINE_ITEM";
				this.oViewData.setProperty("/oModelName", "WorkRelated");
				this.oViewData.setProperty("/oTableAppName", "BENEFIT_WRC_MASTER_CLAIM");
				this.oViewData.setProperty("/oTableAppLineName", "BENEFIT_WRC_LINEITEM_CLAIM");
				this.oViewData.setProperty("/oTableid", "oTableWorkRelated");
				this.oViewData.setProperty("/oTableDelName", "WRC_MASTER_CLAIM");
				break;
			case "WRC_HR":
				oEntity = "/BenefietCAP/claim/WRC_HR_MASTER_CLAIM?$expand=LINE_ITEM";
				this.oViewData.setProperty("/oModelName", "WorkRelatedHR");
				this.oViewData.setProperty("/oTableAppName", "BENEFIT_WRC_HR_MASTER_CLAIM");
				this.oViewData.setProperty("/oTableAppLineName", "BENEFIT_WRC_HR_LINEITEM_CLAIM");
				this.oViewData.setProperty("/oTableid", "oTableWorkRelatedHR");
				this.oViewData.setProperty("/oTableDelName", "WRC_HR_MASTER_CLAIM");
				break;
			case "COV":
				oEntity = "/BenefietCAP/claim/COV_MASTER_CLAIM?$expand=LINE_ITEM";
				this.oViewData.setProperty("/oModelName", "Covid");
				this.oViewData.setProperty("/oTableAppName", "BENEFIT_COV_MASTER_CLAIM");
				this.oViewData.setProperty("/oTableAppLineName", "BENEFIT_COV_LINEITEM_CLAIM");
				this.oViewData.setProperty("/oTableid", "oTableCovid");
				this.oViewData.setProperty("/oTableDelName", "COV_MASTER_CLAIM");
				break;
			case "TC":
				oEntity = "/BenefietCAP/claim/TC_MASTER_CLAIM?$expand=LINE_ITEM";
				this.oViewData.setProperty("/oModelName", "Transportation");
				this.oViewData.setProperty("/oTableAppName", "BENEFIT_TC_MASTER_CLAIM");
				this.oViewData.setProperty("/oTableAppLineName", "BENEFIT_TC_LINEITEM_CLAIM");
				this.oViewData.setProperty("/oTableid", "oTableTransp");
				this.oViewData.setProperty("/oTableDelName", "TC_MASTER_CLAIM");
				break;
			case "TIM":
				oEntity = "/BenefietCAP/claim/overtime_claim";
				this.oViewData.setProperty("/oModelName", "Timesheet");
				this.oViewData.setProperty("/oTableAppName", "BENEFIT_OVERTIME_CLAIM");
				this.oViewData.setProperty("/oTableAppLineName", "");
				this.oViewData.setProperty("/oTableid", "oTableTime");
				this.oViewData.setProperty("/oTableDelName", "overtime_claim");
				break;
			case "AHP":
				oEntity = "/BenefietCAP/claim/AHP_LIC_MS_WIC_CLAIM";
				this.oViewData.setProperty("/oModelName", "Ahpreim");
				this.oViewData.setProperty("/oTableAppName", "BENEFIT_AHP_LIC_MS_WIC_CLAIM");
				this.oViewData.setProperty("/oTableAppLineName", "");
				this.oViewData.setProperty("/oTableid", "oTableAHP");
				this.oViewData.setProperty("/oTableDelName", "AHP_LIC_MS_WIC_CLAIM");
				break;
			case "LIC":
				oEntity = "/BenefietCAP/claim/AHP_LIC_MS_WIC_CLAIM";
				this.oViewData.setProperty("/oModelName", "Licence");
				this.oViewData.setProperty("/oTableAppName", "BENEFIT_AHP_LIC_MS_WIC_CLAIM");
				this.oViewData.setProperty("/oTableAppLineName", "");
				this.oViewData.setProperty("/oTableid", "oTableLic");
				this.oViewData.setProperty("/oTableDelName", "AHP_LIC_MS_WIC_CLAIM");
				break;
			case "WIC":
				oEntity = "/BenefietCAP/claim/AHP_LIC_MS_WIC_CLAIM";
				this.oViewData.setProperty("/oModelName", "WorkInjury");
				this.oViewData.setProperty("/oTableAppName", "BENEFIT_AHP_LIC_MS_WIC_CLAIM");
				this.oViewData.setProperty("/oTableAppLineName", "");
				this.oViewData.setProperty("/oTableid", "oTableInjury");
				this.oViewData.setProperty("/oTableDelName", "AHP_LIC_MS_WIC_CLAIM");
				break;
			case "MSR":
				oEntity = "/BenefietCAP/claim/AHP_LIC_MS_WIC_CLAIM";
				this.oViewData.setProperty("/oModelName", "Reimbursement");
				this.oViewData.setProperty("/oTableAppName", "BENEFIT_AHP_LIC_MS_WIC_CLAIM");
				this.oViewData.setProperty("/oTableAppLineName", "");
				this.oViewData.setProperty("/oTableid", "oTableTReimb");
				this.oViewData.setProperty("/oTableDelName", "AHP_LIC_MS_WIC_CLAIM");
				break;
			case "PTF":
				oEntity = "/BenefietCAP/claim/PTF_ACL_BCL_CLAIM";
				this.oViewData.setProperty("/oModelName", "TrainingFund");
				this.oViewData.setProperty("/oTableAppName", "BENEFIT_PTF_ACL_BCL_CLAIM");
				this.oViewData.setProperty("/oTableAppLineName", "");
				this.oViewData.setProperty("/oTableid", "oTablePtf");
				this.oViewData.setProperty("/oTableDelName", "PTF_ACL_BCL_CLAIM");
				break;
			case "CLS":
				oEntity = "/BenefietCAP/claim/PTF_ACL_BCL_CLAIM";
				this.oViewData.setProperty("/oModelName", "ABcls");
				this.oViewData.setProperty("/oTableAppName", "BENEFIT_PTF_ACL_BCL_CLAIM");
				this.oViewData.setProperty("/oTableAppLineName", "");
				this.oViewData.setProperty("/oTableid", "oTableAcls");
				this.oViewData.setProperty("/oTableDelName", "PTF_ACL_BCL_CLAIM");
				break;
			case "PC":
				oEntity = "/BenefietCAP/claim/PC_CLAIM";
				this.oViewData.setProperty("/oModelName", "PettyCash");
				this.oViewData.setProperty("/oTableAppName", "BENEFIT_PC_CLAIM");
				this.oViewData.setProperty("/oTableAppLineName", "");
				this.oViewData.setProperty("/oTableid", "oTablePettyCash");
				this.oViewData.setProperty("/oTableDelName", "PC_CLAIM");
				break;
			case "SP":
				oEntity = "/BenefietCAP/claim/SP_MASTER_CLAIM?$expand=LINE_ITEM";
				this.oViewData.setProperty("/oModelName", "Sponsorship");
				this.oViewData.setProperty("/oTableAppName", "BENEFIT_SP_MASTER_CLAIM");
				this.oViewData.setProperty("/oTableAppLineName", "BENEFIT_SP1_LINEITEM_CLAIM");
				this.oViewData.setProperty("/oTableid", "oTableTSpons");
				this.oViewData.setProperty("/oTableDelName", "SP_MASTER_CLAIM");
				break;
			case "SP1":
				oEntity = "/BenefietCAP/claim/SP1_MASTER_CLAIM?$expand=LINE_ITEM";
				this.oViewData.setProperty("/oModelName", "Sponsorship");
				this.oViewData.setProperty("/oTableAppName", "BENEFIT_SP1_MASTER_CLAIM");
				this.oViewData.setProperty("/oTableAppLineName", "BENEFIT_SP1_LINEITEM_CLAIM");
				this.oViewData.setProperty("/oTableid", "oTableTSpons");
				this.oViewData.setProperty("/oTableDelName", "SP1_MASTER_CLAIM");
				break;
			case "SP2":
				oEntity = "/BenefietCAP/claim/SP2_MASTER_CLAIM?$expand=LINE_ITEM";
				this.oViewData.setProperty("/oModelName", "Sponsorship");
				this.oViewData.setProperty("/oTableAppName", "BENEFIT_SP2_MASTER_CLAIM");
				this.oViewData.setProperty("/oTableAppLineName", "BENEFIT_SP2_LINEITEM_CLAIM");
				this.oViewData.setProperty("/oTableid", "oTableTSpons");
				this.oViewData.setProperty("/oTableDelName", "SP2_MASTER_CLAIM");
				break;
			case "SP3":
				oEntity = "/BenefietCAP/claim/SP3_MASTER_CLAIM?$expand=LINE_ITEM";
				this.oViewData.setProperty("/oModelName", "Sponsorship");
				this.oViewData.setProperty("/oTableAppName", "BENEFIT_SP3_MASTER_CLAIM");
				this.oViewData.setProperty("/oTableAppLineName", "BENEFIT_SP3_LINEITEM_CLAIM");
				this.oViewData.setProperty("/oTableid", "oTableTSpons");
				this.oViewData.setProperty("/oTableDelName", "SP3_MASTER_CLAIM");
				break;
			case "CPR":
				oEntity = "/BenefietCAP/claim/CPR_CLAIM";
				this.oViewData.setProperty("/oModelName", "PRequest");
				this.oViewData.setProperty("/oTableAppName", "BENEFIT_CPR_CLAIM");
				this.oViewData.setProperty("/oTableAppLineName", "");
				this.oViewData.setProperty("/oTableid", "oTablePettyCash");
				this.oViewData.setProperty("/oTableDelName", "CPR_CLAIM");
				break;
			case "SDFR":
				oEntity = "/BenefietCAP/claim/SDFR_MASTER_CLAIM?$expand=LINE_ITEM";
				this.oViewData.setProperty("/oModelName", "SDFRClaim");
				this.oViewData.setProperty("/oTableAppName", "BENEFIT_SDFR_MASTER_CLAIM");
				this.oViewData.setProperty("/oTableAppLineName", "BENEFIT_SDFR_LINEITEM_CLAIM");
				this.oViewData.setProperty("/oTableid", "oTableSDFRClaim");
				this.oViewData.setProperty("/oTableDelName", "SDFR_MASTER_CLAIM");
				break;
			case "SDFC":
				oEntity = "/BenefietCAP/claim/SDFC_MASTER_CLAIM?$expand=LINE_ITEM";
				this.oViewData.setProperty("/oModelName", "SDFClaim");
				this.oViewData.setProperty("/oTableAppName", "BENEFIT_SDFC_MASTER_CLAIM");
				this.oViewData.setProperty("/oTableAppLineName", "BENEFIT_SDFC_LINEITEM_CLAIM");
				this.oViewData.setProperty("/oTableid", "oTableSDFClaim");
				this.oViewData.setProperty("/oTableDelName", "SDFC_MASTER_CLAIM");
				break;
			case "CPC":
				oEntity = "/BenefietCAP/claim/CPC_MASTER_CLAIM?$expand=LINE_ITEM";
				this.oViewData.setProperty("/oModelName", "CPClaim");
				this.oViewData.setProperty("/oTableAppName", "BENEFIT_CPC_MASTER_CLAIM");
				this.oViewData.setProperty("/oTableAppLineName", "BENEFIT_CPC_LINEITEM_CLAIM");
				this.oViewData.setProperty("/oTableid", "oTableCPClaim");
				this.oViewData.setProperty("/oTableDelName", "CPC_MASTER_CLAIM");
				break;
			case "OC":
				oEntity = "/BenefietCAP/claim/OC_MASTER_CLAIM?$expand=LINE_ITEM";
				this.oViewData.setProperty("/oModelName", "OClaim");
				this.oViewData.setProperty("/oTableAppName", "BENEFIT_OC_MASTER_CLAIM");
				this.oViewData.setProperty("/oTableAppLineName", "BENEFIT_OC_LINEITEM_CLAIM");
				this.oViewData.setProperty("/oTableid", "oTableOClaim");
				this.oViewData.setProperty("/oTableDelName", "OC_MASTER_CLAIM");
				break;
			case "PAY_UP":
				oEntity = "/BenefietCAP/claim/PAY_UP_MASTER_CLAIM?$expand=LINE_ITEM";
				this.oViewData.setProperty("/oModelName", "PUpload");
				this.oViewData.setProperty("/oTableAppName", "BENEFIT_PAY_UP_MASTER_CLAIM");
				this.oViewData.setProperty("/oTableAppLineName", "BENEFIT_PAY_UP_LINEITEM_CLAIM");
				this.oViewData.setProperty("/oTableid", "oTablePUpload");
				this.oViewData.setProperty("/oTableDelName", "PAY_UP_MASTER_CLAIM");
				break;
			}
			return oEntity;
		},

		fnPutEntity: function (oData) {
			var oClaim = this.oViewData.getProperty("/ClaimType"),
				oEntity = "";
			switch (oClaim) {
			case "MC":
				oEntity = "/BenefietCAP/claim/Medical_Claim(EMPLOYEE_ID='" + oData.EMPLOYEE_ID + "',CLAIM_CODE='" + oData.CLAIM_CODE +
					"',CLAIM_REFERENCE='" + oData.CLAIM_REFERENCE + "',CLAIM_DATE=" + oData.CLAIM_DATE + ")";
				this.oViewData.setProperty("/oModelName", "Hospitialisation");
				break;
			case "WRC":
				oEntity = "/BenefietCAP/claim/WRC_MASTER_CLAIM(EMPLOYEE_ID='" + oData.EMPLOYEE_ID + "',CLAIM_REFERENCE='" + oData.CLAIM_REFERENCE +
					"',CLAIM_DATE=" + oData.CLAIM_DATE + ",CLAIM_CATEGORY='" + oData.CLAIM_CATEGORY + "')";
				this.oViewData.setProperty("/oModelName", "WorkRelated");
				break;
			case "WRC_HR":
				oEntity = "/BenefietCAP/claim/WRC_HR_MASTER_CLAIM(EMPLOYEE_ID='" + oData.EMPLOYEE_ID + "',CLAIM_REFERENCE='" + oData.CLAIM_REFERENCE +
					"',CLAIM_DATE=" + oData.CLAIM_DATE + ",CLAIM_CATEGORY='" + oData.CLAIM_CATEGORY + "')";
				this.oViewData.setProperty("/oModelName", "WorkRelatedHR");
				break;
			case "COV":
				oEntity = "/BenefietCAP/claim/COV_MASTER_CLAIM(EMPLOYEE_ID='" + oData.EMPLOYEE_ID + "',CLAIM_REFERENCE='" + oData.CLAIM_REFERENCE +
					"',CLAIM_DATE=" + oData.CLAIM_DATE + ",CLAIM_CATEGORY='" + oData.CLAIM_CATEGORY + "')";
				this.oViewData.setProperty("/oModelName", "Covid");
				break;
			case "TC":
				oEntity = "/BenefietCAP/claim/TC_MASTER_CLAIM(EMPLOYEE_ID='" + oData.EMPLOYEE_ID + "',CLAIM_REFERENCE='" + oData.CLAIM_REFERENCE +
					"',CLAIM_DATE=" + oData.CLAIM_DATE + ",CLAIM_CATEGORY='" + oData.CLAIM_CATEGORY + "')";
				this.oViewData.setProperty("/oModelName", "Transportation");
				break;
			case "AHP":
				oEntity = "/BenefietCAP/claim/AHP_LIC_MS_WIC_CLAIM(EMPLOYEE_ID='" + oData.EMPLOYEE_ID + "',CLAIM_REFERENCE='" + oData.CLAIM_REFERENCE +
					"',CLAIM_DATE=" + oData.CLAIM_DATE + ",CLAIM_CODE='" + oData.CLAIM_CODE + "')";
				this.oViewData.setProperty("/oModelName", "Ahpreim");
				break;
			case "LIC":
				oEntity = "/BenefietCAP/claim/AHP_LIC_MS_WIC_CLAIM(EMPLOYEE_ID='" + oData.EMPLOYEE_ID + "',CLAIM_REFERENCE='" + oData.CLAIM_REFERENCE +
					"',CLAIM_DATE=" + oData.CLAIM_DATE + ",CLAIM_CODE='" + oData.CLAIM_CODE + "')";
				this.oViewData.setProperty("/oModelName", "Licence");
				break;
			case "WIC":
				oEntity = "/BenefietCAP/claim/AHP_LIC_MS_WIC_CLAIM(EMPLOYEE_ID='" + oData.EMPLOYEE_ID + "',CLAIM_REFERENCE='" + oData.CLAIM_REFERENCE +
					"',CLAIM_DATE=" + oData.CLAIM_DATE + ",CLAIM_CODE='" + oData.CLAIM_CODE + "')";
				this.oViewData.setProperty("/oModelName", "WorkInjury");
				break;
			case "MSR":
				oEntity = "/BenefietCAP/claim/AHP_LIC_MS_WIC_CLAIM(EMPLOYEE_ID='" + oData.EMPLOYEE_ID + "',CLAIM_REFERENCE='" + oData.CLAIM_REFERENCE +
					"',CLAIM_DATE=" + oData.CLAIM_DATE + ",CLAIM_CODE='" + oData.CLAIM_CODE + "')";
				this.oViewData.setProperty("/oModelName", "Reimbursement");
				break;
			case "TIM":
				oEntity = "/BenefietCAP/claim/overtime_claim(EMPLOYEE_ID='" + oData.EMPLOYEE_ID + "',CLAIM_CODE='" + oData.CLAIM_CODE +
					"',CLAIM_REFERENCE='" + oData.CLAIM_REFERENCE + "',CLAIM_DATE=" + oData.CLAIM_DATE + ")";
				this.oViewData.setProperty("/oModelName", "Timesheet");
				break;
			case "PTF":
				oEntity = "/BenefietCAP/claim/PTF_ACL_BCL_CLAIM(EMPLOYEE_ID='" + oData.EMPLOYEE_ID + "',CLAIM_CODE='" + oData.CLAIM_CODE +
					"',CLAIM_REFERENCE='" + oData.CLAIM_REFERENCE + "',CLAIM_DATE=" + oData.CLAIM_DATE + ")";
				this.oViewData.setProperty("/oModelName", "TrainingFund");
				break;
			case "CLS":
				oEntity = "/BenefietCAP/claim/PTF_ACL_BCL_CLAIM(EMPLOYEE_ID='" + oData.EMPLOYEE_ID + "',CLAIM_CODE='" + oData.CLAIM_CODE +
					"',CLAIM_REFERENCE='" + oData.CLAIM_REFERENCE + "',CLAIM_DATE=" + oData.CLAIM_DATE + ")";
				this.oViewData.setProperty("/oModelName", "ABcls");
				break;
			case "PC":
				oEntity = "/BenefietCAP/claim/PC_CLAIM(EMPLOYEE_ID='" + oData.EMPLOYEE_ID + "',CLAIM_CODE='" + oData.CLAIM_CODE +
					"',CLAIM_REFERENCE='" + oData.CLAIM_REFERENCE + "',CLAIM_DATE=" + oData.CLAIM_DATE + ")";
				this.oViewData.setProperty("/oModelName", "PettyCash");
				break;
			case "SP":
				oEntity = "/BenefietCAP/claim/SP_MASTER_CLAIM(EMPLOYEE_ID='" + oData.EMPLOYEE_ID + "',CLAIM_CATEGORY='" + oData.CLAIM_CATEGORY +
					"',CLAIM_REFERENCE='" + oData.CLAIM_REFERENCE + "',CLAIM_DATE=" + oData.CLAIM_DATE + ")";
				this.oViewData.setProperty("/oModelName", "Sponsorship");
				break;
			case "SP1":
				oEntity = "/BenefietCAP/claim/SP1_MASTER_CLAIM(EMPLOYEE_ID='" + oData.EMPLOYEE_ID + "',CLAIM_CATEGORY='" + oData.CLAIM_CATEGORY +
					"',CLAIM_REFERENCE='" + oData.CLAIM_REFERENCE + "',CLAIM_DATE=" + oData.CLAIM_DATE + ")";
				this.oViewData.setProperty("/oModelName", "Sponsorship");
				break;
			case "SP2":
				oEntity = "/BenefietCAP/claim/SP2_MASTER_CLAIM(EMPLOYEE_ID='" + oData.EMPLOYEE_ID + "',CLAIM_CATEGORY='" + oData.CLAIM_CATEGORY +
					"',CLAIM_REFERENCE='" + oData.CLAIM_REFERENCE + "',CLAIM_DATE=" + oData.CLAIM_DATE + ")";
				this.oViewData.setProperty("/oModelName", "Sponsorship");
				break;
			case "SP3":
				oEntity = "/BenefietCAP/claim/SP3_MASTER_CLAIM(EMPLOYEE_ID='" + oData.EMPLOYEE_ID + "',CLAIM_CATEGORY='" + oData.CLAIM_CATEGORY +
					"',CLAIM_REFERENCE='" + oData.CLAIM_REFERENCE + "',CLAIM_DATE=" + oData.CLAIM_DATE + ")";
				this.oViewData.setProperty("/oModelName", "Sponsorship");
				break;
			case "CPC":
				oEntity = "/BenefietCAP/claim/CPC_MASTER_CLAIM(EMPLOYEE_ID='" + oData.EMPLOYEE_ID + "',CLAIM_CATEGORY='" + oData.CLAIM_CATEGORY +
					"',CLAIM_REFERENCE='" + oData.CLAIM_REFERENCE + "',CLAIM_DATE=" + oData.CLAIM_DATE + ")";
				this.oViewData.setProperty("/oModelName", "CPClaim");
				break;
			case "CPR":
				oEntity = "/BenefietCAP/claim/CPR_CLAIM(EMPLOYEE_ID='" + oData.EMPLOYEE_ID + "',CLAIM_CODE='" + oData.CLAIM_CODE +
					"',CLAIM_REFERENCE='" + oData.CLAIM_REFERENCE + "',CLAIM_DATE=" + oData.CLAIM_DATE + ")";
				this.oViewData.setProperty("/oModelName", "PRequest");
				break;
			case "OC":
				oEntity = "/BenefietCAP/claim/OC_MASTER_CLAIM(EMPLOYEE_ID='" + oData.EMPLOYEE_ID + "',CLAIM_CATEGORY='" + oData.CLAIM_CATEGORY +
					"',CLAIM_REFERENCE='" + oData.CLAIM_REFERENCE + "',CLAIM_DATE=" + oData.CLAIM_DATE + ")";
				this.oViewData.setProperty("/oModelName", "OClaim");
				break;
			case "PAY_UP":
				oEntity = "/BenefietCAP/claim/PAY_UP_MASTER_CLAIM(EMPLOYEE_ID='" + oData.EMPLOYEE_ID + "',CLAIM_CATEGORY='" + oData.CLAIM_CATEGORY +
					"',CLAIM_REFERENCE='" + oData.CLAIM_REFERENCE + "',CLAIM_DATE=" + oData.CLAIM_DATE + ")";
				this.oViewData.setProperty("/oModelName", "PUpload");
				break;
			case "SDFC":
				oEntity = "/BenefietCAP/claim/SDFC_MASTER_CLAIM(EMPLOYEE_ID='" + oData.EMPLOYEE_ID + "',CLAIM_CATEGORY='" + oData.CLAIM_CATEGORY +
					"',CLAIM_REFERENCE='" + oData.CLAIM_REFERENCE + "',CLAIM_DATE=" + oData.CLAIM_DATE + ")";
				this.oViewData.setProperty("/oModelName", "SDFClaim");
				break;
			case "SDFR":
				oEntity = "/BenefietCAP/claim/SDFR_MASTER_CLAIM(EMPLOYEE_ID='" + oData.EMPLOYEE_ID + "',CLAIM_CATEGORY='" + oData.CLAIM_CATEGORY +
					"',CLAIM_REFERENCE='" + oData.CLAIM_REFERENCE + "',CLAIM_DATE=" + oData.CLAIM_DATE + ")";
				this.oViewData.setProperty("/oModelName", "SDFRClaim");
				break;
			}
			return oEntity;
		},

		_fnModel: function (key) {
			var oModel = "";
			switch (key) {
			case "WRC":
				oModel = "WorkRelated_Master";
				this.oViewData.setProperty("/oCancelClaim", "WRC_MASTER_CLAIM");
				break;
			case "WRC_HR":
				oModel = "WorkRelatedHR_Master";
				this.oViewData.setProperty("/oCancelClaim", "WRC_HR_MASTER_CLAIM");
				break;
			case "COV":
				oModel = "Covid_Master";
				this.oViewData.setProperty("/oCancelClaim", "COV_MASTER_CLAIM");
				break;
			case "TC":
				oModel = "Transportation_Master";
				this.oViewData.setProperty("/oCancelClaim", "TC_MASTER_CLAIM");
				break;
			case "SP":
				oModel = "Sponsorship_Master";
				this.oViewData.setProperty("/oCancelClaim", "SP_MASTER_CLAIM");
				break;
			case "SP1":
				oModel = "Sponsorship_Master";
				this.oViewData.setProperty("/oCancelClaim", "SP1_MASTER_CLAIM");
				break;
			case "SP2":
				oModel = "Sponsorship_Master";
				this.oViewData.setProperty("/oCancelClaim", "SP2_MASTER_CLAIM");
				break;
			case "SP3":
				oModel = "Sponsorship_Master";
				this.oViewData.setProperty("/oCancelClaim", "SP3_MASTER_CLAIM");
				break;
			case "CPC":
				oModel = "CPClaim_Master";
				this.oViewData.setProperty("/oCancelClaim", "CPC_MASTER_CLAIM");
				break;
			case "CPR":
				oModel = "PRequest_Master";
				this.oViewData.setProperty("/oCancelClaim", "CPR_CLAIM");
				break;
			case "OC":
				oModel = "OClaim_Master";
				this.oViewData.setProperty("/oCancelClaim", "OC_MASTER_CLAIM");
				break;
			case "PAY_UP":
				oModel = "PUpload_Master";
				this.oViewData.setProperty("/oCancelClaim", "PAY_UP_MASTER_CLAIM");
				break;
			case "SDFC":
				oModel = "SDFClaim_Master";
				this.oViewData.setProperty("/oCancelClaim", "SDFC_MASTER_CLAIM");
				break;
			case "SDFR":
				oModel = "SDFRClaim_Master";
				this.oViewData.setProperty("/oCancelClaim", "SDFR_MASTER_CLAIM");
				break;
			}
			return oModel;
		},

		_fngettemplate: function (key) {
			var oProp = "";
			switch (key) {
			case "WRC":
				oProp = "WRC Claim";
				break;
			case "WRC_HR":
				oProp = "WRC HR Claim";
				break;
			case "WIC":
				oProp = "AHP_LIC_MS_WIC";
				break;
			case "TIM":
				oProp = "Timesheet";
				break;
			case "TC":
				oProp = "Transport";
				break;
			case "SP":
				oProp = "Sponsorship Exit Exam";
				break;
			case "SP1":
				oProp = "Sponsorship Int Conf";
				break;
			case "SP2":
				oProp = "Sponsorship Reg Conf";
				break;
			case "SP3":
				oProp = "Sponsorship Residents";
				break;
			case "PTF":
				oProp = "PTF_ACL_BCL";
				break;
			case "PC":
				oProp = "Petty Cash";
				break;
			case "MSR":
				oProp = "AHP_LIC_MS_WIC";
				break;
			case "MC":
				oProp = "Medical Claim";
				break;
			case "LIC":
				oProp = "AHP_LIC_MS_WIC";
				break;
			case "COV":
				oProp = "Covid Claim";
				break;
			case "CLS":
				oProp = "PTF_ACL_BCL";
				break;
			case "AHP":
				oProp = "AHP_LIC_MS_WIC";
				break;
			}
			return oProp;
		},

		onDisplayFiles: function (claimnumb) {
			var oID = this.oViewData.getProperty("/ClaimType"),
				oDlgName = this.oViewData.getProperty("/oModelName");
			if (oDlgName === "PUpload" || oDlgName === "SDFRClaim") {
				oDlgName = oDlgName + "_Master";
			}
			var oControl = this._getFragmentTextPos(oDlgName, oID + "UploadCollection");
			console.log(oControl + "---" + oID + "----" + oDlgName);
			$.ajax({
				url: "/BenefietCAP/browseUpload/FileItems?$filter=fileID eq '" + claimnumb + "'",
				method: "GET",
				dataType: "json",
				success: function (oData) {
					var items = [];
					this.oViewData.setProperty("/ALength", oData.value.length);
					if (oData.value.length > 0) {
						for (var i = 0; i < oData.value.length; i++) {
							this.oViewData.setProperty("/ofileID", oData.value[i].fileID);
							items.push({
								"fileName": oData.value[i].fileName,
								"ID": oData.value[i].ID,
								"delete": this.oViewData.getProperty("/DMode"),
								"date": oData.value[i].createdAt,
								"name": oData.value[i].createdName
							});
						}
						oControl.setModel(new JSONModel(items), "oAttachItems");
					} else {
						oControl.setModel(new JSONModel([]), "oAttachItems");
					}
				}.bind(this),
				error: function (xhr, ajaxOptions, throwError) {
					this.handleErrorDialog(xhr);
				}.bind(this)
			});
		},

		onTypeMissmatch: function (oEvent) {
			this._fnShowErrorMessage("File type is not allowed");
		},

		onFileSizeExceed: function (oEvent) {
			this._fnShowErrorMessage("Exceeds maximum file size of 5MB");
		},
		onFileNameExceed: function (oEvent) {
			this._fnShowErrorMessage("Filename should be within 50 characters long including file extension.");
		},

		handleUploadPopover: function (oEvent, key) {
			var oSource = oEvent.getSource(),
				oModel1 = new JSONModel({
					"Title": " Information",
					"BodyText": "<h3>Attachments should include the following:</h3>" +
						"<ol><li>Supported file types: JPG,JPEG,PNG,PDF</li> <li>Maximum file size to be upload is 5 MB. </li>" +
						"<li>Filename should be within 50 characters long including file extension.</li></ol>",
					"BtnOkText": "CLOSE"
				}),
				oModel2 = new JSONModel({
					"Title": " Information",
					"BodyText": "<h3>Attachments should include the following:</h3>" +
						"<ol><li>Supported file types: JPG,JPEG,PNG,PDF,XLS,XLSX</li> <li>Maximum file size to be upload is 5 MB. </li>" +
						"<li>Filename should be within 50 characters long including file extension.</li></ol>",
					"BtnOkText": "CLOSE"
				}),
				oModel = key === "PU" ? oModel2 : oModel1;
			this._oInfoUploadPopover = Fragment.load({
				id: this.createId("InfoUploadPopover"),
				name: "BenefitClaim.ZBenefitClaim.fragments.Dialog.GenericPopover",
				controller: this
			}).then(function (oDialog) {
				this._oInfoUploadPopover = oDialog;
				this.getView().addDependent(this._oInfoUploadPopover);
				this._oInfoUploadPopover.setModel(oModel, "oPopup");
			}.bind(this));
			this._oInfoUploadPopover.then(function (oDialog) {
				this._oInfoUploadPopover.openBy(oSource);
			}.bind(this));
		},

		onCancelPopover: function () {
			this._oInfoUploadPopover.close();
		},

		onCountTable: function (oevent, id) {
			var length = 0;
			if (oevent.getSource().getBinding("items").iLength) {
				length = oevent.getSource().getBinding("items").iLength;
			}
			this.oViewData.setProperty("/" + id, length);
		},

		onDisableCheck: function (oEvent, model) {
			var oTable = this.getView().byId("tbApprovalDetails"),
				aItems = oTable.getItems();
			for (var i = 0; i < aItems.length; i++) {
				if (aItems[i].getBindingContext(model).getObject().Entitlement_Type === "With Entitlement") {
					aItems[i].getMultiSelectControl(true).setVisible(false);
				}
			}
		},

		onDownloadFile: function (oEvent) {
			var oVal = oEvent.getSource().getBindingContext("oAttachItems").getObject(),
				ID = oVal.ID,
				filename = oVal.fileName;
			$.ajax({
				url: `/BenefietCAP/v2/browseUpload/FileItems(guid'${ID}')/content`,
				contentType: "application/octet-stream",
				success: function (oData) {
					var link = document.createElement("a");
					link.target = '_blank';
					link.style.display = "none";
					link.innerHTML = "Download PDF file";
					link.download = oVal.fileName;
					link.href = oData;
					if (Device.system.tablet || Device.system.phone) {
						var moblink = document.createElement("a");
						moblink.href = window.URL.createObjectURL(oData);
						window.open(moblink, "_blank");
						return;
					} else {
						link.click();
					}
				},
				error: function (xhr, ajaxOptions, throwError) {
					this.handleErrorDialog(xhr);
				}.bind(this)
			});

		},

		onFileDeleted: function (oEvent) {
			var oClaim = this.oViewData.getProperty("/ofileID"),
				ID = oEvent.getParameter("documentId");
			$.ajax({
				url: `/BenefietCAP/v2/browseUpload/FileItems(guid'${ID}')`,
				type: "DELETE",
				contentType: "application/json",
				success: function (oData) {
					this.onDisplayFiles(oClaim);
					sap.m.MessageToast.show("Selected file has been deleted");
				}.bind(this),
				error: function (xhr, ajaxOptions, throwError) {
					this.handleErrorDialog(xhr);
				}.bind(this)
			});

		},

		onDownloadSMSreport: function () {
			var oCont = this.getView().byId("tbSMSDetails").getBinding("items").aLastContextData,
				oKey = [];
			for (var i = 0; i < oCont.length; i++) {
				oKey.push(JSON.parse(oCont[i]));
			}
			this.JSONToCSVConvertor(oKey, "Report", true);
		},

		onDownloadMed: function () {
			// var oCont = this.getView().byId("tb_Ringfence").getBinding("items").aLastContextData,
			// 	oKey = [];
			// for (var i = 0; i < oCont.length; i++) {
			// 	oKey.push(JSON.parse(oCont[i]));
			// }
			var oKey = this.getView().getModel("oRingAmntDetails").getData();
			this.JSONToCSVConvertor(oKey, "Medisave", true);
		},

		onDownload: function (model) {
			this.getView().setBusy(true);
			var odata = this.getView().getModel(model).getData();
			var oKey = [];
			for (var i = 0; i < odata.length; i++) {
				oKey.push(this._fnsortdata(odata[i]));
			}
			this.JSONToCSVConvertor(oKey, "Report", true);
		},

		_fnsortdata: function (odata) {
			var oValue = Object.keys(odata).sort().reduce(
				function (obj, key) {
					obj[key] = odata[key];
					return obj;
				}, {}
			);
			return oValue;
		},

		onDownloadRep: function (model) {
			var odata = this.getView().getModel(model).getData();
			this.JSONToCSVConvertor(odata, "Report", true);
		},

		onDownloadDel: function (id, title) {
			var data = [],
				oData = this.getView().byId(id).getBinding("items").getCurrentContexts();
			for (var i = 0; i < oData.length; i++) {
				data.push(oData[i].getObject());
			}
			this.JSONToCSVConvertor(data, title, true);
		},

		onDownloadPayUp: function (model, title) {
			var data = this.eDialogM.getModel(model).getData();
			if (data.LINE_ITEM.length > 0) {
				var oKey = [];
				for (var i = 0; i < data.LINE_ITEM.length; i++) {
					oKey.push(this._fnsortdata(data.LINE_ITEM[i]));
				}
				this.JSONToCSVConvertor(oKey, title, true);
			} else {
				this._fnShowErrorMessage("No data to download.");
			}
		},

		JSONToCSVConvertor: function (JSONData, ReportTitle, ShowLabel) {
			var arrData = typeof JSONData !== "object" ? JSON.parse(JSONData) : JSONData;
			var CSV = "";
			if (ShowLabel) {
				var row = "";
				for (var index in arrData[0]) {
					row += index + ",";
				}
				row = row.slice(0, -1);
				CSV += row + "\r\n";
			}
			for (var i = 0; i < arrData.length; i++) {
				var row = "";
				for (var indx in arrData[i]) {
					row += '"' + arrData[i][indx] + '",';
				}
				row.slice(0, row.length - 1);
				CSV += row + "\r\n";
			}
			this.getView().setBusy(false);
			if (CSV === "") {
				sap.m.MessageToast.show("Invalid Data");
				return;
			}
			var fileName = "Data_";
			fileName += ReportTitle.replace(/ /g, "_");
			var uri = "data: text / csv;charset = utf - 8, " + escape(CSV);
			var link = document.createElement("a");
			link.href = uri;
			link.style = "visibility: hidden";
			link.download = fileName + ".csv";
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		},

		onCalculateAmount: function (oEvent, model) {
			var oData = this.eDialog.getModel(model).getData(),
				oElig = this.getView().getModel("oEligCalData").getData(),
				oEntit = this.oViewData.getData().oEntit[0].Entitlement,
				oNameTile = this.oViewData.getProperty("/oTile"),
				oKeyRej = this.oViewData.getProperty("/oAppRejKey"),
				oBalanc, oPending;
			if (oNameTile === "Approvals") {
				var oTaken = oElig.taken,
					oEntit = oEntit === undefined ? 0 : oEntit === null ? 0 : oEntit;
				oBalanc = parseFloat(oEntit) - parseFloat(oTaken);
				oPending = 0;
			} else {
				oBalanc = oElig.balance;
				oPending = oElig.pending;
			}
			var state = this._getFragmentTextPos("Hospitialisation", "inpWardDays").getValueState();
			if (state === "Error") {
				this._fnShowErrorMessage("Please check ward days");
				return;
			}
			this.hasChange = true;
			var oValue = {
				"claim": {
					"Claim_Code": oData.CLAIM_CODE,
					"Claim_Reference": oData.CLAIM_REFERENCE,
					"Clinic": oData.CLINIC,
					"Med_Leave_Declar": oData.MED_LEAVE_DECLARATION === undefined ? "No" : oData.MED_LEAVE_DECLARATION === null ? "No" : oData.MED_LEAVE_DECLARATION,
					"AL_Exceeded": "",
					"AL_Wardday_Limit": "",
					"Claim_Amount": oData.RECEIPT_AMOUNT === undefined ? 0 : oData.RECEIPT_AMOUNT === null ? 0 : oData.RECEIPT_AMOUNT,
					"Consultation_Fee": oData.CONSULTATION_FEE === undefined ? 0 : oData.CONSULTATION_FEE === null ? 0 : oData.CONSULTATION_FEE,
					"Other_Cost": oData.OTHER_COST === undefined ? 0 : oData.OTHER_COST === null ? 0 : oData.OTHER_COST,
					"Hospitalization_Fees": oData.HOSPITALIZATION_FEES === undefined ? 0 : oData.HOSPITALIZATION_FEES === null ? 0 : oData.HOSPITALIZATION_FEES,
					"eligibility": oEntit === undefined ? 0 : oEntit === null ? 0 : oEntit,
					"taken": oElig.taken,
					"pending": oPending,
					"YTDConsultation": oElig.YTDConsultation,
					"YTDOthers": oElig.YTDOthers,
					"balance": oBalanc.toFixed(2),
					"claimDate": oData.CLAIM_DATE,
					"receptDate": oData.RECEIPT_DATE,
					"company": this.getView().getModel("oEmpData").getData().COMPANY,
					"Claim_Category": oData.CLAIM_CATEGORY,
					"employee": oData.EMPLOYEE_ID === undefined ? this.oViewData.getProperty("/EmpID") : oData.EMPLOYEE_ID,
					"CASH_AMOUNT": oData.CASH_AMOUNT === undefined ? 0 : oData.CASH_AMOUNT === null ? 0 : oData.CASH_AMOUNT,
					"MEDISAVE_AMOUNT": oData.MEDISAVE_AMOUNT === undefined ? 0 : oData.MEDISAVE_AMOUNT === null ? 0 : oData.MEDISAVE_AMOUNT,
					"MEDISHIELD_AMOUNT": oData.MEDISHIELD_AMOUNT === undefined ? 0 : oData.MEDISHIELD_AMOUNT === null ? 0 : oData.MEDISHIELD_AMOUNT,
					"PRIVATE_INSURER_AMT": oData.PRIVATE_INSURER_AMT === undefined ? 0 : oData.PRIVATE_INSURER_AMT === null ? 0 : oData.PRIVATE_INSURER_AMT,
					"RECEIPT_AMOUNT": oData.RECEIPT_AMOUNT === undefined ? 0 : oData.RECEIPT_AMOUNT === null ? 0 : oData.RECEIPT_AMOUNT,
					"AMOUNT_PAID_VIA_PAYROLL": 0,
					"AMOUNT_PAID_TOMEDISAVE": 0,
					"AMOUNT_PAID_TOMDEISHIELD": 0,
					"AMOUNT_PAID_TO_PRIVATE_INSURER": 0,
					"consumedWardDays": oData.NO_OF_WARD_DAYS === undefined ? 0.0 : oData.NO_OF_WARD_DAYS === null ? 0.0 : oData.NO_OF_WARD_DAYS,
					"wardCharges": oData.WARD_CHARGES === undefined ? 0 : oData.WARD_CHARGES === null ? 0 : oData.WARD_CHARGES,
				}
			};
			$.ajax({
				url: "/BenefietCAP/claim/validateMedicalClaim",
				data: JSON.stringify(oValue),
				method: "POST",
				crossDomain: true,
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json"
				},
				success: function (data) {
					var oWW = parseFloat(data.Claim_Amount).toFixed(2) - parseFloat(data.wardCharges).toFixed(2)
					oData.CLAIM_AMOUNT = data.Claim_Amount;
					oData.OTHER_COST = data.Other_Cost;
					oData.CLAIM_AMOUNT_WW = oWW.toFixed(2);
					oData.AMOUNT_PAID_VIA_PAYROLL = data.AMOUNT_PAID_VIA_PAYROLL;
					oData.AMOUNT_PAID_TOMEDISAVE = data.AMOUNT_PAID_TOMEDISAVE;
					oData.AMOUNT_PAID_TOMDEISHIELD = data.AMOUNT_PAID_TOMDEISHIELD;
					oData.AMOUNT_PAID_TO_PRIVATE_INSURER = data.AMOUNT_PAID_TO_PRIVATE_INSURER;
					oData.CLAIM_CONSULTATION_FEE = data.claimConsultation;
					oData.CLAIM_OTHER_COST = data.claimOtherCost;
					oData.HOSPITALIZATION_FEES = data.Hospitalization_Fees_Display;
					this.eDialog.getModel(model).refresh(true);
					if (data.Claim_Amount > 0 || (oNameTile === "Approvals" && oKeyRej === "R") || oData.CLAIM_STATUS.includes(
							"Cancellation Pending")) {
						this.hasChange = false;
					} else {
						this.hasChange = true;
					}
					this.oViewData.setProperty("/oCompute", true);
				}.bind(this),
				error: function (response) {
					this.oViewData.setProperty("/oCompute", false);
					this.handleErrorDialog(response);
				}.bind(this)
			});
		},

		onRejRemarks: function (oEvent, key) {
			var oRemark = oEvent.getSource().getValue();
			if (key === "Error") {
				if (oRemark.length > 0) {
					if (oRemark !== null && "=-+@".indexOf(oRemark.charAt(0)) >= 0) {
						oEvent.getSource().setValueStateText("Enter Data should not start with =-+@ ");
						oEvent.getSource().setValueState(sap.ui.core.ValueState.Error);
						oEvent.getSource().setValue("");
					} else {
						this._oDialogReject.getModel("oRej").setProperty("/Remarks", true);
					}
				} else {
					this._oDialogReject.getModel("oRej").setProperty("/Remarks", false);
				}
			}
		},

		fnOnCancelRejectDialog: function () {
			this.oSource.setEnabled(true);
			this._oDialogReject.close();
			this._oDialogReject.destroy();
			this._oDialogReject = undefined;
		},

		onClickUpload: function () {
			if (Validator.ValidateForm(this, "PUpload_Master", this.eDialogM)) {
				return;
			}
			Validator.resetValidStates(this, "PUpload_Master", this.eDialogM);
			var oPay = this.eDialogM.getModel("PUpload_Master").getProperty("/PAYMENT");
			this.oViewData.setProperty("/oPayment", oPay);
			if (!this._oDialogUpload) {
				this._oDialogUpload = Fragment.load({
					id: this.createId("dlgfileupload"),
					name: "BenefitClaim.ZBenefitClaim.fragments.FileUpload",
					controller: this
				}).then(function (oDialog) {
					this._oDialogUpload = oDialog;
					this.getView().addDependent(this._oDialogUpload);
					this._oDialogUpload.open();
				}.bind(this));
			}
		},

		onCloseUpDialog: function () {
			this._oDialogUpload.close();
			this._oDialogUpload.destroy();
			this._oDialogUpload = undefined;
		},

		onEmpDivOpen: function (model, key) {
			this.oViewData = this.getOwnerComponent().getModel("ViewData");
			this.oViewData.setProperty("/oDivModel", model);
			this.oViewData.setProperty("/oKeyDiv", key);
			var oView = this.getView();
			if (!this.byId("dlgDivision")) {
				Fragment.load({
					id: oView.getId(),
					controller: this,
					name: "BenefitClaim.ZBenefitClaim.fragments.Division"
				}).then(function (oDialog) {
					oView.addDependent(oDialog);
					oDialog.open();
				});
			} else {
				this.byId("dlgDivision").open();
			}
		},

		onEmpDeptOpen: function (model, key) {
			var oView = this.getView();
			this.oViewData = this.getOwnerComponent().getModel("ViewData");
			this.oViewData.setProperty("/oKeyDep", key);
			if (!this.byId("dlgDepart")) {
				Fragment.load({
					id: oView.getId(),
					controller: this,
					name: "BenefitClaim.ZBenefitClaim.fragments.Department"
				}).then(function (oDialog) {
					oView.addDependent(oDialog);
					oDialog.open();
				});
			} else {
				this.byId("dlgDepart").open();
			}

		},

		onEmpLocOpen: function (model, key) {
			this.oViewData = this.getOwnerComponent().getModel("ViewData");
			this.oViewData.setProperty("/oLocModel", model);
			this.oViewData.setProperty("/oKeyLoc", key);
			var oView = this.getView();
			if (!this.byId("dlgLocation")) {
				Fragment.load({
					id: oView.getId(),
					controller: this,
					name: "BenefitClaim.ZBenefitClaim.fragments.Location"
				}).then(function (oDialog) {
					oView.addDependent(oDialog);
					oDialog.open();
				});
			} else {
				this.byId("dlgLocation").open();
			}
		},

		onCurrencyOpen: function (model) {
			this.oViewData.setProperty("/oModelsch", model);
			var oDate = new Date().toISOString().substring(0, 10),
				oURL = "/BenefietCAP/claim/CURRENCY?$filter=START_DATE le " + oDate + " and END_DATE ge " +
				oDate + "",
				oView = this.getView();
			this._fnGetCall(oURL, "oCurrency");
			if (!this.byId("dlgCurrency")) {
				Fragment.load({
					id: oView.getId(),
					controller: this,
					name: "BenefitClaim.ZBenefitClaim.fragments.Currency"
				}).then(function (oDialog) {
					oView.addDependent(oDialog);
					oDialog.open();
				});
			} else {
				this.byId("dlgCurrency").open();
			}
		},

		onVendorOpen: function (model) {
			this.oViewData.setProperty("/oModelsch", model);
			var oDate = new Date().toISOString().substring(0, 10),
				oURL = "/BenefietCAP/claim/VENDOR?$filter=START_DATE le " + oDate + " and END_DATE ge " +
				oDate + "",
				oView = this.getView();
			this._fnGetCall(oURL, "oVendor");
			if (!this.byId("dlgVendor")) {
				Fragment.load({
					id: oView.getId(),
					controller: this,
					name: "BenefitClaim.ZBenefitClaim.fragments.Vendor"
				}).then(function (oDialog) {
					oView.addDependent(oDialog);
					oDialog.open();
				});
			} else {
				this.byId("dlgVendor").open();
			}
		},

		onReferenOpen: function (model) {
			this.oViewData.setProperty("/oModelsch", model);
			var sURL, oEmp = this.oViewData.getProperty("/EmpID"),
				oView = this.getView();
			if (model === "SDFClaim_Master") {
				sURL = "/BenefietCAP/claim/sdfandClaim?$filter=AVAILABLECHECK eq 'X' and CLAIM_STATUS eq 'Approved' and EMPLOYEE_ID eq '" + oEmp +
					"'";
			} else {
				sURL = "/BenefietCAP/claim/cprandclaim?$filter=AVAILABLECHECK eq 'X' and CLAIM_STATUS eq 'Approved' and EMPLOYEE_ID eq '" + oEmp +
					"'";
			}
			setTimeout(this._fnGetCall(sURL, "oReqID"), 30);
			Fragment.load({
				id: oView.getId(),
				controller: this,
				name: "BenefitClaim.ZBenefitClaim.fragments.RequestID"
			}).then(function (oDialog) {
				oView.addDependent(oDialog);
				oDialog.open();
			});

		},

		onLocClose: function (oEvent) {
			this.oViewData = this.getOwnerComponent().getModel("ViewData");
			var model = this.oViewData.getProperty("/oLocModel"),
				oSelectedItem = oEvent.getParameter("selectedItem"),
				key = this.oViewData.getProperty("/oKeyLoc");
			if (key === "A") {
				this.eDialog.getModel(model).setProperty("/TRANSPORT_FROM", oSelectedItem.getTitle());
			} else {
				this.eDialog.getModel(model).setProperty("/TRANSPORT_TO", oSelectedItem.getTitle());
			}
		},

		onDivClose: function (oEvent) {
			this.oViewData = this.getOwnerComponent().getModel("ViewData");
			var model = this.oViewData.getProperty("/oDivModel"),
				oSelectedItem = oEvent.getParameter("selectedItem"),
				key = this.oViewData.getProperty("/oKeyDiv");
			if (model === "oApprovalData") {
				this._oApproverDialog.getModel("oApprovalData").setProperty("/Employee_Division", oSelectedItem.getTitle());
			} else if (model === "oCoordinData") {
				this._oCoordinDialog.getModel(model).setProperty("/EMPLOYEE_DIVISION", oSelectedItem.getTitle());
			} else if (model === "oValueTable") {
				if (key === "F") {
					this._oCreateValue.getModel(model).setProperty("/DIVISION_FROM", oSelectedItem.getTitle());
				} else if (key === "T") {
					this._oCreateValue.getModel(model).setProperty("/DIVISION_TO", oSelectedItem.getTitle());
				} else {
					this._oCreateValue.getModel(model).setProperty("/DIVISION", oSelectedItem.getTitle());
					this._oCreateValue.getModel(model).setProperty("/DIVISION_ID", oSelectedItem.getDescription());
				}
			} else {
				if (key === "A") {
					this.eDialog.getModel(model).setProperty("/TRANSPORT_FROM", oSelectedItem.getTitle());
				} else if (key === "AYTD") {
					this.oViewData.setProperty("/IntDivisionHR", oSelectedItem.getTitle());
				} else {
					this.eDialog.getModel(model).setProperty("/TRANSPORT_TO", oSelectedItem.getTitle());
				}
			}
		},

		onDepClose: function (oEvent) {
			this.oViewData = this.getOwnerComponent().getModel("ViewData");
			var key = this.oViewData.getProperty("/oKeyDep");
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (key === "A") {
				this._oCreateValue.getModel("oValueTable").setProperty("/DEPARTMENT", oSelectedItem.getTitle());
				this._oCreateValue.getModel("oValueTable").setProperty("/DEPARTMENT_ID", oSelectedItem.getDescription());
			} else if (key === "CO") {
				this._oCoordinDialog.getModel("oCoordinData").setProperty("/EMPLOYEE_DEPARTMENT", oSelectedItem.getTitle());
			} else {
				this._oApproverDialog.getModel("oApprovalData").setProperty("/Employee_Department", oSelectedItem.getTitle());
			}
		},

		onClaimCatSelFil: function (oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem"),
				oKey = this.oViewData.getProperty("/oTableAdminClaim");
			if (oKey === "EA") {
				this._oCreateValue.getModel("oValueTable").setProperty("/Claim_code", oSelectedItem.getTitle());
			} else if (oKey === "A") {
				this._oCreateValue.getModel("oValueTable").setProperty("/Claim_Code", oSelectedItem.getTitle());
			} else if (oKey === "WRC") {
				this._oCreateValue.getModel("oValueTable").setProperty("/CLAIM_CODE", oSelectedItem.getTitle());
			} else {
				this.oViewData.setProperty("/ClaimCate", oSelectedItem.getTitle());
			}
		},

		onReqidClose: function (oEvent) {
			var oData = oEvent.getParameter("selectedItem").getBindingContext("oReqID").getObject(),
				model = this.oViewData.getProperty("/oModelsch"),
				oModel = this.eDialogM.getModel(model);
			if (model === "SDFClaim_Master") {
				oModel.setProperty("/SDF_APPROVED_AMOUNT", oData.ORG_CLAIM_AMOUNT);
				oModel.setProperty("/SDFR_CURRENCY", oData.CURRENCY);
				oModel.setProperty("/SDF_REFERENCE", oData.CLAIM_REFERENCE);
				this.getView().getModel("oEligCalData").setProperty("/ENTITLEMENT", oData.CLAIM_AMOUNT);
			} else {
				oModel.setProperty("/CPR_AMOUNT", oData.CLAIM_AMOUNT);
				oModel.setProperty("/CPR_REFERENCE", oData.CLAIM_REFERENCE);
				oModel.setProperty("/CPR_CURRENCY", oData.CURRENCY);
				this.getView().getModel("oEligCalData").setProperty("/BALANCE", oData.CLAIM_AMOUNT);
			}
			oModel.refresh(true);
		},

		onCurrencyClose: function (oEvent) {
			var oData = oEvent.getParameter("selectedItem").getBindingContext("oCurrency").getObject(),
				model = this.oViewData.getProperty("/oModelsch"),
				oModel = this.eDialog.getModel(model);
			oModel.setProperty("/CURRENCY", oData.CURRENCY);
			oModel.refresh(true);
			this.oViewData.setProperty("/RATE", oData.RATE);
		},

		onVendorClose: function (oEvent) {
			var oData = oEvent.getParameter("selectedItem").getBindingContext("oVendor").getObject(),
				model = this.oViewData.getProperty("/oModelsch"),
				oModel = this.eDialog.getModel(model);
			oModel.setProperty("/VENDOR_CODE", oData.VENDOR_CODE);
			oModel.refresh(true);
		},

		handleOpenDialog: function (oEvent, model, field) {
			this.oViewData.setProperty("/oTimeModel", model);
			this.oViewData.setProperty("/oTimeField", field);
			var oView = this.getView();
			if (!this._pDialog) {
				this._pDialog = Fragment.load({
					id: oView.getId(),
					name: "BenefitClaim.ZBenefitClaim.fragments.Time",
					controller: this
				}).then(function (oDialog) {
					this._pDialog = oDialog;
					oView.addDependent(this._pDialog);
					this._pDialog.addStyleClass("sapUiSizeCompact");
					this._pDialog.open();
				}.bind(this));
			}
		},
		handleOKPress: function () {
			var odata = this.oViewData.getData();
			if (odata.hour === "" || odata.minute === "" || odata.second === "" || odata.hour === undefined || odata.minute === undefined ||
				odata.second === undefined) {
				this._fnShowErrorMessage("Please select all value");
			} else {
				var oHour = odata.hour + ":" + odata.minute + ":" + odata.second;
				if (odata.oTimeModel === "Timesheet") {
					this.eDialog.getModel(odata.oTimeModel).setProperty("/" + odata.oTimeField, oHour);
					this._fnTimeCalculate();
				} else {
					this.eDialog.getModel(odata.oTimeModel).setProperty("/" + odata.oTimeField, oHour);
				}
				this.fnClose();
			}
		},

		_fnTimeCalculate: function () {
			var osDate = this.eDialog.getModel("Timesheet").getProperty("/START_TIME"),
				oeDate = this.eDialog.getModel("Timesheet").getProperty("/END_TIME");

			if (osDate !== "" || oeDate !== "") {
				var oSTime = new Date("1970-01-01T" + osDate).getTime(),
					oETime = new Date("1970-01-01T" + oeDate).getTime();
				var oHour = ((oETime - oSTime) / (1000 * 60 * 60));
				if (oHour < 0) {
					oHour = 24 + oHour;
				}
				this.eDialog.getModel("Timesheet").setProperty("/WORK_HOURS_ACTUAL", parseFloat(oHour, 10).toFixed(2));
				this.eDialog.getModel("Timesheet").setProperty("/WORK_HOURS_PAID", parseFloat(oHour, 10).toFixed(2));
				this.eDialog.getModel("Timesheet").refresh(true);
			}

		},

		handleCancelPress: function () {
			this.fnClose();
		},

		fnClose: function () {
			this._pDialog.close();
			this._pDialog.destroy();
			this._pDialog = undefined;
			this.oViewData.setProperty("/hour", "");
			this.oViewData.setProperty("/minute", "");
			this.oViewData.setProperty("/second", "");
		},

		_fnTimePicker: function () {
			var minute = [],
				hour = [];

			for (var i = 0; i <= 59; i++) {
				minute.push({
					"Min": i < 10 ? ("0" + i.toString()) : i.toString()
				});
				this.getView().setModel(new JSONModel(minute), "oMinute");
			}

			for (var j = 0; j <= 23; j++) {
				hour.push({
					"Hour": j < 10 ? ("0" + j.toString()) : j.toString()
				});
				this.getView().setModel(new JSONModel(hour), "oHour");
			}
		},

		_fnClearCopy: function (oData) {
			if (oData.CATEGORY_CODE.includes("SDF") || oData.CATEGORY_CODE === "CPC" || oData.CATEGORY_CODE === "CPR" || oData.CATEGORY_CODE ===
				"OC" || oData.CATEGORY_CODE === "PAY_UP") {
				oData.ORIGINAL_CLAIM_REFERENCE = oData.CLAIM_REFERENCE;
			}
			oData.CLAIM_REFERENCE = oData.CATEGORY_CODE + new Date().getTime().toString();
			oData.CLAIM_DATE = this._getCurrentDate();
			oData.CLAIM_STATUS = "Pending for Submission";
			oData.REMARKS_APPROVER1 = "";
			oData.REMARKS_APPROVER2 = "";
			oData.REMARKS_APPROVER3 = "";
			oData.REMARKS_REJECTION = "";
			oData.FIRST_LEVEL_APPROVED_ON = null;
			oData.FIRST_LEVEL_APPROVER = "";
			oData.SECOND_LEVEL_APPROVED_ON = null;
			oData.SECOND_LEVEL_APPROVER = "";
			oData.THIRD_LEVEL_APPROVED_ON = null
			oData.THIRD_LEVEL_APPROVER = "";
		},

		_fnGetCallSDFR: function (oUrl, key, mode) {
			this.getView().setBusy(true);
			if (mode !== "Edit") {
				var oModel = this.eDialogM.getModel("SDFRClaim_Master");
			}
			$.ajax({
				method: "GET",
				url: oUrl,
				dataType: "json",
				success: function (data) {
					this.getView().setBusy(false);
					var oData = data.value[0];
					if (oData && mode !== "Edit") {
						oModel.setProperty("/COURSE_END_DATE", oData.cust_expectedCourseEndDate);
						oModel.setProperty("/CUMULATIVE_CAP", oData.cust_cumulativeGPA);
						oModel.setProperty("/QUALIFY", oData.cust_nomenclature);
						oModel.refresh(true);
					}
					this.oViewData.setProperty("/oENTITLEMENT", oData.cust_SDFCap);
				}.bind(this),
				error: function (response) {
					this.getView().setBusy(false);
					this.handleErrorDialog(response);
				}.bind(this)
			});
		},

		_fnGetCall: function (oUrl, model) {
			this._getBusyIndicator().show();
			$.ajax({
				method: "GET",
				url: oUrl,
				dataType: "json",
				success: function (data) {
					var oModel = this._getSizeLimit(data.value);
					this.getView().setModel(oModel, model);
					this._getBusyIndicator().hide();
				}.bind(this),
				error: function (response) {
					this._getBusyIndicator().hide();
					this.handleErrorDialog(response);
				}.bind(this)
			});
		},

		_fnDropdowns: function () {
			$.ajax({
				method: "GET",
				url: "/BenefietCAP/claim/DropDowns()",
				dataType: "json",
				success: function (data) {
					var oData = JSON.parse(data.value);
					this.getView().setModel(new JSONModel(oData), "ComboDetails");
					this._fnDeleteHosp();
					this._fnFilterDepDiv();
					this._fnClaimTypes();
					this._fnLocation();
					if (this.oViewData.getProperty("/oTile") === "Coord" || this.oViewData.getProperty("/oTile") === "HistoryCoord" || this.oViewData
						.getProperty("/oTile") === "HistoryCoordSch" || this.oViewData.getProperty("/oTile") === "Coordinat" || this.oViewData.getProperty(
							"/oTile") === "CoordinatSch") {
						this._fnAddAll();
					}
				}.bind(this),
				error: function (response) {
					this.handleErrorDialog(response);
				}.bind(this)
			});
		},

		_fnDeleteHosp: function () {
			var oJson = this.getView().getModel("ComboDetails").getData(),
				oModel = [];
			$.each(oJson.COMPANY_CLAIM_CATEGORY, function (idx, obj) {
				if (obj.Claim_code === "HOSPD_Day" || obj.Claim_code === "HOSPS_Day") {
					//
				} else {
					oModel.push(obj);
				}
			});
			oJson.COMPANY_CLAIM_CATEGORY = oModel;
		},

		_fnFilterDepDiv: function () {
			var oKey = this.getView().getModel("oEmpData").getProperty("/COMPANY"),
				oJson = this.getView().getModel("ComboDetails").getData(),
				oDept = [],
				oDiv = [];
			if (this.oViewData.getProperty("/oTile") === "Coord") {
				oDept.push({
					Company: oKey,
					Department_Code: "ALL",
					Department_Desc: "ALL"
				});
				oDiv = [{
					Company: oKey,
					Division_Code: "ALL",
					Division_Desc: "ALL"
				}];
			}

			// filter Department
			$.each(oJson.DEPARTMENT, function (idx, obj) {
				if (obj.Company === oKey) {
					oDept.push(obj);
				}
			});
			// filter Division
			$.each(oJson.DIVISION, function (idx, obj) {
				if (obj.Company === oKey) {
					oDiv.push(obj);
				}
			});

			this.getView().setModel(new JSONModel(oDept), "oDeptData");
			this.getView().setModel(new JSONModel(oDiv), "oDivData");
		},

		_fnLocation: function () {
			var oLocation = [],
				oJson = this.getView().getModel("ComboDetails").getData();
			$.each(oJson.LOCATION, function (idx, obj) {
				if (obj.START_DATE <= new Date().toISOString().substring(0, 10) && obj.END_DATE >= new Date().toISOString().substring(0, 10)) {
					oLocation.push(obj);
				}
			});
			this.getView().setModel(new JSONModel(oLocation), "oLocationData");
		},

		_fnAccountDetaila: function (eURL, name, key, payment) {
			var oDlgdata;
			if (name.includes("_Master") && key !== "Form") {
				oDlgdata = this.eDialogM.getModel(name);
			} else {
				oDlgdata = this.eDialog.getModel(name);
			}
			$.ajax({
				method: "GET",
				url: eURL,
				dataType: "json",
				success: function (data) {
					var oModel = data.value[0];
					if (oModel.cust_primaryBankAccountStr === "true" || oModel.cust_primaryBankAccountStr === "Y") {
						if (name === "OClaim_Master" ||
							name === "PUpload" || name === "SDFClaim_Master" || name === "CPClaim_Master") {
							oDlgdata.setProperty("/PAY_TO_BANK", oModel.cust_bankName);
							oDlgdata.setProperty("/ACC_NAME", oModel.cust_accountOwner);
							oDlgdata.setProperty("/ACC_NO", oModel.cust_bankAccountNumber);
							oDlgdata.setProperty("/BANK_CURRENCY", oModel.cust_currency);
							oDlgdata.refresh(true);
						}
						if (key === "Form") {
							oDlgdata.setProperty("/CURRENCY", oModel.cust_currency);
							this._fnCurrencyRate(oModel.cust_currency);
						}
					} else {
						this._fnOverseasDetails(oDlgdata, oModel.externalCode, key, name);
					}
					if (name !== "SDFRClaim" && name !== "SDFClaim" && name !== "CPClaim" && name !== "PRequest" && name !== "OClaim") {
						oDlgdata.setProperty("/VENDOR_CODE", oModel.cust_vendorCode);
						this._fnGLdetail(oDlgdata, oModel.externalCode, payment);
					}
				}.bind(this),
				error: function (response) {
					this.getView().setBusy(false);
					this.handleErrorDialog(response);
				}.bind(this)
			});
		},

		_fnGLdetail: function (oDlgdata, emp, payment) {
			var oDate = new Date().toISOString().substring(0, 10);
			$.ajax({
				method: "GET",
				url: "/BenefietCAP/claim/GL_details?$filter=START_DATE le " +
					oDate + " and END_DATE ge " + oDate + " and externalCode eq '" + emp + "'",
				dataType: "json",
				success: function (data) {
					var oModel = data.value[0];
					if (oModel) {
						oDlgdata.setProperty("/GL_ACCOUNT", oModel.GL_ACC);
						var payment = this.oViewData.getProperty("/PAYMENT");
						if (payment === "Vendor") {
							oDlgdata.setProperty("/VENDOR_CODE", "");
						} else {
							oDlgdata.setProperty("/VENDOR_CODE", oModel.cust_vendorCode);
						}
						oDlgdata.refresh(true);
					}
				}.bind(this),
				error: function (response) {
					this.getView().setBusy(false);
					this.handleErrorDialog(response);
				}.bind(this)
			});
		},

		_fnOverseasDetails: function (oDlgdata, EmpId, key, name) {
			$.ajax({
				method: "GET",
				url: "/BenefietCAP/claim/OVERSEAS_BANK?$filter=cust_bankAccount_externalCode eq '" + EmpId + "'",
				dataType: "json",
				success: function (data) {
					var oModel = data.value[0];
					if (oModel) {
						if (key === "Form") {
							oDlgdata.setProperty("/CURRENCY", oModel.cust_currency);
							this._fnCurrencyRate(oModel.cust_currency);
						}
						if ((oModel.cust_primaryBankStr === "true" || oModel.cust_primaryBankStr === "Y") && (name === "OClaim_Master" || name ===
								"PUpload" || name === "SDFClaim_Master" || name === "CPClaim_Master")) {
							oDlgdata.setProperty("/PAY_TO_BANK", oModel.cust_bank);
							oDlgdata.setProperty("/ACC_NAME", oModel.cust_accountOwner);
							oDlgdata.setProperty("/ACC_NO", oModel.cust_bankAccountNumber);
							oDlgdata.setProperty("/BANK_CURRENCY", oModel.cust_currency);
							oDlgdata.refresh(true);
						}
					}
				}.bind(this),
				error: function (response) {
					this.getView().setBusy(false);
					this.handleErrorDialog(response);
				}.bind(this)
			});
		},

		_fnInflightScholar: function (eURL, name) {
			var oDlgdata = this.eDialog.getModel(name);
			$.ajax({
				method: "GET",
				url: eURL,
				dataType: "json",
				success: function (data) {
					var oModel = data.value[0];
					oDlgdata.setProperty("/SCHOLAR_UNIV", oModel.cust_school);
					oDlgdata.refresh(true);
				}.bind(this),
				error: function (response) {
					this.getView().setBusy(false);
					this.handleErrorDialog(response);
				}.bind(this)
			});
		},

		_fnPayupDetaila: function (eURL, name) {
			var oDlgdata = this.eDialog.getModel(name);
			$.ajax({
				method: "GET",
				url: eURL,
				dataType: "json",
				success: function (data) {
					var oModel = data.value[0];
					oDlgdata.setProperty("/SCHOLAR_SCHEME", oModel.cust_scholarshipScheme);
					oDlgdata.setProperty("/SCHOLAR_DISC", oModel.cust_discipline);
					oDlgdata.refresh(true);
				}.bind(this),
				error: function (response) {
					this.getView().setBusy(false);
					this.handleErrorDialog(response);
				}.bind(this)
			});
		},

		_fnCurrencyRate: function (curr) {
			var oDate = new Date().toISOString().substring(0, 10),
				oURL = "/BenefietCAP/claim/CURRENCY?$filter=CURRENCY eq '" + curr + "' and START_DATE le " + oDate + " and END_DATE ge " +
				oDate + "";
			$.ajax({
				url: oURL,
				method: "GET",
				dataType: "json",
				success: function (data, resp) {
					if (data.value.length > 0) {
						this.oViewData.setProperty("/RATE", data.value[0].RATE);
					} else {
						this.oViewData.setProperty("/RATE", 1.00);
					}
				}.bind(this)
			});
		},

		_fnEmpJob: function () {
			$.ajax({
				url: "/BenefietCAP/sfservice/EmpJobPayCompRecurring?$top=100000",
				method: "GET",
				dataType: "json",
				success: function (data, oResponse) {
					var oModel = this._getSizeLimit(data.value);
					this.getView().setModel(oModel, "oEmpJobData");
				}.bind(this),
				error: function (xhr, ajaxOptions, throwError) {
					this.handleErrorDialog(xhr);
				}.bind(this)
			});
		},
		onChangePayment: function (oEvent) {
			var key = oEvent.getSource().getSelectedKey();
			this.oViewData.setProperty("/PAYMENT", key);
		},

		onChangePA: function (oEvent) {
			var key = oEvent.getSource().getSelectedKey(),
				oResp = this.getView().getModel("ComboDetails").getData(),
				oDivision = [],
				oPayComp = [];
			$.each(oResp.DIVISION, function (idx, obj) {
				if (obj.Company === key) {
					oDivision.push(obj);
				}
			});
			$.each(oResp.PAY_COMPONENT, function (idx, obj) {
				if (obj.Company === key) {
					oPayComp.push(obj);
				}
			});
			this.getView().setModel(new JSONModel(oDivision), "oDivision");
			this.getView().setModel(new JSONModel(oPayComp), "oPayComp");
		},

		onChangeTCdate: function (oEvent) {
			this.eDialog.getModel("Transportation").setProperty("/COST_DISTANCE");
			this.eDialog.getModel("Transportation").setProperty("/TRANSPORT_TYPE");
		},

		onChangeTrans: function (oEvent, model) {
			var key = oEvent.getSource().getSelectedKey(),
				oDate = this.eDialog.getModel(model).getProperty("/RECEIPT_DATE");

			if (key === "BUSMRT" || key === "TAXI") {
				this.eDialog.getModel(model).setProperty("/ERP_COST", 0.00);
				this.eDialog.getModel(model).setProperty("/PARKING_COST", 0.00);
			}
			if (oDate) {
				$.ajax({
					method: "GET",
					url: "/BenefietCAP/claim/VEHICLE_RATE?$filter=START_DATE le " +
						oDate + " and END_DATE ge " + oDate + " and TRANSPORT_TYPE eq '" + key + "'",
					dataType: "json",
					success: function (data) {
						this.eDialog.getModel(model).setProperty("/COST_DISTANCE", data.value[0].RATE);
					}.bind(this),
					error: function (response) {
						this.handleErrorDialog(response);
					}.bind(this)
				});
			} else {
				this._fnShowErrorMessage("Please select receipt date");
			}
		},

		onChangeApprover: function (oEvent) {
			this.onValidData(oEvent);
			this._fnValidActiveEmp(oEvent.getSource().getSelectedKey());
		},

		_fnValidActiveEmp: function (oEmp) {
			var oURL, oDate = new Date().toISOString().substring(0, 10) + "T00:00:00Z";
			oURL = "/BenefietCAP/sfservice/EmpEmployment?$filter=userId eq '" + oEmp + "' and startDate le " + oDate + " and (endDate ge " +
				oDate + " or endDate eq null)";
			$.ajax({
				method: "GET",
				url: oURL,
				dataType: "json",
				success: function (data) {
					if (data.value.length > 0) {
						this.oViewData.setProperty("/isActive", false);
					} else {
						this.oViewData.setProperty("/isActive", true);
					}
				}.bind(this),
				error: function (response) {
					this.handleErrorDialog(response);
				}.bind(this)
			});
		},

		_fnSubmitApproval: function (payload, msg, key) {
			this._fnEmail(payload[0], "SA");
			if (this.oViewData.getProperty("/isActive")) {
				this.oViewData.setProperty("/isActiveClose", false);
				this._fnShowErrorMessage("Selected Approver is inactive");
				return;
			} else {
				this.oViewData.setProperty("/isActiveClose", true);
			}
			this.getView().setBusy(true);
			$.ajax({
				url: "/BenefietCAP/claim/submitForApproval",
				data: JSON.stringify({
					"listofClaims": JSON.stringify(payload),
					"table_Name": this.oViewData.getProperty("/oTableAppName")
				}),
				method: "POST",
				crossDomain: true,
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json"
				},
				success: function (data, oResponse) {
					/*if (key === "H") {
						this.onCloseDialogM();
					} else {
						this._fnTableData();
					}*/
					this.objectMatched();
					this.handleSuccessDialog(msg);
					this._fnEmailNotification(payload[0]);
					this.getView().setBusy(false);
					this._getBusyIndicator().hide();
				}.bind(this),
				error: function (xhr, ajaxOptions, throwError) {
					this.getView().setBusy(false);
					this._getBusyIndicator().hide();
					this.handleErrorDialog(xhr);
				}.bind(this)
			});
		},

		_fnActiveEmp: function () {
			if (this.oViewData.getProperty("/isActive")) {
				this.oViewData.setProperty("/isActiveClose", false);
				return false;
			} else {
				this.oViewData.setProperty("/isActiveClose", true);
				return true;
			}
		},

		onSDialogCancel: function (oEvent) {
			oEvent.getSource().getBinding("items").filter([]);
		},

		onSDialogCancelR: function (oEvent) {
			oEvent.getSource().getBinding("items").filter([]);
			// this.getModel("oReqID").setData([]);
		},

		_fnGenPutEntity: function (oData) {
			var oURL = this.fnPutEntity({
				"CLAIM_CODE": oData.CLAIM_TYPE,
				"CLAIM_CATEGORY": oData.CATEGORY_CODE,
				"EMPLOYEE_ID": oData.CLAIM_OWNER_ID,
				"CLAIM_REFERENCE": oData.CLAIM_REFERENCE,
				"CLAIM_DATE": oData.CLAIM_DATE
			});

			if (oData.CATEGORY_CODE === "WRC_HR" || oData.CATEGORY_CODE === "WRC" || oData.CATEGORY_CODE === "COV" || oData.CATEGORY_CODE.includes(
					"SP") || oData.CATEGORY_CODE === "TC" || oData.CATEGORY_CODE.includes("SDF") || oData.CATEGORY_CODE === "CPC" || oData.CATEGORY_CODE ===
				"OC" || oData.CATEGORY_CODE === "PAY_UP") {
				oURL = oURL + "?$expand=LINE_ITEM";
			}
			return oURL;
		},

		_fnRejectionDialog: function (model) {
			if (!this._oDialogReject) {
				this._oDialogReject = Fragment.load({
					id: this.createId("fReject"),
					name: "BenefitClaim.ZBenefitClaim.fragments.Dialog.Rejection",
					controller: this
				}).then(function (oDialog) {
					this._oDialogReject = oDialog;
					this.getView().addDependent(this._oDialogReject);
					this._oDialogReject.setModel(model, "oRej");
					this._oDialogReject.open();
				}.bind(this));
			}
		},

		onDownloadExcel: function () {
			this.getView().setBusy(true);
			var odata = this.oViewData.getData(),
				oFilter = "",
				fromDate = "2020-01-01",
				toDate = "9999-12-31";
			if (odata.ClaimCate) {
				oFilter += "CLAIM_TYPE eq '" + odata.ClaimCate + "'";
			}
			if (odata.ClaimType) {
				oFilter += "CATEGORY_CODE contains '" + odata.ClaimType + "'";
			}
			if (odata.Status) {
				oFilter += "CLAIM_STATUS contains '" + odata.Status + "'";
			}
			if (odata.Sdate) {
				fromDate = odata.Sdate.toISOString().substring(0, 10);
			}
			if (odata.toDate) {
				toDate = odata.Edate.toISOString().substring(0, 10);
			}

			var oPAemp = this.getView().getModel("oEmpData").getProperty("/COMPANY"),
				oPSAemp = this.getView().getModel("oEmpData").getProperty("/LOCATION"),
				oPayemp = this.getView().getModel("oEmpData").getProperty("/PAYGRADE"),
				oDivemp = this.getView().getModel("oEmpData").getProperty("/DIVISION"),
				oEmpId = this.oViewData.getProperty("/EmpID"),
				oURL, oFkeyss = "",
				oKey = [];
			if (this.oViewData.getProperty("/oTile") === "HistoryCoord" || this.oViewData.getProperty("/oTile") === "HistoryCoordSch") {
				oPAemp = this.oViewData.getProperty("/oTile") === "HistoryCoord" ? "MOHH" : "MOHHSCH";

				// if (oPAemp === "MOHH") {
				// 	oFkeyss =
				// 		"&$filter=CATEGORY_CODE ne 'OC' and CATEGORY_CODE ne 'CPR' and CATEGORY_CODE ne 'CPC' and CATEGORY_CODE ne 'SDFR' and CATEGORY_CODE ne 'SDFC' and CATEGORY_CODE ne 'PAY_UP'";
				// } else {
				// 	oFkeyss =
				// 		"&$filter=CATEGORY_CODE eq 'OC' or CATEGORY_CODE eq 'CPR' or CATEGORY_CODE eq 'CPC' or CATEGORY_CODE eq 'SDFR' or CATEGORY_CODE eq 'SDFC' or CATEGORY_CODE eq 'PAY_UP'";
				// }

				oURL = "/BenefietCAP/calclaim/exportExcelClaim(USERID='',fromDate=" + fromDate + ",toDate=" + toDate +
					",CORDIN='" + oEmpId + "',Personnel_Area='" + oPAemp + "',Personal_Subarea='" + oPSAemp + "',Pay_Grade='" + oPayemp +
					"',Division='" + oDivemp + "',HR_ADMIN='',CLAIM_STATUS='',CLAIM_TYPE='',CATEGORY_CODE='',CLAIM_REFERENCE='')" + oFkeyss;
			} else {
				oKey.push(oEmpId);
				oKey = JSON.stringify(oKey);
				oURL = "/BenefietCAP/calclaim/exportExcelClaim(USERID='" + oKey + "',fromDate=" + fromDate + ",toDate=" + toDate +
					",CORDIN='',Personnel_Area='" + oPAemp + "',Personal_Subarea='" + oPSAemp + "',Pay_Grade='" + oPayemp + "',Division='" +
					oDivemp + "',HR_ADMIN='',CLAIM_STATUS='',CLAIM_TYPE='',CATEGORY_CODE='',CLAIM_REFERENCE='')";
			}
			$.ajax({
				url: oURL,
				method: "GET",
				dataType: "json",
				success: function (data) {
					var href = "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64," + data.value,
						element = document.createElement('a');
					element.setAttribute('href', href);
					element.setAttribute('download', "ClaimReport.xlsx");
					element.style.display = 'none';
					document.body.appendChild(element);
					element.click();
					document.body.removeChild(element);
					this.getView().setBusy(false);
				}.bind(this),
				error: function (response) {
					this.getView().setBusy(false);
					this.handleErrorDialog(response);
				}.bind(this)
			});
		},

		onTemplateDownloadPR: function () {
			var file_path = window.location.origin + "/BenefitClaimZBenefitClaim-1.0.0/model/Clinical_Placement_Claims_Request.docx";
			var a = document.createElement('A');
			a.href = file_path;
			a.download = file_path.substr(file_path.lastIndexOf('/') + 1);
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
		},

		onTemplateDownload: function (key) {
			var okey, oURL;
			if (key === "claim") {
				okey = this._fngettemplate(this.oViewData.getProperty("/ClaimType"));
			} else if (key === "Pay_Up") {
				okey = "Pay Upload Temp";
			} else {
				okey = this.oViewData.getProperty("/ConfigType");
			}
			oURL = "/BenefietCAP/calclaim/exportExcelTemplate(CLAIM='" + okey + "')";
			$.ajax({
				method: "GET",
				url: oURL,
				dataType: "json",
				success: function (data) {
					var href = "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64," + data.value,
						element = document.createElement('a');
					element.setAttribute('href', href);
					element.setAttribute('download', "Upload_Template.xlsx");
					element.style.display = 'none';
					document.body.appendChild(element);
					element.click();
					document.body.removeChild(element);
				}.bind(this),
				error: function (response) {
					this.handleErrorDialog(response);
				}.bind(this)
			});
		},

		onChangeup: function (oEvent) {
			this.file = oEvent.getParameter("files")[0];
		},

		onUploadTemplate: function (key, id) {
			this._getBusyIndicator().show();
			var oNumb = Math.floor(Math.random() * 99) + 1,
				file = this.file;
			this.oViewData.setProperty("/oClaimTempID", oNumb);
			var reader = new FileReader();
			reader.onload = function (oEvent) {
				this.content = oEvent.currentTarget.result;
				var data = new Blob([new Uint8Array(this.content)], {
					type: file.type
				});
				this.createfile(oNumb, data, key);
			}.bind(this);
			reader.readAsArrayBuffer(file);
		},
		createfile: function (oNumb, data, key) {
			var oURL;
			if (key === "claim") {
				oURL = "/BenefietCAP/calclaim/excelUpload(" + oNumb + ")/content";
			} else if (key === "Pay_Up") {
				oURL = "/BenefietCAP/calclaim/pay_up_config(" + oNumb + ")/content"
			} else if (key === "Finance") {
				oURL = "/BenefietCAP/sfservice/SMS_Import_Posting_Upload('M')/content";
			} else {
				oURL = "/BenefietCAP/calclaim/uploadConfig(" + oNumb + ")/content";
			}
			$.ajax({
				url: oURL,
				method: "PUT",
				crossDomain: true,
				data: data,
				processData: false,
				contentType: "application/my-binary-type",
				success: function (oData) {
					if (key === "Finance") {
						this.handleSuccessDialog("Uploaded successfully");
						this._fnFinanceData();
					} else {
						if (key === "Pay_Up") {
							this._fnpayuploadrec(oNumb, key);
						} else {
							setTimeout(this.ClaimUploadComplete(oNumb, key), 3500);
						}
					}
				}.bind(this),
				error: function (xhr, ajaxOptions, throwError) {
					this.getView().setBusy(false);
					this._getBusyIndicator().hide();
					this.handleErrorDialog(xhr);
				}.bind(this)
			});
		},

		_fnpayuploadrec: function (oNumb, key) {
			this.threshold = 60;
			this.counter = 0;
			this.logInterval = setInterval(function () {
					this.ClaimUploadComplete(oNumb, key);
				}.bind(this),
				1000);
		},

		ClaimUploadComplete: function (oNumb, key) {
			$.ajax({
				method: "GET",
				url: "/BenefietCAP/calclaim/getUploadErrorLog(id='" + oNumb + "')",
				dataType: "json",
				success: function (data) {
					this.getView().setBusy(false);
					if (data.success) {
						if (key === "Pay_Up") {
							clearInterval(this.logInterval);
							this._fnPayUplineItem(oNumb);
						} else {
							this._getBusyIndicator().hide();
							this.handleSuccessDialog("Data has been uploaded successfully");
						}
					} else {
						clearInterval(this.logInterval);
						this._getBusyIndicator().hide();
						this._fnShowErrorMessage("Error: " + data.error);
					}
				}.bind(this),
				error: function (response) {
					this._getBusyIndicator().hide();
					if (key === "Pay_Up") {
						if (this.counter === this.threshold || response.responseText) {
							this.handleErrorDialog(response);
							clearInterval(this.logInterval);
						} else {
							this.counter++;
						}
					} else {
						this.handleErrorDialog(response);
					}
				}.bind(this)
			});
		},

		_fnPayUplineItem: function (sKey) {
			$.ajax({
				method: "GET",
				url: "/BenefietCAP/calclaim/getPay_Up_LineItems(id='" + sKey + "',paymentTo='" + this.oViewData.getProperty("/oPayment") +
					"')",
				dataType: "json",
				success: function (data) {
					if (data.value.length > 0) {
						var data = this._getSizeLimit(data.value),
							oData = data.getData();
						for (var i = 0; i < oData.length; i++) {
							delete oData[i].ID;
							oData[i].LINE_ITEM_REFERENCE_NUMBER = new Date().getTime().toString();
							oData[i].CLAIM_AMOUNT = parseFloat(oData[i].CLAIM_AMOUNT).toFixed(2);
							oData[i].CLAIM_DATE = new Date().toISOString().substring(0, 10);
							oData[i].SCHOLAR_ID = oData[i].SCHOLAR_ID;
							oData[i].SCHOLAR_NAME = oData[i].SCHOLAR_NAME;
							oData[i].CLAIM_REFERENCE = oData[i].CLAIM_CODE + new Date().getTime().toString() + i;
							oData[i].CLAIM_CODE = oData[i].CLAIM_CODE;
							oData[i].VENDOR_CODE = this.oViewData.getProperty("/PAYMENT") === "Vendor" ? oData[i].VENDOR_CODE : oData[i].CUST_VENDORCODE;
							oData[i].PAY_TO_BANK = oData[i].CUST_BANKNAME;
							oData[i].ACC_NAME = oData[i].CUST_ACCOUNTOWNER;
							oData[i].ACC_NO = oData[i].CUST_BANKACCOUNTNUMBER;
							oData[i].BANK_CURRENCY = oData[i].CUST_CURRENCY;
							oData[i].CLAIM_CATEGORY = oData[i].CLAIM_CODE_DESCRIPTION;
							oData[i].EMPLOYEE_ID = this.oViewData.getProperty("/EmpID");
							delete oData[i].CUST_VENDORCODE;
							delete oData[i].CLAIM_CODE_DESCRIPTION;
							delete oData[i].CUST_BANKNAME;
							delete oData[i].CUST_ACCOUNTOWNER;
							delete oData[i].CUST_BANKACCOUNTNUMBER;
							delete oData[i].CUST_CURRENCY;
						}
						var oData1 = this.eDialogM.getModel("PUpload_Master").getData().LINE_ITEM,
							oFData = oData1.concat(oData);
						this.eDialogM.getModel("PUpload_Master").getData().LINE_ITEM = oFData;
						this.eDialogM.getModel("PUpload_Master").refresh(true);
						sap.m.MessageToast.show("Data has been uploaded successfully");
					}
					this._getBusyIndicator().hide();
					this.onCloseUpDialog();
				}.bind(this),
				error: function (response) {
					this._getBusyIndicator().hide();
					this.handleErrorDialog(response);
				}.bind(this)
			});
		},

		_fnFinanceData: function (key) {
			var oTimestamp = this.oViewData.getProperty("/oFinanceDate"),
				oTimestampT = this.oViewData.getProperty("/oFinanceDateT"),
				oPostDate = this.oViewData.getProperty("/oPostingDate"),
				oPostDateT = this.oViewData.getProperty("/oPostingDateT"),
				oEmpid = this.oViewData.getProperty("/Emp_SMS_finance"),
				oURL, oFilter = [],
				oTimestampl;
			if (key === "Search") {
				oEmpid = oEmpid ? oEmpid : "";
				oPostDate = oPostDate ? oPostDate : null;
				oPostDateT = oPostDateT ? oPostDateT : null;
				oTimestampl = oTimestamp ? oTimestamp + "T00:00:00Z" : null;
				oTimestampT = oTimestampT ? oTimestampT + "T23:59:59Z" : null;
				/*if (oTimestampl) {
					oFilter.push(new sap.ui.model.Filter([
						new sap.ui.model.Filter("Timestamp", sap.ui.model.FilterOperator.GT, oTimestampl),
						new sap.ui.model.Filter("Timestamp", sap.ui.model.FilterOperator.LT, oTimestamp)
					], true));
				}*/
				if (oTimestampl && oTimestampT) {
					oFilter.push(new sap.ui.model.Filter([
						new sap.ui.model.Filter("Timestamp", sap.ui.model.FilterOperator.GT, oTimestampl),
						new sap.ui.model.Filter("Timestamp", sap.ui.model.FilterOperator.LT, oTimestampT)
					], true));
				}
				if (this.oViewData.getProperty("/SMS_LINE_REF")) {
					oFilter.push(new Filter("Internal_Claim_Reference", FilterOperator.EQ, this.oViewData.getProperty("/SMS_LINE_REF")));
				}
				if (this.oViewData.getProperty("/SMS_EXP_REF")) {
					oFilter.push(new Filter("Export_Reference", FilterOperator.EQ, this.oViewData.getProperty("/SMS_EXP_REF")));
				}
				if (this.oViewData.getProperty("/SMS_Stats")) {
					oFilter.push(new Filter("Status", FilterOperator.EQ, this.oViewData.getProperty("/SMS_Stats")));
				}
				if (this.oViewData.getProperty("/oPostingDate") && oPostDateT) {
					oFilter.push(new sap.ui.model.Filter([
						new Filter("Posting_Date", FilterOperator.GT, oPostDate),
						new Filter("Posting_Date", FilterOperator.LT, oPostDateT)
					], true));
				}
				if (this.oViewData.getProperty("/Emp_SMS_finance")) {
					oFilter.push(new Filter("Employee_ID", FilterOperator.EQ, this.oViewData.getProperty("/Emp_SMS_finance")));
				}
				var oTable = this.getView().byId("oTableFinance").getBinding("items");
				oTable.filter(oFilter, true);
				this.oViewData.setProperty("/oTableFinanceLength", oTable.iLength);

			} else {
				oURL = "/BenefietCAP/sfservice/SMS_Import_Posting_Upload_Logs?$top=100000";
				$.ajax({
					method: "GET",
					url: oURL,
					dataType: "json",
					success: function (data) {
						this.getView().setBusy(false);
						this._getBusyIndicator().hide();
						if (data.value.length > 0) {
							var oModel = this._getSizeLimit(data.value);
							this.oViewData.setProperty("/oTableFinanceLength", data.value.length);
							this.getView().setModel(oModel, "oFinanceData");
						} else {
							this.oViewData.setProperty("/oTableFinanceLength", 0);
							this.getView().setModel(new JSONModel([]), "oFinanceData");
						}
					}.bind(this),
					error: function (response) {
						this.getView().setBusy(false);
						this._getBusyIndicator().hide();
						this.handleErrorDialog(response);
					}.bind(this)
				});
			}
		},

		onLogout: function () {
			MessageBox.confirm("Are you sure you want to logout?", {
				actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
				emphasizedAction: MessageBox.Action.OK,
				onClose: function (sAction) {
					window.location.replace("/do/logout");
				}
			});
		}

	});

});