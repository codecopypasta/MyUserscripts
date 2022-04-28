// ==UserScript==
// @name         SG - Bulk Action
// @version      2.3.2
// @description  Open multiple links easily
// @author       codecopypasta
// @match        https://www.steamgifts.com
// @match        https://www.steamgifts.com/giveaways/*
// @match        https://www.steamgifts.com/giveaway/*
// @icon         https://www.google.com/s2/favicons?domain=steamgifts.com
// @grant        none
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
			localStorage.setItem(urlToAdd, Date.now());
		}

		if(parameters.has("close")){
			window.close();
		}
	}
	else{
		let id = 0;
		let start = 0;
		let end = 0;

		// Add controls for each GA row
		(function(){
			$(".page__heading + div > .giveaway__row-outer-wrap").each(function(){
				let parent = $(this)

				let link = parent.find("a").attr("href");

				let dom = $(`<div class="bulk-link-opener" id="bulk-link-opener-${id}"></div>`);
				parent.append(dom);

				dom.append(`<div class="bulk-link-button bulk-start-button" data-index="${id}">Start</div>`);
				dom.append(`<input type="checkbox" data-link="${link}" id="bulk-link-opener-cb-${id}" class="bulk-link-opener-cb">`);
				dom.append(`<div class="bulk-link-button bulk-end-button" data-index="${id}">End</div>`);

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
				<div class="bulk-link-button" id="bulk-link-select-smart">Smart</div>
				<div class="bulk-link-button" id="bulk-link-select-all">Select All</div>
				<div class="bulk-link-button" id="bulk-link-select-none">Select None</div>
				<div class="bulk-link-button" id="bulk-link-select-invert">Invert</div>
				<div class="bulk-link-button" id="bulk-mark-visited">Mark Done</div>
				<div class="bulk-link-button" id="bulk-open-button">Open</div>
			</div>
			`);
			$("body").append(controlPanel);

			$("body").on("click", "#bulk-link-select-smart", function(){
				let links = GetVisitedLinks();
				$(".bulk-link-opener-cb").each(function(){
					let curLink = GetGACode($(this).data("link"));
					if(!links.includes(curLink)){
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
				let visitedLinks = [];
				$(".bulk-link-opener-cb:checked").each(function(){
					visitedLinks.push(VisitWithDelay(this, "?bulked&close", n++));
				});
				SaveVisitedLinks(visitedLinks);
			});

			$("body").on("click", "#bulk-open-button", function(){
				let n = 0;
				let visitedLinks = [];
				$(".bulk-link-opener-cb:checked").each(function(){
					visitedLinks.push(VisitWithDelay(this, "?bulked", n++));
				});
				SaveVisitedLinks(visitedLinks);
			});
		})();

		// Remove old data
		(function(){
			let weekInMS = 1000 * 60 * 60 * 24 * 7; // ms in a week
			let now = Date.now();
			let keysToRemove = [];

			for(let i = 0; i < localStorage.length; i++){
				let key = localStorage.key(i);
				if(key.startsWith(gaKeyPrefix)){
					let diffInWeeks = (now - Number(localStorage.getItem(key))) / weekInMS;
					if(diffInWeeks > 4){
						keysToRemove.push(key);
					}
				}
			}

			for(key in keysToRemove){
				localStorage.removeItem(key);
			}
		})();


		function RefreshCount(){
			$(".bulk-link-selected-count").text($(".bulk-link-opener-cb:checked").length);
		}

		function VisitWithDelay(ele, parameter, delay){
			let link = $(ele).data("link");
			let code = GetGACode(link);
			link += parameter;
			setTimeout(function(){
				window.open(link, '_blank');
			}, 50 * delay);
			return code;
		}

		function SaveVisitedLinks(links){
			let now = Date.now();
			for(let l of links){
				if(localStorage.getItem(l) === null)
					localStorage.setItem(l, now);
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
				.bulk-link-button{
					color: #fff;
					font-weight: bold;
					text-align: center;
					padding: 5px;
					border-radius: 0.5em;
					background: #666;
					cursor: pointer;
					border: 1px solid #000;
				}
				.bulk-link-button.bulk-start-button{
					background: #696;
				}
				.bulk-link-button.bulk-end-button{
					background: #966;
				}
			</style>
			`);
		})()

	}


	function GetGACode(url){
		return gaKeyPrefix + reg.exec(url)[1];
	}

});
