// ios/<YourApp>/AudioFilterModuleBridge.m

#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(AudioFilterModule, NSObject)

// Play & loop a URL
RCT_EXTERN_METHOD(playUrl:(NSString *)urlString)

// Stop all playback
RCT_EXTERN_METHOD(stop)

// Set per-URL volume
RCT_EXTERN_METHOD(setVolumeForUrl:(NSString *)urlString volume:(nonnull NSNumber *)volume)

// Set low‑pass cutoff
RCT_EXTERN_METHOD(setCutoff:(nonnull NSNumber *)freq)

// Tell RN this module needs main‑thread init
+ (BOOL)requiresMainQueueSetup
{
  return YES;
}

@end
