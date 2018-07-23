/**
 * Copyright 2015 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

'use strict';

var express = require('express'); // app server
var bodyParser = require('body-parser'); // parser for post requests
var AssistantV1 = require('watson-developer-cloud/assistant/v1');
var ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');

var toneDetection = require('./addons/tone_detection.js'); // required for tone detection
var maintainToneHistory = false;

// The following requires are needed for logging purposes
var uuid = require('uuid');
var vcapServices = require('vcap_services');
var basicAuth = require('basic-auth-connect');

// The app owner may optionally configure a cloudand db to track user input.
// This cloudand db is not required, the app will operate without it.
// If logging is enabled the app must also enable basic auth to secure logging
// endpoints
var cloudantCredentials = vcapServices.getCredentials('cloudantNoSQLDB');
var cloudantUrl = null;
if (cloudantCredentials) {
  cloudantUrl = cloudantCredentials.url;
}
cloudantUrl = cloudantUrl || process.env.CLOUDANT_URL; // || '<cloudant_url>';
var logs = null;
var app = express();

app.use(express.static('./public')); // load UI from public folder
app.use(bodyParser.json());

// Bootstrap application settings
// Instantiate the Watson AssistantV1 Service as per WDC 2.2.0
var assistant = new AssistantV1({
  version: '2017-05-26'
});

// Instantiate the Watson Tone Analyzer Service as per WDC 2.2.0
var toneAnalyzer = new ToneAnalyzerV3({
  version: '2016-05-19'
});

// Endpoint to be called from the client side
app.post('/api/message', function(req, res) {
  var workspace = process.env.WORKSPACE_ID || '<workspace-id>';
  if (!workspace || workspace === '<workspace-id>') {
    return res.json({
      'output': {
        'text': 'The app has not been configured with a <b>WORKSPACE_ID</b> environment variable. Please refer to the ' + '<a href="https://github.com/watson-developer-cloud/assistant-simple">README</a> documentation on how to set this variable. <br>' + 'Once a workspace has been defined the intents may be imported from ' + '<a href="https://github.com/watson-developer-cloud/assistant-simple/blob/master/training/car_workspace.json">here</a> in order to get a working application.'
      }
    });
  }
  var payload = {
    workspace_id: workspace,
    context: {},
    input: {}
  };

  if (req.body) {
    if (req.body.input) {
      payload.input = req.body.input;
    }
    if (req.body.context) {
      payload.context = req.body.context;
    } else {

      // Add the user object (containing tone) to the context object for
      // Assistant
      payload.context = toneDetection.initUser();
    }


    // Invoke the tone-aware call to the Assistant Service
    invokeToneConversation(payload, res);
  }
});

/**
 * Updates the response text using the intent confidence
 *
 * @param {Object}
 *                input The request to the Assistant service
 * @param {Object}
 *                response The response from the Assistant service
 * @return {Object} The response with the updated message
 */
function updateMessage(input, response) {
  var responseText = null;
  var id = null;

  if (!response.output) {
    response.output = {};
  } else {
    if (logs) {
      // If the logs db is set, then we want to record all input and responses
      id = uuid.v4();
      logs.insert({'_id': id, 'request': input, 'response': response, 'time': new Date()});
    }
    return response;
  }

  if (response.intents && response.intents[0]) {
    var intent = response.intents[0];
    // Depending on the confidence of the response the app can return different
    // messages.
    // The confidence will vary depending on how well the system is trained. The
    // service will always try to assign
    // a class/intent to the input. If the confidence is low, then it suggests
    // the service is unsure of the
    // user's intent . In these cases it is usually best to return a
    // disambiguation message
    // ('I did not understand your intent, please rephrase your question',
    // etc..)
    if (intent.confidence >= 0.75) {
      responseText = 'I understood your intent was ' + intent.intent;
    } else if (intent.confidence >= 0.5) {
      responseText = 'I think your intent was ' + intent.intent;
    } else {
      responseText = 'I did not understand your intent';
    }
  }
  response.output.text = responseText;
  if (logs) {
    // If the logs db is set, then we want to record all input and responses
    id = uuid.v4();
    logs.insert({'_id': id, 'request': input, 'response': response, 'time': new Date()});
  }
  return response;
}

/**
 * @author April Webster
 * @returns {Object} return response from Assistant service
 *          invokeToneConversation calls the invokeToneAsync function to get the
 *          tone information for the user's input text (input.text in the
 *          payload json object), adds/updates the user's tone in the payload's
 *          context, and sends the payload to the Assistant service to get a
 *          response which is printed to screen.
 * @param {Json}
 *                payload a json object containing the basic information needed
 *                to converse with the Assistant Service's message endpoint.
 * @param {Object}
 *                res response object
 *
 */
