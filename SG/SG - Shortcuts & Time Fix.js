// ==UserScript==
// @name         SG - Shortcuts & Time Fix
// @version      1.2
// @description  SG GA new shortcut buttons, shortcut placement and time fix
// @author       codecopypasta
// @match        https://www.steamgifts.com/giveaway/*
// @icon         https://www.google.com/s2/favicons?domain=steamgifts.com
// @grant        GM_setClipboard
// ==/UserScript==

$(document).ready(function(){
	'use strict';

	// Fix time text
	let timeElement = $(".featured__column > span[data-timestamp]").first();
	let timestamp = timeElement.data("timestamp");
	let time = new Date(timestamp*1000);
	let inFuture = time.getTime() > Date.now();
	let diff = inFuture ? prettyTimeDiff(Date.now(), time.getTime()) : prettyTimeDiff(time.getTime(), Date.now());
	timeElement.html(`${timeElement.text()} (${diff.str})`);

	// Create a new row and move existing shortcuts there
	let original = $(".featured__heading");
	let shortcuts = $(`<div class="featured__heading"></div>`);
	original.after(shortcuts);
	original.children("a").each(function(){
		$(this).detach().appendTo(shortcuts);
	});


	// Add Steam DB link
	let link = shortcuts.children().first().attr("href").replace("store.steampowered.com", "steamdb.info");
	shortcuts.prepend(`<a rel="nofollow noopener" target="_blank" href="${link}"><i class="fa fa-database"></i></a>`);

	// Add copy button
	let customCopyButton = $(`<a><i class="fa fa-link" aria-hidden="true"></i></a>`);
	shortcuts.prepend(customCopyButton);
	customCopyButton.click(function(){
		let title = original.children().first().text();
		let url = window.location.href;
		let data = title + "\t" + url + "\t" + timestamp;
		console.log(data);
		navigator.clipboard.writeText(data);
	});

	function prettyTimeDiff(t1, t2){
		let diff = (t2 - t1) / 1000;
		let w = parseInt(diff/60/60/24/7);
		let d = parseInt(diff/60/60/24) - w*7;
		let h = parseInt(diff/60/60) - (w*7 + d)*24;
		let m = parseInt(diff/60) - (w*7*24 + d*24 + h)*60;
		return {str:`${w}w ${d}d ${h}h ${m}m`, "w":w, "d":d, "h":h, "m":m, "diff":diff};
	}

});