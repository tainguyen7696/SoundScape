#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(AudioFilterModule, NSObject)
RCT_EXTERN_METHOD(filterAndPlay:(NSString *)filePath cutoff:(nonnull NSNumber *)cutoff)
@end
