# torpido

torpido is a discord bot attribute to [peterloorke](https://github.com/egemenyildiz). The first generation created as an IRC bot at irc.freenode.org #sourbet<br>
This is the second generation and improved version of torpido.

torpido uses [discord.js](https://discord.js.org/)

There are three channels defined;<br>
* text channel : gets text commands
* voice channel : any kind of voice interactions done by this channel
* log channel : optional, it keeps the records for who entered and exit the voice channel

Accent list can be found [here](https://cloud.google.com/translate/docs/languages).

Changelog: latest version [1.1.0](https://github.com/yalin/torpido/blob/master/CHANGELOG.md)

### contact
Discord username: etsw#2539

---

## prerequisites
[ffmpeg](http://ffmpeg.org/) needs to be installed for voice channel playback.

for linux:
>sudo apt-get install ffmpeg

for windows:
>npm install ffmpeg-static --save


sometimes, there is a problem with `node-pre-gyp` then it needs to be installed manually.

## commands

```
!join
Joins to pre-defined discord voice channel

!leave
Leaves from voice channel

!ping
ping-pong

!teoman
O Teoman'i var ya..

```

```
!yt {keyword(s)}
Youtube search command.
i.e : !yt murat ovuc

!play {youtube_url}
Plays the audio of given youtube video url
i.e : !play https://youtu.be/OWGvkzH2vH8

!play {keyword}
Searches youtube then plays the first video
i.e : !play murat ovuc dalga dalga

!stop
Stops whatever is playing right now

!vol
Tells the current volume

!vol [0-1]
Sets the volume of the bot
i.e : !vol 0.2

!say {word(s)}
Says the given words as voice

!accent {langcode}
Changes the accent of speech

!img {keyword(s)}
Brings the first result of google image search

!caps {imageKeyword(s)} + {capsText}
Adorable caps generator.

```


## config

You need to create `config.json` file to compile.

```
{
    "prefix": "!",
    "youtube": {
        "key": "your_youtube_api_key"
    },
    "discord": {
        "token": "your_discord_api_token",
        "channels": {
            "text": "text_channel_id",
            "voice": "voice_channel_id",
            "log": "log_channel_id"
    },
    "consts":{
        "speechlang" : "en",
        "speechspeed" : 1,
        "leaveafterplay" : false,
        "msglang" : "en",
        "speechToText" : 0
    }
}
```

## speech recognition
you need to create dotenv files which includes Google API json file.

_TODO : explain how speech recognition works_