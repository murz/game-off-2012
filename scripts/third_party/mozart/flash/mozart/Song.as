package mozart {
  import flash.media.Sound;
  import flash.media.SoundChannel;
  import flash.net.URLRequest;
  import flash.events.Event;
  import flash.external.ExternalInterface;

  public class Song {
    private var pausePoint:Number = 0.00;
    private var sound:Sound = new Sound();
    private var channel:SoundChannel = new SoundChannel();
    private var ready:Boolean = false;
    private var callbackScope:Object = {};
    private var callback:Function;
    private var url:String;
    private var uid:String;

    public function Song(url:String, uid:String):void {
      this.url = url;
      this.uid = uid;
    }

    public function setCallbackScope(scope:Object):Song {
      this.callbackScope = scope;
      return this;
    }

    public function setCallback(fn:Function = null):Song {
      this.callback = fn;
      return this;
    }

    public function load():Song {
      sound.addEventListener(Event.COMPLETE, function(e){
        ready = true;
        ExternalInterface.call("Mozart.log", "callback??");
        if (callback != null) {
          callback.call(callbackScope, url);
        }
      }, false, 0, true);
      sound.load(new URLRequest(url));
      return this;
    }

    public function play():Song {
      channel = sound.play(pausePoint);
      ExternalInterface.call("Mozart.log", "attaching complet evt..");
      channel.addEventListener(Event.SOUND_COMPLETE, soundComplete, false, 0, true);
      return this;
    }

    public function pause():Song {
      pausePoint = channel.position;
      channel.stop();
      return this;
    }

    public function stop():Song {
      pausePoint = 0.0;
      channel.stop();
      return this;
    }

    public function getTime():Number {
      return channel.position;
    }

    public function soundComplete(e:Event):void {
      pausePoint = 0.00;
      ExternalInterface.call("Mozart.log", "dispatching..");
      ExternalInterface.call("Mozart.dispatchEvent", "mzSoundEnd:"+uid);
      // TODO(mike): dispatch a JS event.
    }

    public function isReady():Boolean {
      return ready;
    }
  }
}
