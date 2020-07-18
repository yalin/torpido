const fs = require('fs');
const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const youtubeSearch = require('youtube-search');
const googleTTS = require('google-tts-api');
const gis = require('g-i-s');
const Canvas = require('canvas')

var voice = require('./voice/voice.js')
let cfg = JSON.parse(fs.readFileSync('./config.json', 'utf-8'))
let msgfile = JSON.parse(fs.readFileSync('./text/msgs.json', 'utf-8'))

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
const msgs = msgfile[msglang]

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
                        // console.log("imgh :\n", imgh);
                        let imgw = result.width
                        // console.log("imgw :\n", imgw);
                        let bottomh = Math.round(imgh / 3) // simdilik
                        // console.log("bottomh :\n", bottomh);
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
                            // ctx.font = 'bold 40px arial'

                            let lx = textdoldur(ctx, canvas, capstext, bottomh)
                            if (lx == undefined) {
                                return msg.reply(' beklenmedik bi sorun oldu. beklenseydi zaten cozmus olurduk')
                            }
                            // console.log("lx :\n", lx);
                            ctx.font = `bold ${lx.fontsize}px arial`
                            // console.log("lx.font :\n", lx);

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

function textdoldur(ctx, canvas, text, textAreaHeight) {
    
    let highfont = 100
    let lowfont = 15
    let fontsize
    let returnlines

    // console.log('\n------------\ntext doldur:\n')

    for (let size = highfont; size > lowfont; size -= 2) {
        ctx.font = `bold ${size}px arial`
        // console.log("\nsize :", size);
        if (ctx.measureText(text).width > canvas.width) {
            // console.log(size + ' px e gore sigmadi')
            let lines = getLines(ctx, text, canvas.width)
            // console.log("lines.length :", lines.length);
            let gapsize = Math.round(size * 1.3) // 30% of font pixel is line height
            // console.log("bir satir :", gapsize);
            let totalfontheight = gapsize * lines.length
            // console.log("toplam satir :", totalfontheight);
            // console.log("canvas.height :", textAreaHeight);

            if (totalfontheight <= textAreaHeight) {
                fontsize = size
                returnlines = lines
                break;
            }
        } else {
            fontsize = size
            returnlines = [text]
            break;
        }
    }

    // console.log("size for sonrasi :\n", fontsize);

    return {
        fontsize,
        returnlines
    }
}

function getLines(ctx, text, maxWidth) {
    var words = text.split(" ");
    var lines = [];
    var currentLine = words[0];

    for (var i = 1; i < words.length; i++) {
        var word = words[i];
        var width = ctx.measureText(currentLine + " " + word).width;
        if (width < maxWidth) {
            currentLine += " " + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);
    return lines;
}

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