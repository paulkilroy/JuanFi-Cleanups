var timer = null;
var uptimeMilis = 0;
var upTimeSeconds = 0;
var separator = "|";
var rowSeparator = "#";
var hardwareType = "ESP32";
var interfaceType = "WIRELESS";
var version = "3.0";
var chargerTimer = "";
var rateType = "1";
var macAddress = "";

function onBodyLoad(){

	$("#logoImg").attr("src", "admin/image/logo.png");
	var token = localStorage.getItem("token");
	$.ajaxSetup({headers: {"X-TOKEN": token}});
	$(document).on('ajaxError', function(event, xhr) {
	  if (xhr.status === 401 || xhr.status === 403) {
		localStorage.removeItem("token");
		window.location = "/login";
	  }
	});
	openDashboard(this); 

	$(".wrapper .sidebar ul li").on('click', function(e){
		$(this).addClass('active').siblings().removeClass('active');
		if($("#mobileVersion").css("display") == "block"){
			document.querySelector(".menu-container ").classList.toggle("active");
			document.querySelector(".content-container ").classList.toggle("active");
		}
	});
	
	var hamburger = document.querySelector(".section .hamburger");
		hamburger.addEventListener("click", function () {
		document.querySelector(".menu-container ").classList.toggle("active");
		document.querySelector(".content-container ").classList.toggle("active");
	});
}

function saveSystemConfig(){

	var coinSlotPin = $('#coinSlotPin').val();
	var coinSlotSetPin = $('#coinSlotSetPin').val();
	var systemReadyLEDPin = $('#systemReadyLEDPin').val();
	var insertCoinLEDPin = $('#insertCoinLEDPin').val();
	var insertCoinBtnPin = $('#insertCoinBtnPin').val();
	var nightLightPin = $('#nightLightPin').val();
	var lcdSDAPin = $('#lcdSDAPin').val();
	var lcdSCLPin = $('#lcdSCLPin').val();
	var billAcceptorPin = $('#billAcceptorPin').val();
	var thermalPrinterPin = $('#thermalPrinterPin').val();
	var buzzerPin = $('#buzzerPin').val();
	
	var pinMap = [];
	pinMap['Coinslot Pin'] = coinSlotPin;
	pinMap['Coinslot Set Pin'] = coinSlotSetPin;
	pinMap['System Ready Pin'] = systemReadyLEDPin;
	pinMap['Insert Coin LED Pin'] = insertCoinLEDPin;
	pinMap['Insert Coin Button Pin'] = insertCoinBtnPin;
	pinMap['Night Light Pin'] = nightLightPin;
	pinMap['LCD SDA Pin'] = lcdSDAPin;
	pinMap['LCD SCL Pin'] = lcdSCLPin;
	pinMap['Bill Acceptor Pin'] = billAcceptorPin;
	pinMap['Thermal Printer Pin'] = thermalPrinterPin;
	pinMap['Buzzer Pin'] = buzzerPin;
	
	
	if($('#mikrotikPw').val() != $('#confirmMikrotikPw').val()){
		alert('Mikrotik password is not equal to confirm mikrotik password');
		return;
	}
	
	if($('#adminPw').val() != $('#confirmAdminPw').val()){
		alert('Admin password is not equal to confirm admin password');
		return;
	}
	
	if($('#operatorPw').val() != $('#confirmOperatorPw').val()){
		alert('Operator password is not equal to confirm operator password');
		return;
	}
	
	if(!validateCoinSlotPin(pinMap)){
		return;
	}
	
	var ipAddressMode = $("#ipAddressMode").val();
	
	var localIpAddress = $("#localIpAddress").val();
	var gatewayIp = $("#gatewayIp").val();
	var subnetMask = $("#subnetMask").val();
	var dnsServer = $("#dnsServer").val();
	
	var ipAddressFields = [];
	ipAddressFields['Local IP Address'] = localIpAddress;
	ipAddressFields['Gateway IP Address'] = gatewayIp;
	ipAddressFields['Subnet Mask Address'] = subnetMask;
	ipAddressFields['DNS Server Address'] = dnsServer;
	
	if(ipAddressMode == 1 && (!validateIpAddressFields(ipAddressFields))){
		return;
	}
	
	$('#setupDoneFlag').val("1");
	$('#lanModeOverride').val("1");

	var postData = createParam([
				$('#vendoName').val(),
				$('#wifiSSID').val(),
				$('#wifiPW').val(),
				$('#mikrotikIp').val(),
				$('#mikrotikUser').val(),
				$('#mikrotikPw').val(),
				$('#coinSlotWaitTime').val(),
				$('#adminUser').val(),
				$('#adminPw').val(),
				$('#coinSlotAbuseCount').val(),
				$('#coinSlotBanMinutes').val(),
				coinSlotPin,
				coinSlotSetPin,
				systemReadyLEDPin,
				insertCoinLEDPin,
				$('#lcdScreen').val(),
				insertCoinBtnPin,
				$('#checkInternetStatus').val(),
				$('#voucherPrefix').val(),
				$('#welcomeLCDMarquee').val(),
				$('#setupDoneFlag').val(),
				$('#voucherLoginOption').val(),
				$('#voucherProfile').val(),
				$('#voucherValidity').val(),
				$('#ledTriggerType').val(),
				ipAddressMode,
				localIpAddress,
				gatewayIp,
				subnetMask,
				dnsServer,
				$('#coinSlotType').val(),
				$('#singleCoinPulseCount').val(),
				$('#mtConnectionMode').val(),
				$('#operatorUser').val(),
				$('#operatorPw').val(),
				$('#apiKey').val(),
				nightLightPin,
				$('#buttonFunction').val(),
				$('#voucherLength').val(),
				$('#coinMultiplier').val(),
				$('#lanModeOverride').val(),
				lcdSDAPin,
				lcdSCLPin,
				billAcceptorPin,
				$('#billAcceptorMultiplier').val(),
				thermalPrinterPin,
				$('#printOption').val(),
				$('#printOptionCriteria').val(),
				$('#lanCSPin').val(),
				$('#persistLogs').val(),
				$('#includeVendoName').val(),
				$('#welcomeTextFirstLine').val(),
				$('#welcomeTextThirdLine').val(),
				$('#insertCoinText').val(),
				$('#thankYouText').val(),
				$('#restartSchedule').val(),
				$('#blackoutDetection').val(),
				buzzerPin,
				$('#printerBaudRate').val(),
				$('#pulseToBlock').val(),
				$('#thankYouTimeout').val()
			 ]);
				 
/* PSK Change to use fetch() with credentials to automatically pass the token hash
fetch('https://example.com', {
	credentials: 'include'
});
*/
	$.ajax({
	  type: "POST",
	  url: "admin/api/saveSystemConfig",
	  data: "data="+postData,
	  success: function(data){
		alert('Configuration save succesfully!, System will restart now to take effect....');
	  },
	  error: function(XMLHttpRequest, textStatus, errorThrown) { 
		alert("Error: " + errorThrown); 
	  } 
	});
}

function validateCoinSlotPin(pinMap){
	for(var i in pinMap){
		for(var j in pinMap){
			if(i != j){
				if(pinMap[i] != "-1" && pinMap[i] == pinMap[j]){
					alert(j + ' is already used by ' + i);
					return false;
				}
			}
		}
	}
	return true;
}


