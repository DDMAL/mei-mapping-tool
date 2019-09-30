# Cress 🎵
Web-based app to map squiggles to MEI snippets (under construction)

You can get the development version of the mei-mapping-tool by accessing the page http://132.206.14.209:8800/

## Requirements
* [Node.js](https://nodejs.org/en/download/)
* [Homebrew](https://brew.sh/) *for mac users*
* [Mongodb](https://docs.mongodb.com/manual/installation/) Make sure MongoDB is installed (`brew install mongodb`)
* [Mongoose](https://mongoosejs.com/docs/) `npm install mongoose`
* [npm](https://www.npmjs.com/get-npm):
 `npm install npm@latest -g` 
 
 To check if you have npm or node.js, you can run these commands in your terminal :
 
  `npm -v`
 
  `node -v`

## Setup

1. Clone this repository in your terminal from the `develop` branch

  `git clone https://github.com/DDMAL/mei-mapping-tool`

2. Go to the mei-mapping-tool repository

  `cd mei-mapping-tool`

3. Install dependencies using npm

  `npm install`

4. Start the server

  `npm start`
  
  You should be able to see the message *node ./bin/www*

You can get the most recent version of the mei-mapping-tool by accessing the page http://132.206.14.209:8800/

You can work on the developement version of the mei-mapping-tool by accessing the page http://localhost:8800/

## Mongodb installation

Depending on your OS, you should follow the instructions to install and run MongoDB as a service upon start.

To install it in Ubuntu 18.04 follow [these instructions](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/)
  
If the installation was fine, when opening the terminal window and typing
 
`mongo`
  
you should be able to interact with the database with mongodb commands like `show dbs`to show a list of all the databases. A list of useful commands can be found in this link : https://docs.mongodb.com/manual/reference/mongo-shell/
 
 ### With the MongoDB Compass Community object
 1. Open the MongoDB compass community application and connect to the `localhost:27017`.
 2. Open the Collections tab of the mei-mapping-tool database to see the information from the collections.
 
For more information about how the application works, you can go to the Cress [wiki](https://github.com/DDMAL/mei-mapping-tool/wiki). 

Reporting an issue? Click [here](https://github.com/DDMAL/mei-mapping-tool/wiki/Issues)!
