const Discord = require('discord.js');
const ytdl = require('ytdl-core');
var youtubeSearch = require('youtube-search');

var config = require('./config.json');

const client = new Discord.Client();
const guild = new Discord.Guild(client);
const voiceChannel = new Discord.VoiceChannel(guild, {
    id: config.discord.channels.voice
});
const textChannel = new Discord.TextChannel(guild, {
    id: config.discord.channels.text
});
const logChannel = new Discord.TextChannel(guild, {
    id: config.discord.channels.log
});

// Youtube dispatcher
let ytdispatcher;

// Optional decisions
var leaveAfterPlay = true;

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    // checks if the command came from text channel
    if (msg.channel.id != config.discord.channels.text) return;

    if (msg.content[0] == config.prefix) {

        var args = msg.content.substring(1).split(' ');
        var cmd = args[0];
        var rest = args.splice(1);

        switch (cmd) {
            case 'ping':
                msg.reply('O Teoman\'i torpidoya sokarim!');
                break;

            case 'join':
                voiceChannel.fetch().then(vc => {
                    vc.join().then(connection => {
                            console.log("\n", connection.channel);
                            connection.on('speaking', user => {
                                console.log('============================')
                                console.log('konusan :', user);
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
                voiceChannel.fetch().then(vc => {
                        // will fix next commit
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
                    msg.reply(' what to play ? - !play {youtube-link} - !play {keywords}')
                    return;
                }
                var vc = msg.member.voice.channel;
                if (!vc) {
                    return msg.reply('you need to be in voice channel first!');
                }

                if (rest[0].startsWith('https://you')) {

                    vc.join().then(connection => {
                            const stream = ytdl(rest[0], {
                                filter: 'audioonly',
                            });

                            ytdispatcher = connection.play(stream);

                            if (leaveAfterPlay) {
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
                        key: config.youtube.key,
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

                                ytdispatcher = connection.play(stream);

                                if (leaveAfterPlay) {
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
                ytdispatcher.destroy()
                break;

            case 'teoman':
                var vc = msg.member.voice.channel;
                if (!vc) {
                    return msg.reply('you need to be in voice channel first!');
                }
                vc.join().then(connection => {

                        const stream = ytdl('https://youtu.be/OWGvkzH2vH8', {
                            filter: 'audioonly',
                        });

                        ytdispatcher = connection.play(stream);

                        if (leaveAfterPlay) {
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
                    msg.reply('what to search? - !yt {keyword}')
                    return;
                }
                var opts = {
                    maxResults: 1,
                    key: config.youtube.key,
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

            default:
                break;
        }
    }
});

client.on('voiceStateUpdate', (oldState, newState) => {
    // write to log channel if only user entered or left a specific voice channel
    var _stateChannel = oldState.channelID == undefined ? newState.channelID : oldState.channelID

    if (_stateChannel == voiceChannel.id) {
        if (oldState.channelID != newState.channelID) {
            if (newState.channelID == null) {
                // user leaves the voice channel
                var u = new Discord.User(client, {
                    id: oldState.id
                })
                u.fetch().then(info => {
                    logChannel.send('"' + info.username + '"' + ' left channel.')
                })
            } else {
                // user enters the voice channel
                var u = new Discord.User(client, {
                    id: oldState.id
                })
                u.fetch().then(info => {
                    logChannel.send('"' + info.username + '"' + ' entered channel.')
                })
            }
        }
    }
})

client.login(config.discord.token);