function savePromoRates(){
	var params = [];
	var validRates = 0;
	var ratesData = [];
	for(var i=0;i<100;i++){
		var rateNameText = $("#rateNameText"+i).val();
		var priceText = $("#priceText"+i).val();
		var minutesText = $("#minutesText"+i).val();
		if(rateType == "1" || rateType == ""){
			var validityText = $("#validityText"+i).val();
			var dataLimitText = $("#dataLimitText"+i).val();
			var profileNameText = $("#profileNameText"+i).val();
			if(rateNameText != null && priceText != null && minutesText != null && validityText != null){
				var rateData = {rateNameText, priceText, minutesText, validityText, dataLimitText, profileNameText};
				ratesData.push(rateData);
				validRates++;
			}
		}else{
			if(rateNameText != null && priceText != null && minutesText){
				var rateData = {rateNameText, priceText, minutesText};
				ratesData.push(rateData);
				validRates++;
			}
		}
	}

	ratesData.sort(function(a, b){return a.priceText - b.priceText});

	for(var i=0;i<validRates;i++){
		var curData = ratesData[i];
		if(rateType == "1" || rateType == ""){
			params.push(curData.rateNameText+"#"+curData.priceText+"#"+curData.minutesText+"#"+curData.validityText+"#"+curData.dataLimitText+"#"+curData.profileNameText);
		}else{
			params.push(curData.rateNameText+"#"+curData.priceText+"#"+curData.minutesText);
		}
	}

	var postData = createParam(params);
	$.ajax({
	  type: "POST",
	  url: "admin/api/saveRates?rateType="+rateType,
	  data: "data="+postData,
	  success: function(data){
		alert('Configuration save succesfully!');
	  },
	  error: function(XMLHttpRequest, textStatus, errorThrown) { 
		alert("Error: " + errorThrown); 
	  } 
	});
}

function createParam(params){
	var data = "";
	for(var i=0;i<params.length;i++){
		if(i>0){
			data += separator;
		}
		data += params[i];
	}
	return encodeURI(data);
}

function resetStats(type){
	var r = confirm("Are you sure you want to reset statistic?");
	if (r == true) {
		$.ajax({
		  type: "GET",
		  url: "admin/api/resetStatistic?type="+type,
		  success: function(data){
			if(type == 'monthlySales' || type == 'dailySales'){
				salesDetail();
			}else{
				openDashboard(null);
			}
		  }
		});
	}
}

function openDashboard(evt){

	$.ajax({
	  type: "GET",
	  url: "admin/api/dashboard?query="+new Date().getTime(),
	  success: function(data){
		if(timer != null){
			clearInterval(timer);
			timer = null;
		}
		var dashboardData = data.split(separator);
		uptimeMilis = dashboardData[0];
		upTimeSeconds = (parseInt(dashboardData[0])/1000);
		timer = setInterval(function(){
			upTimeSeconds++;
			$('#upTime').html(secondsToDhms(upTimeSeconds));
		}, 1000);
		
		$('#lifeCoinCount').html(dashboardData[1]);
		$('#coinCount').html(dashboardData[2]);
		$('#customerCount').html(dashboardData[3]);
		if(dashboardData[4] == "1"){
			$('#internetStatus').html("Online").css("color","green");	
		}else{
			$('#internetStatus').html("Offline").css("color","red");
		}
		if(dashboardData[5] == "1"){
			$('#mikrotikStatus').html("Online").css("color","green");
			$('#restartMikrotikBtn').attr('style', 'display: block');
		}else{
			$('#mikrotikStatus').html("Offline").css("color","red");
			$('#restartMikrotikBtn').attr('style', 'display: none');
		}
		macAddress = dashboardData[6];
		$('#macAddress').html(macAddress);
		$('#ipAddress').html(dashboardData[7]);
		hardwareType = dashboardData[8];
		$('#hardwareType').html(hardwareType);
		version = dashboardData[9];
		$('#appVersionAbout').html(version);
		$('#currentVersion').html(version);
		interfaceType = dashboardData[10];
		$('#interfaceType').html(interfaceType);
		$('#freeHeap').html(dashboardData[12]);
		populatePinFields();
		if(hardwareType == 'ESP32'){
			if(interfaceType == "LAN"){
				$('#apSettingDiv').attr('style','display: none');
			}else{
				$('#signalStrength').html(dashboardData[11]+"%");
				$('#lanCSPinDiv').attr('style','display: none');
			}
		}else{
			$('[featureType="ESP32"]' ).attr("style", "display: none");
			if(interfaceType == "LAN"){
				$('#apSettingDiv').attr('style','display: none');
			}else{
				$('#signalStrength').html(dashboardData[11]+"%");
				$('#lanCSPinDiv').attr('style','display: none');
			}
		}
		var authType = dashboardData[13];
		if(authType == '2'){
			$("#systemConfigMenu").attr("style", "display: none");
			$("#firmwareUpdateMnu").attr("style", "display: none");
		}
		var nightLightStatus = dashboardData[14];
		if(nightLightStatus == 1){
			$('#nightLightToggle').attr("style", 'background-color: #05c46b;');
			$('#nightLightToggle').html("ON");
		}else{
			$('#nightLightToggle').attr("style", 'background-color: #eb2f06');
			$('#nightLightToggle').html("OFF");
		}
		activeUserCount = parseInt(dashboardData[15]);
		$("#activeUsers").html(dashboardData[15]);

		if (dashboardData[16]){
			$('#systemClock').html(new Date(parseInt(dashboardData[16])*1000));
		}
	  }
	});
	
	openTab(evt, 'Dashboard');
}

function populatePinFields(){
	if(hardwareType == 'ESP32'){
		$('select[name*="Pin"]' ).each(function( index ) {
			  $(this).html(""); 	
			  $(this)
			    .append(new Option("NONE", "-1"))
				.append(new Option("P0", "0"))
				.append(new Option("P1", "1"))
				.append(new Option("P2", "2"))
				.append(new Option("P3", "6"))
				.append(new Option("P4", "4"))
				.append(new Option("P5", "5"))
				.append(new Option("P6", "6"))
				.append(new Option("P7", "7"))
				.append(new Option("P8", "8"))
				.append(new Option("P9", "9"))
				.append(new Option("P10", "10"))
				.append(new Option("P11", "11"))
				.append(new Option("P12", "12"))
				.append(new Option("P13", "13"))
				.append(new Option("P14", "14"))
				.append(new Option("P15", "15"))
				.append(new Option("P16", "16"))
				.append(new Option("P17", "17"))
				.append(new Option("P21", "21"))
				.append(new Option("P22", "22"))
				.append(new Option("P25", "25"))
				.append(new Option("P26", "26"))
				.append(new Option("P27", "27"))
				.append(new Option("P32", "32"))
				.append(new Option("P33", "33"))
				.append(new Option("P34", "34"))
				.append(new Option("P35", "35"))
				.append(new Option("P36", "36"))
				.append(new Option("P39", "39"));
			});
	}else{
		$('select[name*="Pin"]' ).each(function( index ) {
			$(this).html(""); 	
			$(this)
			  .append(new Option("NONE", "-1"))
			  .append(new Option("D0", "16"))
			  .append(new Option("D1", "5"))
			  .append(new Option("D2", "4"))
			  .append(new Option("D3", "0"))
			  .append(new Option("D4", "2"))
			  .append(new Option("D5", "14"))
			  .append(new Option("D6", "12"))
			  .append(new Option("D7", "13"))
			  .append(new Option("D8", "15"))
			  .append(new Option("RX", "3"));
		  });
	}
	
}

function openSystemConfig(evt){
	$.ajax({
	  type: "GET",
	  url: "admin/api/getSystemConfig?query="+new Date().getTime(),
	  success: function(data){
		populateSystemConfigFields(data);
	  }
	});
	openTab(evt, 'SystemConfigration');
}