function invokeToneConversation(payload, res) {
  toneDetection.invokeToneAsync(payload, toneAnalyzer).then(function(tone) {
    toneDetection.updateUserTone(payload, tone, maintainToneHistory);
    assistant.message(payload, function(err, data) {
      var returnObject = null;
      if (err) {
        console.error(JSON.stringify(err, null, 2));
        returnObject = res.status(err.code || 500).json(err);
      } else {
        returnObject = res.json(updateMessage(payload, data));
      }
      return returnObject;
    });
  }).catch(function(err) {
    console.log(JSON.stringify(err, null, 2));
  });
}

/**
 * Enable logging Must add an instance of the Cloudant NoSQL DB to the
 * application in BlueMix and add the Cloudant credentials to the application's
 * user-defined Environment Variables.
 */
if (cloudantUrl) {
  // If logging has been enabled (as signalled by the presence of the
  // cloudantUrl) then the
  // app developer must also specify a LOG_USER and LOG_PASS env vars.
  if (!process.env.LOG_USER || !process.env.LOG_PASS) {
    throw new Error('LOG_USER OR LOG_PASS not defined, both required to enable logging!');
  }
  // add basic auth to the endpoints to retrieve the logs!
  var auth = basicAuth(process.env.LOG_USER, process.env.LOG_PASS);
  // If the cloudantUrl has been configured then we will want to set up a nano
  // client
  var nano = require('nano')(cloudantUrl);
  // add a new API which allows us to retrieve the logs (note this is not
  // secure)
  nano.db.get('food_coach', function(err) {
    if (err) {
      console.error(err);
      nano.db.create('food_coach', function(errCreate) {
        console.error(errCreate);
        logs = nano.db.use('food_coach');
      });
    } else {
      logs = nano.db.use('food_coach');
    }
  });

  // Endpoint which allows deletion of db
  app.post('/clearDb', auth, function(req, res) {
    nano.db.destroy('food_coach', function() {
      nano.db.create('food_coach', function() {
        logs = nano.db.use('food_coach');
      });
    });
    return res.json({'message': 'Clearing db'});
  });

  // Endpoint which allows conversation logs to be fetched
  // csv - user input, conversation_id, timestamp

  app.get('/chats', auth, function(req, res) {
    logs.list({
      include_docs: true,
      'descending': true
    }, function(err, body) {
      console.error(err);
      // download as CSV
      var csv = [];
      csv.push([
        'Id',
        'Question',
        'Intent',
        'Confidence',
        'Entity',
        'Emotion',
        'Output',
        'Time'
      ]);
      body.rows.sort(function(a, b) {
        if (a && b && a.doc && b.doc) {
          var date1 = new Date(a.doc.time);
          var date2 = new Date(b.doc.time);
          var t1 = date1.getTime();
          var t2 = date2.getTime();
          var aGreaterThanB = t1 > t2;
          var equal = t1 === t2;
          if (aGreaterThanB) {
            return 1;
          }
          return equal
            ? 0
            : -1;
        }
      });
      body.rows.forEach(function(row) {
        var question = '';
        var intent = '';
        var confidence = 0;
        var time = '';
        var entity = '';
        var outputText = '';
        var emotion = '';
        var id = '';

        if (row.doc) {
          var doc = row.doc;
          if (doc.response.context) {
            id = doc.response.context.conversation_id;
          }

          if (doc.response.context && doc.response.context.user) {
            emotion = doc.response.context.user.tone.emotion.current;
          }

          if (doc.request && doc.request.input) {
            question = doc.request.input.text;
          }
          if (doc.response) {
            intent = '<no intent>';
            if (doc.response.intents && doc.response.intents.length > 0) {
              intent = doc.response.intents[0].intent;
              confidence = doc.response.intents[0].confidence;
            }
            entity = '<no entity>';
            if (doc.response.entities && doc.response.entities.length > 0) {
              entity = doc.response.entities[0].entity + ' : ' + doc.response.entities[0].value;
            }
            outputText = '<no dialog>';
            if (doc.response.output && doc.response.output.text) {
              outputText = doc.response.output.text.join(' ');
            }
          }
          time = new Date(doc.time).toLocaleString();
        }
        csv.push([
          id,
          question,
          intent,
          confidence,
          entity,
          emotion,
          outputText,
          time
        ]);
      });
      res.json(csv);
    });
  });
}

module.exports = app;
