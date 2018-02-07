"use strict";

//load NPM libraries
var Alexa = require("alexa-sdk");
// var request = require("request");
var http = require("http");
var https = require('https');
var myRequest = 'Florida';

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

        httpsGet(myRequest,  (myResult) => {
            console.log("sent     : " + myRequest);
            console.log("received : " + myResult);

            this.response.speak('The population of ' + myRequest + ' is ' + myResult);
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

function httpsGet(myData, callback) {

    // GET is a web service request that is fully defined by a URL string
    // Try GET in your browser:
    // https://cp6gckjt97.execute-api.us-east-1.amazonaws.com/prod/stateresource?usstate=New%20Jersey


    // Update these options with the details of the web service you would like to call
    var options = {
        host: 'cp6gckjt97.execute-api.us-east-1.amazonaws.com',
        port: 443,
        path: '/prod/stateresource?usstate=' + encodeURIComponent(myData),
        method: 'GET',

        // if x509 certs are required:
        // key: fs.readFileSync('certs/my-key.pem'),
        // cert: fs.readFileSync('certs/my-cert.pem')
    };

    var req = https.request(options, res => {
        res.setEncoding('utf8');
        var returnData = "";

        res.on('data', chunk => {
            returnData = returnData + chunk;
        });

        res.on('end', () => {
            // we have now received the raw return data in the returnData variable.
            // We can see it in the log output via:
            // console.log(JSON.stringify(returnData))
            // we may need to parse through it to extract the needed data

            var pop = JSON.parse(returnData).population;

            callback(pop);  // this will execute whatever function the caller defined, with one argument

        });

    });
    req.end();

}

//JIRA and OAuth Implmentation

var express = require('express'),
sys = require('sys'),
util = require('util'),
OAuth = require('./oauth').OAuth,
cookieParser = require('cookie-parser'),
errorhandler = require('errorhandler'),
session = require('express-session'),
fs = require('fs');

var app = express();

//development
if (process.env.NODE_ENV === 'development') {
app.use(errorhandler({ dumpExceptions: true, showStack: true }));
//app.use(express.logger());
app.use(cookieParser());
app.use(express.session({secret: "ssshhhh!"}));
}

var config = require("./config.js");

var privateKeyData = fs.readFileSync(config["consumerPrivateKeyFile"], "utf8");

var consumer = 
  new OAuth("https://jdog.atlassian.com/plugins/servlet/oauth/request-token",
                  "https://jdog.atlassian.com/plugins/servlet/oauth/access-token",
                  config["consumerKey"],
                  "",
                  "1.0",
                  "http://localhost:8080/sessions/callback",
                  "RSA-SHA1",
				  null,
				  privateKeyData);




app.dynamicHelpers({
  	session: function(request, response){
    	return request.session;
	}
});

app.get('/', function(request, response){
  	response.send('Hello World');
});

app.get('/sessions/connect', function(request, response){
	consumer.getOAuthRequestToken(
		function(error, oauthToken, oauthTokenSecret, results) {
    		if (error) {
				console.log(error.data);
      			response.send('Error getting OAuth access token');
			}
    		else {
      			request.session.oauthRequestToken = oauthToken;
      			request.session.oauthRequestTokenSecret = oauthTokenSecret;
      			response.redirect("https://jdog.atlassian.com/plugins/servlet/oauth/authorize?oauth_token="+request.session.oauthRequestToken);
			}
		}
	)
});

app.get('/sessions/callback', function(request, response){
	consumer.getOAuthAccessToken (
			request.session.oauthRequestToken, 
			request.session.oauthRequestTokenSecret, 
			request.query.oauth_verifier,
			function(error, oauthAccessToken, oauthAccessTokenSecret, results){			
				if (error) { 
					console.log(error.data);
					response.send("error getting access token");		
				}
    			else {
      				request.session.oauthAccessToken = oauthAccessToken;
      				request.session.oauthAccessTokenSecret = oauthAccessTokenSecret;
      				consumer.get("https://jdog.atlassian.com/rest/api/latest/issue/JRADEV-8110.json", 
						request.session.oauthAccessToken, 
						request.session.oauthAccessTokenSecret, 
						"application/json",
						function(error, data, resp){
							console.log(data);
        					data = JSON.parse(data);
        					response.send("I am looking at: "+data["key"]);
						}
					);
				}
			}
		)
	});
					

app.listen(parseInt(process.env.PORT || 8080));


