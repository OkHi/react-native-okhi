#import "Okhi.h"
#import <React/RCTBridgeModule.h>

#if __has_include(<ReactNativeOkHi/ReactNativeOkHi-Swift.h>)
#import <ReactNativeOkHi/ReactNativeOkHi-Swift.h>
#else
#import "ReactNativeOkHi-Swift.h"
#endif

@implementation Okhi
- (NSNumber *)multiply:(double)a b:(double)b {
    return [OkHiWrapper multiply:a :b];
}

- (void)login:(NSDictionary *)credentials callback:(RCTResponseSenderBlock)callback {
    [OkHiWrapper login:credentials callback:^(NSArray<NSString *> *results) {
        if (callback) {
            callback(@[results ?: [NSNull null]]);
        }
    }];
}

- (void)startDigitalAddressVerification:(NSDictionary *)okcollect callback:(RCTResponseSenderBlock)callback {
    [OkHiWrapper startDigitalAddressVerification:okcollect callback:^(NSDictionary *result, NSDictionary *error) {
        if (callback) {
            callback(@[result ?: [NSNull null], error ?: [NSNull null]]);
        }
    }];
}

- (void)startPhysicalAddressVerification:(NSDictionary *)okcollect callback:(RCTResponseSenderBlock)callback {
    [OkHiWrapper startPhysicalAddressVerification:okcollect callback:^(NSDictionary *result, NSDictionary *error) {
        if (callback) {
            callback(@[result ?: [NSNull null], error ?: [NSNull null]]);
        }
    }];
}

- (void)startDigitalAndPhysicalAddressVerification:(NSDictionary *)okcollect callback:(RCTResponseSenderBlock)callback {
    [OkHiWrapper startDigitalAndPhysicalAddressVerification:okcollect callback:^(NSDictionary *result, NSDictionary *error) {
        if (callback) {
            callback(@[result ?: [NSNull null], error ?: [NSNull null]]);
        }
    }];
}

- (void)createAddress:(NSDictionary *)okcollect callback:(RCTResponseSenderBlock)callback {
    [OkHiWrapper createAddress:okcollect callback:^(NSDictionary *result, NSDictionary *error) {
        if (callback) {
            callback(@[result ?: [NSNull null], error ?: [NSNull null]]);
        }
    }];
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeOkhiSpecJSI>(params);
}

+ (NSString *)moduleName
{
  return @"Okhi";
}

@end
