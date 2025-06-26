import Foundation
import AVFoundation

@objc(AudioFilterModule)
class AudioFilterModule: NSObject {
  private var engine: AVAudioEngine?
  private var playerNode: AVAudioPlayerNode?
  private var eq: AVAudioUnitEQ?

  @objc
  func filterAndPlay(_ filePath: NSString, cutoff: NSNumber) {
    let url = URL(fileURLWithPath: filePath as String)
    engine     = AVAudioEngine()
    playerNode = AVAudioPlayerNode()
    eq         = AVAudioUnitEQ(numberOfBands: 1)

    guard let engine = engine,
          let player = playerNode,
          let eq     = eq else { return }

    let band = eq.bands[0]
    band.filterType = .lowPass
    band.frequency  = cutoff.floatValue
    band.bypass     = false

    engine.attach(player)
    engine.attach(eq)
    engine.connect(player, to: eq, format: nil)
    engine.connect(eq, to: engine.mainMixerNode, format: nil)

    do {
      let audioFile = try AVAudioFile(forReading: url)
      player.scheduleFile(audioFile, at: nil)
      try engine.start()
      player.play()
    } catch {
      print("AudioFilterModule error:", error)
    }
  }

  @objc
  static func requiresMainQueueSetup() -> Bool {
    true
  }
}
