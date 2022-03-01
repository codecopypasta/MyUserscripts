// ==UserScript==
// @name         Gamehag - New Article Checker
// @version      1.0
// @description  Alert on new articles
// @author       codecopypasta
// @match        gamehag.com/news
// @grant        none
// @require      http://code.jquery.com/jquery-3.4.1.min.js
// ==/UserScript==


let $ = window.jQuery;

$(document).ready(function(){
	let beepLength = 100;
	let audioCtx = new(window.AudioContext || window.webkitAudioContext)();

	function beep() {
		let oscillator = audioCtx.createOscillator();
		let gainNode = audioCtx.createGain();

		oscillator.connect(gainNode);
		gainNode.connect(audioCtx.destination);

		gainNode.gain.value = 0.15;		// volume
		oscillator.frequency.value = 1000;	// freq
		oscillator.type = 'sawtooth';		// type

		oscillator.start();

		setTimeout(
			function() {
				oscillator.stop();
			},
			beepLength
		);
	};

	function getRndTime(min=15, max=30) { // In secs
		min *= 1000;
		max *= 1000;
		return (Math.floor(Math.random() * (max - min) ) + min);
	}

	function startAlarm() {
		beep();
		setTimeout(beep, beepLength*2);
		setTimeout(beep, beepLength*4);
	}



	if($("a[href$='/news/voting']").length == 0){
		setTimeout(()=>{location.reload();}, getRndTime());
	}
	else{
		startAlarm();
		let alarm = setInterval(startAlarm, beepLength*10);
		setTimeout(function(){clearInterval(alarm);},1000*60*2);
		setTimeout(()=>{location.reload();}, 1000*60*2 + 1000*15);
	}

});



