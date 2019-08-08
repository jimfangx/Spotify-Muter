# SpotiMuter
SpotiMuter is an [Electron](https://electronjs.org) application that mutes Spotify ADs. When a Spotify AD is playing, SpotiMuter automatically mutes the Spotify application on Windows and mutes your speakers on all other platforms. It DOES NOT remove ADs from Spotify. **Spotify has patched HOST file editing. Even if there is a way to remove ADs completely, it can be detected by Spotify and WILL get your account banned. What SpotiMuter is doing is on the client side ONLY, and will NOT get your account banned by Spotify.**

# Build from source: Using Git - Preferred build from source method
Instructions on how to build SpotiMuter from source.

  * __**Prerequisites:**__
    * A computer with a git command line 
    * A computer that has nodeJS installed on it, and the ability to install npm modules.
    * Know the basics of how to install NPM packags & rebuild them if necessary. 
    
  * __**Instructions:**__ 
    * Fork SpotiMuter using `git clone https://github.com/AirFusion45/Spotify-Muter.git`
    * Install all required dependencies using `npm install`
    * Start app using `npm start || electron .`
    
# Build from source - Not using Git:
  * __**Prerequisites:**__
    * A computer that has a command line
    * A computer that has nodeJS installed on it, and the ability to install npm modules.
    * Know the basics of how to install NPM packags & rebuild them if necessary. 
  
  * __**Instructions:**__
    * Download the source code as a zip file
    * Unzip the zip file then, cd into the unzipped folder
    * Run `npm install` to install all dependencies
    * Start app using `npm start || electron .`

# NPM Rebuild Instructions
You might need to rebuild some modules when building from source. It is helpful if you have a basic understanding of how NPM rebuilding works. Below is a rough example of the rebuild command. The command below is for rebuilding robotjs against node 69. 
`npm rebuild --runtime=electron --target=4.2.0 --disturl=https://atom.io/download/atom-shell --abi=69`

# SpotiMuter Features
* Mutes Spotify application/Speakers when AD is playing
* Shows basic song information in application:
   * Song name
   * Artist names
   * Explicit rating by Spotify
   * Duration of song
   * Current progress of song
   * Toggleable AD block (If you want to hear the AD you can toggle the AD blocker off)
   * Toggleable stickyness (If you want the app to be sticky - stay on top of all other windows)
   * Adaptive app background - A color that best fits the album cover & song - This is calculated using k-means clustering - See the paper here: [Hasler and Süsstrunk (2003)](https://infoscience.epfl.ch/record/33994/files/HaslerS03.pdf)

# Authors
  * AirFusion45 - Owner

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
  * Electron basics from Traversy Media's videos [here](https://www.youtube.com/watch?v=kN1Czs0m1SU) & [here](https://www.youtube.com/watch?v=mr9Mtm_TRpw).
  * Additional Electron knowledge from DesignCourse's video [here](https://www.youtube.com/watch?v=2RxHQoiDctI).
  * Spotify OAuth basics from haptixgames's video [here](https://www.youtube.com/watch?v=jlA_cmYRX3c).
  * Additional Spotify OAuth knowledge from Traversy Media's video [here](https://www.youtube.com/watch?v=f6SrTZwZi70).
  * Additional examples for SpotiMuter's background color selection algorithm from davidkrantz's Colorfy [here](https://github.com/davidkrantz/Colorfy)
  * Implimentation of k-means clustering is from akfish's node-vibrant [here](https://github.com/akfish/node-vibrant/)

# Contact Me
Feel free to contact me if you find bugs, license issues, missing credits, etc. Feel free to contact me by email or Discord!

  * Please contact me here:
    * Email: jfang.cv.ca.us@gmail.com OR jim@jimfang.me
    * Discord: AirFusion#1706

# Note/Notes 
  Please check the releases for known issues and newest releases.
