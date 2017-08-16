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
/* eslint-env es6 */

var Promise = require('bluebird');

/**
 * Thresholds for identifying meaningful tones returned by the Watson Tone
 * Analyzer. Current values are based on the recommendations made by the Watson
 * Tone Analyzer at
 * https://www.ibm.com/watson/developercloud/doc/tone-analyzer/understanding-tone.shtml
 * These thresholds can be adjusted to client/domain requirements.
 */
var PRIMARY_EMOTION_SCORE_THRESHOLD = 0.5;
// var LANGUAGE_HIGH_SCORE_THRESHOLD = 0.75;
// var LANGUAGE_NO_SCORE_THRESHOLD = 0.0;
// var SOCIAL_HIGH_SCORE_THRESHOLD = 0.75;
// var SOCIAL_LOW_SCORE_THRESHOLD = 0.25;

/**
 * Labels for the tone categories returned by the Watson Tone Analyzer
 */
var EMOTION_TONE_LABEL = 'emotion_tone';
// var LANGUAGE_TONE_LABEL = 'language_tone';
// var SOCIAL_TONE_LABEL = 'social_tone';

/**
 * Public functions for this module
 */
module.exports = {
  updateUserTone: updateUserTone,
  invokeToneAsync: invokeToneAsync,
  initUser: initUser
};

/**
 * invokeToneAsync is an asynchronous function that calls the Tone Analyzer
 * service and returns a Promise
 * 
 * @param {Json}
 *                conversationPayload json object returned by the Watson
 *                Conversation Service
 * @param {Object}
 *                toneAnalyzer an instance of the Watson Tone Analyzer service
 * @returns {Promise} a Promise for the result of calling the toneAnalyzer with
 *          the conversationPayload (which contains the user's input text)
 */
function invokeToneAsync(conversationPayload, toneAnalyzer) {
  if (!conversationPayload.input || !conversationPayload.input.text || conversationPayload.input.text.trim() == '')
    conversationPayload.input.text = '<empty>';
  return new Promise(function(resolve, reject) {
    toneAnalyzer.tone_chat({
      utterances: [
        { text: conversationPayload.input.text, user: 'customer'}
    ]}, (error, data) => {
      if (error) {
        reject(error);
      } else {
        resolve(data);
      }
    });
  });
}

/**
 * updateUserTone processes the Tone Analyzer payload to pull out the emotion,
 * language and social tones, and identify the meaningful tones (i.e., those
 * tones that meet the specified thresholds). The conversationPayload json
 * object is updated to include these tones.
 * 
 * @param {Json}
 *                conversationPayload json object returned by the Watson
 *                Conversation Service
 * @param {Json}
 *                toneAnalyzerPayload json object returned by the Watson Tone
 *                Analyzer Service
 * @param {boolean}
 *                maintainHistory set history for each user turn in the history
 *                context variable
 * @returns {void}
 */
function updateUserTone(conversationPayload, toneAnalyzerPayload, maintainHistory) {
  var emotionTone = null;
  //var languageTone = null;
  //var socialTone = null;

  if (!conversationPayload.context) {
    conversationPayload.context = {};
  }

  if (!conversationPayload.context.user) {
    conversationPayload.context.user = initUser();
  }

  // For convenience sake, define a variable for the user object
  var user = conversationPayload.context.user;
  var detectedTones = toneAnalyzerPayload.utterances_tone[0].tones
  var userTone = null;

  if (detectedTones.length == 0) {
    userTone = "none"
  } else {
    userTone = detectedTones[0].tond_id;
      }
      
  user.tone.emotion.current = userTone;
  conversationPayload.context.user = user;
  return conversationPayload;
  }
   
/**
 * initToneContext initializes a user object containing tone data (from the
 * Watson Tone Analyzer)
 * 
 * @returns {Json} user json object with the emotion, language and social tones.
 *          The current tone identifies the tone for a specific conversation
 *          turn, and the history provides the conversation for all tones up to
 *          the current tone for a conversation instance with a user.
 */
function initUser() {
  return {
    'tone': {
      'emotion': {
        'current': null
      },
      //'language': {
      //  'current': null
      //},
      //'social': {
      //  'current': null
      }
    }
  };
