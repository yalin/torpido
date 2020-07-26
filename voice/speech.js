const Discord = require('discord.js');
const fs = require('fs');
const {
    resolve
} = require('path');

/**
 * 
 * @param {String} text Speech text
 * @param {Discord.VoiceChannel} vc VoiceConnection
 * @param {String} botnick Bot's nick
 */
exports.botSpeechResponse = async (text, vc) => {
    var words = text.split(' ')


    if (words.includes('torpido')) {

        var commandIndex = words.indexOf('torpido')
        var commandArray = words.slice(commandIndex + 1)

        // what time is it
        if (commandArray.includes('saat')) {
            var date = new Date();
            var hrs = parseInt(date.getHours()) + 3 // +3 added because of Istanbul, TODO: change to timezone
            var time = hrs + ' ' + date.getMinutes()
            return {
                'response': ('saat ' + time),
                'accent': 'tr'
            }
        }

        // who is in channel
        if (['kanalda', 'kimler', 'var'].every(v => commandArray.includes(v))) {
            var people = vc.members
            var peopleInChannel = []
            people.forEach(element => {
                peopleInChannel.push(element.user.username)
            });
            var peopleRest = peopleInChannel.filter(function (x) {
                return x != botnick;
            });
            return {
                'response': 'kanalda ' + peopleRest.join('  ') + ' bir de ben varım',
                'accent': 'tr'
            }
        }

        // welcome
        if (text.includes('hoş geldin')) {
            return {
                'response': 'hoşbuldum',
                'accent': 'tr'
            }
        }

        // whats up
        if (text.includes('ne haber')) {
            return {
                'response': 'daha iyi günlerim olmuştu',
                'accent': 'tr'
            }
        }

        // roll a dice
        if (commandArray.includes('zar')) {
            return {
                'response': dice().toString(),
                'accent': 'tr'
            }
        }

        // flip a coin
        if (['yazı', 'tura'].every(v => commandArray.includes(v))) {
            return {
                'response': flipcoin(),
                'accent': 'tr'
            }
        }

        // choose dota hero
        if (['kimi', 'seçeyim'].every(x => commandArray.includes(x))) {
            return {
                'response': await whichDotaHero(),
                'accent': 'en'
            }
        }
    }
}


function dice() {
    return Math.floor(6 * Math.random()) + 1
}

function flipcoin() {
    let rn = Math.floor(2 * Math.random()) + 1
    return (rn == 1) ? 'yazı' : 'tura'
}

async function whichDotaHero(callback) {
    let heroesurl = "https://api.opendota.com/api/heroes";

    var selectedHero = await fetch(heroesurl, {
            method: 'Get'
        })
        .then(res => res.json())
        .then((json) => {
            let herolist = []
            for (const hero of json) {
                herolist.push(hero['localized_name']);
            }
            return herolist[Math.floor(Math.random() * herolist.length)]
        }).catch(console.error)

    return selectedHero
}