function populateSystemConfigFields(data){
	var configData = data.split(separator);
	$('#vendoName').val(configData[0]);
	$('#wifiSSID').val(configData[1]);
	$('#wifiPW').val(configData[2]);
	$('#mikrotikIp').val(configData[3]);
	$('#mikrotikUser').val(configData[4]);
	$('#mikrotikPw').val(configData[5]);
	$('#confirmMikrotikPw').val(configData[5]);
	$('#coinSlotWaitTime').val(configData[6]);
	$('#adminUser').val(configData[7]);
	$('#adminPw').val(configData[8]);
	$('#confirmAdminPw').val(configData[8]);
	$('#coinSlotAbuseCount').val(configData[9]);
	$('#coinSlotBanMinutes').val(configData[10]);
	$('#coinSlotPin').val(configData[11]);
	$('#coinSlotSetPin').val(configData[12]);
	$('#systemReadyLEDPin').val(configData[13]);
	$('#insertCoinLEDPin').val(configData[14]);
	$('#lcdScreen').val(configData[15]);
	$('#lcdScreen').change();
	$('#insertCoinBtnPin').val(configData[16]);
	$('#checkInternetStatus').val(configData[17]);
	$('#voucherPrefix').val(configData[18]);
	$('#welcomeLCDMarquee').val(configData[19]);
	$('#setupDoneFlag').val(configData[20]);
	$('#voucherLoginOption').val(configData[21]);
	$('#voucherProfile').val(configData[22]);
	$('#voucherValidity').val(configData[23]);
	$('#ledTriggerType').val(configData[24]);
	$("#ipAddressMode").val(configData[25]);
	$("#ipAddressMode").change();
	$("#localIpAddress").val(configData[26]);
	$("#gatewayIp").val(configData[27]);
	$("#subnetMask").val(configData[28]);
	$("#dnsServer").val(configData[29]);
	if(configData[30] != null && configData[30] != ""){
		$('#coinSlotType').val(configData[30]);
		$('#coinSlotType').change();
	}
	if(configData[31] != null && configData[31] != ""){
		$('#singleCoinPulseCount').val(configData[31]);
	}
	if(configData[32] != null && configData[32] != ""){
		$('#mtConnectionMode').val(configData[32]);
	}
	if(configData[33] != null && configData[33] != ""){
		$('#operatorUser').val(configData[33]);
	}
	if(configData[34] != null && configData[34] != ""){
		$('#operatorPw').val(configData[34]);
		$('#confirmOperatorPw').val(configData[34]);
	}
	if(configData[35] != null && configData[35] != ""){
		$('#apiKey').val(configData[35]);
	}
	if(configData[36] != null && configData[36] != ""){
		$('#nightLightPin').val(configData[36]);
	}

	if(configData[37] != null && configData[37] != ""){
		$('#buttonFunction').val(configData[37]);
	}

	if(configData[38] != null && configData[38] != ""){
		$('#voucherLength').val(configData[38]);
	}
	
	if(configData[39] != null && configData[39] != ""){
		$('#coinMultiplier').val(configData[39]);
	}
	
	if( configData[40] == null || configData[40] == "" || configData[40] == "0"){
		if(hardwareType != "ESP32" && interfaceType == "LAN"){
			$('#coinSlotPin').val("2");
			$('#coinSlotSetPin').val("15");
			$('#insertCoinBtnPin').val("3");
			$('#systemReadyLEDPin').val("-1");
			$('#insertCoinLEDPin').val("-1");
		}
	}

	if(configData[41] != null && configData[41] != ""){
		$('#lcdSDAPin').val(configData[41]);
	}else{
		if(hardwareType == "ESP32"){
			$('#lcdSDAPin').val("21");
		}else{
			$('#lcdSDAPin').val("4");
		}
	}

	
	if(configData[42] != null && configData[42] != ""){
		$('#lcdSCLPin').val(configData[42]);
	}else{
		if(hardwareType == "ESP32"){
			$('#lcdSCLPin').val("22");
		}else{
			$('#lcdSCLPin').val("5");
		}
	}

	if(configData[43] != null && configData[43] != ""){
		$('#billAcceptorPin').val(configData[43]);
	}
	
	if(configData[44] != null && configData[44] != ""){
		$('#billAcceptorMultiplier').val(configData[44]);
	}

	if(configData[45] != null && configData[45] != ""){
		$('#thermalPrinterPin').val(configData[45]);
	}

	if(configData[46] != null && configData[46] != ""){
		$('#printOption').val(configData[46]);
	}

	if(configData[47] != null && configData[47] != ""){
		$('#printOptionCriteria').val(configData[47]);
	}

	if(configData[48] != null && configData[48] != ""){
		$('#lanCSPin').val(configData[48]);
	}else{
		if(hardwareType == "ESP32"){
			$('#lanCSPin').val("5");
		}else{
			$('#lanCSPin').val("0");
		}
	}

	if(configData[49] != null && configData[49] != ""){
		$('#persistLogs').val(configData[49]);
	}

	if(configData[50] != null && configData[50] != ""){
		$('#includeVendoName').val(configData[50]);
	}

	if(configData[51] != null && configData[51] != ""){
		$('#welcomeTextFirstLine').val(configData[51]);
	}else{
		$('#welcomeTextFirstLine').val("Welcome to");
	}

	if(configData[52] != null && configData[52] != ""){
		$('#welcomeTextThirdLine').val(configData[52]);
	}

	if(configData[53] != null && configData[53] != ""){
		$('#insertCoinText').val(configData[53]);
	}

	if(configData[54] != null && configData[54] != ""){
		$('#thankYouText').val(configData[54]);
	}else{
		$('#thankYouText').val("Thank you!");
	}

	if(configData[55] != null && configData[55] != ""){
		$('#restartSchedule').val(configData[55]);
	}else{
		$('#restartSchedule').val("0");
	}

	if(configData[56] != null && configData[56] != ""){
		$('#blackoutDetection').val(configData[56]);
	}

	if(configData[57] != null && configData[57] != ""){
		$('#buzzerPin').val(configData[57]);
	}

	if(configData[58] != null && configData[58] != ""){
		$('#printerBaudRate').val(configData[58]);
	}else{
		$('#printerBaudRate').val("9600");
	}

	if(configData[59] != null && configData[59] != ""){
		$('#pulseToBlock').val(configData[59]);
	}else{
		$('#pulseToBlock').val("20");
	}

	if(configData[60] != null && configData[60] != ""){
		$('#thankYouTimeout').val(configData[60]);
	}else{
		$('#thankYouTimeout').val("30");
	}
	
}

var rateCount = 0;

var script = " <div id='rateRow' class='rateholder'>";
			script += "<div><span class='rate-title'>Rate Name</span><input type='text' value='rateNameValue' placeholder='Rate Name' id='rateNameText'></div>";
			script += "<div><span class='rate-title'>Price</span><input type='number' value='priceValue' placeholder='Price' id='priceText'></div>";
			script += "<div><span class='rate-title'>Minutes</span><input type='number' value='minutesValue' placeholder='Minutes' id='minutesText'></div>";
			script += "<div><span class='rate-title'>Validity in minutes</span><input type='number' value='validityValue' placeholder='Validity' id='validityText'></div>";
			script += "<div><span class='rate-title'>Data (MB) Limit Usage(Optional)</span><input type='number' value='dataLimitValue' placeholder='Data Limit Usage' id='dataLimitText'></div>";
			script += "<div><span class='rate-title'>User Profile (Optional, it overrides the default profile set in system config)</span><input type='text' value='profileNameValue' placeholder='User Profile' id='profileNameText'></div>";
			script += "<div class='button-grp-horizontal center'><button class='first-btn red-bg' onClick='deleteRate(rateIndex)'>Delete</button></div>";
			script += "</div>";


			
