// ==UserScript==
// @name         AB Better Torrent List
// @version      2.0
// @description  Formats torrent rows to increase readability
// @author       codecopypasta
// @match        https://animebytes.tv/torrents.php*
// @match        https://animebytes.tv/torrents2.php*
// @require      https://code.jquery.com/jquery-3.5.1.min.js
// @icon         https://www.google.com/s2/favicons?domain=animebytes.tv
// @grant        none
// ==/UserScript==

$(document).ready(function() {
	'use strict';

	 $(".group_torrent").each(function() {
		let rows = $(this).children("td");
		for(let i = 0; i < rows.length; i++){
			switch (i){
				case 0:
					// title
					let $target = $($(rows[i]).children("a")[0]);
					$target.html(formatTitle($target.html()));
					break;
				// case 3:
				// 	// seeds
				// 	$(rows[i]).css("color", "green");
				// 	break;
				// case 4:
				// 	// leeches
				// 	$(rows[i]).css("color", "red");
				// 	break;
			}
		}
	});

	function formatTitle(title){
		title = title.replace(/»\s+/, "<br>"); 
		title = title.replace(/\<br\>(.+?)\((.*?)\)($| \| <img)/, "<span class='uploader-name'>$2</span><br>$1$3");
		title = title.replace("Dual Audio", `<span style="color: #9f9">Dual Audio</span>`);
		title = title.replace("Softsubs", `<span style="color: #9ff">Softsubs</span>`);
		title = title.replace("Hardsubs", `<span style="color: #ff9">Hardsubs</span>`);
		title = title.replace("RAW", `<span style="color: #f66">RAW</span>`);
		title = title.replace("h264", `<span style="color: #c9c">h264</span>`);
		title = title.replace("h265", `<span style="color: #f6f">h265</span>`);
		title = title.replace("10-bit", `<span style="color: #99f">10-bit</span>`);
		title = title.replace("| <img", `<br><img`);
		return title;
	}

	$("body").append(`
	<style type="text/css">
		.group_torrent > td:nth-child(4){
			color: green;
		}
		.group_torrent > td:nth-child(5){
			color: red;
		}
		.group_torrent:nth-of-type(4n+2) {
			backdrop-filter: brightness(0.5);
		}
		.uploader-name{
			color: #39f;
			font-weight: bold;
		}
	</style>
	`);

});
