# Cress 🎵
Web-based app to map squiggles to MEI snippets (under construction)

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

You can get the most recent version of the mei-mapping-tool by accessing the page http://localhost:3000/

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
 2. Open the Collections tab of the mei-mapping-tool database to see the information from the collections.
 
## Instructions

The mei-mapping-tool has 3 main parts : log-in, projects and classifier.

### Log-in
To access the `log-in` page, you can go to the home page http://localhost:8800 . If you don't have an account, you'll need to create it in the register menu.
Under the sign up menu, you can create your own username and password for your mei-mapping project.
After clicking the register button, you will be redirected to the `projects` page :
http://localhost:8800/projects

### Projects
To create a project, simply click on the add Project link and add a project name in the pop-up window. 
Once the project has been created, a button with the name of the project will appear under `My Projects`. To get access to the classifier, you can click on the button you created and you will be redirected to the classifier page. `http://localhost:3000/projects/:id`

### Classifier (in development)
With the classifier view, you can create, update and delete neume components. You can add neumes by clicking on the `add Neume` button and filling the information. The new element will have 4 sections. To access the sections, simply click on the purple collapsible rectangle that has the name of the new element on the left corner. 
Starting from the left, the first section is the drag and drop section using `dropzone` where you can add images of your element. The second section is where you can add the `name, folio and description` of the element. The third section is the `Classifier label` that should have a proper syntax:

`neume.pes.b.3` 

The fourth element is the `MEI Snippet` that holds an `ace editor` where you can directly code the mei encoding related to your element. Under the snippet, you can also specify whether the code you have written down needs to be reviewed for mei errors.
The project name can also be changed under the classifier view. To update the name, simply edit the name of the project in the upper left corner and click on the button `Update Name` to see your changes. 
The home page of the header will redirect you to the projects page http://localhost:8800/projects
### Edit image
To add more images or delete previous images from the classifier, you can click on the `Edit images` button of the neume. A pop-up window with a view of the images and a dropzone to add images will appear. 

## Profile page
To access the profile page, you can click on your username button in the navigation bar. You will be redirected to http://localhost:8800/profile

The profile page is divided in 3 sections. The profile section has information about your email, profile status and bio. You can change your bio by simply writing on the text area and clicking on the update button to see your changes. 

The collaborators section helps manage user access to your projects. To add a new editor to your project, you can press the `add a collaborator` link at the bottom of the screen and you will be prompted to choose the username of the user and the project to which you want to give access. The user will then be able to view and edit the project in their account. The `settings` section manages the changes a user might want to make to its email or username.

## Log-out
To log-out of your project, you can click on the log-out button of the header. You will be redirected to the home page http://localhost:8800