var chargingRateScript = " <div id='rateRow' class='rateholder'>";
			chargingRateScript += "<div><span class='rate-title'>Rate Name</span><input type='text' value='rateNameValue' placeholder='Rate Name' id='rateNameText'></div>";
			chargingRateScript += "<div><span class='rate-title'>Price</span><input type='number' value='priceValue' placeholder='Price' id='priceText'></div>";
			chargingRateScript += "<div><span class='rate-title'>Minutes</span><input type='number' value='minutesValue' placeholder='Minutes' id='minutesText'></div>";
			chargingRateScript += "<div class='button-grp-horizontal center'><button class='first-btn red-bg' onClick='deleteRate(rateIndex)'>Delete</button></div>";
			chargingRateScript += "</div>";

function addRate(){
	var rowData = ["","","","","",""];
	var rowScript = generateRowScript(rateCount, rowData);
	$("#promoRateBody").append(rowScript);
	rateCount++;
}

function deleteRate(index){
	$("#rateRow"+index).remove();
}

function deleteChargingRate(index){
	
	$("#charingRateRow"+index).remove();
}

function openPromoRates(evt){
	populatePromoPage();
	openTab(evt, 'PromoRate');
}

function populatePromoPage(){
	$.ajax({
	  type: "GET",
	  url: "admin/api/getRates?rateType="+rateType+"&query="+new Date().getTime(),
	  success: function(data){
		populateRateFields(data);
	  }
	});
}

function populateRateFields(data){
	var rateData = data.split('|');
	rateCount = 0;
	var html = "";
	for(var i=0;i<rateData.length;i++){
		var rowData = rateData[i].split('#');
		var rowScript = generateRowScript(i, rowData);
		html += rowScript;
		rateCount++;
	}
	$("#promoRateBody").html(html);
}

function openVoucherGenerate(evt){
	openTab(evt, 'VoucherGenerate');
}

function generateRowScript(i , rowData){
	var rowScript = "";
	if(rateType == "1" || rateType == ""){
		rowScript = script.replace("rateNameText", "rateNameText"+i)
		rowScript = rowScript.replace("validityText", "validityText"+i);
		rowScript = rowScript.replace("validityValue", rowData[3]);
		rowScript = rowScript.replace("dataLimitText", "dataLimitText"+i);
		rowScript = rowScript.replace("dataLimitValue", rowData[4]);
		rowScript = rowScript.replace("profileNameText", "profileNameText"+i);
		rowScript = rowScript.replace("profileNameValue", rowData[5]);
	}else{
		rowScript = chargingRateScript.replace("rateNameText", "rateNameText"+i)
	}
	rowScript = rowScript.replace("rateNameValue", rowData[0]);
	rowScript = rowScript.replace("priceText", "priceText"+i);
	rowScript = rowScript.replace("priceValue", rowData[1]);
	rowScript = rowScript.replace("minutesText", "minutesText"+i);
	rowScript = rowScript.replace("minutesValue", rowData[2]);
	rowScript = rowScript.replace("rateIndex", i);
	rowScript = rowScript.replace("rateRow", "rateRow"+i);
	return rowScript;
}


function openTab(evt, tabName) {
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    
  }
  document.getElementById(tabName).style.display = "block";
  if(evt != null && evt.currentTarget != null){
	
  }else{
	$(".wrapper .sidebar ul li").each(function (e,v){
		var tabLink = v.children[0].children[0];
		var tName = $(tabLink).text();
		if(tName.replace(" ","") == tabName){
			$(v).addClass("active").siblings().removeClass('active');
		}
	} );
  }
  
}

function logout(){
	var r = confirm("Are you sure you want to logout?");
	if (r == true) {
	  $.ajax({
		  type: "GET",
		  url: "admin/api/logout?query="+new Date().getTime(),
		  success: function(data){
			localStorage.removeItem("token");
			window.location = "/login";
		  }
	});
	}
}

function generateVoucher(){
	
	var appendToPrevious = $("#appendToPrevious").val();
	var addToSales = $("#addToSales").val();
	var voucherQty = $("#voucherQty").val();
	var voucherAmount = $("#voucherAmount").val();
	var voucherGeneratePrefix = $("#voucherGeneratePrefix").val();
	var printThermalPrinter = $("#printThermalPrinter").val();

	if( voucherQty > 15 ){
		alert('Only 15 is maximum allowed per generation!')
		return;
	}
	
	var postData = "amt="+voucherAmount+"&pfx="+voucherGeneratePrefix+"&qty="+voucherQty+"&sales="+addToSales+"&print="+printThermalPrinter;
	
	$.ajax({
	  type: "POST",
	  url: "admin/api/generateVouchers",
	  data: postData,
	  success: function(data){

		if(data == "busy"){
			alert('Machine is busy, please try again later.')
			return;
		}
	  
		var voucherData = localStorage.getItem("voucherData");
		
		if(appendToPrevious == "1"){
			if(voucherData != null){
				voucherData += "~";
				voucherData += data;
			}else{
				voucherData = data;
			}
			
		}else{
			voucherData = data;
		}
	  
		localStorage.setItem("voucherData", voucherData);
		window.open("admin/viewGeneratedVouchers?d="+new Date().getTime());
	  },
	  error: function(XMLHttpRequest, textStatus, errorThrown) { 
		alert("Error: " + errorThrown); 
	  } 
	});
}

function secondsToDhms(seconds) {
	seconds = Number(seconds);
	var d = Math.floor(seconds / (3600*24));
	var h = Math.floor(seconds % (3600*24) / 3600);
	var m = Math.floor(seconds % 3600 / 60);
	var s = Math.floor(seconds % 60);

	var dDisplay = d > 0 ? d + (d == 1 ? " Day " : " Days ") : "0 Day ";
	var hDisplay = h > 0 ? h + (h == 1 ? " Hour " : " Hours ") : "0 Hour ";
	var mDisplay = m > 0 ? m + (m == 1 ? " Min " : " Mins ") : "0 Min ";
	var sDisplay = s > 0 ? s + (s == 1 ? " Sec" : " Secs") : "0 Sec ";
	return dDisplay + hDisplay + mDisplay + sDisplay;
}

$(document).ajaxStart(function(){
   	$("#loading").attr("class","spinner");
	$("#loadingText").attr("style","");
 });

$(document).ajaxComplete(function(){
	$("#loading").attr("class","hidden");
	$("#loadingText").attr("style","display: none");
 });
 
 function ipAddressModeChange(evt){
 
	var mode = $(evt).val();
	
	if(mode == 0){
		$("#staticIpDiv").attr("style", "display: none");
	}else{
		$("#staticIpDiv").attr("style", "display: block");
	}
 
}

function validateIpAddressFields(ipAddressFields){
	for(var i in ipAddressFields){
		var fieldValue = ipAddressFields[i];
		if(fieldValue == null || fieldValue == "" || (!validateIPaddress(fieldValue))){
			alert(i+" is not valid, please check the ip format");
			return false;
		}
	}
	return true;

}

function validateIPaddress(ipaddress) {  
  if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ipaddress)) {  
    return (true)  
  }
  return (false)  
}   

function exportSystemConfig(){
	$.ajax({
	  type: "GET",
	  url: "admin/api/getSystemConfig?query="+new Date().getTime(),
	  success: function(data){
		var blob = new Blob([data], {type: 'data'});
		var href = window.URL.createObjectURL(blob);
		var a = document.createElement("a");
		a.download = "system.data";
		a.href = href;
		a.click();
	  }
	});
}

