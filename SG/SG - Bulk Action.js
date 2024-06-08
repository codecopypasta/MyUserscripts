// ==UserScript==
// @name         SG - Bulk Action & Better GA listings
// @version      2.9.6
// @description  Make SG easier to use
// @author       codecopypasta
// @match        https://www.steamgifts.com
// @match        https://www.steamgifts.com/game/*
// @match        https://www.steamgifts.com/giveaway/*
// @match        https://www.steamgifts.com/giveaways/*
// @match        https://www.steamgifts.com/group/*
// @match        https://www.steamgifts.com/user/*
// @exclude      https://www.steamgifts.com/giveaways/created
// @exclude      https://www.steamgifts.com/giveaways/created/*
// @exclude      https://www.steamgifts.com/giveaways/entered
// @exclude      https://www.steamgifts.com/giveaways/entered/*
// @exclude      https://www.steamgifts.com/giveaways/new
// @exclude      https://www.steamgifts.com/giveaways/wishlist
// @exclude      https://www.steamgifts.com/giveaways/wishlist/*
// @exclude      https://www.steamgifts.com/giveaways/won
// @exclude      https://www.steamgifts.com/giveaways/won/*
// @exclude      https://www.steamgifts.com/group/*/*/users
// @exclude      https://www.steamgifts.com/group/*/*/stats
// @exclude      https://www.steamgifts.com/group/*/*/wishlist
// @exclude      https://www.steamgifts.com/game/*/*/stats
// @icon         https://www.google.com/s2/favicons?domain=steamgifts.com
// @grant        GM_setClipboard
// ==/UserScript==

