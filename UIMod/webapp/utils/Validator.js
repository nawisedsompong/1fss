sap.ui.define(["jquery.sap.global", "sap/ui/core/Control"], function (jQuery, Control) {
	"use strict";
	return {
		/**
		 * Function 
		 * Format yyyy-mm-ddThh:mm:ss
		 * @param {function} format 
		 * @return {Date} 
		 * @public
		 */
		DateFormat: function (format) {
			return new Date(new Date().toString().split('GMT')[0] + ' UTC').toISOString().split('.')[0];
		},
		/**
		 * Function 
		 * @param {function} that To get the current Object
		 * @param {function} formId 
		 * @return {Boolean} 
		 * @public
		 */
		ValidateForm: function (that, formId, oView) {
			var partValidation = formId !== undefined ? true : false;
			var isToSetFocusFlag = true;
			this.resetValidStates(that, formId, oView);
			var isInvalid = false;
			//Validation for all inputs
			var oControls = oView.getControlsByFieldGroupId("fgInput");
			oControls.forEach(function (oControl) {
				try {
					if (partValidation && oControl.getId().indexOf(formId) === -1) {
						return;
					}
					if (validateControl(oControl, "fgInput")) {
						if (validateControl(oControl, "fgInputEntry")) {
							isInvalid = setErrorState(oControl, that);
							isToSetFocusFlag = isToSetFocusFlag ? setFocus(oControl) : isToSetFocusFlag;
						}
					}
				} catch (e) {}
			});
			oControls = oView.getControlsByFieldGroupId("fgSelect");
			oControls.forEach(function (oControl) {
				try {
					if (partValidation && oControl.getId().indexOf(formId) === -1) {
						return;
					}
					if (validateControl(oControl, "fgSelect")) {
						if (validateControl(oControl, "fgSelectEntry")) {
							isInvalid = setErrorState(oControl, that);
							isToSetFocusFlag = isToSetFocusFlag ? setFocus(oControl) : isToSetFocusFlag;
						}
					} else if (oControl.getValueState() === "Error") {
						isInvalid = true;
					}
				} catch (e) {}
			});
			oControls = oView.getControlsByFieldGroupId("fgDate");
			oControls.forEach(function (oControl) {
				try {
					if (partValidation && oControl.getId().indexOf(formId) === -1) {
						return;
					}
					if (oControl.getVisible() && oControl.getEnabled() && oControl.getValueState() !== "Error") {
						if (oControl.getDateValue() === "" || oControl.getDateValue() === null || oControl.getDateValue() === undefined) {
							isInvalid = setErrorState(oControl, that);
							isToSetFocusFlag = isToSetFocusFlag ? setFocus(oControl) : isToSetFocusFlag;
						}
					} else if (oControl.getValueState() === "Error") {
						isInvalid = true;
					}
				} catch (e) {}
			});
			oControls = oView.getControlsByFieldGroupId("fgEmail");
			oControls.forEach(function (oControl) {
				try {
					if (partValidation && oControl.getId().indexOf(formId) === -1) {
						return;
					}
					if (validateControl(oControl, "fgEmail")) {
						if (oControl.getRequired()) {
							if (validateControl(oControl, "fgEmailEntryReq")) {
								isInvalid = setErrorState(oControl, that);
								isToSetFocusFlag = isToSetFocusFlag ? setFocus(oControl) : isToSetFocusFlag;
							}
						} else if (oControl.getValue().length > 0) {
							if (validateControl(oControl, "fgEmailEntry")) {
								isInvalid = setErrorState(oControl, that);
								isToSetFocusFlag = isToSetFocusFlag ? setFocus(oControl) : isToSetFocusFlag;
							}
						}
					} else if (oControl.getValueState() === "Error") {
						isInvalid = true;
					}
				} catch (e) {}
			});
			oControls = oView.getControlsByFieldGroupId("fgNumber");
			oControls.forEach(function (oControl) {
				try {
					if (partValidation && oControl.getId().indexOf(formId) === -1) {
						return;
					}
					if (validateControl(oControl, "fgNumber")) {
						if (oControl.getRequired()) {
							if (validateControl(oControl, "fgNumberEntryReq")) {
								isInvalid = setErrorState(oControl, that);
								isToSetFocusFlag = isToSetFocusFlag ? setFocus(oControl) : isToSetFocusFlag;
							}
						} else if (oControl.getValue().length > 0) {
							if (validateControl(oControl, "fgNumberEntry")) {
								isInvalid = setErrorState(oControl, that);
								isToSetFocusFlag = isToSetFocusFlag ? setFocus(oControl) : isToSetFocusFlag;
							}
						}
					} else if (oControl.getValueState() === "Error") {
						isInvalid = true;
					}
				} catch (e) {}
			});
			return isInvalid;
		},

		/**
		 * Function 
		 * @param {function} that 
		 * @return {Date} 
		 * @public
		 */
		resetValidStates: function (that, model, oView) {
			var fields = ["fgInput", "fgSelect", "fgDate", "fgEmail", "fgNumber"];
			fields.forEach(function (field) {
				var oControls = oView.getControlsByFieldGroupId(field);
				oControls.forEach(function (oControl) {
					resetErrorState(oControl);
				});
			});
		}
	};

	//============================================================================================================
	//------------------------------------------------------------------------------------------------------------
	//                Generic Functions for Element utility 
	//------------------------------------------------------------------------------------------------------------

	/**
	 * Function validateControl
	 * @param {function} oControl 
	 * @param {function} cType 
	 * @return {void} 
	 * @public
	 */
	function validateControl(oControl, cType) {
		if (cType === "fgInput" && isValidControl(oControl)) { // Apply for controls : Required / Visible / Enabled
			return (oControl.getRequired() && oControl.getValueState() !== "Error");
		} else if ((cType === "fgSelect" || cType === "fgEmail" || cType === "fgNumber" || cType === "fgDate") && isValidControl(oControl)) { // Checks : Field is empty
			// return (oControl.getValueState() !== "Error");
			return (!getPattern("AlphaNumb").test(oControl.getValue()));
		} else if (cType === "fgInputEntry" && isValidControl(oControl)) { // Apply for controls :  Visible / Enabled
			return (oControl.getValue() === undefined || oControl.getValue().trim() === "");
		} else if (cType === "fgSelectEntry" && isValidControl(oControl)) { // Checks : Selected index is 00 or undefined
			return (oControl.getSelectedItemId() === "" || oControl.getSelectedKey() === "" || oControl.getSelectedKey() === undefined);
		} else if (cType === "fgEmailEntryReq" && isValidControl(oControl)) { // Checks : email format and empty
			return isValidControlEntry(oControl, "email");
		} else if (cType === "fgEmailEntry" && isValidControl(oControl)) { // Checks : email format if not empty
			return (!getPattern("email").test(oControl.getValue()));
		} else if (cType === "fgNumberEntryReq" && isValidControl(oControl)) { // Checks : number format and empty
			return isValidControlEntry(oControl, "Numaric");
		} else if (cType === "fgNumberEntry" && isValidControl(oControl)) { // Checks : number format if not empty
			return (!getPattern("Numaric").test(oControl.getValue()));
		} else if (cType === "fgDateEntry" && isValidControl(oControl)) { // Checks : date
			return (oControl.getValue() === undefined || oControl.getDateValue().trim() === "" || oControl.getDateValue() === null || oControl.getDateValue() ===
				undefined);
		}
	}

	function isValidControl(oControl) {
		try {
			return oControl.getEnabled() && oControl.getVisible();
		} catch (e) {
			return true; //In exception, allow entry validation
		}
	}

	function isValidControlEntry(oControl, pattern) {
		try {
			return (oControl.getValue() === undefined || oControl.getValue().trim() === "" || !getPattern(pattern).test(oControl.getValue()));
		} catch (e) {
			return false; //In exception, Follow strict entry validation
		}
	}

	function setFocus(oControl) {
		try {
			oControl.focus();
			return false;
		} catch (e) {
			return true;
		}
	}
	/**
	 * Function getErrorMessage
	 * @param {function} id 
	 * @param {function} that 
	 * @return {string} 
	 * @public
	 */
	function getErrorMessage(id, that) {
		try {
			var errorMessage = "ERROR_";
			if (id !== null && id !== undefined) {
				var tempid = id.split("--")[id.split("--").length - 1];
				errorMessage += tempid;
			}
			//	errorMessage = that.getResourceBundle().getText(errorMessage);
			errorMessage = that.getView().getModel("i18n").getResourceBundle().getText(errorMessage);
			errorMessage = errorMessage.indexOf("ERROR_") === 0 ? that.getResourceBundle().getText("ERROR_GENERIC") : errorMessage;
			errorMessage = errorMessage.indexOf("ERROR_") === 0 ? "Invalid Entry" : errorMessage;
			return errorMessage;
		} catch (e) {
			return "Invalid Entry";
		}
	}

	/**
	 * Function 
	 * @param {function} oControl 
	 * @param {function} that 
	 * @return {Date} 
	 * @public
	 */
	function setErrorState(oControl, that) {
		try {
			oControl.setValueState("Error");
			oControl.setValueStateText(getErrorMessage(oControl.getId(), that));
			return true;
		} catch (e) {}
	}

	/**
	 * Function 
	 * @param {function} oControl 
	 * @return {void} 
	 * @public
	 */
	function resetErrorState(oControl) {
		try {
			if (oControl.getValueState() === "Error" && oControl.getVisible() && oControl.getEnabled()) {
				oControl.setValueState("None");
				oControl.setValueStateText("");
			}
		} catch (e) {}
	}

	/**
	 * Function 
	 * @param {function} patternName 
	 * @return {void} 
	 * @public
	 */
	function getPattern(patternName) {
		if (patternName === "Numaric") {
			return /^\d+$/;
		} else if (patternName === "email") {
			return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
		} else if (patternName === "Empty") {
			return /\S+/;
		} else if (patternName === "Decimal") {
			return /\S+/;
		} else if (patternName === "AlphaNumb") {
			return /^[a-zA-Z0-9,-_./:!@#$&*]+$/;
		}
	}

}, /* bExport= */ true);