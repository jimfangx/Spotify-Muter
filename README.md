# SpotiMuter
SpotiMuter is an [Electron](https://electronjs.org) application that mutes Spotify ADs. When a Spotify AD is playing, SpotiMuter automatically mutes the Spotify application on Windows and mutes your speakers on all other platforms. It DOES NOT remove ADs from Spotify. **Spotify has patched HOST file editing. Even if there is a way to remove ADs completely, it can be detected by Spotify and WILL get your account banned. What SpotiMuter is doing is on the client side ONLY, and will NOT get your account banned by Spotify.**

# Build from source: Using Git - Preferred build from source method
Instructions on how to build SpotiMuter from source.

  * __**Prerequisites:**__
    * A computer that has command prompt with git, or terminal with git.
    * A computer that has nodeJS installed on it, and the ability to install npm modules.
    * Know the basics of how to install NPM packags & rebuild them if necessary. 
    
  * __**Instructions:**__ 
    * Fork SpotiMuter using `git clone https://github.com/AirFusion45/Spotify-Muter.git`
    * Install all required dependencies using `npm install`
    * Start up using `npm start || electron .`
    

# Adding Lumos To Your Discord Server
You can also just add Lumos to your existing server. Lumos has been already hosted for you in this option.

  * __**Prerequisites:**__
    * You need to have the "Manage Server" permission of the server __**OR**__ Be the owner of the server.
    * When adding Lumos, make sure that the bot has "ADMINISTRATOR" permissions on your server.
    * A link is provided [here](https://discordapp.com/oauth2/authorize?client_id=460610749283172353&scope=bot&permissions=2146958591) with all of the required permissions pre-selected.
   
  * __**Basic Operations Guide**__
    * The prefix of Lumos is `-`.
    * For general help, the support server & additional notes type `-help`.
    * For the full commands list, type `-commands`.
    * Each command is called using the prefix, in the following form: `-<command>` where <command> is the command. For example, to call the command ping, you would type `-ping`.
    * To check if Lumos has the correct permissions, just type `-checklist`. If `Lumos ADMINISTRATOR Permissions:` says `true` then Lumos has the required permissions to function.
    * Feel free to join [this support server](https://discord.gg/KSjW2wB) if additional help is needed!

# Lumos Features
This is not a command list. Some of the descriptions after the dash are not actually how you use that command. Use `-commands` in a server with Lumos or use this commands list link [here](https://hastebin.com/rahorilewo.xml) to find Lumos' full command list.
  * Announcements - User join & leave announcements
  * Moderation:
    * Admin/Mod Commands - kick, ban, warn, mute
    * Chat Management - purge & lockdown
  * Utility Commands - server info, user info 
  * Mathematical Commands - Full Wolfram Alpha integration, basic calculations, find the nth prime, randomize numbers, etc
  * General Chat Commands - Google search integration, YouTube search integration, avatar steal, send DMs using the bot, send embed messages in chat, show all & search server's custom emojis, etc
  * Data & Computer Related Commands - Getting information about your IP address & another IP address (Fully secured by a registered npm API, Lumos DOES NOT log your IP address), binary, morse, caesar cipher encode & decode integration
  * English Related Commands - Find random words, check if a word is an anagram
  * Fun Commands :) - rock paper scissors, party commands

# Authors
  * AirFusion45 - Owner

# Contributors 
  * Chroish#4151 (Discord Tag) - First one to start using the bot before beta & numerous bug reports
  * Peter da Best#2547 (Discord Tag) - Lumos Beta Tester & bug reporter
  * FlubberGhasted#0741 (Discord Tag) - Lumos Beta Tester & Reported major input bug
  * Alexander#4377 (Discord Tag) - Multiple bug reports (-rps, -say, anti spam [WIP]) & suggested -party command & Invited Lumos to multiple servers :) 
  * D A N#7517 (Discord Tag) - Lumos Beta Tester & requested -wolfram command
  * Peter da Best#2547 (Discord Tag) - Lumos "anti-crash" Tester (Great effort on trying to crash the bot!) :)
  * Eton#4446 (Discord Tag) [Github Profile [here](https://github.com/ethamitc)] - Added customizable welcome command w/ channel selectors. Improved on exsisting welcome msg command. Code further edited by AirFusion.

# License 
This Project is licensed under MIT License - see the LICENSE.md file for more details. The main points of the MIT License are:
  
  * This code can be used commercially
  * This code can be modified
  * This code can be distributed
  * This code can be used for private use
  * This code has no Liability
  * This code has no Warranty
  * When using this code, credit must be given to the author
  
# Credits
Here are credits for all the code I used that was from other repositories.
  * -wolfram command code from chalda's Discord Bot [here](https://github.com/chalda/DiscordBot/).
  * -botinfo command's uptime calculations code & general ideas/inspiration from Dank-Memer's Dank-Memer [here](https://github.com/Dank-Memer/Dank-Memer).
  * Majority of bot structure from AnIdiotsGuide's Tutorial-Bot [here](https://github.com/AnIdiotsGuide/Tutorial-Bot).

# Contact Me
Feel free to contact me if you find bugs, license issues, missing credits, etc. I am currently only giving out my Discord contact information, but feel free to contact me via Discord and my email.

  * Please contact me here:
    * Email: jfang.cv.ca.us@gmail.com OR jim@jimfang.me
    * Discord: AirFusion#1706

# Note/Notes 
  When self-hosting Lumos, we recommend downloading the latest release under the releases tab. As that is the most stable version.
