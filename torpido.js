const Discord = require('discord.js');
const ytdl = require('ytdl-core');
var youtubeSearch = require('youtube-search');

var config = require('./config.json');

const client = new Discord.Client();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    if (msg.content[0] == config.prefix) {
        var args = msg.content.substring(1).split(' ');
        var cmd = args[0];
        var rest = args.splice(1);
        switch (cmd) {
            case 'ping':
                msg.reply('O Teoman\'i torpidoya sokarim!');
                break;
            case 'voice':
                if (rest[0] == 'join') {
                    const voiceChannel = msg.member.voice.channel
                    voiceChannel.join()
                } else if (rest[0] == 'leave') {
                    const voiceChannel = msg.member.voice.channel
                    voiceChannel.leave()
                } else {
                    msg.reply('komutun devami eksik?')
                }
                break;
            case 'play':
                if (msg.channel.type !== 'text') return;
                if (!rest[0]) {
                    msg.reply(' ne calayim ? - !play {youtube-link}')
                }
                const voiceChannel = msg.member.voice.channel;
                if (!voiceChannel) {
                    return msg.reply('please join a voice channel first!');
                }
                voiceChannel.join().then(connection => {
                    const stream = ytdl(args[0], {
                        filter: 'audioonly'
                    });
                    const dispatcher = connection.play(stream);
                    console.log('stream :', stream);
                    console.log('dispatcher :', dispatcher);

                    dispatcher.on('end', () => voiceChannel.leave());
                });
                break;

            case 'yt':
                var opts = {
                    maxResults: 1,
                    key: config.youtubeAPIKey,
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

client.login(config.discordAPIToken);