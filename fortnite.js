require("dotenv").config();
var appKeys = require("./keys.js");
var request = require('request');
var cTable = require('console.table');
var inquirer = require('inquirer');
var moment = require('moment');
var colors = require('colors');


var Fortnite = (function() {
	var player = '';
	var platform = '';

	function choosePlayer() {
		inquirer
			.prompt([
				{
					type: "list",
					message: "Choose player",
					choices: ["SCHMITTERSTEIN", "yowtfkid", "loftedbeef", "big d 3"],
					name: "player"
				}, {
					type: "list",
					message: "Choose platform",
					choices: ["pc", "xbl", "psn"],
					name: "platform"
				}, {
					type: "checkbox",
					message: "What stats would you like to see",
					choices: ["Ranking", "Total Top 3", "Total Top 5", "Total Top 25", "Total Wins", "Total Win Percentage", "Total Matches Played", "Total Kills", "Recent Matches"],
					name: "stats"
				}
			]).then(function(resp) {
				player = resp.player;
				platform = resp.platform;
				stats = resp.stats;
				fetchData(player, platform, stats);
			});
	}

	function fetchData(player, platform, stats) {
		var options = {
		  url: `https://api.fortnitetracker.com/v1/profile/${platform}/${player}`,
		  headers: {
		    'TRN-Api-Key': appKeys.fortniteKeys.key
		  }
		};
		function callback(error, response, body) {
		  if (!error && response.statusCode == 200) {
		  	console.log('FORTNITE STATS'.bold.red);
		    var info = JSON.parse(body);
		    // console.log(info);
		    var data = {
		    	name: info.epicUserHandle
		    };
		    var recentMatches = {};

		    stats.forEach(function(element) {
					switch(element) {
					    case 'Ranking':
					        data.ranking = info.stats.p2.score.rank;
					        break;
					    case 'Total Top 3':
					    		data.totalTop3 = info.lifeTimeStats[0].value;
					    		break;
					    case 'Total Top 5':
					    		data.totalTop5 = info.lifeTimeStats[1].value;
					    		break;
					    case 'Total Top 25':
					    		data.totalTop25 = info.lifeTimeStats[5].value;
					    		break;
							case 'Total Matches Played':
									data.totalMatchesPlayed = info.lifeTimeStats[7].value;
									break;
							case 'Total Wins':
									data.totalWins = info.lifeTimeStats[8].value;
									break;
							case 'Total Win Percentage':
									data.totalWinPercentage = info.lifeTimeStats[9].value;
									break;
							case 'Total Kills':
									data.totalKills = info.lifeTimeStats[10].value;
									break;
							case 'Recent Matches':
									recentMatches.match = getRecentMatches(info);
									break;
					}
		    });
		    
		    logData(data);
		    //if recent matches are selected, show recent matches
		    if(recentMatches.match !== undefined) {
		    	logMatches(recentMatches);	
		    }
		    
		  }
		}
		 
		request(options, callback);
	}

	function getRecentMatches(info) {
		var data = [];
		var recentMatches = info.recentMatches;
		// var tempMatch = [];
		recentMatches.forEach(function(element, index) {
			// console.log(element);
			if(index < 5) {
				data.push({
					match: `SESSION ${index + 1}`,
					score: element.score,
					time: moment(element.dateCollected.substring(0, 10), "YYYYMMDD").fromNow(),
					matches: element.matches,
					kills: element.kills,
					top1: element.top1,
					top3: element.top3,
					top6: element.top6,
					top25: element.top25
				});				
			}

		});
		// console.log(data);
		return data;
	}

	function logMatches(data) {
		var matches = data.match;
		console.log('RECENT MATCHES'.bold.red);
		matches.forEach(function(element) {
			console.table([element]);
		});
	}

	function logData(data) {
		console.table([data]);
		console.log('________________________________________________________________________'.green);
	}

	function init() {
		choosePlayer();
	}

	return {
		init: init
	}
})();

Fortnite.init();


 
