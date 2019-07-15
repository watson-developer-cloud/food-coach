<h1 align="center" style="border-bottom: none;">🚀 Food Coach Demo</h1>
<h3 align="center">DEPRECATED: this repo is no longer actively maintained. It can still be used as reference, but may contain outdated or unpatched code.</h3>
<p align="center">
  <a href="http://travis-ci.org/watson-developer-cloud/food-coach">
    <img alt="Travis" src="https://travis-ci.org/watson-developer-cloud/food-coach.svg?branch=master">
  </a>
  <a href="#badge">
    <img alt="semantic-release" src="https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg">
  </a>
</p>
</p>

![Demo GIF](readme_images/demo.gif?raw=true)

For more information on the Assistant service, see the [detailed documentation](https://console.bluemix.net/docs/services/conversation/index.html#about).
For more information on the Tone Analyzer Service, see the [detailed documentation](http://www.ibm.com/watson/developercloud/tone-analyzer.html).

## Deploying the application

If you want to experiment with the application or use it as a basis for building your own application, you need to deploy it in your own environment. You can then explore the files, make changes, and see how those changes affect the running application. After making modifications, you can deploy your modified version of the application to IBM Cloud.

## Prerequisites

1. Sign up for an [IBM Cloud account](https://console.bluemix.net/registration/).
1. Download the [IBM Cloud CLI](https://console.bluemix.net/docs/cli/index.html#overview).
1. Create an instance of the Watson Assistant service and get your credentials:
    - Go to the [Watson Assistant](https://console.bluemix.net/catalog/services/conversation) page in the IBM Cloud Catalog.
    - Log in to your IBM Cloud account.
    - Click **Create**.
    - Click **Show** to view the service credentials.
    - Copy the `apikey` value, or copy the `username` and `password` values if your service instance doesn't provide an `apikey`.
    - Copy the `url` value.
1. Create an instance of the Tone Analyzer service and get your credentials:
    - Go to the [Tone Analyzer](https://console.bluemix.net/catalog/services/tone-analyzer) page in the IBM Cloud Catalog.
    - Log in to your IBM Cloud account.
    - Click **Create**.
    - Click **Show** to view the service credentials.
    - Copy the `apikey` value, or copy the `username` and `password` values if your service instance doesn't provide an `apikey`.
    - Copy the `url` value.

## Configuring the application

1. In your IBM Cloud console, open the Watson Assistant service instance

2. Click the **Import workspace** icon in the Watson Assistant service tool. Specify the location of the workspace JSON file in your local copy of the app project:

   `<project_root>/food-coach/training/food-coach-workspace.json`

3. Select **Everything (Intents, Entities, and Dialog)** and then click **Import**. The car dashboard workspace is created.

4. Click the menu icon in the upper-right corner of the workspace tile, and then select **View details**.

5. Click the ![Copy](readme_images/copy.png) icon to copy the workspace ID to the clipboard.

    ![Steps to get credentials](https://github.com/watson-developer-cloud/assistant-simple/raw/master/readme_images/assistant-simple.gif)

6. In the application folder, copy the *.env.example* file and create a file called *.env*

    ```
    cp .env.example .env
    ```

7. Open the *.env* file and add the service credentials that you obtained in the previous step.

    Example *.env* file that configures the `apikey` and `url` for a Watson Assistant service instance hosted in the US East region:

    ```
    ASSISTANT_IAM_APIKEY=X4rbi8vwZmKpXfowaS3GAsA7vdy17Qh7km5D6EzKLHL2
    ASSISTANT_URL=https://gateway-wdc.watsonplatform.net/assistant/api
    ```

    If your service instance uses `username` and `password` credentials, add the `ASSISTANT_USERNAME` and `ASSISTANT_PASSWORD` variables to the *.env* file.

    Example *.env* file that configures the `username`, `password`, and `url` for a Watson Assistant service instance hosted in the US South region:

    ```
    ASSISTANT_USERNAME=522be-7b41-ab44-dec3-g1eab2ha73c6
    ASSISTANT_PASSWORD=A4Z5BdGENrwu8
    ASSISTANT_URL=https://gateway.watsonplatform.net/assistant/api
    ```

8. Add the `WORKSPACE_ID` to the previous properties

    ```
    WORKSPACE_ID=522be-7b41-ab44-dec3-g1eab2ha73c6
    ```


9. Your `.env` file  should looks like:

    ```
    # Environment variables
    WORKSPACE_ID=1c464fa0-2b2f-4464-b2fb-af0ffebc3aab
    ASSISTANT_IAM_APIKEY=_5iLGHasd86t9NddddrbJPOFDdxrixnOJYvAATKi1
    ASSISTANT_URL=https://gateway-syd.watsonplatform.net/assistant/api

    TONE_ANALYZER_IAM_APIKEY=UdHqOFLzoOCFD2M50AbsasdYhOnLV6sd_C3ua5zah
    TONE_ANALYZER_URL=https://gateway-syd.watsonplatform.net/tone-analyzer/api
    ```

## Running locally

1. Install the dependencies

    ```
    npm install
    ```

1. Run the application

    ```
    npm start
    ```

1. View the application in a browser at `localhost:3000`

## Deploying to IBM Cloud as a Cloud Foundry Application

1. Login to IBM Cloud with the [IBM Cloud CLI](https://console.bluemix.net/docs/cli/index.html#overview)

    ```
    ibmcloud login
    ```

1. Target a Cloud Foundry organization and space.

    ```
    ibmcloud target --cf
    ```

1. Edit the *manifest.yml* file. Change the **name** field to something unique.  
  For example, `- name: my-app-name`.
1. Deploy the application

    ```
    ibmcloud app push
    ```

1. View the application online at the app URL.  
For example: https://my-app-name.mybluemix.net


# What to do next

After you have the application installed and running, experiment with it to see how it responds to your input.

## Modifying the application

After you have the application deployed and running, you can explore the source files and make changes. Try the following:

   * Modify the .js files to change the application logic.

   * Modify the .html file to change the appearance of the application page.

   * Use the Assistant tool to train the service for new intents, or to modify the dialog flow. For more information, see the [Assistant service documentation](https://console.bluemix.net/docs/services/conversation/index.html#about).

# What does the Food Coach application do?

The application interface is designed for chatting with a coaching bot. Based on the time of day, it asks you if you've had a particular meal (breakfast, lunch, or dinner) and what you ate for that meal.

The chat interface is in the left panel of the UI, and the JSON response object returned by the Assistant service in the right panel. Your input is run against a small set of sample data trained with the following intents:

    yes: acknowledgment that the specified meal was eaten
    no: the specified meal was not eaten
    help
    exit

The dialog is also trained on two types of entities:

    food items
    unhealthy food items

These intents and entities help the bot understand variations your input.

After asking you what you ate (if a meal was consumed), the bot asks you how you feel about it. Depending on your emotional tone, the bot provides different feedback.

Below you can find some sample interactions:

![Alt text](readme_images/examples.jpeg?raw=true)

In order to integrate the Tone Analyzer with the Assistant service, the following approach was taken:
   * Intercept the user's message. Before sending it to the Assistant service, invoke the Tone Analyzer Service. See the call to `toneDetection.invokeToneAsync` in the `invokeToneConversation` function in [app.js](./app.js).
   * Parse the JSON response object from the Tone Analyzer Service, and add appropriate variables to the context object of the JSON payload to be sent to the Assistant service. See the `updateUserTone` function in [tone_detection.js](./addons/tone_detection.js).
   * Send the user input, along with the updated context object in the payload to the Assistant service. See the call to `assistant.message` in the `invokeToneConversation` function in [app.js](./app.js).


You can see the JSON response object from the Assistant service in the right hand panel.

![Alt text](readme_images/tone_context.jpeg?raw=true)

In the conversation template, alternative bot responses were encoded based on the user's emotional tone. For example:

![Alt text](readme_images/rule.png?raw=true)


# License

  This sample code is licensed under Apache 2.0.
  Full license text is available in [LICENSE](LICENSE).

# Contributing

  See [CONTRIBUTING](CONTRIBUTING.md).

## Open Source @ IBM

  Find more open source projects on the
  [IBM Github Page](http://ibm.github.io/).
