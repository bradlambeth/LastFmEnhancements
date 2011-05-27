
// options request
var checkPage =false;
if (!document.getElementById('fourOhFour') && document.location.pathname.match(/\/user\/[A-Za-z0-9\_\-]+$/)){
	checkPage=true;}

chrome.extension.sendRequest({name: "getPreferences"},
     function(response){
	 	if (response.prefWeekly) if (checkPage) this.weeklyOn(); 
		if (response.prefTopMenu) this.topMenuOn(); else showLastFm();
     });


// ===
// Moves the left menu bar to the top of the page
function showLastFm() {
	if(document.getElementById('secondaryNavigation')) document.getElementById('secondaryNavigation').style.display = "block"; 
	document.getElementById('content').style.display = "block";
	document.getElementById('LastFooter').style.display = "block";}

function topMenuOn() { 

	if(document.getElementById('secondaryNavigation')) {

	function addCss(jsurl) {
	    var js = document.createElement('link'); js.href = jsurl; js.rel="stylesheet"; js.type = 'text/css';
		$("body").prepend(js);
	    //document.body.previousSibling.appendChild(js);
	}
	addCss(chrome.extension.getURL("./sources/topmenu.css"));
	var secondaryNavigation = document.getElementById('secondaryNavigation');
	document.getElementById("page").getElementsByTagName('div')[0].insertBefore(secondaryNavigation, document.getElementById("content"));
	};
	showLastFm();
}

