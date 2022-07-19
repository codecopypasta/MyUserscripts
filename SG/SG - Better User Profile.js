// ==UserScript==
// @name         SG - Better User Profile
// @version      1.0
// @description  Improve the user profile to my personal liking.
// @author       codecopypasta
// @include      /www.steamgifts.com\/user/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=steamgifts.com
// @grant        none
// ==/UserScript==

(function() {
	'use strict';
	
	let name = $(".featured__heading__medium").text();
	let steamID = $(".sidebar__shortcut-inner-wrap > a").prop("href").replace("https://steamcommunity.com/profiles/", "");

	$(".featured__table__column").first().append(`
	<div class="featured__table__row" style="display:flex; gap: 10px;">
		<a href="https://steamdb.info/calculator/${steamID}/">SteamDB</a>
		<a href="https://www.sgtools.info/nonactivated/${name}">Non-Activated</a>
		<a href="https://www.sgtools.info/multiple/${name}">Multiple Wins</a>
	</div>
	`);
})();
