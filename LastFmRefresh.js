// displays lyrics on trackpage and /user/page
// based on http://userscripts.org/scripts/show/25208

Function.prototype.bind =
	function(object) {
		var method = this;
		return function () {method.apply(object, arguments);
	};
}

String.prototype.trim = function() {
	return this.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
};

chrome.extension.sendRequest({name: "getPreferences"},
     function(response){ if (response.prefLyrics) this.LyricsOn();  });

function LyricsOn() {
	if (!document.getElementById('fourOhFour') && (document.location.pathname.match(/\/user\/[A-Za-z0-9\_\-]+$/) || document.location.pathname.match(/music\/.+\/_\/.+$/))) new LyricsPanel(); }

function LyricsPanel() {

	var artist;
	var track;
	var lang;

	this.loadContent = function() {
		if (document.location.pathname.match(/music\/.+\/_\/.+/)){
			breadcrumb = document.getElementsByClassName("breadcrumb").item(0);
			artist = breadcrumb.getElementsByTagName("a")[0].textContent;
			track = breadcrumb.getElementsByTagName("span")[0].textContent;
		} else if (document.location.pathname.match(/\/user\/[A-Za-z0-9\_\-]+$/)){
			subjectCell = document.getElementsByClassName("subjectCell").item(0);
			artist = subjectCell.getElementsByTagName("a")[0].textContent;
			track = subjectCell.getElementsByTagName("a")[1].textContent;
		}
		
		var lastParenthesisIndex = track.lastIndexOf('(');
		if (lastParenthesisIndex != -1)
			track = track.substring(0, track.lastIndexOf('('));
		track = track.trim();

		var lyricsUrl =  "http://lyrics.wikia.com/api.php?action=lyrics&fmt=json&func=getSong"
				+ "&artist=" + encodeURIComponent(artist)
				+ "&song=" + encodeURIComponent(track);

		chrome.extension.sendRequest({'name':'fetchLyrics', 'url':lyricsUrl}, 
				handleLyricsResponse);

		function handleLyricsResponse(lyrics) {
			var found = lyrics != null;
			var lyricsPane = found ? lyrics : "<br/><img src=http:\/\/cdn.last.fm/marvin.gif/>"; 
			
			chrome.extension.sendRequest({'name':'fetchLang', 'path':window.location.hostname}, 
				function(lang){ console.log("hallo!");

			lyricsPane += "<br/><span class=\"moduleOptions\">"
				+ "<a href=\"http://lyrics.wikia.com/index.php?action=edit&title="
		   		+ encodeURIComponent(artist) + ":" + encodeURIComponent(track)
		   		+ "\" class=\"icon\"><span>"+ str_edit[lang] +"</span></a>";
			if (!found)
				lyricsPane += "<a href=\"http://lyrics.wikia.com/lyrics/Special:Search?go=1&search="
					+ (artist + ":" + track).replace(/ /g, '+')
					+ "\"><span>"+str_search[lang]+"</span></a>";
				lyricsPane += "</span>";

				content.innerHTML = "<small id=\"lyricsInfo\">"+artist+" - "+track+"</small><br/>";
				content.innerHTML += lyricsPane;
				});
		}
	}

	this.toggleDisplayed = function() {
		this.panelDisplayed = !this.panelDisplayed;
		GM_setValue("panelDisplayed", this.panelDisplayed);
		this.updateDisplayed();
	}

	this.updateDisplayed = function() {
		if (this.panelDisplayed && !this.contentLoaded) {
			this.loadContent();
			this.contentLoaded = true;
		}
		this.collapser.innerHTML = this.panelDisplayed ? "Hide" : "Show";
		content.style.display = this.panelDisplayed ? ""  : "none";
	}

	this.contentLoaded = false;
	this.panelDisplayed = GM_getValue("panelDisplayed", true);
	var menu = new DropDownMenu();

	var header = document.createElement("h2");
	$("h2.heading").removeClass("first");
	header.setAttribute("class", "first heading");
	header.innerHTML = "<span class=\"h2Wrapper\">Lyrics</span>";
	content = document.createElement("div");
	this.panel = document.createElement("div");
	this.panel.setAttribute("class", "module");

	this.collapser = document.createElement("a");
	this.collapser.addEventListener("click", this.toggleDisplayed.bind(this), false);
	this.collapser.style.cursor = "pointer";
	menu.addItem(this.collapser);

	this.panel.appendChild(menu.getComponent());
	this.panel.appendChild(header);
	this.panel.appendChild(content);

	this.updateDisplayed();
	$('div.rightCol').prepend(this.panel);
}

