//
//  RCTMiniAppViewManager.m
//  react-native-mini-app-view
//
//  Created by iMac on 2/18/21.
//

#import "RCTMiniAppViewManager.h"

@implementation RCTMiniAppViewManager

RCT_EXPORT_MODULE(RCTMiniAppView)

+ (BOOL)requiresMainQueueSetup
{
    return YES;
}

- (instancetype)init
{
    self = [super init];
    if (self) {
        // Init default props
    }
    return self;
}

#pragma mark - Export props

RCT_EXPORT_VIEW_PROPERTY(onViewLoaded, RCTBubblingEventBlock)

RCT_EXPORT_VIEW_PROPERTY(onBackPressed, RCTBubblingEventBlock)

RCT_EXPORT_VIEW_PROPERTY(onNavigate, RCTBubblingEventBlock)

RCT_EXPORT_VIEW_PROPERTY(onChange, RCTBubblingEventBlock)

RCT_CUSTOM_VIEW_PROPERTY(bundleAssetName, NSString, MiniAppView)
{
    if (json) {
        view.bundleAssetName = [RCTConvert NSString:json];
    }
}

RCT_CUSTOM_VIEW_PROPERTY(mainComponentName, NSString, MiniAppView)
{
    if (json) {
        view.mainComponentName = [RCTConvert NSString:json];
    }
}

- (UIView *)view
{
    MiniAppView *miniAppView = [[MiniAppView alloc] init];
    miniAppView.delegate = self;
    return miniAppView;
}

#pragma mark - Events

- (void)viewLoaded:(MiniAppView *)sender
{
    NSDictionary *data = @{
        @"onViewLoaded": (sender.mainComponentName ?: @"")
    };
    
    if (sender.onViewLoaded) {
        sender.onViewLoaded(data);
    }
}

- (void)goBack:(MiniAppView *)sender
{
    NSDictionary *data = @{
        @"onBackPressed": (sender.mainComponentName ?: @"")
    };
    
    if (sender.onBackPressed) {
        sender.onBackPressed(data);
    }
}

- (void)onNavigate:(MiniAppView *)sender appName:(NSString *)appName params:(NSDictionary *)params
{
    if (sender.onChange) {
        sender.onChange(@{
            @"eventName": @"onNavigate",
            @"name": appName,
            @"params": params
        });
    }
}

@end
