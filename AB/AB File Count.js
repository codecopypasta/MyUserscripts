// ==UserScript==
// @name         AB File Count
// @version      1.0
// @description  Displays the number of files in a torrent
// @author       codecopypasta
// @match        https://animebytes.tv/torrents.php*
// @match        https://animebytes.tv/torrents2.php*
// @require      https://code.jquery.com/jquery-3.5.1.min.js
// @icon         https://www.google.com/s2/favicons?domain=animebytes.tv
// @grant        none
// ==/UserScript==

$(document).ready(function() {
	'use strict';

	 $(".torrent_table .pad[id^=torrent_]").each(function() {
		 let numOfFiles = $(this).find("[id^=filelist_]").find("tr").length - 1;
		 let target = $(this).find("li [href$=filelist]");
		 target.text(target.text() + ` (${numOfFiles})`);
	});

});
