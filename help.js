'use strict';

// --------------- Helpers to build responses which match the structure of the necessary dialog actions -----------------------

function elicitSlot(sessionAttributes, intentName, slots, slotToElicit, message, responseCard) {
	return {
		sessionAttributes,
		dialogAction: {
			type: 'ElicitSlot',
			intentName,
			slots,
			slotToElicit,
			message,
			responseCard,
		},
	};
}

function confirmIntent(sessionAttributes, intentName, slots, message, responseCard) {
	return {
		sessionAttributes,
		dialogAction: {
			type: 'ConfirmIntent',
			intentName,
			slots,
			message,
			responseCard,
		},
	};
}

function close(sessionAttributes, fulfillmentState, message, responseCard) {
	return {
		sessionAttributes,
		dialogAction: {
			type: 'Close',
			fulfillmentState,
			message,
			responseCard,
		},
	};
}

function delegate(sessionAttributes, slots) {
	return {
		sessionAttributes,
		dialogAction: {
			type: 'Delegate',
			slots,
		},
	};
}



// ---------------- Helper Functions --------------------------------------------------

// build a message for Lex responses
function buildMessage(messageContent) {
	return {
		contentType: 'PlainText',
		content: messageContent
	};
}

// --------------- Functions that control the skill's behavior -----------------------

/**
 * Performs dialog management and fulfillment for processing payment request.
 */
 
 function help(intentRequest, callback) {
 	const outputSessionAttributes = intentRequest.sessionAttributes;
	const source = intentRequest.invocationSource;
	
	if (source === 'DialogCodeHook') {
		// perform validation on the slot values we have
		const slots = intentRequest.currentIntent.slots;		
		
		// if we've come this far, then we simply defer to Lex
		callback(delegate(outputSessionAttributes, slots));
		return;
		
	}
	
	callback(close(outputSessionAttributes, 'Fulfilled', {
		contentType: 'PlainText',
		content: 'To get started, says something like: "I would like to make a payment."  And you will be guided to complete the process.'
	}));	
 }
 
// --------------- Intents -----------------------

/**
 * Called when the user specifies an intent for this skill.
 */
function dispatch(intentRequest, callback) {

	console.log('dispatch userId=${intentRequest.userId}, intent=${intentRequest.currentIntent.name}');

	const name = intentRequest.currentIntent.name;

	// dispatch to the intent handlers
	if (name === 'jompayHelp') {
		return help(intentRequest, callback);
	}
	throw new Error('Intent with name ${name} not supported');
}

// --------------- Main handler -----------------------

// Route the incoming request based on intent.
// The JSON body of the request is provided in the event slot.
exports.handler = (event, context, callback) => {

	console.log(JSON.stringify(event));

	try {
		console.log('event.bot.name=${event.bot.name}');

		// fail if this function is for a different bot
		if (event.bot.name !== 'JomPAYBot') {
		     callback('Invalid Bot Name');
		}
		dispatch(event, (response) => callback(null, response));
	} catch (err) {
		callback(err);
	}
};