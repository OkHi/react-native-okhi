#import <React/RCTBridgeDelegate.h>
#import <UIKit/UIKit.h>
@import OkHi;

@interface AppDelegate : UIResponder <UIApplicationDelegate, RCTBridgeDelegate>

@property (nonatomic, strong) UIWindow *window;
@property (strong, nonatomic) OkVerify *okverify;

@end
