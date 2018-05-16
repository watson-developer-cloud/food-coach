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

require('dotenv').config({silent: true});

var describeIfCredentials = describe;
if (!process.env.CLOUDANT_URL || !process.env.CONVERSATION_USERNAME) {
  console.log('Skipping unit test because CLOUDANT_URL is null');
  describeIfCredentials = describe.skip;
}

describeIfCredentials('Basic API tests', function () {
  var app = require('../../app');
  var bodyParser = require('body-parser');
  var request = require('supertest');

  app.use(bodyParser.json());

  it('GET to / should load the home page', function () {
    return request(app).get('/').expect(200);
  });
});