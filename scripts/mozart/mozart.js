/**
 * @fileoverview Mozart.js is a simple interface to html5 audio with legacy
 * fallback to flash. Currently only supports MP3s.
 *
 * @author m@murz.net (Mike Murray)
 */


/**
 * Constructs a new instance of Mozart.
 * @param {Object} A map of options. See below for defaults.
 * @constructor
 */
var Mozart = function(opt_options) {
  this.initializeOptions_(opt_options);
  this.detectAudioApi_();
};


/**
 * Options object.
 * @type {Object}
 * @private
 */
Mozart.prototype.options = {
  "flashPath": "/public/flash/tmb_flashAudioApi.swf",
  "flashElementId": "tmb-mozart-flashplayer",
  "flashElementHostId": "tmb-audio-player",
  "swfobjectPath": "//ajax.googleapis.com/ajax/libs/swfobject/2.2/swfobject.js",
  // "swfobjectPath": "/public/scripts/swfobject.js",
  "swfobjectElementId": "tmb-mozart-swfobject"
};


/**
 * Whether we are in legacy (flash) mode or not.
 * @type {Boolean}
 * @private
 */
Mozart.prototype.flashMode_ = false;


/**
 * Whether the swfobject and swf have been fully loaded yet.
 * @type {boolean}
 * @private
 */
Mozart.prototype.flashReady_ = false;


/**
 * Cache of preloaded sounds.
 * @type {Object}
 * @private
 */
Mozart.prototype.soundCache_ = {};


/**
 * Load a sound from it's url.
 * @param {String} url The url to load from.
 * @param {Object=} callbacks Optional object containing callbacks.
 * @return {MozartSound} The resulting sound object.
 */
Mozart.prototype.load = function(url, callbacks) {
	if (this.flashMode_) {
    return new MozartFlashSound(url, callbacks, this.options["flashElementId"]);
	} else {
    return new MozartHtmlSound(url, callbacks);
	}
};


/**
 * Overwrite custom options with the ones that are passed in.
 * @param {Object=} opt_options The options object.
 */
Mozart.prototype.initializeOptions_ = function(opt_options) {
  if (!opt_options) return;

  for (var name in opt_options) {
    if (opt_options[name]) {
      this.options[name] = opt_options[name];
    }
  }
};


/**
 * Detects which audio api to use (flash or html5) and kicks off the loading
 * of the swf file if using flash.
 * @private
 */
Mozart.prototype.detectAudioApi_ = function() {
  if (!window.document) {
    throw new Error("Mozart must be initialized within the context of an HTML document.");
  }

  var audioEl = window.document.createElement('audio');
  // TODO(mike): this check needs to change if we ever support non-mp3.
  this.flashMode_ =
      !audioEl.canPlayType ||
      (audioEl.canPlayType('audio/mpeg').match(/maybe|probably/i) ? false : true);
  
  if (this.flashMode_) {
    this.loadSwfScript_(this.handleSwfScriptReady_, this);
  }
};


/**
 * Callback when the swfobject scripts are loaded.
 * @private
 */
Mozart.prototype.handleSwfScriptReady_ = function() {
	window['swfobject'].embedSWF(this.options["flashPath"], this.options["flashElementHostId"], "0", "0", "9.0.0", "flash/expressInstall.swf", false, false, {id:this.options["flashElementId"]});
  tmb.log('swf embedded');
  Mozart.SWF_READY = true;
  for (var i = 0; i < Mozart.swfReadyCallbacks.length; i++) {
    Mozart.swfReadyCallbacks[i].call();
  }
};


/**
 * Helper function to load in the swfobject JS.
 * @param {Function=} opt_fn Callback function.
 * @param {Object=} opt_scope Scope to use when calling back.
 * @private
 */
Mozart.prototype.loadSwfScript_ = function(fn, scope) {
    scope = scope || {};
    fn = fn || function() {};

    var s = document.createElement('script');
    s.setAttribute("type", "text/javascript");
    s.setAttribute("src", this.options["swfobjectPath"]);
    s.setAttribute('id', this.options["swfobjectElementId"]);

    var done = false;
    s.onerror = s.onload = s.onreadystatechange = function(){
        if (!done && (!this.readyState || /loaded|complete/.test(this.readyState))) {
                done = true;
                // Handle memory leak in IE
                s.onerror = s.onload = s.onreadystatechange = null;
                fn.call(scope);
        }
    };
    document.getElementsByTagName('head')[0].appendChild(s);
};