function DropDownMenu() {

	this.getComponent = function() {
		return this.menu;
	}

	this.addItem = function(element) {
		var item = document.createElement("li");
		item.appendChild(element);
		this.menuList.appendChild(item);
	}


	this.menuButton = document.createElement("a");
	this.menuButton.setAttribute("class", "lfmButton lfmSmallButton lfmSmallModuleButton");
	this.menuList = document.createElement("ul");
	this.menuList.setAttribute("class", "lfmDropDownBody");
	this.menuList.style.display = "none";
	this.menuList.style.position = "absolute";
	this.menuList.style.zIndex = "99";
	this.menu = document.createElement("div");
	this.menu.setAttribute("class", "moduleDropDown toggle");
	this.menu.appendChild(this.menuButton);
	this.menu.appendChild(this.menuList);

	document.addEventListener("click", function(event) {
		this.menuList.style.display = event.target == this.menuButton
			&& this.menuList.style.display == "none" ? ""  : "none";
	}.bind(this), false);
}

// Greasemonkey hack
GM_getValue = function(name, defaultValue) {
	var value = localStorage.getItem(name);
	if (!value) return defaultValue;
	var type = value[0]; value = value.substring(1);
	switch (type) {
		case 'b': return value == 'true';
		case 'n': return Number(value);
		default:  return value;
	}
}
GM_setValue = function(name, value) {
		value = (typeof value)[0] + value;
		localStorage.setItem(name, value);
}

// ===
// Updates recently played track lists every minute without having to reload the page
// based on http://userscripts.org/scripts/show/60177
var getTrackInfo = $("tr.first > td.smallmultibuttonCell a").attr("href");
var tracksTable=document.getElementById("deletablert");
var profileTable=document.getElementsByTagName("table");
for (i=0;i<profileTable.length;i++){
	if (profileTable[i].id=="recentTracks"){
		profileTable=profileTable[i];
		break;
	}
}
var minute; var xmlHttp; var timer=30*1000; 

function ajax() {
	xmlHttp=new XMLHttpRequest;
	xmlHttp.overrideMimeType("text/xml");
	xmlHttp.open("GET",window.location.href,true);
	if (tracksTable) {
		xmlHttp.onreadystatechange=tracksPage;
	}
	else if (profileTable){
		xmlHttp.onreadystatechange=profilePage;
	}
	xmlHttp.send(null);
}

function tracksPage() {
	if (xmlHttp.readyState==4){
		var newText=xmlHttp.responseText;
		newText=newText.substring(newText.indexOf('id="deletablert"')-50);
		newText=newText.substring(newText.indexOf('<table '),newText.indexOf('<div class="pagination">'));
		tracksTable.innerHTML=newText;
		minute=setTimeout(ajax,timer);
	}
}

function profilePage(){
	if (xmlHttp.readyState==4){
		var newText=xmlHttp.responseText;
		newText=newText.substring(newText.indexOf('id="recentTracks"')-50,newText.indexOf('<span class="moduleOptions">'));
		newText=newText.substring(newText.indexOf("<table "),newText.indexOf('</table>')+8);
		profileTable.innerHTML=newText;
		minute=setTimeout(ajax,timer);
		if ( ($("small#lyricsInfo").length > 0) && (getTrackInfo != $("tr.first > td.smallmultibuttonCell a").attr("href")) ) { 
			getTrackInfo = $("tr.first > td.smallmultibuttonCell a").attr("href");
	$("small#lyricsInfo").parent().parent().fadeOut("slow", function () {
	  	$(this).remove();
	  	});			
//			$("small#lyricsInfo").parent().parent().remove();
			new LyricsPanel();}
	}
}
if (document.location.pathname.match(/\/user\/[A-Za-z0-9\_\-]+$/)) 
	minute=setTimeout(ajax,timer);


var str_edit = Array();
str_edit["en"] = "Edit"; str_edit["de"] = "Bearbeiten"; str_edit["it"] = "Modifica"; str_edit["fr"] = "Modifier"; str_edit["es"] = "Editar";
str_edit["pt"] = "Editar"; str_edit["ru"] = "Изменить"; str_edit["pl"] = "Edytuj"; str_edit["jp"] = "書いてみませんか"; str_edit["cn"] = "想帮忙吗";
str_edit["se"] = "Se mer"; str_edit["tr"] = "yardım etmek ister misin"; 

var str_search = Array();
str_search["en"] = "Search"; str_search["de"] = "Suchen"; str_search["it"] = "Cerca"; str_search["fr"] = "Recherche"; str_search["es"] = "Buscar";
str_search["pt"] = "Procurar"; str_search["ru"] = "Поиск"; str_search["pl"] = "Wyszukaj"; str_search["jp"] = "検索"; str_search["cn"] = "想帮忙吗";
str_search["se"] = "Redigera"; str_search["tr"] = "Ara";
