// ==UserScript==
// @name         AB Permalink
// @version      1.2
// @description  Adds permalink to torrent entries with copypasta for clipboard.
// @author       https://animebytes.tv/forums.php?action=viewthread&threadid=27103, codecopypasta
// @match        https://animebytes.tv/*
// @require      https://code.jquery.com/jquery-3.5.1.min.js
// @run-at       document-end
// @icon         https://www.google.com/s2/favicons?domain=animebytes.tv
// @grant        GM_setClipboard
// ==/UserScript==

window.addEventListener('load', (event) => {

	let plId = "permaLinkObj_";
	let plIdIndex = 0;

	$(".torrent_table .group_torrent").each(function() {
		let curTorrent = $(this);
		let injectionSite = $("a[title='Report torrent']", curTorrent)[0];

		// Check if "RP" exists, to prevent error on non-torrent pages (eg. series page)
		if(injectionSite == null || injectionSite === undefined){
			return false;
		}

		let currentId = plId + plIdIndex++;
		let title = $("a[href*='torrents2.php?id='], a[href*='torrents.php?id=']", curTorrent);
		let link = title.attr("href");
		// Alternate symbols: &#x1f517; &#10697; &#x1f4cb;
		injectionSite.insertAdjacentHTML("afterend", ` | <a href="javascript:void(0)" title='Permalink to torrent' id="${currentId}">&#x2398;</a>`);

		// Add on click event: copy link, add to history & toggle details
		$(`#${currentId}`).click(function() {
			navigator.clipboard.writeText(`https://animebytes.tv${link}`);
			window.history.pushState({}, "", `${link}`);
			title.trigger("click");
		});

	});

});
