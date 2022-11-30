import tmi from 'tmi.js'
//const tmi = require('tmi.js'); //same as above
import { BOT_USERNAME, OAUTH_TOKEN, GLOBAL_BLOCKED_WORDS, GLOBAL_TIME_OUT_WORDS , GLOBAL_BAN_WORDS, GLOBAL_LINKS, GLOBAL_HORNY_WORDS} from './constants'
import { CHANNEL_NAME } from './channels'
import * as doleo_ from './channel/doleo_'
//import * as officialteddybeargamer from './channel/officialteddybeargamer'

const fs = require("fs");


const options = {
    options: { debug: true, messagesLogLevel: "info" },
	connection: {
		reconnect: true,
		secure: true
	},
	identity: {
		username: BOT_USERNAME,
		password: OAUTH_TOKEN
	},
    //channels: [ CHANNEL_NAME ]
    channels: CHANNEL_NAME
}

const client = new tmi.Client(options);

// gets current date
var dateToday = new Date();
var dd = String(dateToday.getDate()).padStart(2, '0');
var mm = String(dateToday.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = dateToday.getFullYear();
var today = yyyy + '-' + mm + '-' + dd;

//var util = require('util');
var log_directory = "./logs/"
var log_file = today + ".log";

function attachFSLogger(filePath) {
    // remember tthe old log method
    const oldLog = console.log;

    // create a write stream for the given file path
    const fsLog = fs.createWriteStream(filePath, {
        flags: 'a' // 'a' means appending
    })

    // override console.log
    console.log = (...messages) => {
        // log to console
        oldLog.apply(console, messages)

        // stream message to the file log
        fsLog.write(messages.join('\n'));
        fsLog.write('\n');
    }
}

attachFSLogger(log_directory + log_file);


//silent mode - Turns on/off bot responses for mod events
var silentMode = false;
var trollMode = false;
var hornyMode = false;

//command vars
const prefixCommand = '!';
const prefixMod = '?';
const prefixTimeOut = '#';

//message to be said by the bot
var outputMessage = 'Default';

//timeout list
var timeoutwordlist = [];
var timeouttimelist = [];



client.connect().catch(console.error);

client.on('connected', (channel,address, port) => {
    onConnectedHandler(address, port);
})

client.on("emoteonly", (channel, enabled) => {
    if (enabled === true) {
        if (silentMode) {
            return;
        }
        else {
            client.say(channel, `Emote only mode has been activated.`);
        }
    }
    else if (enabled === false) {
        if (silentMode) {
            return;
        }
        else {
            client.say(channel, `Emote only mode has been deactivated.`);
        }
    }
});

client.on('message', (channel, userstate, message, self) => {
    // update date and log file
    dateToday = new Date();
    var ndd = String(dateToday.getDate()).padStart(2, '0');
    if (ndd != dd) {
        mm = String(dateToday.getMonth() + 1).padStart(2, '0'); //January is 0!
        yyyy = dateToday.getFullYear();
        today = yyyy + '-' + mm + '-' + ndd;
        log_file = today + ".log";
        attachFSLogger(log_directory + log_file);
    }
    

    //if(self) return;
    //if (userstate.username === BOT_USERNAME) return;
    
    //old check if mod, can be removed but saved for reference for now
    /*if (client.isMod(channel, userstate.username)) {
        console.log('Message was said by moderator ' + userstate.username + ' and was not checked against the blacklist.');
        // Handle different message types..
        switch(userstate["message-type"]) {
            case "action":
                // This is an action message..
                // Commented out to disable filtering
                // checkTwitchChat (userstate, message, channel)
                break;
            case "chat":
                // This is a chat message..
                // Commented out to disable filtering
                // checkTwitchChat (userstate, message, channel)
                modCommand(userstate, message, channel)
                useCommand(userstate, message, channel)

                break;
            case "whisper":
                // This is a whisper..
                break;
            default:
                // Something else ?
                break;
        }
        
        return;
    }*/
    /*
    if (userstate.username == 'pat46rick') {
        if (trollMode == true) {
            console.log('Pat46rick said: ' + message);
            var mesg = message;
            var premsg = mesg[0];
            if (premsg == '!') {
                console.log('Message began with a !');
            }
            else if (premsg == '?') {
                console.log('Message began with a ?');
            }
            else {
                console.log('Message will be repeated.');
                client.say(channel, `A wise teacher once said: ${message}`);
            }
        }
        else {
            console.log('Pat46rick said: ' + message);
            console.log('Pat46rick message skipped due to troll mode toggled off.');
        }
    }
    */




    if  (userstate.username == 'doleo_') {
        console.log('Message said by Doleo_');
        switch(userstate["message-type"]) {
            case "action":
                // This is an action message..
                // Commented out to disable filtering
                // checkTwitchChat (userstate, message, channel)
                break;
            case "chat":
                // This is a chat message..
                // Commented out to disable filtering
                // checkTwitchChat (userstate, message, channel)
                if(message.charAt(0) === prefixMod) {
                    modCommand(userstate, message, channel)
                }
                else if(message.charAt(0) === prefixCommand) {
                    useCommand(userstate, message, channel)
                }
                else if(message.charAt(0) === prefixTimeOut) {
                    modCommand(userstate, message, channel)
                }
                break;
            case "whisper":
                // This is a whisper..
                break;
            default:
                // Something else ?
                break;
        }
        
        return;
    }
    
    //checks if mesage came from a mod
    else if (userstate.mod || userstate.broadcaster) {
        console.log('Message was said by moderator ' + userstate.username + ' and was not checked against the blacklist.');
        // Handle different message types..
        switch(userstate["message-type"]) {
            case "action":
                // This is an action message..
                // Commented out to disable filtering
                // checkTwitchChat (userstate, message, channel)
                break;
            case "chat":
                // This is a chat message..
                // Commented out to disable filtering
                // checkTwitchChat (userstate, message, channel)
                if(message.charAt(0) === prefixMod) {
                    modCommand(userstate, message, channel)
                }
                else if(message.charAt(0) === prefixCommand) {
                    useCommand(userstate, message, channel)
                }
                break;
            case "whisper":
                // This is a whisper..
                break;
            default:
                // Something else ?
                break;
        }
        
        return;
    }
    
    else if(userstate.vip) {
        console.log('Message was said by vip ' + userstate.username + '.');
        // Handle different message types..
        switch(userstate["message-type"]) {
            case "action":
                // This is an action message..
                // Commented out to disable filtering
                // checkTwitchChat (userstate, message, channel)
                break;
            case "chat":
                // This is a chat message..
                // Commented out to disable filtering
                // checkTwitchChat (userstate, message, channel)
                if(message.charAt(0) === prefixMod) {
                    modCommand(userstate, message, channel)
                }
                else if(message.charAt(0) === prefixCommand) {
                    useCommand(userstate, message, channel)
                }
                break;
            case "whisper":
                // This is a whisper..
                break;
            default:
                // Something else ?
                break;
        }
        
        return;
    }

    //handles all messages not sent by mods i.e. everyone else
    else {
        // Handle different message types..
        switch(userstate["message-type"]) {
            case "action":
                // This is an action message..
                checkTwitchChat (userstate, message, channel)
                break;
            case "chat":
                // This is a chat message..
                checkTwitchChat (userstate, message, channel)
                if(message.charAt(0) === prefixCommand) {
                    useCommand(userstate, message, channel)
                }
                break;
            case "whisper":
                // This is a whisper..
                break;
            default:
                // Something else ?
                break;
        }
    }
    

    
});


function checkTwitchChat(userstate, message, channel) {
    message = message.toLowerCase()
    let shouldDeleteMessage = false
    let shouldTimeOut = false
    let shouldBan = false
    let shouldTroll = false
    let shouldTO = false

    let whitelistedLink = false;
    let linkDelete = false
    let wordDelete = false
    let messageTimeout = false;
    let messageBan = false;
    let hornyBop = false;


    /*
    //Troll message
    shouldTroll = TROLL_WORDS.some(trollWord => message.includes(trollWord.toLowerCase()))
    if (shouldTroll) {
        client.say(channel, 'Did someone call for King Troll? Kappa')
    }*/

    // check message

    var channelName = channel.toLowerCase();
    switch (channelName) {
        case "doleo_":
            wordDelete = isFilteredWord(doleo_.BLOCKED_WORDS, message);
            linkDelete = isFilteredWord(GLOBAL_LINKS, message);
            whitelistedLink = isFilteredWord(doleo_.WHITELIST_LINK, message);
            //wordTimeout

            break;
        /*case "officialteddybeargamer":
            break;*/
        default:
            wordDelete = isFilteredWord(GLOBAL_BLOCKED_WORDS, message);
            linkDelete = isFilteredWord(GLOBAL_LINKS, message);
            shouldTimeOut = isFilteredWord(GLOBAL_TIME_OUT_WORDS, message);
            shouldBan = isFilteredWord(GLOBAL_BAN_WORDS, message);
            hornyBop = isFilteredWord(GLOBAL_HORNY_WORDS, message);
            break;

    }

    if (wordDelete == true || linkDelete == true) {
        shouldDeleteMessage = true;
    }


    if (hornyBop) {
        if (hornyMode == true) {
            client.say(channel, `@${userstate.username}, go to horny jail! zephyr94Bonk `)
            client.deletemessage(channel, userstate.id)
        }
    }

    
    if (shouldDeleteMessage) {
        if (wordDelete == true) {
            // tell user
            client.say(channel, `@${userstate.username}, sorry! Your message was deleted.`)
        }
        if (linkDelete == true) {
            // tell user
            client.say(channel, `@${userstate.username}, please do not post links in chat.`)
        }
        // delete message
        client.deletemessage(channel, userstate.id)
    }
    if (shouldTimeOut) {
        // tell user
        client.say(channel, `@${userstate.username}, please do not say that in chat.`)
        // timeout the user
        client.timeout(channel, userstate.username, 5, "Using a blocked word: " + message);
    }
    if (shouldBan) {
        client.ban(channel, userstate.username, "Using a banned word: " + message);
    }

    shouldTO = timeoutwordlist.some(tOWord => message.includes(tOWord.toLowerCase()))
    if (shouldTO) {
        client.say(channel, `@${userstate.username}, please do not say that in chat. TESTING SOMETHING`)
        // timeout the user
        client.timeout(channel, userstate.username, 5, "Using a blocked word: " + message);
    }


}

function onConnectedHandler(address, port) {
    console.log(`Connected: ${address}:${port}`)
}

function useCommand(userstate, message, channel) {
    if(message.toLowerCase() === '!hello') {
        outputMessage = `@${userstate.username} heya!`
        client.say(channel, outputMessage);
    }
    else if(message.toLowerCase() == '!test') {
        outputMessage = `@${userstate.username} this is a test command.`
        client.say(channel, outputMessage);
    }
}

function modCommand(userstate, message, channel) {
    var messageArray = message.split(" ")
    var messageFirst = messageArray[0];
    var mesg = message.substring(0,8);

    //emote only mode
    if(message.toLowerCase() === '?emoteonly') {
        client.emoteonly(channel);

    }
    else if(message.toLowerCase() === '?emoteonly test') {
        client.emoteonly(channel);

    }
    else if(message.toLowerCase() === '?emoteonlyoff') {
        client.emoteonlyoff(channel);

    }

    //clear chat
    else if(message.toLowerCase() === '?clear') {
        client.clear(channel);
    }

    //followers only mode
    else if(message.toLowerCase() === '?followersonly') {
        client.followersonly(channel, 0);
    }

    //silent mode - Turns on/off bot responses for mod events
    else if(message.toLowerCase() === '?silentmode') {
        silentMode = true;
        client.say(channel, `Silent mode has been activated.`);
    }
    else if(message.toLowerCase() === '?silentmodeoff') {
        silentMode = false;
        client.say(channel, `Silent mode has been deactivated.`);
    }

    //troll mode - Turns on/off bot responses for troll patrick events
    else if(message.toLowerCase() === '?trollmode') {
        trollMode = true;
        client.say(channel, `Troll mode has been activated. Sorry Patrick!`);
    }
    else if(message.toLowerCase() === '?trollmodeoff') {
        trollMode = false;
        client.say(channel, `Troll mode has been deactivated.`);
    }

    //horny mode
    else if(message.toLowerCase() === '?hornymode') {
        hornyMode = true;
        client.say(channel, `Horny mode has been activated. Mo moar horny for u!`);
    }
    else if(message.toLowerCase() === '?hornymodeoff') {
        hornyMode = false;
        client.say(channel, `Horny mode has been deactivated.`);
    }


    else if(message.toLowerCase() === '?addcom' || messageFirst.toLowerCase() === '?commands add') {
        
    }


    else if(messageFirst.toLowerCase() === '?commands') {
        switch (messageArray[1]) {
            case 'add':
                break;
            case 'delete':
                break;
            default:
                break;
        }
    }


    // command syntax: #timeout (time in seconds) (timeout message) ex: #timeout 60 space cadet
    
    else if(mesg.toLowerCase() === '#timeout') {
        // remove #timeout from message and split by spaces into array
        var mesg = message.substring(9);
        console.log(mesg);
        var messageArray = mesg.split(" ")

        var word = "";
        var time = messageArray[0];
        var length = messageArray.length;
        var i = 1;
        while (i < length) {
            if (i == 1) {
                word = messageArray[i];
            }
            else {
                word += " " + messageArray[i];
            }
            i++;
        }

        timeoutwordlist.push(word);
        timeouttimelist.push(time);
        console.log('Term: ' + word + " has been added to timeout list with " + time + " second timeout.");
    }

    
}


function isFilteredWord(FILTERED_WORDS, message) {
    return FILTERED_WORDS.some(filteredWord => message.includes(filteredWord.toLowerCase()))
}