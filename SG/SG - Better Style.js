// ==UserScript==
// @name         SG - Better Style
// @version      1.1.1
// @description  Imrpove the Style for SG as per my personal liking
// @author       codecopypasta
// @match        https://www.steamgifts.com
// @match        https://www.steamgifts.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=steamgifts.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

	// Global CSS
	$("body").append(`
		<style type="text/css">
			/*Delete Button*/
			.sidebar__entry-delete {
				background-image: linear-gradient(#900 0%, #963 100%) !important;
			}

			/*Entered GAs*/
			.is-faded {
				opacity: .25 !important;
			}

			a.giveaway__heading__name {
				color: #4B72D4;
			}

			a:visited.giveaway__heading__name, a:visited.homepage_table_column_heading,
			a:visited.table__column__heading, .comment__description.markdown a:visited,
   			.page__description a:visited {
				/*color: #c99;*/
				color: purple;
			}
		</style>
	`);

})();
