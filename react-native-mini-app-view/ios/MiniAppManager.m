#import "MiniAppManager.h"
#import <React/RCTConvert.h>
#import <React/RCTUtils.h>
#import <React/RCTBridge.h>
#import <React/RCTRootView.h>

@implementation MiniAppManager

RCT_EXPORT_MODULE(MiniAppViewManager);

RCT_EXPORT_METHOD(goBack:(NSString *)appName)
{
  [[NSNotificationCenter defaultCenter]
          postNotificationName:@"GoBackNotification"
   object:self userInfo:@{ @"appName": appName}];
}

RCT_EXPORT_METHOD(navigate:(NSString *)appName destination:(NSString *)destination params:(NSDictionary *)params)
{
    NSDictionary *sendParams = @{
        @"appName": appName,
        @"destination": destination,
        @"params": params
    };
    
  [[NSNotificationCenter defaultCenter]
          postNotificationName:@"NavigateToMiniAppNotification"
   object:self userInfo:sendParams];
}

RCT_EXPORT_METHOD(loadApp:(NSString *)appName
                  params:(NSDictionary *)params
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    [[NSNotificationCenter defaultCenter]
            postNotificationName:@"LoadAppNotification"
     object:self userInfo:@{ @"appName": appName, @"params": params }];
    resolve(nil);
}

RCT_EXPORT_METHOD(restartApp:(NSString *)appName
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    [[NSNotificationCenter defaultCenter]
            postNotificationName:@"RestartAppNotification"
     object:self userInfo:@{ @"appName": appName}];
    resolve(nil);
}

@end

