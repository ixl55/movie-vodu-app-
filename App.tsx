import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { WebView } from 'react-native-webview';

const URL = 'https://movie.vodu.me';
const UA =
  Platform.OS === 'windows'
    ? 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
    : 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.165 Mobile Safari/537.36';

export default function App() {
  const ref = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [canBack, setCanBack] = useState(false);
  const [canFwd, setCanFwd] = useState(false);
  const [curUrl, setCurUrl] = useState(URL);
  const [progress, setProgress] = useState(0);

  const handleNav = useCallback((s: any) => {
    setCanBack(s.canGoBack);
    setCanFwd(s.canGoForward);
    setCurUrl(s.url);
    if (!s.loading) setLoading(false);
  }, []);

  const handleError = useCallback(() => {
    setError(true);
    setLoading(false);
  }, []);

  const retry = useCallback(() => {
    setError(false);
    setLoading(true);
    setProgress(0);
    ref.current?.reload();
  }, []);

  const openBrowser = useCallback(() => {
    Linking.openURL(URL).catch(() => {});
  }, []);

  if (error) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0f0f23" />
        <View style={styles.fallback}>
          <Text style={styles.fbIcon}>🎬</Text>
          <Text style={styles.fbTitle}>Movie Vodu</Text>
          <Text style={styles.fbMsg}>تعذر تحميل الموقع</Text>
          <TouchableOpacity style={styles.fbBtn} onPress={openBrowser}>
            <Text style={styles.fbBtnText}>فتح في المتصفح</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.fbRetry} onPress={retry}>
            <Text style={styles.fbRetryText}>إعادة المحاولة</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {Platform.OS !== 'windows' && (
        <StatusBar barStyle="light-content" backgroundColor="#0f0f23" />
      )}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#e94560" />
          <Text style={styles.loadingText}>جاري التحميل...</Text>
        </View>
      )}
      <WebView
        ref={ref}
        source={{ uri: URL }}
        style={styles.webview}
        userAgent={UA}
        javaScriptEnabled
        domStorageEnabled
        allowFileAccess
        mixedContentMode="always"
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        setSupportMultipleWindows={false}
        allowsBackForwardNavigationGestures
        onLoadProgress={({ nativeEvent: { progress: p } }) => setProgress(p)}
        onNavigationStateChange={handleNav}
        onError={handleError}
        onHttpError={handleError}
        onContentProcessDidTerminate={handleError}
        onShouldStartLoadWithRequest={(r) => {
          if (['intent:', 'tel:', 'mailto:', 'whatsapp:', 'tg:', 'viber:'].some(p => r.url.startsWith(p))) {
            Linking.openURL(r.url).catch(() => {});
            return false;
          }
          return true;
        }}
      />
      {progress > 0 && progress < 1 && !loading && (
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
      )}
      <View style={styles.nav}>
        <TouchableOpacity onPress={() => ref.current?.goBack()} disabled={!canBack} style={styles.navBtn}>
          <Text style={[styles.navIcon, !canBack && styles.navDisabled]}>◀</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => ref.current?.goForward()} disabled={!canFwd} style={styles.navBtn}>
          <Text style={[styles.navIcon, !canFwd && styles.navDisabled]}>▶</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => ref.current?.reload()} style={styles.navBtn}>
          <Text style={styles.navIcon}>⟳</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => Linking.openURL(curUrl).catch(() => {})} style={styles.navBtn}>
          <Text style={styles.navIcon}>↗</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f23' },
  webview: { flex: 1, backgroundColor: '#0f0f23' },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f0f23',
    zIndex: 10,
  },
  loadingText: { color: '#e94560', marginTop: 16, fontSize: 16 },
  progressBar: { height: 3, backgroundColor: '#333' },
  progressFill: { height: '100%', backgroundColor: '#e94560' },
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    backgroundColor: '#1a1a2e',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  navBtn: { padding: 12 },
  navIcon: { color: '#e94560', fontSize: 18 },
  navDisabled: { color: '#555' },
  fallback: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  fbIcon: { fontSize: 64, marginBottom: 16 },
  fbTitle: { color: '#e94560', fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  fbMsg: { color: '#888', fontSize: 16, marginBottom: 24, textAlign: 'center' },
  fbBtn: { backgroundColor: '#e94560', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 8, marginBottom: 12 },
  fbBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  fbRetry: { padding: 12 },
  fbRetryText: { color: '#e94560', fontSize: 14 },
});
