#import <React/RCTComponent.h>

#import <UIKit/UIKit.h>

#import <React/RCTBridge.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>

@class MiniAppView;

@protocol MiniAppViewDelegate <NSObject>
@optional

- (void)goBack:(MiniAppView *)sender;
- (void)viewLoaded:(MiniAppView *)sender;
- (void)onNavigate:(MiniAppView *)sender appName:(NSString *)appName params:(NSDictionary *)params;

@end

@interface MiniAppView : UIView

@property (nonatomic, strong) NSString *bundleAssetName;
@property (nonatomic, strong) NSString *mainComponentName;

@property (nonatomic, copy, nullable) RCTBubblingEventBlock onViewLoaded;
@property (nonatomic, copy, nullable) RCTBubblingEventBlock onBackPressed;
@property (nonatomic, copy, nullable) RCTBubblingEventBlock onNavigate;
@property (nonatomic, copy, nullable) RCTBubblingEventBlock onChange;

@property (nonatomic, weak, nullable) id <MiniAppViewDelegate> delegate;

@end
