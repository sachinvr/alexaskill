"use strict";

//load NPM libraries
var Alexa = require("alexa-sdk");
var JiraApi = require('jira-client');
// var request = require("request");
var http = require("http");
var https = require('https');
var issueNumber = 'GSD-13';

//load custom modules
//var jira = require("./api/jira");

var HELLO_MESSAGE = "Hello Alexa";
var HELP_MESSAGE = "You can say hello, or, you can say exit... What can I help you with?";
var HELP_REPROMPT = "What can I help you with?";
var STOP_MESSAGE = "Goodbye!";

var handlers = {
    "CallGoogleIntent": function () {
		//var speechOutput = "Google unable to be called";
        //this.response.speak(speechOutput);
        //this.emit(":responseReady");

        httpsGet(issueNumber,  (myResult) => {
            console.log("sent     : " + issueNumber);
            console.log("received : " + myResult);

            //this.response.speak('The population of ' + myRequest + ' is ' + myResult);

            this.response.speak('The status of ' + issueNumber + ' is ' + myResult); 
            this.emit(':responseReady');

        });
    },
    "NewCustomIntent": function () {
        var speechOutput = HELLO_MESSAGE;
        
        this.response.speak(speechOutput);
        this.emit(":responseReady");
    },
    "AMAZON.HelpIntent": function () {
        var speechOutput = HELP_MESSAGE;
        var reprompt = HELP_REPROMPT;

        this.response.speak(speechOutput).listen(reprompt);
        this.emit(":responseReady");
    },
    "AMAZON.CancelIntent": function () {
        this.response.speak(STOP_MESSAGE);
        this.emit(":responseReady");
    },
    "AMAZON.StopIntent": function () {
        this.response.speak(STOP_MESSAGE);
        this.emit(":responseReady");
    },
};

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.registerHandlers(handlers);
    alexa.execute();
};

function httpsGet(issueNumber, callback) {

	var jira = new JiraApi({
        protocol: 'https',
        host: 'sample2018.atlassian.net',
        username: 'sachinvr@gmail.com',
        password: 'sample2018',
        apiVersion: '2',
        strictSSL: true
      });

      jira.findIssue(issueNumber)
        .then(function(issue) {
            console.log('Status: ' + issue.fields.status.name);
            callback(issue.fields.status.name);
        })
        .catch(function(err) {
            console.error(err);
            callback(err);
        });

    
}




