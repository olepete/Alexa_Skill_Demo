/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');
const rp = require('request-promise');

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speechText = 'Welcome to the Airport Weather app, you can say get weather!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Get Weather', speechText)
      .getResponse();
  },
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = 'You can say get weather to me!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Get Weather', speechText)
      .getResponse();
  },
};


const GetWeatherIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'GetAirportWeatherIntent';
  },
  async handle(handlerInput) {

    const currentIntent = handlerInput.requestEnvelope.request.intent;
      const slots = currentIntent.slots;
      const attributesManager = handlerInput.attributesManager;
      //allows us to pass data back to the call
      //to persist parameters betweek calls
      let sessionAttributes = attributesManager.getSessionAttributes();

        let outputSpeech = '';
        let code = 'KATL';
        let airportName = '';
      // prompt for slot data if needed
      for (const slotName in currentIntent.slots) {
       
        if (Object.prototype.hasOwnProperty.call(currentIntent.slots, slotName)) {
          const currentSlot = currentIntent.slots[slotName];
          if( currentSlot.value == null ) {
            if (currentSlot.name == 'Airport'){
              outputSpeech = 'Which airport do you want to check?';
            }
                     
            return handlerInput.responseBuilder
                .speak(outputSpeech)
                .reprompt(outputSpeech)
                .addElicitSlotDirective(currentSlot.name)
                .getResponse();
          }
          else {
            if (currentSlot.name == 'Airport'){
              code = 'KATL';//this is default, should be looked up in a real impl
              airportName = currentSlot.value;
            }
          }
        }
      }

    //we are defaulting this to "KATL" for atlanta, 
    //a robust solution will take the slot value and 
    //lookup the airport code via a service to return 
    let resp = await getWeather(code);
    let speechText = airportName + ' is ' + resp.Temperature + ' celsius';
      
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Get Weather', speechText)
      .getResponse();
  },
};

const baseUri = 'https://avwx.rest/api/metar';
async function getWeather(code) {
  return new Promise((resolve,reject)=>{
 // console.log(authorizationToken);
 let uri = baseUri + '/' + code 
  var options = {
   method: 'GET',
   uri: uri,
   json: true // Automatically stringifies the body to JSON
   
  } ;
  rp(options)
   .then(function (repos) {
      resolve(repos);
   })
   .catch(function (err) {
       reject(err);
   });
})};


const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speechText = 'Goodbye!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Get Weather', speechText)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, I can\'t understand the command. Please say again.')
      .reprompt('Sorry, I can\'t understand the command. Please say again.')
      .getResponse();
  },
};



const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler,
    GetWeatherIntentHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
