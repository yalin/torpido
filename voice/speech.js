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
        let whoisinchannel = ['kanalda', 'kimler', 'var']
        var commandIndex = words.indexOf('torpido')
        var commandArray = words.slice(commandIndex + 1)
        var commandStr = commandArray.join(' ')

        if (commandArray.includes('saat')) {
            var date = new Date();
            var hrs = parseInt(date.getHours()) + 1
            var time = hrs + ' ' + date.getMinutes()
            return ('saat ' + time)
        }

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

        if (commandArray.includes('hoş geldin')) {
            return 'hoşbuldum'
        }

        if (commandArray.includes('ne haber')){
            return 'daha iyi günlerim olmuştu'
        }
    }
}