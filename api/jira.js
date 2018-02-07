"use strict";

//var request = require("request");

module.exports = {
	callGoogle: function(){
		
		request("http://google.com", function(err, res, body){
			if(err){
				return false;
			}
			else
				return true;
		});
		
		return false;
	}
};