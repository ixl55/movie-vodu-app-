import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, StatusBar, BackHandler, Linking } from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';

const URL = 'https://movie.vodu.me/index.php';
const USER_AGENT = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.165 Mobile Safari/537.36';

const INJECTED_JS = `
  (function() {
    if (!window.__webviewPatched) {
      window.__webviewPatched = true;
      document.addEventListener('touchstart', function(){}, {passive: true});
      var style = document.createElement('style');
      style.textContent = 'body { -webkit-text-size-adjust: 100%; }';
      document.head.appendChild(style);
    }
  })();
  true;
`;

export default function App() {
  const webRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(URL);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const onBack = () => {
      if (webRef.current && canGoBack) {
        webRef.current.goBack();
        return true;
      }
      return false;
    };
    BackHandler.addEventListener('hardwareBackPress', onBack);
    return () => BackHandler.removeEventListener('hardwareBackPress', onBack);
  }, [canGoBack]);

  const onNavigationStateChange = (navState) => {
    setCanGoBack(navState.canGoBack);
    setCanGoForward(navState.canGoForward);
    setCurrentUrl(navState.url);
    if (navState.loading === false) {
      setError(null);
    }
  };

  const handleError = () => {
    setError('تعذر تحميل الموقع');
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    webRef.current?.reload();
    setTimeout(() => setLoading(false), 800);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.splashContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
        <Text style={styles.splashTitle}>Movie Vodu</Text>
        <ActivityIndicator size="large" color="#e94560" style={{ marginTop: 20 }} />
        <Text style={styles.splashSub}>جاري التحميل...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.splashContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
        <Text style={styles.splashTitle}>Movie Vodu</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={handleRetry}>
          <Text style={styles.retryText}>إعادة المحاولة</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      <WebView
        ref={webRef}
        source={{ uri: URL }}
        style={styles.webview}
        userAgent={USER_AGENT}
        onNavigationStateChange={onNavigationStateChange}
        onError={handleError}
        onHttpError={handleError}
        javaScriptEnabled
        domStorageEnabled
        allowFileAccess
        allowUniversalAccessFromFileURLs
        mixedContentMode="always"
        allowActivityStreaming
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        setSupportMultipleWindows={false}
        setBuiltInZoomControls={false}
        setDisplayZoomControls={false}
        textInteractionEnabled
        overScrollMode="never"
        showsVerticalScrollIndicator
        bounces={false}
        injectedJavaScript={INJECTED_JS}
        injectedJavaScriptBeforeContentLoaded={INJECTED_JS}
        allowsBackForwardNavigationGestures
        onShouldStartLoadWithRequest={(request) => {
          if (['intent://', 'tel:', 'mailto:', 'whatsapp://', 'tg://', 'viber://'].some((p) => request.url.startsWith(p))) {
            Linking.openURL(request.url).catch(() => {});
            return false;
          }
          return true;
        }}
      />
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navBtn} onPress={() => webRef.current?.goBack()} disabled={!canGoBack}>
          <Text style={[styles.navIcon, !canGoBack && styles.navBtnDisabled]}>◀</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navBtn} onPress={() => webRef.current?.goForward()} disabled={!canGoForward}>
          <Text style={[styles.navIcon, !canGoForward && styles.navBtnDisabled]}>▶</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navBtn} onPress={handleRetry}>
          <Text style={styles.navIcon}>⟳</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navBtn} onPress={() => Linking.openURL(currentUrl).catch(() => {})}>
          <Text style={styles.navIcon}>↗</Text>
        </TouchableOpacity>
        <View style={styles.urlContainer}>
          <Text style={styles.urlText} numberOfLines={1}>{currentUrl}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f23',
  },
  splashContainer: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashTitle: {
    color: '#e94560',
    fontSize: 32,
    fontWeight: 'bold',
  },
  splashSub: {
    color: '#aaa',
    fontSize: 16,
    marginTop: 10,
  },
  errorText: {
    color: '#e94560',
    fontSize: 16,
    marginTop: 20,
    marginHorizontal: 20,
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: 20,
    backgroundColor: '#e94560',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  webview: {
    flex: 1,
    backgroundColor: '#0f0f23',
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  navBtn: {
    padding: 10,
  },
  navIcon: {
    color: '#e94560',
    fontSize: 18,
  },
  navBtnDisabled: {
    color: '#555',
  },
  urlContainer: {
    flex: 1,
    backgroundColor: '#0f0f23',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginLeft: 6,
  },
  urlText: {
    color: '#888',
    fontSize: 11,
  },
});
