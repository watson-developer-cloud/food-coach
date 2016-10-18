/**
 * Copyright 2016 IBM Corp. All Rights Reserved.
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

casper.options.waitTimeout = 360000;

casper.start();

casper
    .thenOpen(
        'http://localhost:3000',
        function(result) {
          this.echo(result.status);
          casper.test.assert(result.status === 200, 'Front page opens');

          casper.then(function() {
            casper.waitForSelector('#scrollingChat > div:nth-child(1)',
                function() {
                });
          });

          // Assert - Initial Dialog message
          casper.then(function() {
            var text = this.evaluate(function() {
              return document.querySelector('p').textContent;
            });

            casper.test.assertMatch(text, /^Did you have .*/i);

            casper.sendKeys('#textInput', 'No');
            this.sendKeys('#textInput', casper.page.event.key.Enter, {
              keepFocus: true
            });
          });

          // Process response
          casper.then(function() {
            casper.waitForSelector('#scrollingChat > div:nth-child(3)',
                function() {
                });
          });

          casper
              .then(function() {
                var text2 = this
                    .evaluate(function() {
                      return document
                          .querySelector('#scrollingChat > div:nth-child(3) > div > div > p').textContent;
                    });

                casper.test.assertMatch(text2, /^.* skipping meals.*/i);

                casper.sendKeys('#textInput', 'Good');
                this.sendKeys('#textInput', casper.page.event.key.Enter, {
                  keepFocus: true
                });
              });

          // Process response
          casper.then(function() {
            casper.waitForSelector('#scrollingChat > div:nth-child(5)');
          });

          // Check for Response
          casper
              .then(function() {
                var text3 = this
                    .evaluate(function() {
                      return document
                          .querySelector('#scrollingChat > div:nth-child(5) > div > div > p').textContent;
                    });

                casper.test.assertMatch(text3, /^I detected joy*/i);
              });
        }, null, 6 * 60 * 1000);

casper.run(function() {
  this.test.done();
});
