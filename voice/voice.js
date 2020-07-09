const Discord = require('discord.js');



/**
 * 
 * @param {Discord.Client} client Discord Client
 * @param {String} vcid Voice Channel Id
 * Returns 'undefined' if bot hasn't connected to a voice channel
 */
exports.GetVoiceConnection = (client, vcid) => {
    var vcc = client.voice.connections
    if (vcc.size == 0) return undefined;
    var vcdictlist = vcc.entries()
    for (const [k, v] of vcdictlist) {
        if (vcid == v.channel.id) {
            result = v
        }
    }
    return result
}

/**
 * 
 * @param {Discord.VoiceState} oldstate 
 * @param {Discord.VoiceState} newstate 
 */
exports.GetStateDifference = ( oldstate, newstate) => {

    if(oldstate.channelID != newstate.channelID) {}

}