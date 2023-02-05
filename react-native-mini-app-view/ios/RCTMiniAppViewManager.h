//
//  RCTMiniAppViewManager.h
//  react-native-mini-app-view
//
//  Created by iMac on 2/18/21.
//

#import <Foundation/Foundation.h>
#import <React/RCTViewManager.h>
#import "MiniAppView.h"
#import <React/RCTUtils.h>

NS_ASSUME_NONNULL_BEGIN

@interface RCTMiniAppViewManager : RCTViewManager <MiniAppViewDelegate>

@end

NS_ASSUME_NONNULL_END