function importSystemConfig(){
	$('#importSystemConfigFile').click();
}

function systemConfigFileImportChange(evt){

 var f = $(evt)[0].files[0];

 var reader = new FileReader();
 reader.onload = (function(theFile) {
	return function(e) {
	  populateSystemConfigFields(e.target.result);
	  alert("Restore succesfully, please review the values and click the save button");
	};
  })(f);

  reader.readAsText(f);
}

function exportRateConfig(){
	$.ajax({
	  type: "GET",
	  url: "admin/api/getRates?query="+new Date().getTime(),
	  success: function(data){
		var blob = new Blob([data], {type: 'data'});
		var href = window.URL.createObjectURL(blob);
		var a = document.createElement("a");
		a.download = "rates.data";
		a.href = href;
		a.click();
	  }
	});
}

function importRateConfig(){
	$('#importRateConfigFile').click();
}

function rateConfigFileImportChange(evt){

 var f = $(evt)[0].files[0];

 var reader = new FileReader();
 reader.onload = (function(theFile) {
	return function(e) {
	  populateRateFields(e.target.result);
	  alert("Restore succesfully, please review the values and click the save button");
	};
  })(f);

  reader.readAsText(f);
}

function uploadMainBin(){
	var fd = new FormData();
	var files = $('#mainBin')[0].files;
	
	if(files.length > 0 ){
		var binFileType = $("#binFileType").val();
	    fd.append(binFileType, files[0]);
		$.ajax({
		  url: '/admin/updateMainBin',
		  type: 'post',
		  data: fd,
		  contentType: false,
		  processData: false,
		  success: function(response){
			 if(response != 0){
				alert('Firmware uploaded: '+response);
			 }else{
				alert('file not uploaded');
			 }
		  },
		  error: function(XMLHttpRequest, textStatus, errorThrown) { 
			alert("Error: " + errorThrown); 
		  } 
		});
	}else{
		alert("Please select bin file!!");
	}
}

function coinslotTypeChange(evt){
	var coinslotType = $(evt).val();
	if(coinslotType == "1"){
		$("#singleCoinPulseDiv").attr("style", "display: none");
	}else{
		$("#singleCoinPulseDiv").attr("style", "display: block");
	}
}
var SSID_ROW = "<li onClick='selectSSID(this)' ssid='SSID_STRING_HERE'><span>SSID_LABEL_HERE</span></li><hr/>";
function scanSSID(evt){
	$.ajax({
	  type: "GET",
	  url: "admin/api/scanSSID?query="+new Date().getTime(),
	  success: function(data){
		var ssidListContent = "";
		var ssidRows = data.split("|");
		for(var i=0;i<ssidRows.length;i++){
			var ssidCols = ssidRows[i].split("#");
			var ssidName = ssidCols[0];
			var ssidLabel = ssidName + " - " + ssidCols[1] + "%";
			ssidListContent += SSID_ROW.replace("SSID_STRING_HERE", ssidName).replace("SSID_LABEL_HERE", ssidLabel);
		}
		$("#ssidListDiv").attr("style", "display: block");
		$("#ssidList").html(ssidListContent);
	  }
	});
	
}
function selectSSID(evt){
	var ssid = $(evt).attr('ssid');
	$("#wifiSSID").val(ssid);
}

function restartSystem(evt){
	var r = confirm("Are you sure you want to restart system?");
	if (r == true) {
		$.ajax({
			  type: "POST",
			  url: "admin/api/restartSystem?query="+new Date().getTime(),
			  success: function(data){
				if(data == "ok"){
					alert('System initiate restart, please refresh the page after 1 minute!');
				}else if(data == "warn"){
					alert('Machine is currently serving a customer,it will restart after customer is finish');
				}else{
					alert('Restart failed, please check if connected to MT');
				}
			  }
		});
	}
}

function restartMikrotik (evt){
	var r = confirm("Are you sure you want to restart mikrotik system?");
	if (r == true) {
		$.ajax({
			  type: "POST",
			  url: "admin/api/restartMikrotik?query="+new Date().getTime(),
			  success: function(data){
				if(data == "ok"){
					alert('Mikrotik system restart initiated, please refresh the page after mikrotik boot up!');
				}else{
					alert('Restart failed, please check if connected to MT');
				}
			  }
		});
	}
}

function generateKey(){
	$("#apiKey").val(randomString(10));
}
function randomString(length) {
	return Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);
}
var systemLogsCsv = "";
function openSystemLogs(evt){
	$.ajax({
	  type: "GET",
	  url: "admin/api/getSystemLogs?query="+new Date().getTime(),
	  success: function(data){
		populateSystemLog(data);
	  }
	});
	openTab(evt, 'SystemLogs');
}
var logRowTemplate = "<tr><td>ROW_TIME_HERE</td><td>ROW_MESSAGE_HERE</td></tr>";
var maxShowRow = 20;
var logs = [];
var logSize = 0;
var page = 1;
var logTypes = [];
logTypes['1'] = 'System Starting...';
logTypes['2'] = 'Network Connected Succesfully';
logTypes['3'] = 'Mikrotik Connected Succesfully';
logTypes['4'] = 'Juanfi Initial Setup';
logTypes['5'] = 'Failed to login to mikrotik';
logTypes['6'] = '${1} Cancel Topup';
logTypes['7'] = 'Rates modified';
logTypes['8'] = 'System Configuration Modified';
logTypes['9'] = 'Reset Total Sales';
logTypes['10'] = 'Reset Current sales';
logTypes['11'] = 'Reset Customer Count';
logTypes['12'] = '${1} Login Sucessfully';
logTypes['13'] = '${1} Login Failed';
logTypes['14'] = '${1} Purchase ${2}, amount: ${3}';
logTypes['15'] = '${1} Attempted to insert coin';
logTypes['16'] = '${1} was banned from using coinslot';
logTypes['17'] = 'Create voucher failed ${1}, retrying...';
logTypes['18'] = '${1} Inserted coin ${2}';
logTypes['19'] = 'Manual voucher purchase activated';
logTypes['20'] = 'Generated ${1} voucher(s)';
logTypes['21'] = 'NightLight Turn On';
logTypes['22'] = 'NightLight Turn Off';
logTypes['23'] = 'Kick active user ${1}';
logTypes['24'] = '${1} tried to insert coin but no internet available';
logTypes['25'] = 'Reset Daily Sales';
logTypes['26'] = 'Reset Monthly Sales';
logTypes['27'] = 'Update charging settings';
logTypes['28'] = '${1} Purchase Eload success ${2}';
logTypes['29'] = 'Update Eload settings';
logTypes['30'] = 'Update Eload rates';
logTypes['31'] = 'Clear Eload transactions';
logTypes['32'] = '${1} Purchase Eload failed ${2}';
logTypes['33'] = 'Unusual coinslot pulse detected, please check coinslot';

function populateSystemLog(rawData){
	rawData = rawData.replace(/\uFFFD/g, '');
	rawData = replaceAll(rawData, "\x00");
	var data = rawData.split("\n");
	logs = [];
	var c = 0;
	page = 1;
	logSize = 0;
	for(var r = data.length-1;r>=0;r--){
		var headerData = data[r].split("~");
		var rows = headerData[1].split("|");
		logSize += rows.length-1;
		var rowSize = rows.length-1;
		systemLogsCsv = "Log Time,Log Message";
		for(i=rowSize;i>=0;i--){
			
			var cols = rows[i].split("#");
			var startUptime = new Date().getTime() - (upTimeSeconds * 1000);
			if(headerData[0] != ""){
				startUptime = new Date(parseInt(headerData[0]) * 1000).getTime();
			}
			var calcLogTime = new Date(startUptime+parseInt(cols[0]));
			var formattedTime = calcLogTime.toString().substr(0,25);
			var logMessage = formatLogMessage(cols);
			if(logMessage == null){
				continue;
			}
			systemLogsCsv += "\n";
			systemLogsCsv += (formattedTime+","+logMessage);
			var d = {};
			d.time = formattedTime;
			d.message = logMessage;
			logs.push(d);
			c++;
		}
	}
	showLog();
}

