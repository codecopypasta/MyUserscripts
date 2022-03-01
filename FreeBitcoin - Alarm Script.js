// ==UserScript==
// @name         FreeBitcoin - Alarm Script
// @version      1.0
// @description  Better Alarm
// @author       codecopypasta
// @match        https://freebitco.in/?op=home
// @grant        none
// ==/UserScript==


$(document).ready(function() {

	// Default values, used in to reset in resetValues()
	let defFrequency = 6000, defVolume = 10, defType = 2, defDuration = 250;

	// Current values Used by show() and beep()
	let frequency, volume, type, duration;

	let refreshTime = 2 * 60 * 1000; // 2 minutes
	let alarmIntervalRef = null, refreshTimeout = null; // setInterval/setTimeout IDs
	let audioCtx = new(window.AudioContext || window.webkitAudioContext)();
	let rebeepGap = () => {return duration*2};

	function beep() {
		let oscillator = audioCtx.createOscillator();
		let gainNode = audioCtx.createGain();

		oscillator.connect(gainNode);
		gainNode.connect(audioCtx.destination);

		gainNode.gain.value = volume;
		oscillator.frequency.value = frequency;
		oscillator.type = type;

		oscillator.start();

		setTimeout(
			function() {
				oscillator.stop();
			},
			duration
		);
	};

	function show() {
		frequency = $frequency.val();
		document.getElementById("fOut").innerHTML = frequency + ' Hz';

		switch ($type.val() * 1) {
			case 0: type = 'sine'; break;
			case 1: type = 'square'; break;
			case 2: type = 'sawtooth'; break;
			case 3: type = 'triangle'; break;
		}
		document.getElementById("tOut").innerHTML = type;

		volume = $volume.val() / 100;
		document.getElementById("vOut").innerHTML = volume.toFixed(2);

		duration = $duration.val();
		document.getElementById("dOut").innerHTML = duration + ' ms';

		saveAlarmData();

		// Check if not default
		if(volume*100 != defVolume || duration != defDuration || $type.val() != defType || frequency != defFrequency){
			$("#resetVals").prop("disabled", false);
		}
		else{
			$("#resetVals").prop("disabled", true);
		}
	}

	function saveAlarmData(){
		localStorage.setItem("frequency", frequency);
		localStorage.setItem("volume", volume);
		localStorage.setItem("type", $type.val());
		localStorage.setItem("duration", duration);
	}

	function loadAlarmData(){
		if(localStorage.getItem("frequency") !== null) $frequency.val(localStorage.getItem("frequency"));
		if(localStorage.getItem("volume") !== null) $volume.val(localStorage.getItem("volume")*100);
		if(localStorage.getItem("type") !== null) $type.val(localStorage.getItem("type"));
		if(localStorage.getItem("duration") !== null) $duration.val(localStorage.getItem("duration"));
		show(); // Update the Display
	}

	function resetValues(){
		$frequency.val(defFrequency);
		$volume.val(defVolume);
		$type.val(defType);
		$duration.val(defDuration).trigger("change");
	}



	function startAlarm(){
		show();
		beep();
		alarmIntervalRef = setInterval(beep, rebeepGap());
		refreshTimeout = setTimeout(()=>{location.reload();}, refreshTime);
	}

	function stopAlarm(){
		clearInterval(alarmIntervalRef);
		clearTimeout(refreshTimeout);
		alarmIntervalRef = null;
		refreshTimeout = null;
		$("#stopAlarmButton").prop("disabled", true);
	}

	function test(){
		show();
		beep();
		let testAlarm = setInterval(beep, rebeepGap());
		setTimeout(()=>{clearInterval(testAlarm);}, rebeepGap()*4);
	}


	let checker = setInterval(()=>{
		if(!($("#time_remaining").length && $("#time_remaining").hasClass("hasCountdown")) && alarmIntervalRef === null){
			startAlarm();
			// Check for user activity
			$(window).on("focus, mousemove", function(){
				stopAlarm();
				$(window).off("focus mousemove");
			});
			$("#stopAlarmButton").prop("disabled", false);
			clearInterval(checker);
		}
	},1000);


	let $alarmControl = $(`
		<div id="alarmcontrols" style="position:fixed; bottom:0; width:100%; padding: 5px 5px 5px 5px; background:#333; color: #fff; z-index:1000000; display:flex; justify-content: space-around; align-items: center;">

			<span></span>

			<span>
				<span style="vertical-align: middle;">Frequency</span>
				<input type="range" id="fIn" min="40" max="6000" value="${defFrequency}" step="10" style="vertical-align: middle;" class="alarmSliders">
				<span id="fOut" style="min-width:60px;display:inline-block;"></span>
			</span>

			<span>
				<span style="vertical-align: middle;">Type</span>
				<input type="range" id="tIn" min="0" max="3" value="${defType}" style="vertical-align: middle;" class="alarmSliders">
				<span id="tOut" style="min-width:70px;display:inline-block;"></span>
			</span>


			<span>
				<span style="vertical-align: middle;">Volume</span>
				<input type="range" id="vIn" min="0" max="100" value="${defVolume}" style="vertical-align: middle;" class="alarmSliders">
				<span id="vOut" style="min-width:10px;display:inline-block;"></span>
			</span>


			<span>
				<span style="vertical-align: middle;">Duration</span>
				<input type="range" id="dIn" min="50" max="5000" value="${defDuration}" step="10" style="vertical-align: middle;" class="alarmSliders">
				<span id="dOut" style="min-width:64px;display:inline-block;"></span>
			</span>

			<span>
				<button id="testButton">Test</button>
				<span style="display:inline-block; width:5px;"></span>
				<button id="resetVals" class="red_button" disabled>Reset</button>
				<span style="display:inline-block; width:5px;"></span>
				<button id="stopAlarmButton" disabled>Stop</button>
			</span>

			<span></span>

		</div>
		<div id="extraspace"></div>
	`);


	$("body").append($alarmControl);
	$(".alarmSliders").on("input change", show);
	$("#stopAlarmButton").click(stopAlarm);
	$("#testButton").click(test);
	$("#resetVals").click(resetValues);

	// Add the extra space due to the footer
	$("#extraspace").css("height", $alarmControl.height());
	let $frequency = $("#fIn"), $volume = $("#vIn"), $type = $("#tIn"), $duration = $("#dIn");

	// Load saved Data
	loadAlarmData();

});