// ===
// Adds weekly chart tables on last.fm user profile pages
// based on http://userscripts.org/scripts/show/31560
function weeklyOn() {
 
/***	    localization strings	***/
var str_editPhrase = Array();
str_editPhrase["en"] = "See more/Edit"; str_editPhrase["de"] = "Weitere anzeigen"; str_editPhrase["it"] = "Visualizza tutti"; str_editPhrase["fr"] = "Voir plus"; str_editPhrase["es"] = "Ver más";
str_editPhrase["pt"] = "Ver mais"; str_editPhrase["ru"] = "Далее"; str_editPhrase["pl"] = "Zobacz więcej"; str_editPhrase["jp"] = "もっと見る"; str_editPhrase["cn"] = "查看更多/编辑";
str_editPhrase["se"] = "Se mer"; str_editPhrase["tr"] = "Daha fazlası"; 
var str_topArtist = Array();
str_topArtist["en"] = "Top Artists"; str_topArtist["de"] = "Top-Künstler"; str_topArtist["it"] = "Artisti"; str_topArtist["fr"] = "Top Artistes"; str_topArtist["es"] = "Artistas";
str_topArtist["pt"] = "artistas"; str_topArtist["ru"] = "Лучшие исполнители"; str_topArtist["pl"] = "wykonawców"; str_topArtist["jp"] = "ベストアーティスト"; str_topArtist["cn"] = "最佳艺术家";
str_topArtist["se"] = "Toppartister"; str_topArtist["tr"] = "Popüler Sanatçılar";
var str_topTrack = Array();
str_topTrack["en"] = "Top Tracks"; str_topTrack["de"] = "Top-Titel"; str_topTrack["it"] = "Brani"; str_topTrack["fr"] = "Top Titres"; str_topTrack["es"] = "Temas"; str_topTrack["pt"] = "tocadas";
str_topTrack["ru"] = "Рейтинг композиций"; str_topTrack["pl"] = "utworów"; str_topTrack["jp"] = "ベストトラック "; str_topTrack["cn"] = "最佳单曲"; str_topTrack["se"] = "Topplåtar"; str_topTrack["tr"] = "Popüler Parçalar";
var str_topAlbum = Array();
str_topAlbum["en"] = "Top Albums"; str_topAlbum["de"] = "Top-Alben"; str_topAlbum["it"] = "Album"; str_topAlbum["fr"] = "Top Albums"; str_topAlbum["es"] = "Álbumes"; str_topAlbum["pt"] = "álbuns";
str_topAlbum["ru"] = "Лучшие альбомы"; str_topAlbum["pl"] = "albumy"; str_topAlbum["jp"] = "ベストアルバム"; str_topAlbum["cn"] = "截至"; str_topAlbum["se"] = "Toppalbum"; str_topAlbum["tr"] = "Popüler Albümler";
var str_next = Array();
str_next["en"] = "next week"; str_next["de"] = "nächste Woche"; str_next["it"] = "prossima settimana"; str_next["fr"] = "semaine prochaine"; str_next["es"] = "próxima semana"; str_next["pt"] = "próxima semana";
str_next["ru"] = "следующей неделе"; str_next["pl"] = "przyszłym tygodniu"; str_next["jp"] = "来週"; str_next["cn"] = "下週"; str_next["se"] = "nästa vecka"; str_next["tr"] = "next Week";
var str_previous = Array();
str_previous["en"] = "previous week"; str_previous["de"] = "vorherige Woche"; str_previous["it"] = "settimana precedente"; str_previous["fr"] = "semaine précédente"; str_previous["es"] = "semana anterior";
str_previous["pt"] = "semana anterior"; str_previous["ru"] = "предыдущей неделе"; str_previous["pl"] = "poprzednim tygodniu"; str_previous["jp"] = "前の週"; str_previous["cn"] = "前一周";
str_previous["se"] = "föregående vecka"; str_previous["tr"] = "previous week";
var str_loading = Array();
str_loading["en"] = "Weekly charts are loading..."; str_loading["de"] = "Wöchentliche Charts laden..."; str_loading["it"] = "Caricamento..."; str_loading["fr"] = "Chargement..."; str_loading["es"] = "Cargando...";
str_loading["pt"] = "Carga..."; str_loading["ru"] = "Погрузка..."; str_loading["pl"] = "Ładowanie..."; str_loading["jp"] = "読み込んでいます"; str_loading["cn"] = "载入中";
str_loading["se"] = "Laddar..."; str_loading["tr"] = "Yükleme...";
var str_settings = Array();
str_settings["en"] = "Settings"; str_settings["de"] = "Einstellungen"; str_settings["it"] = "Impostazioni"; str_settings["fr"] = "Paramètres"; str_settings["es"] = "Configuración";
str_settings["pt"] = "Configurações"; str_settings["ru"] = "Настройки"; str_settings["pl"] = "Ustawienia"; str_settings["jp"] = "設定"; str_settings["cn"] = "設置";
str_settings["se"] = "Inställningar"; str_settings["tr"] = "Settings";
var str_weekly = Array();
str_weekly["en"] = "weekly charts for"; str_weekly["de"] = "Wochencharts für"; str_weekly["it"] = "classifiche settimanali per"; str_weekly["fr"] = "charts hebdo pour"; str_weekly["es"] = "listas de la semana de";
str_weekly["pt"] = "Tabelas semanais para"; str_weekly["ru"] = "чарты недели из"; str_weekly["pl"] = "rankingi tygodniowe dla"; str_weekly["jp"] = "週間チャート 対象"; str_weekly["cn"] = "周排行榜 类别";
str_weekly["se"] = "veckolistor för"; str_weekly["tr"] = "haftalık listeler";

/***	end localization strings	***/

chrome.extension.sendRequest({'name':'fetchLang', 'path':window.location.hostname}, 
		function(lang){ localStorage.setItem("lang", lang)});

function chartData(chartType) {
	this.chartType = chartType;
    	var container = document.createElement("table");
	container.setAttribute("id", this.chartType+"Weekly");
	container.setAttribute("class", "candyStriped chart");
	container.style.display = "none";
	document.getElementById("weeklyCharts").insertBefore(container,document.getElementById("weeklyOptions"));
	this.chartData = Array();
	this.chartHeader = Array();
}
chartData.prototype.chartType;
chartData.prototype.chartHeader;
chartData.prototype.chartData;
chartData.prototype.sendRequest = function() {
	var url = "/user/"+user+"/charts?charttype=weekly&subtype="+this.chartType + (week == 0 ? "" : "&range=" + week);
	xmlhttp.open("GET", url);
	xmlhttp.onreadystatechange=function() {
		if (xmlhttp.readyState == 4) {
			activeCharts.saveData(xmlhttp.responseText);
		}
	}
	xmlhttp.send(null)
}
chartData.prototype.loadData = function() {
	activeCharts = this;
	document.getElementById(this.chartType+"WeeklyLink").parentNode.className = "current";
	if (this.chartData[week] == null) {
		document.getElementById("ajaxIcon").style.display = "block";
		this.sendRequest();
	} else this.showData();
}
chartData.prototype.saveData = function(charts) {
	var tmp = "";
	if(charts.indexOf("<h3>") == -1) {
		this.chartHeader[week] = "<span class=\"h2Wrapper\"><a href=\"/user/"+user+"/charts?charttype=weekly&subtype="+this.chartType+"\">"+"No charts for this week."+"</a></span>";
		tmp = "<div style=\"padding: "+(maxCharts*10)+"px 0 "+(maxCharts*10)+"px 0 !important; color: #444 !important; text-align: center; font-size: 1.2em !important;\">No charts for this week.</div>";
	} else {
		var container = document.createElement("table");
		if (week == 0) {maxWeek = week = charts.substr(charts.lastIndexOf(".push(")+7, charts.substring(charts.lastIndexOf(".push(")+7).indexOf("\""))}
		charts = charts.substring(charts.indexOf("<h3>"), charts.lastIndexOf("</table>")+8); 
		container.innerHTML = charts;
		var i2 = 0;
		for (var i = 0; i < container.childNodes[2].childNodes[1].childNodes.length; i++) {		// showing as many entries as available
			if (container.childNodes[2].childNodes[1].childNodes[i].nodeType != 3 && i2 < maxCharts) {	 // stop after 10, though
				if (i % 2) tmp += "<tr>" + container.childNodes[2].childNodes[1].childNodes[i].innerHTML + "</tr>";
				else tmp += "<tr class=\"odd\">" + container.childNodes[2].childNodes[1].childNodes[i].innerHTML + "</tr>";
				i2++;
			}
		}
		this.chartHeader[week] = "<span class=\"h2Wrapper\"><a href=\"/user/"+user+"/charts?charttype=weekly&subtype="+this.chartType+"\">"+container.childNodes[0].innerHTML+"</a></span>";
	}
	this.chartData[week] = tmp;
	document.getElementById("ajaxIcon").style.display = "none";
	this.showData();
}
chartData.prototype.showData = function() {
	document.getElementById(this.chartType+"Weekly").innerHTML = this.chartData[week];
	document.getElementById(this.chartType+"Weekly").style.display = "table";
	document.getElementById("weeklyHeader").innerHTML = this.chartHeader[week];
	document.getElementById("weeklyChartsSeeMore").href = "/user/"+user+"/charts?charttype=weekly&subtype="+activeCharts.chartType;
	buildDatePicker();
}
chartData.prototype.hideData = function() {
	document.getElementById(this.chartType+"WeeklyLink").parentNode.className = "";
	document.getElementById(this.chartType+"Weekly").style.display = "none";
	document.getElementById("weeklyHeader").innerHTML = str_loading[localStorage.getItem("lang")];
	document.getElementById("weeklyChartsSeeMore").href = "/user/"+user+"/charts?charttype=weekly";
}

function buildDatePicker() {
	var datePick = document.getElementById("weeklyDatePicker");
	datePick.innerHTML = "<a href=\"javascript:void(0)\">&laquo; "+str_previous[localStorage.getItem("lang")]+"</a><a> | </a><a href=\"javascript:void(0)\">"+str_next[localStorage.getItem("lang")]+" &raquo;</a>";
	if (week == maxWeek) {
		datePick.lastChild.style.visibility = "hidden";
		datePick.childNodes[1].style.visibility = "hidden";
	}
	if (week == maxWeek - 10) {
		datePick.firstChild.style.visibility = "hidden";
		datePick.childNodes[1].style.visibility = "hidden";
	}
	datePick.firstChild.addEventListener('click',function(){if (document.getElementById("ajaxIcon").style.display == "none"){week--; activeCharts.hideData(); activeCharts.loadData();}}, false);
	datePick.lastChild.addEventListener('click',function(){if (document.getElementById("ajaxIcon").style.display == "none"){week++; activeCharts.hideData(); activeCharts.loadData();}}, false);
}

function showWeeklySettings() {
	if (document.getElementById("weeklyChartsSettings") == null) {
		var container = document.createElement("div");
		var dialogContent = "<table><tr><td style=\"padding:0px 3px 0px 0px !important; vertical-align:middle !important;\" rowspan=\"4\"><input id=\"mC1\" type=\"text\" name=\"maxCharts\" size=\"1\" style=\"padding-top: 0px !important; padding-bottom: 1px !important;\"> (0- 50): "+str_weekly[localStorage.getItem("lang")]+"</td><td style=\"padding:4px 0px 0 9px !important\"><input id=\"fC1\" type=\"radio\" name=\"firstCharts\" value=\"artist\"></td><td>"+str_topArtist[localStorage.getItem("lang")]+"</td></tr>"
		dialogContent += "<tr><td style=\"padding:4px 0px 0 9px !important\"><input id=\"fC2\" type=\"radio\" name=\"firstCharts\" value=\"track\"></td><td>"+str_topTrack[localStorage.getItem("lang")]+"</td></tr>"
		dialogContent += "<tr><td style=\"padding:4px 0px 0 9px !important\"><input  id=\"fC3\"type=\"radio\" name=\"firstCharts\" value=\"album\"></td><td>"+str_topAlbum[localStorage.getItem("lang")]+"</td></tr>";
		dialogContent += "</tr></table>";
		
		container.setAttribute("class", "dialogBox modulePreferences");
		container.setAttribute("id", "weeklyChartsSettings");
		container.style.position = "fixed";
		container.style.left = "40%";
		container.style.top = "100px";
		container.style.zIndex = "999999";
		container.style.visibility ="visible";
		
		container.innerHTML = "<a id=\"weeklyChartsSettingsClose\" href=\"javascript:void(0);\" class=\"dialogStatus dialogClose\" />";
		container.innerHTML += "<h3>"+str_settings[localStorage.getItem("lang")]+" <small>Weekly Charts</small></h3>";
		container.innerHTML += "<div class=\"dialogContent\">"+dialogContent+"</div><div class=\"dialogButtons\"><input type=\"submit\" id=\"weeklyChartsSettingsCancel\" class=\"button dialogButton dialogCancel\" value=\"Cancel\"><input type=\"submit\" id=\"weeklyChartsSettingsSubmit\" class=\"confirmButton dialogButton dialogConfirm\" value=\"Make it so\"></div>";

		document.getElementById("weeklyCharts").appendChild(container);
		
		var currFirstCharts = GM_getValue("firstCharts", "artist");
		
		if (currFirstCharts == "artist") document.getElementById("fC1").checked = true;
		else if (currFirstCharts == "track") document.getElementById("fC2").checked = true;
		else if (currFirstCharts == "album") document.getElementById("fC3").checked = true;
		
		document.getElementById("mC1").value = GM_getValue("maxCharts", 10);
		
		document.getElementById("weeklyChartsSettingsClose").addEventListener('click',function(){document.getElementById("weeklyCharts").removeChild(document.getElementById("weeklyChartsSettings"));}, false);
		document.getElementById("weeklyChartsSettingsCancel").addEventListener('click',function(){document.getElementById("weeklyCharts").removeChild(document.getElementById("weeklyChartsSettings"));}, false);
		document.getElementById("weeklyChartsSettingsSubmit").addEventListener('click',function(){
			if (document.getElementById("mC1").value.match(/^[0-9]+$/) && document.getElementById("mC1").value != maxCharts) {
				GM_setValue("maxCharts", document.getElementById("mC1").value);
				maxCharts = document.getElementById("mC1").value;
				for (var i = maxWeek; i > 0; i--) {
					weeklyArtist.chartData[i] = null;
					weeklyTrack.chartData[i] = null;
					weeklyAlbum.chartData[i] = null;
				}
				document.getElementById("ajaxIcon").style.margin = (maxCharts*11.3)+"px auto "+(maxCharts*11.4)+"px auto";
			}
			if (document.getElementById("fC1").checked == true) GM_setValue("firstCharts", "artist");
			else if (document.getElementById("fC2").checked == true) GM_setValue("firstCharts", "track");
			else if (document.getElementById("fC3").checked == true)  GM_setValue("firstCharts", "album");
			activeCharts.hideData();
			activeCharts.loadData();
			document.getElementById("weeklyCharts").removeChild(document.getElementById("weeklyChartsSettings"));
		}, false);
	}
}

function firstLoad() {
	var putHere = 9;
/*
if(document.getElementById('idBadgerUser')) {
	if (document.getElementById("idBadgerUser").innerText == $("div.badgeHead h1")[0].innerHTML) var putHere =9;}*/
	

	var container = document.createElement("div");
	container.setAttribute("class", "module chart");container.setAttribute("id", "weeklyCharts");	

	this.tmp = "<span class=\"moduleButtons\"><a id=\"weeklySettings\" href=\"javascript:void(0)\" class=\"mEdit icon\"><img class=\"settings_icon transparent_png\" height=\"9px\" width=\"9px\" src=\"http://cdn.last.fm/flatness/icons/settings.2.png\"><span>"+str_settings[localStorage.getItem("lang")]+"</span></a></span>";
	tmp += "<h2 id=\"weeklyHeader\" class=\"h2Brushed\">"+str_loading[localStorage.getItem("lang")]+"</h2>";
	tmp += "<div class=\"horizontalOptions clearit\"><ul><li><a id=\"artistWeeklyLink\" name=\"artist\" href=\"javascript:void(0)\">"+str_topArtist[localStorage.getItem("lang")]+"</a></li><li><a  id=\"trackWeeklyLink\" name=\"track\" href=\"javascript:void(0)\">"+str_topTrack[localStorage.getItem("lang")]+"</a></li><li><a id=\"albumWeeklyLink\" name=\"album\" href=\"javascript:void(0)\">"+str_topAlbum[localStorage.getItem("lang")]+"</a></li></ul></div>";
	tmp += "<span id=\"weeklyOptions\" class=\"moduleOptions\"><a id=\"weeklyChartsSeeMore\" href=\"/user/"+user+"/charts?charttype=weekly\">"+str_editPhrase[localStorage.getItem("lang")]+"</a></span>";
	tmp += "<span id=\"weeklyDatePicker\" class=\"horizontalOptions\" style=\"float: left !important; margin-top: -15px !important;\"></span>"; 
	
	container.innerHTML = tmp;
	document.getElementById("content").childNodes[3].childNodes[1].insertBefore(container, document.getElementById("content").childNodes[3].childNodes[1].childNodes[putHere].nextSibling);
	
	var ajaxIcon = document.createElement("img");
	ajaxIcon.src = chrome.extension.getURL("./sources/ajaxloader.gif");
	ajaxIcon.style.margin = (maxCharts*11.3)+"px auto "+(maxCharts*11.4)+"px auto";
	ajaxIcon.style.display = "block";
	ajaxIcon.id = "ajaxIcon";
	document.getElementById("weeklyCharts").insertBefore(ajaxIcon, document.getElementById("weeklyOptions"));	
	
	document.getElementById("artistWeeklyLink").addEventListener('click',function(){if (document.getElementById("ajaxIcon").style.display == "none"){activeCharts.hideData(); weeklyArtist.loadData();}}, false);		// adding event handlers to our tabs
	document.getElementById("trackWeeklyLink").addEventListener('click',function(){if (document.getElementById("ajaxIcon").style.display == "none"){activeCharts.hideData(); weeklyTrack.loadData();}}, false);
	document.getElementById("albumWeeklyLink").addEventListener('click',function(){if (document.getElementById("ajaxIcon").style.display == "none"){activeCharts.hideData(); weeklyAlbum.loadData();}}, false);
	document.getElementById("weeklySettings").addEventListener('click',function(){showWeeklySettings();}, false);
	
}

if (window.location.pathname.match(/\/user\/[A-Za-z0-9\_\-]+$/)) {
	// some globals following up	
	var xmlhttp = false;
	var user = window.location.pathname.substring(window.location.pathname.substring(0).lastIndexOf("/") + 1);
	var week = 0; var maxWeek = 0; var maxCharts = GM_getValue("maxCharts", 10); var lang;
	
	if (!xmlhttp && typeof XMLHttpRequest!='undefined') {
		try { xmlhttp = new XMLHttpRequest(); }
		catch (e) { xmlhttp=false; }
	}
	if (!xmlhttp && window.createRequest) {
		try { xmlhttp = window.createRequest(); } 
		catch (e) { xmlhttp=false; }	
	}
		
	firstLoad();		// building some basic structure to work on
	
	var weeklyArtist = new chartData("artist"); var weeklyTrack = new chartData("track"); var weeklyAlbum = new chartData("album");
	
	var firstCharts = GM_getValue("firstCharts", "artist");	
	if (firstCharts == "artist") var activeCharts = weeklyArtist;	
	if (firstCharts == "track") var activeCharts = weeklyTrack;	
	if (firstCharts == "album") var activeCharts = weeklyAlbum;	
	
	activeCharts.loadData();
	}
} 