/**
 * Simple inheritance helper.
 * @param {Function} child Child class.
 * @param {Function} parent Parent class.
 */
Mozart.inherit = function(child, parent) {
  var temp = function() {};
  temp.prototype = parent.prototype;
  child.super_ = parent.prototype;
  child.prototype = new temp();
  child.prototype.constructor = child;
};


/**
 * Helper to bind a function to a given scope.
 * @param {Function} fn Function to bind.
 * @param {Object} scope Scope to bind.
 */
Mozart.bind = function(fn, scope) {
  return function() {
    fn.call(scope);
  };
};


/**
 * Helper to log a string to the console if it's availible.
 * @param {String} msg The string to log.
 */
Mozart.log = function(msg) {
  if (console && typeof console.log == 'function') {
    console.log(msg);
  }
};

/**
 * Helper to attach an event.
 * @param {String} type Event type.
 * @param {Function} callack Callback function.
 */
 Mozart.addEventListener = function(type, callback) {
   if (!Mozart.EVENTS.hasOwnProperty(type)) {
     Mozart.EVENTS[type] = [];
   }
   Mozart.EVENTS[type].push(callback);
 };


 /**
  * Helper to fire an event.
  * @param {String} type Event type.
  */
Mozart.dispatchEvent = function(type) {
  Mozart.log("dispatch: "+type);
  if (!Mozart.EVENTS.hasOwnProperty(type)) {
    return;
  }
  for (var i = 0; i < Mozart.EVENTS[type].length; i++) {
    Mozart.EVENTS[type][i].call();
  }
};


/**
 * An associative array of events.
 * @type {Object}
 */
Mozart.EVENTS = {};


/**
 * A static list of functions to be called when flash is ready.
 * @type {Array.<Function>}
 */
Mozart.swfReadyCallbacks = [];


/**
 * A flag which indicates whether we are ready to play flash audio or not.
 * @type {Boolean}
 */
Mozart.SWF_READY = false;


/**
 * Used to generate globally uid for Mozart sounds.
 */
Mozart.currentUid = 0;


/**
 * Constructs a single sound.
 * @param {String} url Url of the sound file.
 * @param {Object} opt_options Options object.
 * @constructor
 */
var MozartSound = function(url, opt_options) {
  /**
   * The Url of the sound file.
   * @type {String}
   * @protected
   */
  this.url = url;

  /**
   * The unique id of this sound.
   */
  this.uid = Mozart.currentUid++;

  this.initialize(opt_options);
};


/**
 * Options object.
 * @type {Object}
 * @protected
 */
MozartSound.prototype.options = {
  'onLoad': function() {},
  'onError': function() {},
  'onPlay': function() {},
  'onFinish': function() {},
  'onPause': function() {},
  'onStop': function() {},
  'scope': {}
};


/**
 * Whether the sound is ready to play or not.
 * @type {Boolean}
 * @protected
 */
MozartSound.prototype.ready = false;


/**
 * Flag to track when a deferred play has been attached.
 * @type {Boolean}
 * @protected
 */
MozartSound.prototype.deferredAttached = false;


/**
 * Sets one of the options post initialize.
 * @param {String} key The name of the option to set.
 * @param {Object} value The value to set.
 */
MozartSound.prototype.set = function(key, value) {
  this.options[key] = value;
};


/**
 * Attaches event listeners and begins loading the sound.
 * @param {Object} opt_options Options object.
 * @protected
 */
MozartSound.prototype.initialize = function(opt_options) {
  for (var name in opt_options) {
    this.options[name] = options[name];
  }
};


/**
 * Callback invoked when the sound is loaded.
 * @protected
 */
MozartSound.prototype.handleLoaded = function() {
  this.ready = true;
  this.options['onLoad'].call(this.options['scope']);
};


/**
 * Callback invoked on error.
 * @protected
 */
MozartSound.prototype.handleError = function() {
  this.options['onError'].call(this.options['scope']);
};


/**
 * Callback invoked on sound end.
 * @protected
 */
MozartSound.prototype.handleFinished = function() {
  this.options['onFinished'].call(this.options['scope']);
};


/**
 * Start playing the sound, if the sound has not finished loading
 * this method will attach a callback to start playing once it is.
 */
MozartSound.prototype.play = function() {
  if (this.ready) {
    this.playInternal();
    this.options['onPlay'].call(this.options['scope']);
  } else {
    this.deferredPlay();
  }
};


/**
 * A direct API call to start playing.
 * @protected
 */
MozartSound.prototype.playInternal = function() {};


