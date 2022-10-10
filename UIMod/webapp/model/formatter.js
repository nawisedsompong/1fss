sap.ui.define([], function () {
	"use strict";
	return {

		oClaimDesc: function (key) {
			switch (key) {
			case "MC":
				return "Medical Claim";
			case "TIM":
				return "Timesheet";
			case "WRC":
				return "Work Related Claim";
			case "WRC_HR":
				return "Work Related Claim(HR)";
			case "TC":
				return "Transport Claim";
			case "WIC":
				return "Work Injury Compensation";
			case "LIC":
				return "License Reimbursement";
			case "MSR":
				return "Medical Staff Reimbursement";
			case "AHP":
				return "AHP Reimbursement";
			case "CLS":
				return "ACLS/BCLS";
			case "COV":
				return "On-Boarding Reimbursement";
			case "PC":
				return "Petty Cash";
			case "PTF":
				return "Personal Training Fund";
			case "SP":
				return "Sponsorship Exit Exam";
			case "SP1":
				return "Sponsorship International Conference";
			case "SP2":
				return "Sponsorship Regional Conference";
			case "SP3":
				return "Sponsorship Intermediate Exam";
			case "SDFR":
				return "SDF Request";
			case "SDFC":
				return "SDF Claims";
			case "PAY_UP":
				return "Payment Upload";
			case "OC":
				return "Other Claims";
			case "CPC":
				return "Clinical Placement Claim";
			case "CPR":
				return "Clinical Placement Request";
			default:
				return key;
			}
		},

		oClaimCategDesc: function (key, code, desc) {
			switch (key) {
			case "COV":
				return "On-Boarding Reimbursement";
			case "SP":
				return "Sponsorship Exit Exam";
			case "SP1":
				return "Sponsorship International Conference";
			case "SP2":
				return "Sponsorship Regional Conference";
			case "SP3":
				return "Sponsorship Intermediate Exam";
			case "TC":
				return "Transport Claim";
			case "WRC":
				return "Work Related Claim";
			case "WRC_HR":
				return "Work Related Claim(HR)";
			case "SDFR":
				return "SDF Request";
			case "SDFC":
				return "SDF Claims";
			case "PAY_UP":
				if (code) {
					return code + ", " + desc;
				} else {
					return "Payment Upload";
				}
			case "OC":
				return "Other Claims";
			case "CPC":
				return "Clinical Placement Claim";
			case "CPR":
				return "Clinical Placement Request";
			default:
				return key;
			}
		},

		oSPDesc: function (key) {
			switch (key) {
			case "SP":
				return "Sponsorship Exit Exam";
			case "SP1":
				return "Sponsorship International Conference";
			case "SP2":
				return "Sponsorship Regional Conference";
			case "SP3":
				return "Sponsorship Intermediate Exam";
			default:
				return key;
			}
		},

		oClaimText: function (sStatus) {
			switch (sStatus) {
			case "MC":
				return true;
			case "B":
				return true;
			case "C":
				return true;
			default:
				return false;
			}
		},

		oPlusVisible: function (mode, tile) {
			if (mode || tile !== "History") {
				return false;
			} else {
				return true;
			}
		},

		oApproverVis: function (app, deleg) {
			if ((deleg === "" || deleg === undefined || deleg === null) && (app === "" || app === undefined || app === null)) {
				return "N/A";
			} else if (deleg === "" || deleg === undefined || deleg === null) {
				return app;
			} else if (deleg !== "") {
				return deleg;
			} else {
				return "N/A";
			}
		},

		oReceiptDatevisible: function (key) {
			if (key === "WRC" || key === "WRC_HR" || key === "COV" || key === "TC" || key === "SP" || key === "SP1" || key === "SP2" || key ===
				"SP3") {
				return false;
			} else {
				return true;
			}
		},

		oClaimDate: function (oDate) {
			if (oDate) {
				var date = oDate.split("-");
				return date[2].substring(0, 2) + "." + date[1] + "." + date[0];
			} else {
				return oDate;
			}
		},

		DateStamp: function (oDate) {
			if (oDate) {
				var dateT = oDate.split("T")[0],
					date = dateT.split("-"),
					time = oDate.split("T")[1];
				return date[2].substring(0, 2) + "." + date[1] + "." + date[0] + " - " + time.substring(0, time.length - 1);
			} else {
				return oDate;
			}
		},

		oCummulative: function (key) {
			switch (key) {
			case "1":
				return "Honours";
			case "2":
				return "Honours - 1st Class";
			case "3":
				return "Honours - 2nd Class";
			case "4":
				return "Honours - 2nd Lower";
			case "5":
				return "Honours - 2nd Upper";
			case "6":
				return "Honours - 3rd Class";
			case "7":
				return "Honours - Distinction";
			case "8":
				return "Cum Laude";
			case "9":
				return "Magna Cum Laude";
			case "10":
				return "Summa Cum Laude";
			case "11":
				return "Merit";
			case "12":
				return "Passed";
			default:
				return "-";
			}
		},

		oBalanc: function (entit, taken, pend, sdfpend) {
			var oTot = entit - taken - pend - sdfpend;
			return parseFloat(oTot).toFixed(2);
		},

		Optsent: function (a, b) {
			var rt = parseFloat(a, 2) + parseFloat(b, 2);
			return rt.toFixed(2);
		},

		oPayupLine: function (code, desc) {
			if (code) {
				return code + " - " + desc;
			} else {
				return "";
			}
		},

		oSlashLine: function (a, b) {
			if (a) {
				return a + " / " + b;
			} else {
				return "";
			}
		},

		oClaimRef: function (key, okey) {
			if (okey) {
				return "Original Claim Ref: " + okey;
				// return "";
			} else if (key) {
				return "Claim Cancel Ref: " + key;
			} else {
				return "";
			}
		},

		oClaimCatHosp: function (key) {
			if (key === "DEN_EFMR" || key === "HOSPS_EFMR" || key === "OPTS_EFMR") {
				return false;
			} else {
				return true;
			}
		},

		oApprovalTile: function (sch, mohh) {
			if (mohh === "Yes" && sch === "Yes") {
				return true;
			} else if (sch === "Yes" && !mohh) {
				return false;
			} else {
				return true;
			}
		},

		oClaimStatus: function (key, cancel, payRoll, ccode, tilename) {
			if (key === "Cancelled" || key === "Rejected" || key === "Cancellation Approved") {
				return false;
			} else if (ccode === "SDFR" || ccode === "SDFC" || ccode === "CPR" || ccode === "CPC" || ccode === "OC" || ccode === "PAY_UP") {
				if (key === "Cancellation Pending for approval, Level 3" || key === "Cancellation Pending for approval, Level 4" || key ===
					"Pending for approval, Level 3" || key === "Pending for approval, Level 4" || key === "Approved") {
					return false;
				}
			} else if (ccode === "PAY_UP" && (tilename === "History")) {
				return false;
			} else {
				return true;
			}
		},

		oClinicDesc: function (key) {
			switch (key) {
			case "AEG":
				return "A&E Government Hospitals";
			case "AEP":
				return "A&E Private Hospitals";
			case "CHOS":
				return "Community Hospitals";
			case "GP":
				return "General Practitioner";
			case "GHOS":
				return "Government Hospitals";
			case "null":
				return "Not Applicable";
			case "PNC":
				return "Panel Clinic";
			case "PC":
				return "Polyclinic";
			case "PHOS":
				return "Private Hospitals";
			default:
				return key;
			}
		},

		oTileInfo: function (key) {
			switch (key) {
			case "ADMIN":
				return "Benefit Administration";
			case "CO_PAY":
				return "Co-Payment";
			case "APPROVAL":
				return "Approval Structure";
			case "ELIG":
				return "Eligibility Rule";
			case "ON_BEHALF":
				return "Create/Modify Claim";
			case "TAB_MAIN":
				return "Table Maintenance";
			case "TAB_MAINSC":
				return "Table Maintenance (Scholar)";
			case "MED_SAV":
				return "Medisave Crediting";
			case "YTD":
				return "Year to Date Balance Report";
			case "CLM_REC":
				return "Claim Record Report";
			case "INTER":
				return "Interim Report";
			case "RE_ROUTE":
				return "Mass Re-Route";
			case "CLM_UPL":
				return "Claim(s) Upload";
			case "UPL_CONF":
				return "Upload Config Data";
			case "DELEG":
				return "Admin Delegate Action";
			case "COORD":
				return "Claim Coordinator";
			case "ROLE":
				return "Admin Role";
			case "TAB_ADMIN":
				return "Administration Section Tab";
			case "TAB_ADMSCH":
				return "SMS Admin";
			case "APP_MOHH":
				return "Claim Approvals";
			case "APP_SCH":
				return "SMS Approvals";
			case "COORQ_MOHH":
				return "Claim Coordinator Request";
			case "COORE_MOHH":
				return "Claim Coordinator Record";
			case "COORQ_SCH":
				return "Claim Coordinator Request (Scholar)";
			case "COORE_SCH":
				return "Claim Coordinator Record (Scholar)";
			case "BEHALF_SCH":
				return "Create On-Behalf (Scholar)";
			case "SMS_REP":
				return "SMS Master Report";
			case "PAY_UP":
				return "Payment Upload";
			case "PAY_HIS":
				return "Payment Upload Record";
			case "IMP_POS":
				return "Import Posting";
			case "ENT_ADJ":
				return "Entitlement Adjustment";
			case "HRMC":
				return "HR Maker/Checker";
			default:
				return key;
			}
		},

		oClaimWards: function (key) {
			if (key === "HOSPS" || key === "HOSPD") {
				return true;
			} else {
				return false;
			}
		},

		oClaimWardsR: function (key) {
			if (key === "HOSPS" || key === "HOSPD") {
				return false;
			} else {
				return true;
			}
		},

		oClaimCatHospSelf: function (key) {
			if (key === "DEN" || key === "HOSPS" || key === "HOSPS_Day" || key === "OPTS" || key === "SPTS") {
				return true;
			} else {
				return false;
			}
		},

		oClaimCatHospDP: function (key) {
			if (key === "HOSPD" || key === "HOSPD_Day" || key === "OPTD" || key === "SPTD") {
				return true;
			} else {
				return false;
			}
		},

		oClaimHospDep: function (key) {
			if (key === "OPTD") {
				return true;
			} else {
				return false;
			}
		},

		oClaimUnit: function (key) {
			if (key === "WRCPHNONWD" || key === "WRCWKONPH") {
				return false;
			} else {
				return true;
			}
		},

		oClaimUnitR: function (key) {
			if (key === "WRCPHNONWD" || key === "WRCWKONPH") {
				return true;
			} else {
				return false;
			}
		},

		oVisibleUnit: function (key) {
			if (key === "KKH" || key === "LOCUM" || key === "MRF" || key === "NSCNC" || key === "WRCM") {
				return true;
			} else {
				return false;
			}
		},

		oVisibleUnitR: function (key) {
			if (key === "KKH" || key === "LOCUM" || key === "MRF" || key === "NSCNC" || key === "WRCM") {
				return false;
			} else {
				return true;
			}
		},

		oClaimUnitHR: function (val, key) {
			if (key === "KKH" || key === "LOCUM" || key === "MRF" || key === "NSCNC" || key === "WRCM") {
				return "-";
			} else {
				return val;
			}
		},

		emptyDecimal: function (oKey) {
			if (oKey === "" || oKey === 0) {
				return "0.00";
			}
			return oKey;
		},

		oSPVisible: function (a) {
			if (a === "SP" || a === "SP1" || a === "SP2" || a === "SP3") {
				return true;
			} else {
				return false;
			}
		},

		oSubmitVisible: function (a, b, c, d) {
			if (a === true && b === true && (c === "History" || c === "HistoryCoord" || c === "PaymentUpload")) {
				return true;
			} else if (a === true && b === true && (c === "Admin" || c === "Coordinat" || c === "CoordinatSch") && d === "H") {
				return true;
			} else if (a === false && b === true) {
				return true;
			} else {
				return false;
			}
		},

		oCopyVisible: function (oKey) {
			if (oKey === "WRC" || oKey === "WRC_HR" || oKey === "SP" || oKey === "SP1" || oKey === "SP2" || oKey === "SP3" || oKey === "COV" ||
				oKey === "TC") {
				return true;
			} else {
				return false;
			}
		},

		oClaimCopyStatus: function (status, key, ccode, tilename) {
			if (ccode === "PAY_UP" && (tilename === "History")) {
				return false;
			} else if (status === "Cancelled" || status === "Rejected" || status === "Cancellation Approved") {
				return true;
			} else {
				return false;
			}
		},

		onEditline: function (code) {
			var array = this.oViewData.getData().Approvers[0],
				isValidate = true;

			var aDupRec = $.grep(array, function (obj, index) {
				return obj.Claim_Code === code && obj.Allow_Approver === "No";
			});
			if (aDupRec.length > 0) {
				isValidate = false;
			}
			return isValidate;
		},

		oPending: function (val) {
			if (val > 0) {
				return val;
			} else {
				return 0.00;
			}
		},

		emptyText: function (oKey) {
			if (oKey === "" || oKey === null) {
				return "-";
			}
			return oKey;
		}

	};
});