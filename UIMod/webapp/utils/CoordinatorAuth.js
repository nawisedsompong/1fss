sap.ui.define([
	"sap/ui/model/json/JSONModel"
], function (JSONModel) {
	"use strict";

	return {

		_filterValue: function (that, aData, sRegularExp, jsMappingField) {

			var deferred = $.Deferred();

			var jsEmpData = that.getModel("oEmpData").getData();
			var sEmpPernr = jsEmpData.USERID;

			var oDate = new Date().toISOString().substring(0, 10);
			var sURL = "/BenefietCAP/claim/CLAIM_COORDINATOR?$filter=COORDINATOR eq '" + sEmpPernr + "'";
			sURL = sURL + " and STARTDATE le " + oDate + " and ENDDATE ge " + oDate;
			$.ajax({
				async: false,
				url: sURL,
				method: "GET",
				crossDomain: true,
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json"
				},
				success: function (authData, oResponse) {
					deferred.resolve(that._CoordinatorAuth._scanByPermission(that, aData, sRegularExp, jsMappingField, authData.value), oResponse);
				}.bind(that),
				error: function (xhr, ajaxOptions, throwError) {
					deferred.reject(xhr, ajaxOptions, throwError);
				}.bind(that)
			});
			return deferred.promise();
		},
		_scanByPermission: function (that, aData, sRegularExp, jsMappingField, aAuthData) {

			var aAuthDataTmp = $.extend([], aAuthData);
			var aDataTmp = $.extend([], aData);

			for (var i = 0; i < aAuthDataTmp.length; i++) {

				var sRegularExpTmp = sRegularExp;

				for (var j = 0; j < aDataTmp.length; j++) {

					if (aDataTmp[j].IsSelected === undefined) {

						if (jsMappingField.EMPLOYEE_ID !== null) {
							var sRexEMPLOYEE_ID = "";
							if (aAuthDataTmp[i].EMPLOYEE_ID.toString().trim() === "ALL" || aAuthDataTmp[i].EMPLOYEE_ID.toString().trim() === "N/A") {
								sRexEMPLOYEE_ID = "[0-9]+";
							} else {
								sRexEMPLOYEE_ID = aAuthDataTmp[i].EMPLOYEE_ID;
							}
							sRegularExpTmp = sRegularExpTmp.replaceAll("{" + jsMappingField.EMPLOYEE_ID + "}", sRexEMPLOYEE_ID);
						}

						if (jsMappingField.PAY_GRADE !== null) {
							var sRexPAY_GRADE = "";
							if (aAuthDataTmp[i].PAY_GRADE.toString().trim() === "ALL" || aAuthDataTmp[i].PAY_GRADE.toString().trim() === "N/A") {
								sRexPAY_GRADE = ".*";
							} else {
								sRexPAY_GRADE = aAuthDataTmp[i].PAY_GRADE;
							}
							sRegularExpTmp = sRegularExpTmp.replaceAll("{" + jsMappingField.PAY_GRADE + "}", sRexPAY_GRADE);
						}

						if (jsMappingField.PERSONNEL_AREA !== null) {
							var sRexPERSONNEL_AREA = "";
							if (aAuthDataTmp[i].PERSONNEL_AREA.toString().trim() === "ALL" || aAuthDataTmp[i].PERSONNEL_AREA.toString().trim() === "N/A") {
								sRexPERSONNEL_AREA = ".*";
							} else {
								sRexPERSONNEL_AREA = aAuthDataTmp[i].PERSONNEL_AREA;
							}
							sRegularExpTmp = sRegularExpTmp.replaceAll("{" + jsMappingField.PERSONNEL_AREA + "}", sRexPERSONNEL_AREA);
						}

						if (jsMappingField.PERSONAL_SUBAREA !== null) {
							var sRexPERSONAL_SUBAREA = "";
							if (aAuthDataTmp[i].PERSONAL_SUBAREA.toString().trim() === "ALL" || aAuthDataTmp[i].PERSONAL_SUBAREA.toString().trim() === "N/A") {
								sRexPERSONAL_SUBAREA = ".*";
							} else {
								sRexPERSONAL_SUBAREA = aAuthDataTmp[i].PERSONAL_SUBAREA;
							}
							sRegularExpTmp = sRegularExpTmp.replaceAll("{" + jsMappingField.PERSONAL_SUBAREA + "}", sRexPERSONAL_SUBAREA);
						}
						
						if (jsMappingField.EMPLOYEE_DEPARTMENT !== null) {
							var sRexEMPLOYEE_DEPARTMENT = "";
							if (aAuthDataTmp[i].EMPLOYEE_DEPARTMENT.toString().trim() === "ALL" || aAuthDataTmp[i].EMPLOYEE_DEPARTMENT.toString().trim() ===
								"N/A") {
								sRexEMPLOYEE_DEPARTMENT = "[0-9]+";
							} else {
								sRexEMPLOYEE_DEPARTMENT = aAuthDataTmp[i].EMPLOYEE_DEPARTMENT;
							}
							sRegularExpTmp = sRegularExpTmp.replaceAll("{" + jsMappingField.EMPLOYEE_DEPARTMENT + "}", sRexEMPLOYEE_DEPARTMENT);
						}

						if (jsMappingField.EMPLOYEE_DIVISION !== null) {
							var sRexEMPLOYEE_DIVISION = "";
							if (aAuthDataTmp[i].EMPLOYEE_DIVISION.toString().trim() === "ALL" || aAuthDataTmp[i].EMPLOYEE_DIVISION.toString().trim() ===
								"N/A") {
								sRexEMPLOYEE_DIVISION = "[0-9]+";
							} else {
								sRexEMPLOYEE_DIVISION = aAuthDataTmp[i].EMPLOYEE_DIVISION;
							}
							sRegularExpTmp = sRegularExpTmp.replaceAll("{" + jsMappingField.EMPLOYEE_DIVISION + "}", sRexEMPLOYEE_DIVISION);
						}

						if (jsMappingField.SPONSOR_INSTITUTION !== null) {
							var sRexSPONSOR_INSTITUTION = "";
							if (aAuthDataTmp[i].SPONSOR_INSTITUTION.toString().trim() === "ALL" || aAuthDataTmp[i].SPONSOR_INSTITUTION.toString().trim() ===
								"N/A") {
								sRexSPONSOR_INSTITUTION = "[0-9]+";
							} else {
								sRexSPONSOR_INSTITUTION = aAuthDataTmp[i].SPONSOR_INSTITUTION;
							}
							sRegularExpTmp = sRegularExpTmp.replaceAll("{" + jsMappingField.SPONSOR_INSTITUTION + "}", sRexSPONSOR_INSTITUTION);
						}
						
						if (jsMappingField.SPECIALISATION !== null) {
							var sRexSPECIALISATION = "";
							if (aAuthDataTmp[i].SPECIALISATION.toString().trim() === "ALL" || aAuthDataTmp[i].SPECIALISATION.toString().trim() ===
								"N/A") {
								sRexSPECIALISATION = "[0-9]+";
							} else {
								sRexSPECIALISATION = aAuthDataTmp[i].SPECIALISATION;
							}
							sRegularExpTmp = sRegularExpTmp.replaceAll("{" + jsMappingField.SPECIALISATION + "}", sRexSPECIALISATION);
						}
						
						
						if (new RegExp(sRegularExpTmp, 'g').test(JSON.stringify(aDataTmp[j]))) {
							aDataTmp[j].IsSelected = true;
							continue;
						}

					}
				}

			}
			// console.log(JSON.stringify(authData.value));
			var aResult = [];
			for (var k = 0; k < aDataTmp.length; k++) {

				if (aDataTmp[k].IsSelected === true) {
					delete aDataTmp[k].IsSelected;
					aResult.push(aDataTmp[k]);
				}

			}

			return aResult;
		}

	};
});