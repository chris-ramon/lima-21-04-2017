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
    wrappedHandlers[intent] = function() {
      this._emit = this.emit;
      this.emit = function() {
        sendIntent(intent, this.event.session.user.userId, this.event.session.sessionId, false);
        this._emit.apply(this, arguments);
      }

      try {
        handlers[intent].apply(this, arguments)
        sendIntent(intent, this.event.session.user.userId, this.event.session.sessionId, false);
      } catch(e) {
        console.log("Error handling intent: ", e);
      }
    }
  });

  return wrappedHandlers;
}