/**
 * Attach a callback to start playing once loaded.
 * @protected
 */
MozartSound.prototype.deferredPlay = function() {};


/**
 * Pause the sound.
 */
MozartSound.prototype.pause = function() {};


/**
 * Stop the sound.
 */
MozartSound.prototype.stop = function() {};


/**
 * Gets the current playback time in seconds.
 */
MozartSound.prototype.getTime = function() {};


/**
 * Constructs an HTML5 audio sound.
 * @param {String} url Url of the sound file.
 * @constructor
 * @extends {MozartSound}
 */
var MozartHtmlSound = function(url, opt_options) {
  /**
   * The HTML5 audio element.
   * @type {Element}
   * @private
   */
  this.audioEl_ = new Audio(url);

  MozartSound.call(this, url, opt_options);
};
Mozart.inherit(MozartHtmlSound, MozartSound);


/** @override */
MozartHtmlSound.prototype.initialize = function(opt_options) {
  MozartSound.prototype.initialize.call(this, opt_options);
  this.audioEl_.addEventListener("loadeddata", Mozart.bind(this.handleLoaded, this), true);
  this.audioEl_.addEventListener("error", Mozart.bind(this.handleError, this), true);
  this.audioEl_.addEventListener("ended", Mozart.bind(this.handleFinished, this), true);
  this.audioEl_.load();
};


/** @override */
MozartHtmlSound.prototype.pause = function() {
  this.audioEl_.pause();
};


/** @override */
MozartHtmlSound.prototype.stop = function() {
  this.audioEl_.pause();
  this.audioEl_.currentTime = 0;
};


/** @override */
MozartHtmlSound.prototype.playInternal = function() {
  this.audioEl_.play();
};


/** @override */
MozartHtmlSound.prototype.deferredPlay = function() {
  if (this.deferredAttached) {
    return;
  }

  this.defferedAttached = true;
  var _this = this;
  this.audioEl_.addEventListener("loadeddata", function() {
    this.options['onPlay'].call(this.options['scope']);
    _this.playInternal();
  }, true);
};


/** @override */
MozartHtmlSound.prototype.getTime = function() {
  return this.audioEl_.currentTime;
};


/**
 * Constructs a flash audio sound.
 * @param {String} url Url of the sound file.
 * @param {Object=} opt_options Optional callback object.
 * @param {String} elId Id of the flash object element.
 * @constructor
 * @extends {MozartSound}
 */
var MozartFlashSound = function(url, opt_options, elId) {
  /**
   * Reference to <object> element which contains our flash player
   * @type {Element}
   * @private
   */
  this.audioEl_ = document.getElementById(elId);

  /**
   * The id of the audio element.
   * @type {String}
   * @private
   */
  this.audioElId_ = elId;
  
  /**
   * The url to the mp3.
   * @type {String}
   * @private
   */
  this.url_ = url;

  MozartSound.call(this, url, opt_options);
};
Mozart.inherit(MozartFlashSound, MozartSound);


/** @override */
MozartFlashSound.prototype.initialize = function(opt_options) {
	// TODO(mike): add listeners
  Mozart.addEventListener("mzSoundEnd:"+this.uid,
      Mozart.bind(this.handleFinished, this));
	MozartSound.prototype.initialize.call(this, opt_options);
};


/** @override */
MozartFlashSound.prototype.pause = function() {
  this.audioEl_.pauseTrack();
};


/** @override */
MozartFlashSound.prototype.stop = function() {
  this.audioEl_.stopTrack();
};


/** @override */
MozartFlashSound.prototype.playInternal = function() {
	if (!this.audioEl_) {
    if (Mozart.SWF_READY) {
      this.audioEl_ = document.getElementById(this.audioElId_);
    } else {
      var _this = this;
      Mozart.swfReadyCallbacks.push(function() {
        _this.audioEl_ = document.getElementById(_this.audioElId_);
        _this.playInternal();
      });
      return;
    }
  }
  this.audioEl_.playTrack(this.url_, this.uid);
};


/** @override */
MozartFlashSound.prototype.deferredPlay = function() {
  if (this.deferredAttached) {
    return;
  }

  this.defferedAttached = true;
  var _this = this;
  window.addEventListener("loadeddata", function() {
    this.options['onPlay'].call(this.options['scope']);
  }, true);
  _this.playInternal();
};


/** @override */
MozartFlashSound.prototype.getTime = function() {
  if (!this.audioEl_) return 0;
  return this.audioEl_.getTime();
};
