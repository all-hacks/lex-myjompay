'use strict';// --------------- Helpers to build responses which match the structure of the necessary dialog actions -----------------------function elicitSlot(sessionAttributes, intentName, slots, slotToElicit, message, responseCard) {	return {		sessionAttributes,		dialogAction: {			type: 'ElicitSlot',			intentName,			slots,			slotToElicit,			message,			responseCard,		},	};}function confirmIntent(sessionAttributes, intentName, slots, message, responseCard) {	return {		sessionAttributes,		dialogAction: {			type: 'ConfirmIntent',			intentName,			slots,			message,			responseCard,		},	};}function close(sessionAttributes, fulfillmentState, message, responseCard) {	return {		sessionAttributes,		dialogAction: {			type: 'Close',			fulfillmentState,			message,			responseCard,		},	};}function delegate(sessionAttributes, slots) {	return {		sessionAttributes,		dialogAction: {			type: 'Delegate',			slots,		},	};}// ---------------- Helper Functions --------------------------------------------------// build a message for Lex responsesfunction buildMessage(messageContent) {	return {		contentType: 'PlainText',		content: messageContent	};}// --------------- Functions that control the skill's behavior -----------------------/** * Performs dialog management and fulfillment for processing payment request. */  function payBill(intentRequest, callback) { 	const outputSessionAttributes = intentRequest.sessionAttributes;	const source = intentRequest.invocationSource;		if (source === 'DialogCodeHook') {		// perform validation on the slot values we have		const slots = intentRequest.currentIntent.slots;						const name = (slots.name ? slots.name : null);		const amount = (slots.amount ? slots.amount : null);		const date = (slots.date ? slots.date : null);				if (name ===  null && amount === null && date === null) {			callback(elicitSlot(outputSessionAttributes, intentRequest.currentIntent.name,				slots, 'name', buildMessage("Welcome to My JomPAY Chat Bot.  What is the biller's name?")));		}						// check payment date        if (date) {            var now = new Date();            now.setHours(0, 0, 0, 0);                        if (Date.parse(date) < now) {                    			callback(elicitSlot(outputSessionAttributes, intentRequest.currentIntent.name,    				slots, 'date', buildMessage("A payment date can not be in the past.  When do you want to pay?")));            }        }        		// if we've come this far, then we simply defer to Lex		callback(delegate(outputSessionAttributes, slots));		return;			}		callback(close(outputSessionAttributes, 'Fulfilled', {		contentType: 'PlainText',		content: 'Great!  Your payment request has been processed.  Thanks for using JomPAY Bot!'	}));	 } function orderBeverage(intentRequest, callback) {	const outputSessionAttributes = intentRequest.sessionAttributes;	const source = intentRequest.invocationSource;	if (source === 'DialogCodeHook') {		// perform validation on the slot values we have		const slots = intentRequest.currentIntent.slots;		const beverageType = (slots.BeverageType ? slots.BeverageType : null);		const beverageSize = (slots.BeverageSize ? slots.BeverageSize : null);		const beverageTemp = (slots.BeverageTemp ? slots.BeverageTemp : null);		if (! (beverageType && (beverageType === 'mocha'))) {			callback(elicitSlot(outputSessionAttributes, intentRequest.currentIntent.name,				slots, 'BeverageType', buildMessage('Sorry, but we can only make a mocha today.  What kind of beverage would you like?')));		}		// let's assume we only accept short, tall, grande, venti, small, medium, and large for now		if (! (beverageSize && beverageSize.match(/short|tall|grande|venti|small|medium|large/))) {			callback(elicitSlot(outputSessionAttributes, intentRequest.currentIntent.name,				slots, 'BeverageSize'));		}		// let's say we need to know temperature for mochas		if (! (beverageTemp && beverageTemp.match(/kids|hot|iced/))) {			callback(elicitSlot(outputSessionAttributes, intentRequest.currentIntent.name,				slots, 'BeverageTemp'));		}		// if we've come this far, then we simply defer to Lex		callback(delegate(outputSessionAttributes, slots));		return;	}	callback(close(outputSessionAttributes, 'Fulfilled', {		contentType: 'PlainText',		content: 'Great!  Your mocha will be available for pickup soon.  Thanks for using JomPAY Bot!'	}));}// --------------- Intents -----------------------/** * Called when the user specifies an intent for this skill. */function dispatch(intentRequest, callback) {	console.log('dispatch userId=${intentRequest.userId}, intent=${intentRequest.currentIntent.name}');	const name = intentRequest.currentIntent.name;	// dispatch to the intent handlers	if (name === 'jompayPayBill') {		return payBill(intentRequest, callback);	}	throw new Error('Intent with name ${name} not supported');}// --------------- Main handler -----------------------// Route the incoming request based on intent.// The JSON body of the request is provided in the event slot.exports.handler = (event, context, callback) => {	console.log(JSON.stringify(event));	try {		console.log('event.bot.name=${event.bot.name}');		// fail if this function is for a different bot		if (event.bot.name !== 'JomPAYBot') {		     callback('Invalid Bot Name');		}		dispatch(event, (response) => callback(null, response));	} catch (err) {		callback(err);	}};