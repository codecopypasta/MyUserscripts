// ==UserScript==
// @name         Steam - Game Ownership Checker
// @version      2.0
// @description  Do I already own this game on some other store?
// @author       codecopypasta
// @match        https://store.steampowered.com/app/*
// @icon         https://www.google.com/s2/favicons?domain=steampowered.com
// @grant        none
// @require      https://code.jquery.com/jquery-3.4.1.min.js
// ==/UserScript==

$(document).ready(function(){
	'use strict';

	let minSimilarity = 0.50;
	let idleSimilarity = 0.75;

	let gamesList = {
		"Store Name 1": [
			"Owned Game 1",
			"Owned Game 2",
			"Owned Game 3",
		],
		"Store Name 2": [
			"Owned Game 1",
			"Owned Game 2",
			"Owned Game 3",
		],
	};

	$(".apphub_AppName").each(function(){
		let $curTextRef = $(this);
		let maxPerc = 0, maxPercItem = null, maxPercStore = null;

		// Iterate over all non-steam owned games, and find the one with highest % match
		$.each(gamesList, function(key, list){
			$.each(list, function(){
				let perc = stringSimilarity(this, $curTextRef.text());
				if(perc > minSimilarity){
					if(perc > maxPerc){
						maxPerc = perc;
						maxPercItem = this;
						maxPercStore = key;
					}
					else if(perc == maxPerc){
						if(!maxPercStore.includes(key)){
							maxPercStore += ", " + key;
						}
						if(!maxPercItem.includes(this)){
							maxPercItem += ", " + this;
						}
					}
				}
			});
		});

		// If match, update title and BG
		if(maxPerc > minSimilarity){
			let percText = (parseInt(maxPerc*10000)/100) + "%";
			console.log(`${$curTextRef.text()}\nVS\n${maxPercItem}\nMatch: ${percText}\nStore(s): ${maxPercStore}`);
			$curTextRef.css("background", maxPerc > idleSimilarity ? "#c33" : "#c93");
			$curTextRef.text(`${$curTextRef.text()} (${maxPercStore} ${percText})`);
			$(".queue_actions_ctn").first().css("background", maxPerc > idleSimilarity ? "#300" : "#430");
		}
	});

	function stringSimilarity(str1, str2, gramSize = 2) {
		str1 = str1.trim();
		str2 = str2.trim();
		if(str1 == str2) return 1;
		function getNGrams(s, len) {
			s = ' '.repeat(len - 1) + s.toLowerCase() + ' '.repeat(len - 1);
			let v = new Array(s.length - len + 1);
			for (let i = 0; i < v.length; i++) {
				v[i] = s.slice(i, i + len);
			}
			return v;
		}
		if (!(str1 === null || str1 === void 0 ? void 0 : str1.length) || !(str2 === null || str2 === void 0 ? void 0 : str2.length)) {
			return 0.0;
		}
		let s1 = str1.length < str2.length ? str1 : str2;
		let s2 = str1.length < str2.length ? str2 : str1;
		let pairs1 = getNGrams(s1, gramSize);
		let pairs2 = getNGrams(s2, gramSize);
		let set = new Set(pairs1);
		let total = pairs2.length;
		let hits = 0;
		for (let item of pairs2) {
			if (set.delete(item)) {
				hits++;
			}
		}
		return hits / total;
	}

});