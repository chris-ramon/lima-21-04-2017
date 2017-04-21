var utuClient = require('utu').uTu;
var utu = new utuClient('c6c953a9e4a04e56bb8273075267deb3');

var constants = require('utu').constants;

var sendIntent = function(intent, platformId, sessionId, botMsg) {
  utu.intent({
    platform: constants.ALEXA,
    platformId: platformId,
    sessionId: "abc",
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
