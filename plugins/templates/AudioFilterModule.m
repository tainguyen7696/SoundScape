#import "AudioFilterModule.h"
#import <React/RCTLog.h>
#import <AVFoundation/AVFoundation.h>

@implementation AudioFilterModule {
  AVAudioEngine *_audioEngine;
  AVAudioPlayerNode *_playerNode;
  AVAudioUnitEQ *_eqUnit;
}

// Expose this module to JS under the name “AudioFilterModule”
RCT_EXPORT_MODULE();

// JS method: filterAndPlay(localFilePath: string, cutoffFreq: number)
RCT_EXPORT_METHOD(filterAndPlay:(NSString *)filePath cutoffFreq:(nonnull NSNumber *)cutoffFreq)
{
  // Lazy-init audio engine
  if (!_audioEngine) {
    _audioEngine = [[AVAudioEngine alloc] init];
    _playerNode = [[AVAudioPlayerNode alloc] init];
    _eqUnit = [[AVAudioUnitEQ alloc] initWithNumberOfBands:1];

    AVAudioUnitEQFilterParameters *band = _eqUnit.bands.firstObject;
    band.filterType = AVAudioUnitEQFilterTypeLowPass;
    band.frequency = cutoffFreq.floatValue;
    band.bypass = NO;

    [_audioEngine attachNode:_playerNode];
    [_audioEngine attachNode:_eqUnit];
    [_audioEngine connect:_playerNode to:_eqUnit format:nil];
    [_audioEngine connect:_eqUnit to:_audioEngine.mainMixerNode format:nil];

    NSError *err = nil;
    [_audioEngine startAndReturnError:&err];
    if (err) {
      RCTLogError(@"AudioEngine failed to start: %@", err.localizedDescription);
      return;
    }
  }

  // Play the file through the low-pass filter
  NSURL *url = [NSURL fileURLWithPath:filePath];
  AVAudioFile *audioFile = [[AVAudioFile alloc] initForReading:url error:nil];
  [_playerNode scheduleFile:audioFile atTime:nil completionHandler:nil];
  [_playerNode play];
}

@end
