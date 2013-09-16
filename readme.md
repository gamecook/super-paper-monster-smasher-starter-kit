## About The Super Paper Monster Smasher Starter Kit

The Super Paper Monster Smasher Starter Kit is a side-scrolling monster smashing game. You take on the role of a large green monster which is under attack by a bunch of heroes and you have to try and survive as long as you can. Since this project is completely open source, you are free to build on top of it and add your own story, artwork, and sounds and then publish it. I created this starter kit to help get you used to thinking about level design and building games without having to mess with lines upon lines of code just to get things up and running. You will find that the following document will walk you through everything you need to know about using the starter kit and ways to customize it.

Before you get started here are a few screen shots of the game itself so you
can get a sense for what it will look like when you get it up and running.

![](http://jessefreeman.com/wp-content/uploads/2013/08/spms-image01.jpg)

The starter kit comes with its own splash screen. Clicking on it will start
the game.

![](http://jessefreeman.com/wp-content/uploads/2013/08/spms-image02.jpg)

The player begins the game riding down the elevator. On the second floor he
encounters the zombies.

![](http://jessefreeman.com/wp-content/uploads/2013/08/spms-image03.jpg)

As the player progresses through the level each section introduces new zombies
and dangers.

![](http://jessefreeman.com/wp-content/uploads/2013/08/spms-image04.jpg)

The final stretch of the level is guarded by two strong zombies before the
player gets to the exit which takes them back to the splash screen, ending the
game.

While the screenshots are helpful to get a sense of how the game looks, I
suggest playing the game online at [http://jessefreeman.com/games/play/super-
paper-monster-smasher-starter-kit](http://jessefreeman.com/games/play/super-paper-
monster-smasher-starter-kit).

## Features

The Super Paper Monster Smasher Starter Kit

  * **ImpactJS Bootstrap** - this is a standard library of code used across all of my Impact games and starter kits. For more information check out the resources section about how it works
  * **Entities** - this directory contains all the entitles you need to build a zombie shooter with including a player, zombies, weapons and obstacles like doors and elevators
  * **Plugins** - a collection of plugins to help get the starter kit working on each platform as well as additional ones used in the game.
  * **Screens** - this contains the main sections of your game such as the start screen and the game itself.
  * **Artwork** - you get all of the artwork you need for the entities and map editor.
  * **Sounds** - a collection of sound effects for you to get started with.

In addition to the above features, the biggest selling point of the Starter
Kit is the fact that it is ready to run on Windows 8, Windows Phone 8 and the
Web. All you need to do is create your own levels and you are good to go. Of
course I highly encourage you to customize the artwork and sounds as well as
add your own entities and challenges to the game. For those of you out there
just getting started making HTML5 games and learning Impact, this is the best
tool you can find to fast track your game making experience.

# Getting Started

The following section will walk you through how to get the game up and running
on your computer. For this project we are going to set up everything to
support running it on Windows 8 but most of the following will apply to other
setups if you just want to build the game for the web.

## What you need

The good news is that this Starter Kit will work on the web as well as on
Windows 8. While I designed it to run inside of Visual Studio, you can still
use any JavaScript" idE you want. The following downloads are based on doing
your development on Windows 8:

  * Download the Super Paper Monster Smasher Starter Kit - [https://github.com/gamecook/super-paper-monster-smasher-starter-kit](https://github.com/gamecook/super-resident-raver-starter-kit)
  * Copy of Impact JS ($100) - [http://impactjs.com](http://impactjs.com)
  * Git &amp; GitBash (on Windows) - [http://git-scm.com/downloads](http://git-scm.com/downloads)
  * NodeJS - [http://nodejs.org/](http://nodejs.org/)
  * PHP - [http://windows.php.net/downloads/releases/php-5.3.26-nts-Win32-VC9-x86.msi](http://windows.php.net/downloads/releases/php-5.3.26-nts-Win32-VC9-x86.msi)
  * Windows 8 (90 Day Trial) - [http://msdn.microsoft.com/en-us/evalcenter/jj554510.aspx](http://msdn.microsoft.com/en-us/evalcenter/jj554510.aspx)
  * Visual Studio Express - [ http://www.microsoft.com/visualstudio/eng/products/visual-studio-express-for-windows-8](http://www.microsoft.com/visualstudio/eng/products/visual-studio-express-for-windows-8)

Additional Downloads

* Aseprite - [http://www.aseprite.org/](http://www.aseprite.org/)
* ShoeBox - [http://renderhjs.net/shoebox/](http://renderhjs.net/shoebox/)
* Bfxr (Standalone) - [http://ded.bfxr.net/~locus/bfxr_update/bfxr.air](http://ded.bfxr.net/~locus/bfxr_update/bfxr.air)
* Audacity - [http://audacity.sourceforge.net/](http://audacity.sourceforge.net/)

The Super Paper Monster Smasher Starter Kit should be all ready for you to use as
soon as you download and unzip it. I highly suggest branching the project on
Github and use git to clone it locally to your computer this way you can
continue to pull down changes and bug fixed to the starter kit as they are
released. When you are done, you should have something that looks like this:

![](http://jessefreeman.com/wp-content/uploads/2013/07/rrsk-image05.jpg)

From here you can access the two Visual Studio projects inside of the Projects
folder:

![](http://jessefreeman.com/wp-content/uploads/2013/07/rrsk-image06.jpg)

The SuperResidentRaverStarterKitWin8 Visual Studio project contains all of the
code for the Starter Kit. This is where we'll be doing all of our development,
the contents of the WP8 project will be automatically generated via a build
script which you will learn more about later on.

![](http://jessefreeman.com/wp-content/uploads/2013/07/rrsk-image07.jpg)

Before we can actually run any of the code we will need to copy Impact's
source code over into the project. Open up the directory containing your copy
of Impact's source code, which you get after purchasing a license, and
navigate into the `lib` directory. Here are the steps for moving everything
over:

  1. From inside of the `lib` directory you will want to copy over the entire `impact` directory into your starter kit's `lib` directory.
  2. Next, get the contents of the `weltmeister` directory and make sure you copy over all of the files in there with the exception of `config.js`. Our starter kit already has its own copy of the `config.js` file which is already setup with everything you need to run the level editor.
  3. Finally once you have completed this, simply copy over the `weltmeister.html` file over to the root of your own project. We do not need the `index.html` since the starter kit comes with its own. _Make sure you don't override the Super Paper Monster Smasher Starter Kit's `index.html` file or the project will not work for you._

In the end you should have something that looks like this where the selected
files are now part of your project:

![](http://jessefreeman.com/wp-content/uploads/2013/07/rrsk-image08.png)

In the next section we will go over how to setup a simple server to run our
game and use the level editor.

## Installing NodeJS, Grunt &amp; PHP

Before you get started, make sure you installed GitBash (which comes with Git
on Windows) since we will be using it for the following installation. Once you
have Git &amp; GitBash installed, you can start installing NodeJS from
[here](http://nodejs.org/).

![](http://jessefreeman.com/wp-content/uploads/2013/07/rrsk-image09.png)

Simply run through the installer and you should get everything you need to run
NodeJS. To double check, open up GitBash and type in the following:

    > npm

You should see the following:

![](http://jessefreeman.com/wp-content/uploads/2013/07/rrsk-image10.jpg)

We will be using npm, which is a module installer/manager for NodeJS, to
install everything we need to run the Super Paper Monster Smasher Starter Kit build
scripts. These build scripts will automate much of our workflow for us so we
can simply focus on making our game. I'll cover the build script in a little
more detail in the next section.

Now we need to install Grunt's command line tools. Grunt is a task runner,
similar to Ant, and actually does the heavy lifting in your automated build
script. If you already have Grunt installed you can skip this next step or
uninstall and reinstall it:

    
    > npm uninstall -g grunt

Once you are sure Grunt is no longer installed on your computer, type in the
following into GitBash:

    
    > npm install -g grunt-cli

Now you will have Grunt installed which will allow you to run our build
scripts. Before we do that, you will need to install all of the dependent node
modules. Again, inside of GitBash, navigate into the starter kit's directory
like so:

![](http://jessefreeman.com/wp-content/uploads/2013/07/rrsk-image11.jpg)

Once you are in the directory, simply run the following command:

    
    > npm install

From here you should see all of the required modules download and install.
Once all of these dependencies are installed you should be able to run the
following command to start the node server and checkout the Super Resident
Raver Starter Kit:

    
    > grunt

This is the default command for the build script and your browser should open
up with the game:

![](http://jessefreeman.com/wp-content/uploads/2013/08/spms-image13.jpg)

Now you should have everything you need to create your own game within the
Super Paper Monster Smasher Starter Kit.