function formatLogMessage(cols){
	var messageTemplate = logTypes[cols[1]];
	var message = "-";
	if(messageTemplate != null){
		message = messageTemplate;
		for(p=2;p<cols.length;p++){
			message = message.replace("${"+(p-1)+"}", cols[p]);
		}
	}else{
		return null;
	}
	return message;
}

function exportLogs(){
	var blob = new Blob([systemLogsCsv], {type: 'data'});
	var href = window.URL.createObjectURL(blob);
	var a = document.createElement("a");
	a.download = "log_"+new Date().getTime()+".csv";
	a.href = href;
	a.click();
}

function toggleNightLight(){
	$.ajax({
		type: "POST",
		url: "admin/api/toggerNightLight",
		success: function(data){
		  openDashboard(null);
		}
	});
}

function salesDetail(){
	$.ajax({
		  type: "GET",
		  url: "admin/api/getSalesDetail?query="+new Date().getTime(),
		  success: function(data){
			$("#salesDetailDiv").attr("style", "display: block");
			var salesData = data.split(separator);
			$("#dailySales").html(salesData[0]);
			$("#monthlySales").html(salesData[1]);
			$("#chargingSales").html(salesData[2]);
			fetchEloadTrxLogs();
		  }
	});
}

function nextLogs(){
	page++;
	showLog();
}

function prevLogs(){
	page--;
	showLog();
}

function showLog(){
	var logHtml = "";
	var start = (page -1) * maxShowRow;
	for(i=start;i<=start+maxShowRow;i++){
		if(i <= logSize){
			if(logs[i] == null){
				continue;
			}
			var rowScript = logRowTemplate.replace("ROW_TIME_HERE", logs[i].time);
			rowScript = rowScript.replace("ROW_MESSAGE_HERE", logs[i].message);
			logHtml += rowScript;
		}
	}
	$("#logBody").html(logHtml);
	var maxPage = Math.ceil(logSize/maxShowRow);
	if(page == 1){
		$("#prevBtn").attr('style', 'display:none');
	}else{
		$("#prevBtn").attr('style', '');
	}
	if(maxPage <= page){
		$("#nxtBtn").attr('style', 'display:none');
	}else{
		$("#nxtBtn").attr('style', '');
	}
	
}

function openActiveUsers(evt){
	if(activeUserCount <= 15){
		$.ajax({
			type: "GET",
			url: "admin/api/getActiveUsers?query="+new Date().getTime(),
			success: function(data){
				populateActiveUsers(data);
			}
		});
		$("#tooManyUser").attr('style', 'display: none');
	}else{
		$("#tooManyUser").attr('style', 'display: block');
	}
	openTab(evt, 'ActiveUsers');
}

var activeUserTemplate = "<tr><td>USER_HERE</td><td>MAC_HERE</td><td>LEFT_HERE</td><td><button class='delratebtn' onClick=\"kickUser('USERID_HERE')\">Kick</button></td></tr>";
function populateActiveUsers(data){
	var activeUserHtml = "";
	var rows = data.split("|");
	for(u in rows){
		var cols = rows[u].split("#");
		var activeUserRow = activeUserTemplate;
			activeUserRow =	activeUserRow.replace("USERID_HERE", cols[0]);
			activeUserRow =	activeUserRow.replace("USER_HERE", cols[1]);
			activeUserRow =	activeUserRow.replace("MAC_HERE", cols[2]);
			activeUserRow =	activeUserRow.replace("LEFT_HERE", cols[3]);
		activeUserHtml += activeUserRow;
	}
	$("#activeUserBody").html(activeUserHtml);
}

function kickUser(userid){
	var r = confirm("Are you sure you want to kick?");
	if(r){
		$.ajax({
			type: "POST",
			data: "userId="+userid,
			url: "admin/api/kickActiveUser",
			success: function(data){
				openActiveUsers(null);
			}
		});
		
	}
}

function lcdChange(evt){
	var lcdVal = $(evt).val();
	if(lcdVal == "0"){
		$("#buttonFunction").attr("disabled", true);
		$("#buttonFunction").val("1");
		$('#insertCoinText').val("");
	}else if(lcdVal == "1"){
		$("#buttonFunction").attr("disabled", false);
		if($("#insertCoinText").val() == "")
			$('#insertCoinText').val("Pls Insert    coin: 1/5/10");
	}else if(lcdVal == "2"){
		$("#buttonFunction").attr("disabled", false);
		if($("#insertCoinText").val() == "")
			$('#insertCoinText').val("Pls Insert        coin: 1/5/10");
	}
}

function openPromoRates(evt){
	$.ajax({
	  type: "GET",
	  url: "admin/api/getRates?query="+new Date().getTime(),
	  success: function(data){
		populateRateFields(data);
	  }
	});
	openTab(evt, 'PromoRate');
}

function openChargingStation(evt){
	$.ajax({
		type: "GET",
		url: "admin/api/getChargerSettings?query="+new Date().getTime(),
		success: function(data){
			populateChargerStationFields(data);
		}
	  });
	openTab(evt, 'ChargingStation');
}

function populateChargerStationFields(data){
	var chargingData = data.split('|');
	var html = "";
	for(var i=0;i<chargingData.length;i++){
		var rowData = chargingData[i].split('#');
		var rowScript = generateChargingRowScript(i, rowData);
		html += rowScript;
	}
	$("#chargingStationBody").html(html);
	populatePinFields();
	populateChargerSelectFields(chargingData);
	clearInterval(chargerTimer);
	chargerTimer = setInterval(refreshChargerTimer, 1000);
}

var chargingRowScript = " <div id='chargingRow' row-type='charger-row' class='rateholder' target-time='targetTimeText'>";
			chargingRowScript += "<div><span class='rate-title'>Port Name</span><input type='text' value='portNameValue' placeholder='Port Name' id='portNameText'></div>";
			chargingRowScript += "<div><span class='rate-title'>Pin Setting (Select NONE for disable)</span><select name='chargerPin' id='pinText'></select></div>";
			chargingRowScript += "<div><span class='rate-title'>Trigger Type</span><select name='trigerType' id='triggerTypeText'><option value='0'>LOW</option><option value='1'>HIGH</option></select></div>";
			chargingRowScript += "<div><span class='rate-title'>Remaining Time</span><input type='text' name='chargerRemain' disabled><input type='hidden' id='offTimeText' value='offTimeValue' /></div>";
			chargingRowScript += "<div><span class='rate-title'>Sales</span><input type='text' id='portSalesText' value='portSalesValue' disabled></div>";
			chargingRowScript += "<div class='button-grp-horizontal center'><button class='first-btn red-bg' onClick='resetChargerSales(portIndex)'>Reset Sales</button><button class='second-btn yellow-bg' onClick='resetChargerTimer(portIndex)'>Reset Timer</button></div>";
			chargingRowScript += "</div>";