$(document).ready(function(){
	'use strict';

	let gaKeyPrefix = "GA#";
	let currentUrl = window.location.href;
	let reg = /.*giveaway\/(.{5})\//;

	if(currentUrl.includes("steamgifts.com/giveaway/")){
		let urlToAdd = GetGACode(currentUrl);
		let url = new URL(currentUrl);
		let parameters = new URLSearchParams(url.search);

		if(parameters.has("bulked")){
			url.searchParams.delete("bulked");
			url.searchParams.delete("close");
			window.history.pushState("", "", url.href);
		}

		if(!parameters.has("bulked") && localStorage.getItem(urlToAdd) === null){
			let $timeFields = $(".featured__column > span[data-timestamp]");
			if($timeFields.length > 0){
				let timestamp = $timeFields.first().data("timestamp") * 1000;
				localStorage.setItem(urlToAdd, timestamp);
			}
		}

		if(parameters.has("close")){
			window.close();
		}
	}
	else{ // if(currentUrl.includes("steamgifts.com/giveaways/") || currentUrl.includes("steamgifts.com/group/") || currentUrl.endsWith("steamgifts.com") || currentUrl.endsWith("steamgifts.com/") || currentUrl.includes("steamgifts.com/game/")){
		let id = 0;
		let start = 0;
		let end = 0;

		// Add controls for each GA row
		(function(){
			$(".page__heading + div > .giveaway__row-outer-wrap").each(function(){
				let parent = $(this)

				let link = parent.find("a").attr("href");
				let time = parent.find(".giveaway__columns > div:first-child > span[data-timestamp]").attr("data-timestamp") * 1000;

				let dom = $(`<div class="bulk-link-opener" id="bulk-link-opener-${id}"></div>`);
				parent.append(dom);

				dom.append(`<div class="control-panel-button bulk-start-button" data-index="${id}">Start</div>`);
				dom.append(`<input type="checkbox" data-link="${link}" data-time="${time}" id="bulk-link-opener-cb-${id}" class="bulk-link-opener-cb">`);
				dom.append(`<div class="control-panel-button bulk-end-button" data-index="${id}">End</div>`);

				id++;
			});

			$("body").on("change", ".bulk-link-opener-cb", function(){
				RefreshCount();
				let isChecked = $(this).is(":checked");
				$(this).parent().parent().css("background", isChecked ? "#323946" : "");
			});

			$("body").on("click", ".bulk-start-button", function(){
				start = $(this).data("index");
			});

			$("body").on("click", ".bulk-end-button", function(){
				end = $(this).data("index");
				for(let i = start; i <= end; i++){
					$(`#bulk-link-opener-cb-${i}`).prop("checked", true).change();
				}
			});
		})();


		// Control Panel
		(function(){
			let controlPanel = $(`
			<div style="position: fixed; bottom: 25px; right: 10px; background: #333; border: 2px double #666; padding: 10px; display: grid; grid-template-columns: repeat(2, 1fr); grid-gap: 10px;">
				<span style="grid-column-end: span 2; color: #ccc; font-size: 1.25em; text-align: center;">Selection (<span class="bulk-link-selected-count">0</span>)</span>
				<div class="control-panel-button" id="bulk-link-select-smart">Smart</div>
				<div class="control-panel-button" id="bulk-link-select-all">Select All</div>
				<div class="control-panel-button" id="bulk-link-select-none">Select None</div>
				<div class="control-panel-button" id="bulk-link-select-invert">Invert</div>
				<div class="control-panel-button" id="bulk-mark-visited">Mark Done</div>
				<div class="control-panel-button" id="bulk-open-button">Open</div>
			</div>
			`);
			$("body").append(controlPanel);

			$("body").on("click", "#bulk-link-select-smart", function(){
				let links = GetVisitedLinks();
				$(".bulk-link-opener-cb").each(function(){
					let time = new Date(parseInt($(this).attr("data-time")));
					let inFuture = time.getTime() > Date.now();
					let curLink = GetGACode($(this).data("link"));
					if(!links.includes(curLink) && inFuture){
						$(this).prop("checked", true).change();
					}
				});
			});

			$("body").on("click", "#bulk-link-select-all", function(){
				$(".bulk-link-opener-cb").prop("checked", true).change();
			});

			$("body").on("click", "#bulk-link-select-none", function(){
				$(".bulk-link-opener-cb").prop("checked", false).change();
			});

			$("body").on("click", "#bulk-link-select-invert", function(){
				$(".bulk-link-opener-cb").each(function(){
					$(this).prop("checked", !$(this).prop("checked")).change();
				});
			});

			$("body").on("click", "#bulk-mark-visited", function(){
				let n = 0;
				let visitedLinks = {};
				$(".bulk-link-opener-cb:checked").each(function(){
					let {code, time} = VisitWithDelay(this, "?bulked&close", n++);
					visitedLinks[code] = time;
				});
				SaveVisitedLinks(visitedLinks);
			});

			$("body").on("click", "#bulk-open-button", function(){
				let n = 0;
				let visitedLinks = {};
				$(".bulk-link-opener-cb:checked").each(function(){
					let {code, time} = VisitWithDelay(this, "?bulked", n++);
					visitedLinks[code] = time;
				});
				SaveVisitedLinks(visitedLinks);
			});
		})();

		// Remove old data
		(function(){
			let weekInMS = 1000 * 60 * 60 * 24 * 7; // ms in a week
			let now = Date.now();
			let keysToRemove = [];
			let noOfKeys = 0;

			for(let i = 0; i < localStorage.length; i++){
				let key = localStorage.key(i);
				if(key.startsWith(gaKeyPrefix)){
					noOfKeys++;
					let expiryTime = Number(localStorage.getItem(key));
					// CHeck for NaN due to legacy keys that might still be present
					if(now > expiryTime || isNaN(expiryTime)){
						keysToRemove.push(key);
					}
				}
			}

			for(let key of keysToRemove){
				console.log("Removing key: " + key);
				localStorage.removeItem(key);
			}
			console.log(
				`Total keys initially: ${noOfKeys}`
				+ `\nNo keys removed: ${keysToRemove.length}`
				+ `\nNew Total keys: ${noOfKeys - keysToRemove.length}`
				);
		})();


		function RefreshCount(){
			$(".bulk-link-selected-count").text($(".bulk-link-opener-cb:checked").length);
		}

		function VisitWithDelay(ele, parameter, delay){
			let $ele = $(ele);
			let link = $ele.data("link");
			let code = GetGACode(link);
			let time = $ele.data("time");
			link += parameter;
			setTimeout(function(){
				window.open(link, '_blank');
			}, 50 * delay);
			return {code, time};
		}

		function SaveVisitedLinks(links){
			for(let l in links){
				if(localStorage.getItem(l) === null)
					localStorage.setItem(l, links[l]);
			}
		}

		function GetVisitedLinks(){
			let links = [];

			for(let i = 0; i < localStorage.length; i++){
				let key = localStorage.key(i);
				if(key.startsWith(gaKeyPrefix)){
					links.push(key);
				}
			}
			return links;
		}


		// Export/Import Panel
		(function(){
			let maxGAPerLine = 1850;

			let controlPanel = $(`
			<div style="position: fixed; bottom: 25px; left: 25px; background: #333; border: 2px double #666; padding: 10px; display: grid; grid-template-columns: repeat(2, 1fr); grid-gap: 10px;">
				<span style="grid-column-end: span 2; color: #ccc; font-size: 1.25em; text-align: center;">Manage Data</span>
				<div class="control-panel-button" id="export-visited-data">Export</div>
				<div class="control-panel-button" id="import-visited-data">Import</div>
			</div>
			`);
			$("body").append(controlPanel);

			$("body").on("click", "#export-visited-data", function(){
				let keys = GetVisitedLinks();
				let clipboard = "";
				let i = 0;
				let data = {};
				for (let k of keys) {
					data[k] = localStorage.getItem(k);
					i++;
					if(i > maxGAPerLine){
						clipboard += JSON.stringify(data);
						clipboard += "\n";
						data = {};
						i = 0;
					}
				}
				clipboard += JSON.stringify(data);
				console.log(clipboard);
				console.log("Total exported keys: " + keys.length);
				navigator.clipboard.writeText(clipboard);
				alert("Exported to Clipboard & Console");
			});

			$("body").on("click", "#import-visited-data", function(){
				let data = prompt("Import");
				try {
					let parsedData = {};
					for(let line of data.split(/\r\n|\r|\n/g)){
						Object.assign(parsedData, JSON.parse(line));
					}
					data = parsedData;
					for (let k in data) {
						if(localStorage.getItem(k) === null){
							localStorage.setItem(k, data[k]);
						}
					}
					alert("Data imported");
				} catch (error) {
					alert("No data found!");
					return;
				}
			});
		})();


		// Add CSS
		(function(){
			$("body").append(`
			<style type="text/css">
				.giveaway__row-outer-wrap{
					display: flex;
				}
				.giveaway__row-outer-wrap > .giveaway__row-inner-wrap{
					flex-grow: 1;
				}
				.bulk-link-opener{
					display: flex;
					flex-direction: column;
					justify-content: space-around;
					align-items: stretch;
					margin-left: 20px;
				}
				.control-panel-button{
					color: #fff;
					font-weight: bold;
					text-align: center;
					padding: 5px;
					border-radius: 0.5em;
					background: #666;
					cursor: pointer;
					border: 1px solid #000;
				}
				.control-panel-button.bulk-start-button{
					background: #696;
				}
				.control-panel-button.bulk-end-button{
					background: #966;
				}
			</style>
			`);
		})()

	}


	function GetGACode(url){
		return gaKeyPrefix + reg.exec(url)[1];
	}

	// Better timestamps & Color codes in GA lists - Needs to be global
	(function(){
		let hslMin = 0;       // red
		let hslMax = 115;     // green
		let timeMin = 300;    // 5 mins
		let timeMax = 259200; // 3 days


		function prettyTimeDiff(t1, t2){
			let diff = (t2 - t1) / 1000;
			let w = parseInt(diff/60/60/24/7);
			let d = parseInt(diff/60/60/24) - w*7;
			let h = parseInt(diff/60/60) - (w*7 + d)*24;
			let m = parseInt(diff/60) - (w*7*24 + d*24 + h)*60;
			return {str:`${w}w ${d}d ${h}h ${m}m`, "w":w, "d":d, "h":h, "m":m, "diff":diff};
		}

		setTimeout(function() {
			$(".giveaway__columns > div:first-child > span[data-timestamp]").each(function(){
				let time = new Date(parseInt($(this).attr("data-timestamp"))*1000);
				let started = $(this).parent().text().includes("remaining");
				let notEnded = time.getTime() > Date.now();
				let diff = notEnded ? prettyTimeDiff(Date.now(), time.getTime()) : prettyTimeDiff(time.getTime(), Date.now());
				$(this).html(`${$(this).text()} (${diff["str"]})`);

				if(notEnded && started){
					// Dynamic Coloring
					let h = Math.min(diff["diff"], timeMax + timeMin) - timeMin;
					h = h / timeMax;
					h = (hslMax - hslMin) * h + hslMin;
					$(this).parent().css("background", `hsl(${h}, 75%, 20%)`);
				}
				else if(notEnded){
					$(this).parent().css("background", `#083875`);
				}
			});
		}, 500);
	})();

});
