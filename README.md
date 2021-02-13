# SAG-MongoDB
![Build Status](https://img.shields.io/badge/build-passing-brightgreen?style=plastic)
        <img src="https://img.shields.io/badge/license-MIT-green?style=plastic" alt="License Badge">  [![GitHub pull-requests closed](https://img.shields.io/github/issues-pr-closedcom/deawar/SAG-MongoDB.js.svg?style=plastic)](https://GitHub.com/deawar/SAG-MongoDB.js/pull/) [![GitHub stars](https://img.shields.io/github/stars/deawar/SAG-MongoDB.js.svg?style=social&label=Star&maxAge=2592000)](https://GitHub.com/deawar/SAG-MongoDB.js/stargazers/)
# Project-Title
SilentAuctionGallery using a MongoDB vs MySQL backend.

This is a fork of the SilentAuctionGallery Project found at [ankmud01/SilentAuctionGallery](https://github.com/ankmud01/SilentAuctionGallery).

## Authors: 
Dean Warren and Jonathan Kelley using the above mentiond project as it's base.

## Table of Contents
=====================
* [Installation](#installation)
* [License](#license)
* [Usage](#usage)
* [Collaborators](#collaborators)
* [Testing](#testing)
* [Contributing](#contributing)
* [Demo](#demo)
* [Questions](#questions)

## Installation
To install necessary dependencies, run the following command:<br>
```
npm install
```
Create a `.env` file for all system variables:
```
# .env for SilentAuctionGallery
# Node Environment
NODE_ENV=development
PORT=3000

# MySQL DB Credentials
DB_USER=root
DB_PASSWORD=root
DB_NAME=silentauctiondb
DB_HOST=localhost

# SESSION SECRET
SESSION_SECRET='your secret phrase'

# GMAIL Account credentials
GMAIL_SERVICE_HOST=smtp.gmail.com
GMAIL_PASSWORD='your gmail password here'
GMAIL_USERNAME='gmail-account@gmail.com'
GMAIL_SERVICE_SECURE=false
GMAIL_SERVICE_PORT=587

# Twilio Account Credentials
TWILIO_ACC_SID='your Twilio SID here'
TWILIO_AUTH_TOKEN=your Twilio Auth_Token here'
TWILIO_PHONE_NUM='Twilio Phone Number'
```

## License
MIT

## Usage
I am a highschool art teacher whose students were unable to have a silent auction to display and sell their work due to COVID-19. I want to be able to display my students' work in a professional manner. Each artist will have a Bio page and thumbnails of their art that can be enlarged on click. 

## Collaborators
[Dean Warren](https://api.github.com/users/deawar/repos) and [Jonathan Kelley](https://api.github.com/itsjonkelley/repos) are this projects primary collaborators. 

## Testing
To run tests, run the following comand:<br>
```
npm run lint
```
To run the application locally, run the following command:<br>
```
npm run start
```
Or :<br>
```
node -r dotenv/config server.js 
```
Or if you prefer `nodemon` :<br>
```
 nodemon -r dotenv/config server.js
```

## Contributing
This application will be used for helping teachers and students to raise charity for a good cause and showcase their talent. So, please be respectful and mindful to others.

## Demo
Our reasons for creating this project/app:
[Prezi Slide Deck](https://prezi.com/view/laFRI0MbylYOWSvRisPr/)

## Questions
<img src="https://avatars1.githubusercontent.com/u/15312495?s=400&u=ca57805f0913479f15a13ed8e5a1577eb95c0926&v=4" alt="ME" width="150" height="150"><br>
if you have any questions about the repo contact me or deawar directly at deawar@gmail.com thank you.<br>
If you want to see more of my work please click here [deawar/repos](https://api.github.com/users/deawar/repos).