package com.tai.soundscape;  // <-- match your Android package from app.json

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import android.media.MediaPlayer;
import android.media.audiofx.Equalizer;

import java.io.IOException;

public class AudioFilterModule extends ReactContextBaseJavaModule {
  private final ReactApplicationContext reactContext;

  public AudioFilterModule(ReactApplicationContext reactContext) {
    super(reactContext);
    this.reactContext = reactContext;
  }

  @Override
  public String getName() {
    return "AudioFilterModule";
  }

  @ReactMethod
  public void filterAndPlay(String filePath, int cutoff) {
    MediaPlayer player = new MediaPlayer();
    try {
      player.setDataSource(filePath);
      player.setLooping(true);
      player.prepare();
    } catch (IOException e) {
      e.printStackTrace();
      return;
    }

    Equalizer eq = new Equalizer(0, player.getAudioSessionId());
    eq.setEnabled(true);
    short bands   = eq.getNumberOfBands();
    short[] range = eq.getBandLevelRange();
    for (short i = 0; i < bands; i++) {
      int freq = eq.getCenterFreq(i) / 1000;
      if (freq > cutoff) {
        eq.setBandLevel(i, range[0]);
      } else {
        eq.setBandLevel(i, range[1]);
      }
    }
    player.start();
  }
}
