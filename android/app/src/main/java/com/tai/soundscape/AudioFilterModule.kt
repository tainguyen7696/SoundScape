// android/app/src/main/java/com/tai/soundscape/AudioFilterModule.kt
package com.tai.soundscape

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import android.media.audiofx.Equalizer

class AudioFilterModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  private val eq: Equalizer = Equalizer(0, 0).apply {
    enabled = true
    // initialize all bands at unity (0 dB)
    for (i in 0 until numberOfBands) setBandLevel(i.toShort(), 0)
  }

  override fun getName(): String = "AudioFilterModule"

  /**
   * freq: cutoff in Hz
   */
  @ReactMethod
  fun setLowPassFrequency(freq: Float) {
    // Mute bands above cutoff, leave below at 0dB
    for (i in 0 until eq.numberOfBands) {
      val centerFreq = eq.getCenterFreq(i.toShort()) / 1000
      val level = if (centerFreq <= freq) 0 else -1500  // -15 dB
      eq.setBandLevel(i.toShort(), level.toShort())
    }
  }
}
