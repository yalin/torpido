const fs = require('fs');
const Discord = require('discord.js');
const ytdl = require('ytdl-core');
var youtubeSearch = require('youtube-search');
var googleTTS = require('google-tts-api');

var voice = require('./voice/voice.js')
let cfg = JSON.parse(fs.readFileSync('./config.json', 'utf-8'))
let msgs = JSON.parse(fs.readFileSync('./text/msgs.json', 'utf-8'))

const client = new Discord.Client();
const guild = new Discord.Guild(client);
const voiceChannel = new Discord.VoiceChannel(guild, {
    id: cfg.discord.channels.voice
});
const textChannel = new Discord.TextChannel(guild, {
    id: cfg.discord.channels.text
});
const logChannel = new Discord.TextChannel(guild, {
    id: cfg.discord.channels.log
});

// Youtube dispatcher
let ytdispatcher = Discord.StreamDispatcher;

// volume
let _musicVolume = 0.1
let _announceVolume = 1

// language
let speechlang = cfg.consts.speechlang
let languages = require('./text/langs.js').langs

// functions
function enteredChannel(username) {
    if (username == 'etsw') {
        // personal thingy
        username = 'etsv'
    }
    var vConnection = voice.GetVoiceConnection(client, voiceChannel.id)
    if (vConnection) {
        googleTTS(username + msgs.enteredchannel, speechlang, cfg.consts.speechspeed)
            .then(function (url) {
                ytdispatcher = vConnection.play(url, {
                    volume: _announceVolume
                });
            })
            .catch(function (err) {
                console.error(err.stack);
            });
    }
}

function exitChannel(username) {
    if (username == 'etsw') {
        username = 'etsv'
    }
    var vConnection = voice.GetVoiceConnection(client, voiceChannel.id)
    if (vConnection) {
        googleTTS(username + msgs.exitchannel, speechlang, cfg.consts.speechspeed)
            .then(function (url) {
                ytdispatcher = vConnection.play(url, {
                    volume: _announceVolume
                });
            })
            .catch(function (err) {
                console.error(err.stack);
            });
    }
}

