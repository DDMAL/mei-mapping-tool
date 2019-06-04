# Mei-mapping-tool
Web-based app to map squiggles to MEI snippets (under construction)

## Requirements
* [Node.js](https://nodejs.org/en/download/)
* [Homebrew](https://brew.sh/) *for mac users*
* [Mongodb](https://docs.mongodb.com/manual/installation/) `brew install mongodb`
* [Mongoose](https://mongoosejs.com/docs/) `npm install mongoose`
* [npm](https://www.npmjs.com/get-npm):
 `npm install npm@latest -g` 
 
 To check if you have npm or node.js, you can run these commands in your terminal :
 
  `npm -v`
 
  `node -v`

## Setup

1. Clone this repository in your terminal

  `git clone https://github.com/DDMAL/mei-mapping-tool`

2. Go to the myapp directory of the repository

  `cd mei-mapping-tool/myapp`

3. Install dependencies using npm

  `npm install`

4. Start the server

  `DEBUG=myapp:* npm start`
  
  You should be able to see the message *myapp:server Listening on port 3000 +0ms*

You can get the most recent version of the mei-mapping-tool by accessing the page http://localhost:3000/meiMapping

## Mongodb installation

To make sure mongodb is running in your application, you can add this command to the terminal :
`brew services start mongodb`

 ### With the terminal
 1. Open a new terminal window and add this command to the terminal. You will be asked for your administrator password.
 
  `sudo mongod`
  
  This will start the mongodb database app for the website.
  
 2. Open another terminal window and add this command to the terminal
 
  `mongo`
  
  Under this terminal, you will be able to interact with the database with mongodb commands like `show dbs`to show a list of all the databases. A list of useful commands can be found in this link : https://docs.mongodb.com/manual/reference/mongo-shell/
 
 ### With the MongoDB Compass Community object
 1. Open the MongoDB compass community application and connect to the `localhost:27017`.
 2. Open the Collections tab of the database titled userDatabase and you can see the information from the projects collection and the users collection.
 
## Instructions

The mei-mapping-tool has 3 main parts : log-in, projects and mei mapping page.

### Log-in
To access the `log-in` page, you can go to the home page http://localhost:3000 .
Under the sign up menu, you can create your own username and password for your meiMapping project. After signing-up, you will be redirected to the `log-in` page where you can add your new username and log-in to your account.
After clicking the submit button, you will be redirected to the `projects` page :
http://localhost:3000/projects

### Projects
To create a project, simply click on the add Project link and add a project name in the pop-up window. 
Once the project has been created, a button with the name of the project will appear. To get access to the mei mapping tool, you can click on the button you created and you will be redirected to the `mapping editor page` http://localhost:3000/meiMapping

### MEI Mapping (in development)
The mei mapping page has 3 test elements. You can add elements by clicking on the `add` button and giving a name to your new element. The new element will have 4 sections. To access the sections, simply click on the purple collapsible rectangle that has the name of the new element on the left corner. 
Starting from the left, the first section is the drag and drop section using `dropzone` where you can add images of your element. The second section is where you can add the `name, folio and description` of the element. The third section is the `Classifier label` that should have a proper syntax:

`neume.pes.b.3` 

The fourth element is the `MEI Snippet` that holds an `ace editor` where you can directly code the mei encoding related to your element. For the information to be stored in the database, you will need to press the save button.
The home page of the header will redirect you to the projects page http://localhost:3000/projects

## Log-out
To log-out of your project, you can click on the log-out button of the header. You will be redirected to the home page http://localhost:3000
