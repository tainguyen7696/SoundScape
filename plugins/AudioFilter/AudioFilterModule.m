#import "AudioFilterModule.h"
#import <AVFoundation/AVFoundation.h>

@implementation AudioFilterModule {
  // Example: keep a player reference if you like
  AVAudioPlayer *_player;
}

RCT_EXPORT_MODULE();  // This makes it visible as NativeModules.AudioFilterModule

RCT_EXPORT_METHOD(playUrl:(NSString *)urlString)
{
  NSURL *url = [NSURL URLWithString:urlString];
  NSData *data = [NSData dataWithContentsOfURL:url];
  _player = [[AVAudioPlayer alloc] initWithData:data error:nil];
  _player.numberOfLoops = -1;
  [_player play];
}

RCT_EXPORT_METHOD(stop)
{
  [_player stop];
  _player = nil;
}

RCT_EXPORT_METHOD(setVolumeForUrl:(NSString *)urlString volume:(nonnull NSNumber *)volume)
{
  if (_player && [_player.url.absoluteString isEqualToString:urlString]) {
    _player.volume = volume.floatValue;
  }
}

RCT_EXPORT_METHOD(setCutoff:(nonnull NSNumber *)cutoff)
{
  // If you have audio units for filtering, adjust them here
  NSLog(@"[AudioFilterModule] setCutoff: %@", cutoff);
}

@end
