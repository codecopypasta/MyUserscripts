// ==UserScript==
// @name         Steam - Review Percentage Display
// @version      0.1
// @description  Always show the number of reviews
// @author       codecopypasta
// @match        https://store.steampowered.com/app/*
// @icon         https://www.google.com/s2/favicons?domain=steampowered.com
// @grant        none
// @require      https://code.jquery.com/jquery-3.4.1.min.js
// ==/UserScript==

$(document).ready(function(){
	'use strict';

	$(".glance_ctn .glance_ctn_responsive_left .user_reviews_summary_row[data-tooltip-html]").each(function(){
		let parent = $(this)
		let target = parent.find(".responsive_hidden");
		let perc = parent.data("tooltip-html").match(/(\d+% of) the ([\d\,]+)/);
		if(target === undefined || target == null || perc == null)
			return;
		perc = perc[1] + " " + perc[2];
		target.text(`(${perc})`);
	});
});