sap.ui.define(["jquery.sap.global", "sap/ui/core/Control", "sap/ui/core/syncStyleClass"], function (jQuery, Control, syncStyleClass) {
	"use strict";

	return {

		/**
		 * Function 
		 * @param {function} that 
		 * @param {function} model
		 * @param {function} fragmentId
		 * @public
		 */
		// For Warning Dialog
		// handleCancelWarningDialog: function (fragInst, model, fragmentId) {
		// 	model = (model !== null && model !== undefined) ? model : setDialogModel("W");
		// 	_handleDialog(fragInst, model, "BenefitClaim.ZBenefitClaim.fragments.Dialog.GenericConfirm", fragmentId, "btnNo", "btnYes");
		// },
		// Confirmation message for  more Sub title 
		// handleCancelSubTitleDialog: function (fragInst, model, fragmentId) {
		// 	model = (model !== null && model !== undefined) ? model : setDialogModel("W");
		// 	_handleDialog(fragInst, model, "BenefitClaim.ZBenefitClaim.fragments.Dialog.GenericConfirmWithSubtitle", fragmentId, "btnNo",
		// 		"btnYes");
		// },
		// For Success Dialog
		// handleSuccessDialog: function (fragInst, model, fragmentId) {
		// 	model = (model !== null && model !== undefined) ? model : setDialogModel("S");
		// 	_handleDialog(fragInst, model, "BenefitClaim.ZBenefitClaim.fragments.Dialog.GenericSuccess", fragmentId, "btnOk", null);
		// },
		// For Remarks Dialog
		// handleRemarksDialog: function (fragInst, model, fragmentId) {
		// 	model = (model !== null && model !== undefined) ? model : setDialogModel("RE");
		// 	_handleDialog(fragInst, model, "BenefitClaim.ZBenefitClaim.fragments.Dialog.GenericRemarks", fragmentId, "btnNo", "btnYes");
		// },
		// For Confirmation Dialog
		handleConfirmationDialog: function (fragInst, model, fragmentId, oCallback) {
			model = (model !== null && model !== undefined) ? model : setDialogModel("C");
			_handleDialog(fragInst, model, "BenefitClaim.ZBenefitClaim.fragments.Dialog.GenericConfirm", fragmentId, "btnNo", "btnYes", oCallback);
		},
		// For Agree Dialog
		// handleAgreeDialog: function (fragInst, model, fragmentId) {
		// 	model = (model !== null && model !== undefined) ? model : setDialogModel("C");
		// 	_handleDialog(fragInst, model, "BenefitClaim.ZBenefitClaim.fragments.Dialog.GenericAgree", fragmentId, "btnNo", "btnYes");
		// },
		// For Confirmation OK Dialog
		// handleConfirmationOKDialog: function (fragInst, model, fragmentId) {
		// 	model = (model !== null && model !== undefined) ? model : setDialogModel("C");
		// 	_handleDialog(fragInst, model, "BenefitClaim.ZBenefitClaim.fragments.Dialog.GenericConfirmOK", fragmentId, "btnYes");
		// },
		// For Confirmation Information Dialog
		// handleConfirmationInformation: function (fragInst, model, fragmentId) {
		// 	model = (model !== null && model !== undefined) ? model : setDialogModel("GI");
		// 	_handleDialog(fragInst, model, "BenefitClaim.ZBenefitClaim.fragments.Dialog.GenericInformation", fragmentId, "btnOk");
		// },
		// For Error Dialog
		// handleErrorDialog: function (fragInst, model, fragmentId) {
		// 	model = (model !== null && model !== undefined) ? model : setDialogModel("E");
		// 	_handleDialog(fragInst, model, "BenefitClaim.ZBenefitClaim.fragments.Dialog.GenericError", fragmentId, "btnOk", null);
		// },
		// handleWarningErrorDialog: function (fragInst, model, fragmentId) {
		// 	model = (model !== null && model !== undefined) ? model : setDialogModel("E");
		// 	_handleDialog(fragInst, model, "BenefitClaim.ZBenefitClaim.fragments.Dialog.GenericErrorWarning", fragmentId, "btnOk", null);
		// },

		// handleMobileWarningDialog: function (fragInst, model, fragmentId) {
		// 	model = (model !== null && model !== undefined) ? model : setDialogModel("E");
		// 	_handleDialog(fragInst, model, "BenefitClaim.ZBenefitClaim.fragments.Dialog.MobileWarning", fragmentId, "btnOk", null);
		// },

		// For Hint Dialog
		// handleHintDialog: function (fragInst, model, fragmentId) {
		// 	model = (model !== null && model !== undefined) ? model : setDialogModel("H");
		// 	_handleDialog(fragInst, model, "BenefitClaim.ZBenefitClaim.fragments.Dialog.GenericHint", fragmentId, "btnOk", null);
		// },
		// For Info Dialog
		// handleInfoDialog: function (fragInst, model, fragmentId) {
		// 	model = (model !== null && model !== undefined) ? model : setDialogModel("I");
		// 	_handleDialog(fragInst, model, "BenefitClaim.ZBenefitClaim.fragments.Dialog.GenericInfo", fragmentId, "btnOk", null);
		// },
		/**
		 * Function handleODataErrorDialog(fragInst,model,fragmentId)
		 * @param {function} fragInst 
		 * @param {function} model 
		 * @param {function} fragmentId 
		 * @return {void} 
		 * @public
		 */
		handleODataErrorDialog: function (fragInst, model, fragmentId) {
			var that = this;
			model = (model !== null && model !== undefined) ? model : setDialogModel("OE");
			if (that._dialog !== undefined) {
				_clearDialog(that._dialog);
			}
			that._pDialog = sap.ui.core.Fragment.load({
				id: "oDataError",
				name: "BenefitClaim.ZBenefitClaim.fragments.Dialog.GenericError",
				controller: that
			}).then(function (oDialog) {
				that._dialog = oDialog;
				that._dialog.setModel(model);
				that.getView().addDependent(that._dialog);
				that._dialog.setEscapeHandler(function () {
					return;
				});
			});
			that._pDialog.then(function (oDialog) {
				that._dialog.open();
			}.bind(that));
			sap.ui.core.Fragment.byId("oDataError", 'btnOk').attachPress(
				function (oControlEvent) {
					_closeDialog(that._dialog);
				});
		},
		/**
		 * Function handleDeleteWarningDialog(fragInst,model,fragmentId)
		 * @param {function} fragInst 
		 * @param {function} model 
		 * @param {function} fragmentId 
		 * @return {void} 
		 * @public
		 */
		handleDeleteWarningDialog: function (fragInst, model, fragmentId) {
			var that = fragInst;
			model = (model !== null && model !== undefined) ? model : setDialogModel("D");
			fragInst.getOKControl = "Y";
			_handleDialog(fragInst, model, "BenefitClaim.ZBenefitClaim.fragments.Dialog.GenericConfirm", fragmentId, "btnYes", "btnNo");
			sap.ui.core.Fragment.byId(that.createId(fragmentId), 'btnYes').attachPress(
				function (oControlEvent) {
					that.onDeleteConfirmation(oControlEvent);
				}
			);
		}
	};
	/**
	 * Function _handleDialog(that, model, fragment, fragmentId, btnOk, btnCancel)
	 * @param {function} fragInst 
	 * @param {function} model 
	 * @param {function} fragment 
	 * @param {function} fragmentId 
	 * @param {function} FirstButton 
	 * @param {function} SecondButton 
	 * @return {void} 
	 * @public
	 */
	function _handleDialog(that, model, fragment, fragmentId, btnOk, btnCancel, oCallback) {
		if (that._oDialog !== undefined) {
			_clearDialog(that._oDialog);
		}
		fragmentId = (fragmentId !== "" && fragmentId !== undefined) ? fragmentId : "UTIL_FRAG";
		that._oDialog = sap.ui.core.Fragment.load({
			id: that.createId(fragmentId),
			name: fragment,
			controller: that
		}).then(function (oDialog) {
			that._oDialog = oDialog;
			that.getView().addDependent(that._oDialog);
			that._oDialog.setModel(model);
			that._oDialog.addStyleClass("sapUiSizeCompact");
			if (btnOk) {
				sap.ui.core.Fragment.byId(that.createId(fragmentId), btnOk).attachPress(
					function (oControlEvent) {
						_closeDialog(that._oDialog);
					});
			}
			if (btnCancel) {
				sap.ui.core.Fragment.byId(that.createId(fragmentId), btnCancel).attachPress(
					function (oControlEvent) {
						_closeDialog(that._oDialog);
					});
			}
			if (oCallback)
				oCallback();
			that._oDialog.setEscapeHandler(function () {
				return;
			});
		});
		that._oDialog.then(function (oDialog) {
			that._oDialog.open();
		}.bind(that));

	}
	/**
	 * Function _closeDialog
	 * @param {function} oDialog 
	 * @public
	 */
	function _closeDialog(oDialog) {
		try {
			oDialog.close();
			oDialog.destroy();
		} catch (e) {}
	}
	/**
	 * Function _clearDialog
	 * @param {function} oDialog 
	 * @public
	 * Here no need to close the dialog as the intension is to destroy dialog
	 */
	function _clearDialog(oDialog) {
		try {
			oDialog.destroy();
			oDialog = undefined;
		} catch (e) {}
	}
	/**
	 * Function setDialogModel
	 * @param {function} type 
	 * @return {Date} 
	 * @public
	 * This section will handle the default json information for fragments
	 */
	function setDialogModel(type) {
		if (type === "D") {
			return new sap.ui.model.json.JSONModel({
				"Title": "   Delete Record Warning !!!   ",
				"SubTitle": "Do you want to delete the selected item?",
				"BtnNoText": "NO",
				"BtnYesText": "YES"
			});
		} else if (type === "OE") {
			return new sap.ui.model.json.JSONModel({
				"Title": "HTTP Request failed",
				"SubTitle": "Unexpected error caused!!!",
				"BtnOkText": "OK"
			});
		} else if (type === "C") {
			return new sap.ui.model.json.JSONModel({
				"Title": " You have modified records !!! ",
				"SubTitle": "Do you want to submit the modified record ?",
				"BtnNoText": "NO",
				"BtnYesText": "YES"
			});
		} else if (type === "S") {
			return new sap.ui.model.json.JSONModel({
				"Title": " Successfully updated the record ",
				"SubTitle": "The selected record have submitted successfully",
				"BtnOkText": "GO BACK TO MY DASHBOARD"
			});
		} else if (type === "GI") {
			return new sap.ui.model.json.JSONModel({
				"Title": " You have rejected this letter of appoinment. ",
				"SubTitle": "HR will receive a notification to inform the candidate of the outcome.",
				"BtnOkText": "GO BACK TO MY DASHBOARD"
			});
		} else if (type === "W") {
			return new sap.ui.model.json.JSONModel({
				"Title": "  Do you wanted to modify the selected record ?  ",
				"SubTitle": "The selected item will replace the exsisting record",
				"BtnNoText": "NO",
				"BtnYesText": "YES"
			});
		} else if (type === "E") {
			return new sap.ui.model.json.JSONModel({
				"Title": "  The selected record will be deleted  ",
				"SubTitle": "The selected record will be deleted from the database",
				"BtnOkText": "OK"
			});
		} else if (type === "RE") {
			return new sap.ui.model.json.JSONModel({
				"Title": "You are about to give remark",
				"SubTitle": "Please state your reason",
				"BtnNoText": "CANCEL",
				"BtnYesText": "SUBMIT"
			});
		} else if (type === "H") {
			return new sap.ui.model.json.JSONModel({
				"Title": " Information ",
				"BodyText": "The message box (sap.m.MessageBox) is a special dialog that allows you to display messages to the user. Compared to the message popover (sap.m.MessagePopover), you can use the message box to display messages that are not related to a field on the UI, such as technical errors",
				"BtnOkText": "OK"
			});
		} else if (type === "U") {
			return new sap.ui.model.json.JSONModel({
				"Title": " What you should upload? ",
				"BodyText": "<p><strong>What Should You Upload?</strong></span></p><p>1. Maximum file size to be upload is 2 MB.<br />2. Supported file types: PDF, JPG, PNG, JPEG.</p>",
				"BtnOkText": "CLOSE"
			});
		} else if (type === "I") {
			return new sap.ui.model.json.JSONModel({
				"Title": " You have modified below information ",
				"Lable1": "The record information as given below",
				"Lable2": "Record number",
				"Lable3": "Type of record",
				"Text1": "Info level 1",
				"Text2": "Info level 2",
				"Text3": "Info level 3",
				"BtnOkText": "OK"
			});
		}

	}

}, /* bExport= */ true);