function checkifPersonInVoiceChannel(msg) {
    var vc = msg.member.voice.channel;
    if (!vc) {
        msg.reply(msgs.notinchannel);
        return
    }

}
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {

    // checks if the command came from text channel
    if (msg.channel.id != cfg.discord.channels.text) return;

    if (msg.content[0] == cfg.prefix) {

        var args = msg.content.substring(1).split(' ');
        var cmd = args[0];
        var rest = args.splice(1);

        switch (cmd) {
            case 'ping':
                msg.reply('O Teoman\'i torpidoya sokarim!');
                break;

            case 'help':
                fs.readFile('help.md', 'utf8', (err, data) => {
                    msg.reply(data)
                });
                break;

            case 'join':
                voiceChannel.fetch().then(vc => {
                    vc.join().then(connection => {
                            // console.log("\n", connection.channel);
                            // connection.on('speaking', user => {
                            //     console.log('============================')
                            //     console.log('konusan :', user);
                            // })
                        })
                        .catch(console.error);
                })
                break;

            case 'leave':
                voiceChannel.fetch().then(vc => {
                        vc.leave()
                    })
                    .catch(console.error);
                break;

            case 'hash':
                // will fix next commit
                voiceChannel.fetch().then(vc => {
                        var memberss = vc.members
                        memberss.forEach(element => {
                            console.log("member :", element.user.username);
                        });
                        new Promise((resolve, reject) => {
                                vc.leave()
                            }).then(good => {
                                vc.join().catch(console.error);
                            })
                            .catch(console.error);
                    })
                    .catch(console.error);
                break;

            case 'play':
                if (!rest[0]) {
                    return msg.reply(' what to play ? - !play {youtube-link} - !play {keywords}')
                }
                var vc = msg.member.voice.channel;
                if (!vc) {
                    return msg.reply(msgs.notinchannel);
                }

                if (rest[0].startsWith('https://www.you')) {

                    vc.join().then(connection => {
                            const stream = ytdl(rest[0], {
                                filter: 'audioonly',
                            });

                            ytdispatcher = connection.play(stream, {
                                volume: _musicVolume
                            });

                            if (cfg.consts.leaveafterplay) {
                                ytdispatcher.on('finish', () =>
                                    voiceChannel.fetch().then(vc => {
                                        vc.leave()
                                    })
                                    .catch(console.error)
                                );
                            }
                        })
                        .catch(e => {
                            console.error(e);
                        });
                } else {
                    var opts = {
                        maxResults: 1,
                        key: cfg.youtube.key,
                        type: 'video'
                    };
                    var ytSearchKey = rest.join(' ')
                    youtubeSearch(ytSearchKey, opts, function (err, results) {
                        if (err) return console.log(err);

                        ytUrl = results[0]['link']
                        msg.reply(ytUrl)

                        vc.join().then(connection => {
                                const stream = ytdl(ytUrl, {
                                    filter: 'audioonly',
                                });

                                ytdispatcher = connection.play(stream, {
                                    volume: _musicVolume
                                });

                                if (cfg.consts.leaveafterplay) {
                                    ytdispatcher.on('finish', () =>
                                        voiceChannel.fetch().then(vc => {
                                            vc.leave()
                                        })
                                        .catch(console.error)
                                    );
                                }
                            })
                            .catch(e => {
                                console.error(e);
                            });
                    })
                }
                break;

            case 'stop':
                if (ytdispatcher)
                    ytdispatcher.destroy()
                break;

            case 'teoman':
                var vc = msg.member.voice.channel;
                if (!vc) {
                    return msg.reply(msgs.notinchannel);
                }
                vc.join().then(connection => {

                        const stream = ytdl('https://youtu.be/OWGvkzH2vH8', {
                            filter: 'audioonly',
                        });

                        ytdispatcher = connection.play(stream, {
                            volume: _musicVolume
                        });

                        if (cfg.consts.leaveafterplay) {
                            ytdispatcher.on('finish', () =>
                                voiceChannel.fetch().then(vc => {
                                    vc.leave()
                                })
                                .catch(console.error)
                            );
                        }
                    })
                    .catch(console.error)
                break;

            case 'yt':
                if (!rest[0]) {
                    return msg.reply('what to search? - !yt {keyword}')
                }
                var opts = {
                    maxResults: 1,
                    key: cfg.youtube.key,
                    type: 'video'
                };
                var ytSearchKey = rest.join(' ')
                youtubeSearch(ytSearchKey, opts, function (err, results) {
                    if (err) return console.log(err);
                    msg.reply(results[0]['link'])
                });
                break;

            case 'g':
                break;

            case 'say':
                var vc = msg.member.voice.channel;
                if (!vc) {
                    return msg.reply(msgs.notinchannel);
                }
                if (!rest[0]) {
                    return msg.reply(msgs.saywhat)
                }
                var vConnection = voice.GetVoiceConnection(client, voiceChannel.id)
                if (vConnection) {
                    googleTTS(rest.join(' '), speechlang, cfg.consts.speechspeed)
                        .then(function (url) {
                            ytdispatcher = vConnection.play(url, {
                                volume: _announceVolume
                            });
                        })
                        .catch(function (err) {
                            console.error(err.stack);
                        });
                }
                break;

            case 'vol':
                var vc = msg.member.voice.channel;
                if (!vc) {
                    return msg.reply(msgs.notinchannel);
                }
                if (!rest[0]) {
                    return msg.reply('volume: ' + _musicVolume)
                }
                _musicVolume = parseFloat(rest[0])
                if (ytdispatcher)
                    ytdispatcher.setVolume(_musicVolume)
                msg.reply(msgs.volumesetto + _musicVolume)

                break;

            case 'reload':
                cfg = JSON.parse(fs.readFileSync('./config.json', 'utf-8'))
                msgs = JSON.parse(fs.readFileSync('./text/msgs.json', 'utf-8'))
                break;

            case 'lang':
                var requestedLanguage = rest[0]
                if (languages.includes(requestedLanguage)) {
                    speechlang = requestedLanguage
                    return msg.reply(msgs.languagesetto + requestedLanguage)
                } else {
                    return msg.reply(msgs.nosuchlanguage + requestedLanguage)
                }
                break;

            default:
                break;
        }
    }
});

client.on('voiceStateUpdate', (oldState, newState) => {
    // write to log channel if only user entered or left a specific voice channel
    if (newState.channelID && newState.channelID == cfg.discord.channels.voice && newState.channelID != oldState.channelID) {
        // user enters the voice channel
        // bugfix = second condition added to catch only channel diff, not mute or deaf
        var u = new Discord.User(client, {
            id: oldState.id
        })
        u.fetch().then(info => {
            enteredChannel(info.username)
            logChannel.send('"' + info.username + '"' + msgs.enteredchannel)
        })

        console.log('girdi')
    } else if (oldState.channelID && oldState.channelID == cfg.discord.channels.voice && newState.channelID != oldState.channelID) {
        // user leaves the voice channel
        var u = new Discord.User(client, {
            id: oldState.id
        })
        u.fetch().then(info => {
            exitChannel(info.username)
            logChannel.send('"' + info.username + '"' + msgs.exitchannel)
        })
    }
})

client.login(cfg.discord.token);