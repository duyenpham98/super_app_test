NSString *const GoBackNotification = @"GoBackNotification";
NSString *const NavigateToMiniAppNotification = @"NavigateToMiniAppNotification";
NSString *const LoadAppNotification = @"LoadAppNotification";
NSString *const RestartAppNotification = @"RestartAppNotification";

#import "MiniAppView.h"

@implementation MiniAppView
{
    RCTBridge *bridge;
    RCTRootView *newView;
}

- (void)setBundleAssetName:(NSString *)bundleAssetName
{
    _bundleAssetName = bundleAssetName;
}

- (void)setMainComponentName:(NSString *)mainComponentName
{
    _mainComponentName = mainComponentName;
}

- (void)startReactApplicationWithParams:(NSDictionary *)params
{
    __weak typeof(self) weakSelf = self;
    
    dispatch_async(dispatch_get_main_queue(), ^{
        
        if (self->_bundleAssetName.length > 0 && self->_mainComponentName.length > 0)
        {
            NSURL *appBundleURL = [NSURL fileURLWithPath:[NSString stringWithFormat:@"%@.jsbundle", weakSelf.bundleAssetName]];
            
            if (appBundleURL != nil)
            {
                self->bridge = [[RCTBridge alloc] initWithBundleURL:appBundleURL moduleProvider:nil launchOptions:nil];

                self->newView = [[RCTRootView alloc] initWithBridge:self->bridge
                                                               moduleName:weakSelf.mainComponentName
                                                        initialProperties:params];
                
                UIView *middleView =[ [UIView alloc ] initWithFrame:CGRectMake(0, 0, [[UIScreen mainScreen] bounds].size.width, [[UIScreen mainScreen] bounds].size.height) ];
                middleView.backgroundColor = [UIColor redColor];
                self->newView.frame = CGRectMake(0, 0, [[UIScreen mainScreen] bounds].size.width, [[UIScreen mainScreen] bounds].size.height);
                UIViewController *rootViewController = [UIViewController new];
                rootViewController.view = self->newView;
                UIView *parent = self.superview;
                [parent.window.rootViewController.view addSubview:self->newView];
            }
        }
        
    });
}

- (void)restartApp
{
    dispatch_async(dispatch_get_main_queue(), ^{
        [self->bridge reload];
    });
}

- (void)setOnChange:(RCTBubblingEventBlock)onChange
{
    _onChange = onChange;
    
    [self readyToLoadApp];
}

- (void)readyToLoadApp
{
    if (self.onChange)
    {
        self.onChange(@{
            @"eventName": @"onReadyToLoadApp"
        });
    }
}

- (void) dealloc
{
    [[NSNotificationCenter defaultCenter] removeObserver:self];
}

- (id) init
{
    self = [super init];
    if (!self) return nil;

    [[NSNotificationCenter defaultCenter] addObserver:self
        selector:@selector(receiveNotification:)
        name:GoBackNotification
        object:nil];
    
    [[NSNotificationCenter defaultCenter] addObserver:self
        selector:@selector(receiveNotification:)
        name:NavigateToMiniAppNotification
        object:nil];
    
    [[NSNotificationCenter defaultCenter] addObserver:self
        selector:@selector(receiveNotification:)
        name:RCTJavaScriptDidLoadNotification
        object:nil];
    
    [[NSNotificationCenter defaultCenter] addObserver:self
        selector:@selector(receiveNotification:)
        name:LoadAppNotification
        object:nil];
    
    [[NSNotificationCenter defaultCenter] addObserver:self
        selector:@selector(receiveNotification:)
        name:RestartAppNotification
        object:nil];
    
    return self;
}

- (void)receiveNotification:(NSNotification *) notification
{
    if (![[[notification userInfo] objectForKey:@"appName"] isEqualToString:_mainComponentName]) return;
    
    if ([[notification name] isEqualToString:RCTJavaScriptDidLoadNotification])
    {
        // JS Bundle is loaded
        
        if ([self.delegate respondsToSelector:@selector(viewLoaded:)])
        {
            [self.delegate viewLoaded:self];
        }
    }
    
    if ([[notification name] isEqualToString:GoBackNotification])
    {
        // Go back action
        
        if ([self.delegate respondsToSelector:@selector(goBack:)])
        {
            dispatch_async(dispatch_get_main_queue(), ^{
                [self->newView removeFromSuperview];
            });
            [self.delegate goBack:self];
        }
    }
    
    if ([[notification name] isEqualToString:NavigateToMiniAppNotification])
    {
        // Navigate from mini-app to another (mini-app)
        
        if ([self.delegate respondsToSelector:@selector(onNavigate:appName:params:)])
        {
            [self.delegate onNavigate:self appName:[[notification userInfo] objectForKey:@"destination"] params:[[notification userInfo] objectForKey:@"params"]];
        }
    }
    
    
    if ([[notification name] isEqualToString:LoadAppNotification])
    {
        // Load app
        [self startReactApplicationWithParams:[[notification userInfo] objectForKey:@"params"]];
    }
    
    if ([[notification name] isEqualToString:RestartAppNotification])
    {
        // Restart app
        [self restartApp];
    }
}

@end
