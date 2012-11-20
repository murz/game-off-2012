package {
  import mozart.Song;
  import flash.display.MovieClip;
  import flash.events.Event;
  import flash.external.ExternalInterface;

  public class AudioPlayer extends MovieClip {

    private var songMap:Object = {};
    private var currentTrack:String;

    public function AudioPlayer():void {
      if (ExternalInterface.available) {
        log("flash audio player initialized");
        ExternalInterface.addCallback("playTrack", playTrack);
        ExternalInterface.addCallback("pauseTrack", pauseTrack);
        ExternalInterface.addCallback("stopTrack", pauseTrack);
        ExternalInterface.addCallback("loadTrack", loadTrack);
        ExternalInterface.addCallback("getTime", getTime);
      }
    }

    public function loadTrack(track:String, uid:String, fn:Function = null):void {
      log("loadTrack");
      songMap[uid] = new Song(track, uid);
      songMap[uid].setCallbackScope(this)
          .setCallback(fn)
          .load();
    }

    public function playTrack(track:String, uid:String):void {
      log("playTrack");

      if (songMap.hasOwnProperty(uid)) {
        songMap[uid].play();
        currentTrack = uid;
        return;
      }

      loadTrack(track, uid, function(t) {
        this.playTrack(t, uid);
      });
    }

    public function pauseTrack():void {
      log("pauseTrack");
      if (currentTrack != null) {
        songMap[currentTrack].pause();
      }
    }

    public function stopTrack():void {
      log("stopTrack")
      if (currentTrack != null) {
        songMap[currentTrack].stop();
        currentTrack = null;
      }
    }

    public function getTime():Number {
      log("getTime");
      if (currentTrack != null) {
        return songMap[currentTrack].getTime();
      }
      return 0;
    }

    private function log(msg:String):void {
      ExternalInterface.call("Mozart.log", "> mozart - " + msg + " <");
    }
  }
}