// ===
// Removes an amount of known ads from Last.FM without leaving blank space like AdBlock
// based on http://userscripts.org/scripts/show/60622
(function(){
	var adIDAry = ['LastAd_Top','LastAd_Mid','LastAd_Bot','LastAd_Bottom','footer_ads','LastAd_TopRight','LastAd_BottomRight'];
	var classNameAry = ['LastAd'];
	var tempEle = "";
	var tempEles = "";
	// remove known ad ids
	for (var i = 0; i < adIDAry.length; i++) {
		tempEle = document.getElementById(adIDAry[i]);
		if (tempEle) tempEle.parentNode.removeChild(tempEle);
	}
	// remove known ad class names
	for (var i = 0; i < classNameAry.length; i++) {
		tempEles = document.getElementsByClassName(classNameAry[i]);
		for (var j = 0; j < tempEles.length; j++) {
			tempEles[j].parentNode.removeChild(tempEles[j]);
		}
	}
})();


// ===
// Replaces the "Listening Now" status of friends with the name of the artist and the song they are listening to
// based on http://userscripts.org/scripts/show/67360
var friends=document.getElementsByClassName("vcard"); var NumOfFriends=friends.length; 
for (i=1; i<NumOfFriends; i++){ 	
		mainNode=friends[i].getElementsByTagName("p")[0];		
		if(mainNode && checkPage){				
			song=mainNode.getAttribute('title');
			song=song.replace(/Hört gerade|Écoute|Słucha teraz|Listening to|Ouvindo|Lyssnar på|dinliyor|Escuchando a|In ascolto di|を再生中|正在收听|Слушает/g, '');
			mainNode.getElementsByTagName("span")[0].childNodes[0].nodeValue=song;		
		}
}


// ===
// Adds zoom to the album cover on last.fm/music 
// based on http://userscripts.org/scripts/show/69717
var cover, img, img2, lcase, url;

if ((cover = document.getElementById('albumCover')) &&
	(img = cover.getElementsByTagName('img')[0]) &&
	(lcase = cover.getElementsByTagName('span')[0])) {
		lcase.style.cursor = 'pointer';
		lcase.addEventListener('click', function() {
			if (!img2) {
				img2 = document.createElement('img'); img2.src = img.src.replace(/\/174s\//, '/300x300/');
				img2.width = 450; img2.style.position = 'absolute';
				img2.style.top = '42px'; img2.style.left = '50%'; img2.style.marginLeft = '-225px';img2.style.zIndex = 1000000;
				img2.style.border = '1px solid #ccc';img2.style.background = '#333';img2.style.padding = '5px';
				img2.addEventListener('click', function() {
					document.getElementById('page').removeChild(img2);
					$('body').find('div:last').remove();
				}, false);
			}
			document.getElementById('page').appendChild(img2);
			$('body').append('<div id="jquery-overlay"></div>');
			$('#jquery-overlay').css({backgroundColor:'#000',opacity:'0.8',width:'100%',height:'100%'}).fadeIn();
	}, false);
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
