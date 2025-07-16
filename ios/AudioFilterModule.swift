// ios/<YourApp>/AudioFilterModule.swift

import Foundation
import AVFoundation

@objc(AudioFilterModule)
class AudioFilterModule: NSObject {
  private let engine = AVAudioEngine()
  private let eq: AVAudioUnitEQ
  private var players: [String: AVAudioPlayerNode] = [:]

  override init() {
    // 1) Configure a single‑band low‑pass EQ
    eq = AVAudioUnitEQ(numberOfBands: 1)
    let band = eq.bands[0]
    band.filterType = .lowPass
    band.frequency    = 20_000  // start fully open
    band.bandwidth    = 0.5
    band.bypass       = false

    super.init()

    // 2) Wire up: engine → player → EQ → main mixer
    engine.attach(eq)
    engine.connect(eq, to: engine.mainMixerNode, format: nil)

    do {
      try engine.start()
    } catch {
      NSLog("🔊 Audio engine failed to start: %@", error.localizedDescription)
    }
  }

  // MARK: – React Native bridge methods

  /// Schedule and loop a URL buffer
  @objc func playUrl(_ urlString: String) {
    guard let url = URL(string: urlString) else { return }
    do {
      let file = try AVAudioFile(forReading: url)
      let buffer = AVAudioPCMBuffer(
        pcmFormat: file.processingFormat,
        frameCapacity: AVAudioFrameCount(file.length)
      )!
      try file.read(into: buffer)

      // create & attach a new player node if needed
      let playerNode = AVAudioPlayerNode()
      players[urlString] = playerNode
      engine.attach(playerNode)
      engine.connect(playerNode, to: eq, format: buffer.format)

      playerNode.scheduleBuffer(buffer, at: nil, options: .loops, completionHandler: nil)
      playerNode.play()
    } catch {
      NSLog("🔊 AudioFilterModule.playUrl error: %@", error.localizedDescription)
    }
  }

  /// Stop & detach all player nodes
  @objc func stop() {
    for (_, node) in players {
      node.stop()
      engine.detach(node)
    }
    players.removeAll()
  }

  /// Adjust volume on a specific URL’s player node
  @objc func setVolumeForUrl(_ urlString: String, volume: NSNumber) {
    DispatchQueue.main.async {
      self.players[urlString]?.volume = volume.floatValue
    }
  }

  /// Change the EQ cutoff frequency (in Hz)
  @objc func setCutoff(_ freq: NSNumber) {
    DispatchQueue.main.async {
      self.eq.bands[0].frequency = freq.floatValue
    }
  }

  /// Required by React Native for main‑thread setup
  @objc static func requiresMainQueueSetup() -> Bool {
    return true
  }
}
