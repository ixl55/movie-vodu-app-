import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, StatusBar, BackHandler, Linking } from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';

const URL = 'https://movie.vodu.me/index.php';

export default function App() {
  const webRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(URL);

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
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      {progress > 0 && progress < 1 && (
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
      )}
      <WebView
        ref={webRef}
        source={{ uri: URL }}
        style={styles.webview}
        onLoadProgress={({ nativeEvent }) => setProgress(nativeEvent.progress)}
        onNavigationStateChange={onNavigationStateChange}
        startInLoadingState
        javaScriptEnabled
        domStorageEnabled
        allowFileAccess
        allowUniversalAccessFromFileURLs
        mixedContentMode="compatibility"
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        renderLoading={() => (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#e94560" />
          </View>
        )}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView error: ', nativeEvent);
        }}
        onShouldStartLoadWithRequest={(request) => {
          if (['intent://', 'tel:', 'mailto:'].some((p) => request.url.startsWith(p))) {
            Linking.openURL(request.url).catch(() => {});
            return false;
          }
          return true;
        }}
        allowsBackForwardNavigationGestures
      />
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navBtn} onPress={() => webRef.current?.goBack()} disabled={!canGoBack}>
          <Text style={[styles.navIcon, !canGoBack && styles.navBtnDisabled]}>◀</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navBtn} onPress={() => webRef.current?.goForward()} disabled={!canGoForward}>
          <Text style={[styles.navIcon, !canGoForward && styles.navBtnDisabled]}>▶</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navBtn} onPress={() => webRef.current?.reload()}>
          <Text style={styles.navIcon}>⟳</Text>
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
  webview: {
    flex: 1,
    backgroundColor: '#0f0f23',
  },
  progressBar: {
    height: 3,
    backgroundColor: '#333',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#e94560',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
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
