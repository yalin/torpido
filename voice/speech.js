const Discord = require('discord.js');

/**
 * 
 * @param {String} text Speech text
 * @param {Discord.VoiceChannel} vc VoiceConnection
 * @param {String} botnick Bot's nick
 */
exports.botSpeechResponse = (text, vc) => {
    var words = text.split(' ')
    if (words.includes('torpido')) {
        
        var commandIndex = words.indexOf('torpido')
        var commandArray = words.slice(commandIndex + 1)
        var commandStr = commandArray.join(' ')

        // what time is it
        if (commandArray.includes('saat')) {
            var date = new Date();
            var hrs = parseInt(date.getHours()) + 3 // +3 added because of Istanbul, TODO: change to timezone
            var time = hrs + ' ' + date.getMinutes()
            return ('saat ' + time)
        }

        // who is in channel
        let whoisinchannel = ['kanalda', 'kimler', 'var']
        if (whoisinchannel.every(v => commandArray.includes(v))) {
            var people = vc.members
            var peopleInChannel = []
            people.forEach(element => {
                peopleInChannel.push(element.user.username)
            });
            var peopleRest = peopleInChannel.filter(function (x) {
                return x != botnick;
            });
            return 'kanalda ' + peopleRest.join('  ') + ' bir de ben varım'
        }

        // welcome
        if (commandArray.includes('hoş geldin')) {
            return 'hoşbuldum'
        }

        // whats up
        if (commandArray.includes('ne haber')) {
            return 'daha iyi günlerim olmuştu'
        }

        // roll a dice
        if (commandArray.includes('zar')) {
            return dice().toString()
        }

        let aCoin = ['yazı', 'tura']
        if (aCoin.every(v => commandArray.includes(v))) {
            return flipcoin()
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