require('dotenv').config({
    path: 'process.env'
})

const fs = require('fs');
const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const youtubeSearch = require('youtube-search');
const googleTTS = require('google-tts-api');
const gis = require('g-i-s');
const Canvas = require('canvas')

var voice = require('./voice/voice.js')
var caps = require('./image/caps.js')
let cfg = JSON.parse(fs.readFileSync('./config.json', 'utf-8'))
let msgfile = JSON.parse(fs.readFileSync('./text/msgs.json', 'utf-8'))
let speechQfile = JSON.parse(fs.readFileSync('./text/speechquery.json', 'utf-8'))

const {
    Transform
} = require('stream')

var botspeech = require('./voice/speech.js')
const speech = require('@google-cloud/speech');
const speechclient = new speech.SpeechClient();
let speechstatus = 1

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
let msglang = cfg.consts.msglang
let msgs = msgfile[msglang]
let speechqueries = speechQfile[msglang]

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


// speech functions
function convertBufferTo1Channel(buffer) {
    const convertedBuffer = Buffer.alloc(buffer.length / 2)

    for (let i = 0; i < convertedBuffer.length / 2; i++) {
        const uint16 = buffer.readUInt16LE(i * 4)
        convertedBuffer.writeUInt16LE(uint16, i * 2)
    }

    return convertedBuffer
}

class ConvertTo1ChannelStream extends Transform {
    constructor(source, options) {
        super(options)
    }

    _transform(data, encoding, next) {
        next(null, convertBufferTo1Channel(data))
    }
}


function sayIt(text, accent) {
    var vConnection = voice.GetVoiceConnection(client, voiceChannel.id)
    if (vConnection) {
        googleTTS(text, (accent) ? accent : speechlang, cfg.consts.speechspeed)
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

            case 'speech':
                var vc = msg.member.voice.channel;
                if (!vc) {
                    return msg.reply(msgs.notinchannel);
                }
                if (!rest[0]) {
                    return msg.reply((speechstatus == 1) ? 'on' : 'off')
                }
                speechstatus = (rest[0] == 'on') ? 1 : 0
                msg.reply((speechstatus == 1) ? 'on' : 'off')
                break;

            case 'join':
                voiceChannel.fetch().then(vc => {
                    vc.join().then(connection => {
                            connection.on('speaking', (user, speaking) => {
                                if (speechstatus == 0) {
                                    return;
                                } // added if speech is off, dont look at google speech
                                if (speaking.bitfield == 1) {
                                    var audioStream = connection.receiver.createStream(user, {
                                        mode: 'pcm'
                                    });

                                    const requestConfig = {
                                        encoding: 'LINEAR16',
                                        sampleRateHertz: 48000,
                                        languageCode: 'tr-TR'
                                    }
                                    const request = {
                                        config: requestConfig
                                    }

                                    const recognizeStream = speechclient
                                        .streamingRecognize(request)
                                        .on('error', console.error)
                                        .on('data', response => {
                                            const transcription = response.results
                                                .map(result => result.alternatives[0].transcript)
                                                .join('\n')
                                                .toLowerCase()

                                            console.log(user.username + ' :\n', transcription);

                                            var botresponse = botspeech.botSpeechResponse(text = transcription, vc = vc, botnick = cfg.botnick)
                                            botresponse.then(res => {
                                                if (res) {
                                                    console.log("torpido :\n", res.response);
                                                    sayIt(res.response, res.accent);
                                                }
                                            }).catch(err => {
                                                sayIt('beceremedik abi', 'tr');
                                            })


                                        })

                                    const convertTo1ChannelStream = new ConvertTo1ChannelStream()
                                    audioStream.pipe(convertTo1ChannelStream).pipe(recognizeStream)
                                    audioStream.on('end', async () => {})
                                    audioStream.on('error', (err) => {
                                        msg.reply('bir hata oldu')
                                    })

                                }
                            })
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
                        // var memberss = vc.members
                        // memberss.forEach(element => {
                        //     console.log("member :", element.user.username);
                        // });
                        new Promise((resolve, reject) => {
                                vc.join().then(connection => {
                                    vc.leave()
                                })
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
                speechQfile = JSON.parse(fs.readFileSync('./text/speechquery.json', 'utf-8'))

                msgs = msgfile[msglang]
                speechqueries = speechQfile[msglang]
                break;

            case 'accent':
                var requestedLanguage = rest[0]
                if (languages.includes(requestedLanguage)) {
                    speechlang = requestedLanguage
                    msg.reply(msgs.languagesetto + requestedLanguage)
                } else {
                    msg.reply(msgs.nosuchlanguage + requestedLanguage)
                }
                break;

            case 'img':
                if (!rest[0]) {
                    return msg.reply(msgs.searchwhat)
                }
                gis({
                    searchTerm: rest.join(' '),
                }, async function (err, results) {
                    if (err) {
                        return msg.reply(err)
                    }

                    for (let index = 0; index < results.length; index++) {
                        result = results[index]
                        let img = await Canvas.loadImage(src = result.url).catch(err => {})
                        if (img) {
                            // if image is valid. sometimes images can be corrupted, so it skips that result
                            let canvas = Canvas.createCanvas(result.width, result.height);
                            let ctx = canvas.getContext('2d');
                            ctx.drawImage(img, 0, 0, result.width, result.height);
                            let attachment = new Discord.MessageAttachment(canvas.toBuffer(), rest.join() + '.png');
                            return msg.reply(attachment)
                        }
                    }
                });
                break;

            case 'caps':
                if (!rest[0]) {
                    return msg.reply(msgs.searchwhat)
                }

                let seperateindex = rest.indexOf('+')
                let imgtext = rest.slice(0, seperateindex).join(' ')
                let capstext = rest.slice(seperateindex + 1).map(x => {
                    return x.toUpperCase()
                }).join(' ')

                gis({
                    searchTerm: imgtext,
                }, async function (err, results) {
                    if (err) {
                        return msg.reply(err)
                    }

                    for (let index = 0; index < results.length; index++) {
                        result = results[index]
                        let imgh = result.height
                        let imgw = result.width
                        let bottomh = Math.round(imgh / 3) // %30 of height will be added as red bottom
                        let bottomw = imgw
                        let bottomstarty = imgh
                        let canvash = imgh + bottomh
                        let canvasw = imgw

                        let img = await Canvas.loadImage(src = result.url).catch(err => {})
                        if (img) {
                            let canvas = Canvas.createCanvas(imgw, imgh + bottomh);
                            let ctx = canvas.getContext('2d');
                            ctx.drawImage(img, 0, 0, imgw, imgh);
                            ctx.fillStyle = 'red'
                            ctx.fillRect(0, bottomstarty, bottomw, bottomh)

                            // caps text
                            ctx.fillStyle = '#ffffff';
                            ctx.textBaseline = 'top'
                            ctx.textAlign = 'center'

                            let lx = caps.createCaps(ctx, canvas, capstext, bottomh)
                            if (lx == undefined) {
                                return msg.reply(' beklenmedik bi sorun oldu. beklenseydi zaten cozmus olurduk')
                            }
                            ctx.font = `bold ${lx.fontsize}px arial`

                            for (let s = 0; s < lx.returnlines.length; s++) {
                                let linesize = Math.round(lx.fontsize * 1.3) // 30% of font pixel is line height
                                ctx.fillText(lx.returnlines[s], canvasw / 2, bottomstarty + (s * linesize));
                            }
                            let attachment = new Discord.MessageAttachment(canvas.toBuffer(), rest.join() + '.png');
                            return msg.reply(attachment)
                        }
                    }
                })
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