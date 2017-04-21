var utuClient = require('utu').uTu;
var utu = new utuClient(process.env.UTU_KEY);

var constants = require('utu').constants;

var sendIntent = function(intent, platformId, sessionId, botMsg) {
  utu.intent(intent, {
    platform: constants.ALEXA,
    platformId: platformId,
    sessionId: sessionId,
    values: {
      botMessage: botMsg,
    }
  }).catch((err) => console.log(err))
}

exports.injectUtu = function(handlers) {
  var wrappedHandlers = {};

  Object.keys(handlers).forEach(function (intent) {
    wrappedHandlers[intent] = function(eventType) {
      this._emit = this.emit;
      this.emit = function() {
        if (eventType === ":tellWithCard" || eventType === ":tell") {
          sendIntent(intent, this.event.session.user.userId, this.event.session.sessionId, false);
        }
        this._emit.apply(this, arguments);
      }

      try {
        // temporary hack for demo purposes
        if (intent === 'GetNewFactIntent') {
          sendIntent(intent, this.event.session.user.userId, this.event.session.sessionId, false);
        }

        handlers[intent].apply(this, arguments)
      } catch(e) {
        console.log("Error handling intent: ", e);
      }
    }
  });

  return wrappedHandlers;
}