function generateChargingRowScript(i , rowData){
	var rowScript = chargingRowScript.replace("portNameText", "portNameText"+i);
	rowScript = rowScript.replace("portNameValue", rowData[0]);
	rowScript = rowScript.replace("pinText", "pinText"+i);
	rowScript = rowScript.replace("triggerTypeText", "triggerTypeText"+i);
	rowScript = rowScript.replace("offTimeText", "offTimeText"+i);
	rowScript = rowScript.replace("offTimeValue", rowData[3]);
	rowScript = rowScript.replace("portSalesText", "portSalesText"+i);
	rowScript = rowScript.replace("portSalesValue", rowData[4]);
	rowScript = rowScript.replace("portIndex", i);
	rowScript = rowScript.replace("portIndex", i);

	var targetTime = parseInt(rowData[3]);
	var curDate = new Date();
	var targetTimestamp = 0;
	if(targetTime > 0){
		var targetTimeDate = new Date(targetTime * 1000);
		if(targetTimeDate.getTime() > curDate.getTime()){
			targetTimestamp  = targetTimeDate.getTime();
		}
	}
	rowScript = rowScript.replace("targetTimeText", targetTimestamp);
	rowScript = rowScript.replace("chargingRow", "chargingRow"+i);
	return rowScript;
}

function populateChargerSelectFields(chargingData){
	for(var i=0;i<chargingData.length;i++){
		var rowData = chargingData[i].split('#');
		$("#pinText"+i).val(rowData[1]);
		$("#triggerTypeText"+i).val(rowData[2]);
	}
}

function refreshChargerTimer(){
	$("[row-type='charger-row']").each(function () {
       var targetTime = parseInt($(this).attr('target-time'));	
	   var curDate = new Date();
	   var remainInput = $(this).find("[name='chargerRemain']");
	   if(targetTime > 0){
			if(targetTime > curDate.getTime()){
				difference = (targetTime- curDate.getTime()) / 1000;
				remainInput.val(secondsToDhms(difference));
			}else{
				remainInput.val("Not in use");
			}
	   }else{
		  remainInput.val("Not in use");
	   }
  });
}

function saveChargerSetting(){
	var params = [];
	var i = 0;
	$("[row-type='charger-row']").each(function () {
		var portNameText = $("#portNameText"+i).val();
		var pinText = $("#pinText"+i).val();
		var triggerTypeText = $("#triggerTypeText"+i).val();
		var offTimeText = $("#offTimeText"+i).val();
		var portSalesText = $("#portSalesText"+i).val();
		if(portNameText != null && pinText != null && triggerTypeText != null && offTimeText != null && portSalesText != null){
			params.push(portNameText+"#"+pinText+"#"+triggerTypeText+"#"+offTimeText+"#"+portSalesText);
		}
		
		i++;
	});
	var postData = createParam(params);
	$.ajax({
	  type: "POST",
	  url: "admin/api/saveChargerSetting",
	  data: "data="+postData,
	  success: function(data){
		openChargingStation(null);
		alert('Configuration save succesfully!');
	  },
	  error: function(XMLHttpRequest, textStatus, errorThrown) { 
		alert("Error: " + errorThrown); 
	  } 
	});
}

function exportChargerSetting(){
	$.ajax({
	  type: "GET",
	  url: "admin/api/getChargerSettings?query="+new Date().getTime(),
	  success: function(data){
		var blob = new Blob([data], {type: 'data'});
		var href = window.URL.createObjectURL(blob);
		var a = document.createElement("a");
		a.download = "charger.data";
		a.href = href;
		a.click();
	  }
	});
}

function downloadVoucherTemplate(){
	$.ajax({
	  type: "GET",
	  url: "admin/viewGeneratedVouchers",
	  success: function(data){
		var blob = new Blob([data], {type: 'data'});
		var href = window.URL.createObjectURL(blob);
		var a = document.createElement("a");
		a.download = "voucher-generate.html";
		a.href = href;
		a.click();
	  }
	});
}

function uploadVoucherTemplate(){
	$('#importVoucherTemplateFile').click();
}

function voucherTemplateFileImportChange(evt){
	
	var files = $('#importVoucherTemplateFile')[0].files;
	if(files.length > 0 ){
		var r = confirm("Are you sure you want to upload the new template?");
		if(r){
			var fd = new FormData();
			if(files.length > 0 ){
				fd.append("template", files[0]);
				$.ajax({
				url: '/admin/api/uploadVoucherTemplate',
				type: 'post',
				data: fd,
				contentType: false,
				processData: false,
				success: function(response){
					alert('New voucher template uploaded succesfully!')
				},
				error: function(XMLHttpRequest, textStatus, errorThrown) { 
					alert("Upload Template Error: " + errorThrown); 
				} 
				});
			}else{
				alert("Please select template file!!");
			}
		}
	}
}

function importChargerSetting(){
	$('#importChargerConfigFile').click();
}

function chargerConfigFileImportChange(evt){

 var f = $(evt)[0].files[0];

 var reader = new FileReader();
 reader.onload = (function(theFile) {
	return function(e) {
	  populateChargerStationFields(e.target.result);
	  alert("Restore succesfully, please review the values and click the save button");
	};
  })(f);

  reader.readAsText(f);
}

function resetChargerSales(port){
	var r = confirm("Are you sure you want to reset?");
	if(r){
		var offTimeText = $("#portSalesText"+port).val("0");
		saveChargerSetting();
	}
}

function resetChargerTimer(port){
	var r = confirm("Are you sure you want to reset?");
	if(r){
		var offTimeText = $("#offTimeText"+port).val("0");
		saveChargerSetting();
	}
}

function onRateTypeChange(evt){
	rateType = $(evt).val();
	populatePromoPage();
}

function customBoardFileChanged(evt){

	var f = $(evt)[0].files[0];
   
	var reader = new FileReader();
	reader.onload = (function(theFile) {
	   return function(e) {
		 var jsonData = JSON.parse(e.target.result);
		 if(jsonData.hardwareType !== hardwareType){
			 alert("Custom board config is not for this hardware type");
			 return;
		 }
		 var c = confirm("Custom Board Configuration Detail\nMaker: "+jsonData.maker +"\nVersion: "+jsonData.version+"\n"+"Instructions: "+jsonData.instructions);
		 if(c){
			if(!populateCustomBoardPin(jsonData)){
				alert("Custom board config loading failed!");
			}
		 }
		 
	   };
	 })(f);
   
	 reader.readAsText(f);
}

function populateCustomBoardPin(jsonData){
	for(var dt in jsonData){
		if(dt.indexOf('Pin') !== -1){
			$('#'+dt).val(jsonData[dt]);	
		}
	}
	return true;
}

function openEloadSetting(evt){
	$("#eloadBalanceDiv").attr('style', 'display: none');
	$.getScript( "admin/js/md5.js" )
		.done(function( script, textStatus ) {
			
		})
		.fail(function( jqxhr, settings, exception ) {
			//script fail warning if you want it
	});
	$.getScript( "https://cdn.jsdelivr.net/pako/1.0.3/pako.min.js" )
		.done(function( script, textStatus ) {
			
		})
		.fail(function( jqxhr, settings, exception ) {
			//script fail warning if you want it
	});
	$.ajax({
		type: "GET",
		url: "admin/api/eload/getSetting?query="+new Date().getTime(),
		success: function(data){
		  populateEloadSettings(data);
		}
	});
	fetchEloadTrxLogs();
	openTab(evt, 'EloadCenter');
}
var eloadRatesData = "";

function fetchEloadTrxLogs(){
	$.ajax({
		type: "GET",
		url: "admin/api/eload/getTrxs?query="+new Date().getTime(),
		success: function(data){
		  populateEloadTrx(data);
		}
	});
}

