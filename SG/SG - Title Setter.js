// ==UserScript==
// @name         SG - Title Setter
// @version      1.2
// @description  Why doesn't SG set the page title as the game name?
// @author       codecopypasta
// @match        https://www.steamgifts.com/giveaways/search?app=*
// @match        https://www.steamgifts.com/giveaways/search?sub=*
// @icon         https://www.google.com/s2/favicons?domain=steamgifts.com
// @grant        none
// ==/UserScript==

$(document).ready(function(){
	'use strict';

	let urlObj = new URL(window.location.href);
	let $gaList = $(".giveaway__heading__name").not(".pinned-giveaways__outer-wrap .giveaway__heading__name");
	if(urlObj.searchParams.get("app") || urlObj.searchParams.get("sub")){
		let gameName = $gaList.length > 0 ? $gaList.first().text() : "N/A";
		console.log("Game Name: " + gameName);
		document.title = gameName + " | " + document.title;
	}

});