function eloadRateFileChange(evt){

	var f = $(evt)[0].files[0];
   
	var reader = new FileReader();
	reader.onload = (function(theFile) {
	   return function(e) {
		var rows = e.target.result.split("\n");  
		for(var i=1;i<rows.length;i++){
			var cols = rows[i].split(",");
			if(i > 0){
				eloadRatesData += "\n";
			}
			if(cols[0] !== null && cols[0] !== undefined && cols[0] !== ''){
				var eloadRow = cols[0] + "," + cols[1]  + "," + cols[2] + "," + cols[3] + "," + hexMD5(cols[0]+cols[2]+macAddress);
				eloadRatesData += eloadRow;
			}
		}
	   };
	 })(f);
   
	 reader.readAsText(f);
}

function saveEloadRates(){
	if(eloadRatesData == ""){
		alert("Please upload the eload rates csv!");
		return;
	}
	var a = confirm("Are you sure you want to upload new rates?");
	if(a){
		var fd = new FormData();
		var result = window.pako.gzip(eloadRatesData, {to: 'string'});
		var blob = new Blob([result], { type: 'plain/text' });
		fd.append('file', blob,'eload.csv');
		$.ajax({
			url: '/admin/api/eload/uploadRates',
			type: 'post',
			data: fd,
			contentType: false,
			processData: false,
			success: function(response){
			   if(response != 0){
				  alert('Eload rates uploaded: '+response);
			   }else{
				  alert('file not uploaded');
			   }
			},
			error: function(XMLHttpRequest, textStatus, errorThrown) { 
			  alert("Error: " + errorThrown); 
			} 
		});
	}

}

function exportEloadRates(){
	$.ajax({
	  type: "GET",
	  url: "/admin/api/eload/getRates?query="+new Date().getTime()
	}).done((rawData) => {
		if(rawData == null || rawData == ""){
			alert('No Rates has uploaded yet!');
			return;
		}
		var data = pako.ungzip(rawData, { to: 'string' });
		var exportData = "Product Code,Product Name,Price,Group";
		var rows = data.split("\n");
		for(var i=0;i<rows.length;i++){
			var cols = rows[i].split(",");
			if(i > 0){
				exportData += "\n";
			}
			if(cols[0] !== null && cols[0] !== undefined && cols[0] !== ''){
				var eloadRow = cols[0] + "," + cols[1]  + "," + cols[2] + "," + cols[3];
				exportData += eloadRow;
			}
		}
		var blob = new Blob([exportData], {type: 'data'});
		var href = window.URL.createObjectURL(blob);
		var a = document.createElement("a");
		a.download = "eload.csv";
		a.href = href;
		a.click();
	});
}

function saveEloadSettings (){
	var postData = "status="+$("#eloadEnable").val();
		postData += "&mode="+$("#eloadProvider").val();
		postData += "&uid="+$("#eloadUser").val().trim();
		postData += "&pwd="+$("#eloadPw").val().trim();
	var lineData = createParam([$("#eloadEnable").val(),
								$("#eloadProvider").val(),
								$("#eloadUser").val().trim(),
								$("#eloadPw").val().trim()
								]);
		postData += "&data="+lineData;
	$.ajax({
	  type: "POST",
	  url: "admin/api/eload/saveSetting",
	  data: postData,
	  success: function(data){
		openEloadSetting(null);
		if(data == "ok"){
			alert('Configuration save succesfully!');
		}else{
			alert('Your eload account is invalid please contact the eload provider.');
		}
	  },
	  error: function(XMLHttpRequest, textStatus, errorThrown) { 
		alert("Error: " + errorThrown); 
	  } 
	});
}

function populateEloadSettings(data){
	var configData = data.split(separator);
	$('#eloadEnable').val(configData[0]);
	$('#eloadProvider').val(configData[1]);
	$('#eloadUser').val(configData[2]);
	$('#eloadPw').val(configData[3]);
	$('#eloadBalance').val(configData[4]);
}

function checkEloadBalance(){
	$.ajax({
	  type: "GET",
	  url: "admin/api/eload/checkBalance",
	  success: function(data){
		$("#eloadBalanceDiv").attr('style', 'display: block');
		$('#eloadBal').html(data);
	  },
	  error: function(XMLHttpRequest, textStatus, errorThrown) { 
		alert("Error: " + errorThrown); 
	  } 
	});

}

var eloadTrxTemplate = "<tr><td>ROW_TIME_HERE</td><td>ROW_MOBILE_HERE</td><td>ROW_AMOUNT_HERE</td><td>ROW_VOUCHER_HERE</td><td>ROW_STATUS_HERE</td></tr>";

function populateEloadTrx(data){
	
	data = data.replace(/\uFFFD/g, '');
	data = replaceAll(data, "\x00");
	var rows = data.split("|");
	var eloadTrxHtml = "";
	var totalEload = 0;
	var totalRefund = 0;
	for(i=2;i<rows.length;i++){
		var cols = rows[i].split("#");
		var trxDate = new Date(parseInt(cols[0]));
		trxDate = trxDate.toString().substr(0,25);
		var rowScript = eloadTrxTemplate.replace("ROW_TIME_HERE", trxDate);
		rowScript = rowScript.replace("ROW_MOBILE_HERE", cols[1]);
		var eloadAmt = cols[2];
		rowScript = rowScript.replace("ROW_AMOUNT_HERE", eloadAmt);
		var voucher = cols[3];
		if(cols[5] !== null){
			var refundAmt = parseInt(cols[5]);
			if(refundAmt > 0){
				voucher +=  "("+refundAmt+")";
				totalRefund += refundAmt;
			}else{
				voucher = "-";
			}
		}
		rowScript = rowScript.replace("ROW_VOUCHER_HERE", voucher);
		var status = cols[4];
		if(status === null){
			status = "Failed(Crashed)";
		}else if(status == "0"){
			status = "Failed";
		}else if(status == "1"){
			status = "Success";
			totalEload += parseInt(eloadAmt);
		}
		rowScript = rowScript.replace("ROW_STATUS_HERE", status);
		eloadTrxHtml += rowScript;
	}
	$("#eloadSales").html(totalEload+".00");
	$("#eloadSalesD").html(totalEload);
	$("#eloadRefund").html(totalRefund+".00");
	$("#eloadTrxBody").html(eloadTrxHtml);
}

function replaceAll(str, rep){
	var aa = str;
	while(aa.indexOf(rep) > 0){
		aa = aa.replace(rep, "");
	}
	return aa;
}

function clearEloadLog(){
	var r = confirm("Are you sure you want to reset?");
	if(r){
		$.ajax({
			type: "POST",
			url: "admin/api/eload/resetTrxs",
			success: function(data){
				fetchEloadTrxLogs();
			},
			error: function(XMLHttpRequest, textStatus, errorThrown) { 
			alert("Error: " + errorThrown); 
			} 
		});
	}
	
}

function downloadCompleteRates(){
	window.location.href = "https://s3.ap-southeast-1.amazonaws.com/juanfi.juansystems.com/eload_complete.csv";
}

function downloadLimitedRates(){
	window.location.href = "https://s3.ap-southeast-1.amazonaws.com/juanfi.juansystems.com/eload.csv";
}

function showPassword(evt){
	if($(evt).is(':checked')) {
		$("#eloadPw").attr("type", "text");
	}else{
		$("#eloadPw").attr("type", "password");
	}
}

function importLogs(evt){
	var f = $(evt)[0].files[0];
   
	var reader = new FileReader();
	reader.onload = (function(theFile) {
	   return function(e) {
			populateSystemLog(e.target.result);
			$("#importSystemLogFile").val('');
	   };
	 })(f);
   
	 reader.readAsText(f);
}