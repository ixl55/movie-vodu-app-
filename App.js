import React, { useRef, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, BackHandler, Linking, Platform, Alert } from 'react-native';
import { WebView } from 'react-native-webview';

const URL = 'https://movie.vodu.me';
const UA = 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.165 Mobile Safari/537.36';

const FALLBACK_HTML = `
<html><head><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
body{margin:0;background:#0f0f23;display:flex;align-items:center;justify-content:center;height:100vh;color:#fff;font-family:sans-serif;text-align:center}
a{color:#e94560;font-size:18px;text-decoration:none;padding:12px 24px;border:2px solid #e94560;border-radius:8px;display:inline-block;margin-top:16px}
p{color:#888;margin-top:8px}
</style></head><body>
<div>
<div style="font-size:48px;margin-bottom:16px">🎬</div>
<div style="font-size:20px;color:#e94560;font-weight:bold">Movie Vodu</div>
<p>اضغط الزر للذهاب للموقع</p>
<a href="https://movie.vodu.me" target="_top">فتح الموقع</a>
</div></body></html>
`;

export default function App() {
  const ref = useRef(null);
  const [state, setState] = useState('loading');
  const [progress, setProgress] = useState(0);
  const [canBack, setCanBack] = useState(false);
  const [canFwd, setCanFwd] = useState(false);
  const [curUrl, setCurUrl] = useState(URL);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (state === 'loading') setState('fallback');
    }, 8000);
    return () => clearTimeout(timer);
  }, [state]);

  React.useEffect(() => {
    const h = () => { if (ref.current && canBack) { ref.current.goBack(); return true } return false };
    BackHandler.addEventListener('hardwareBackPress', h);
    return () => BackHandler.removeEventListener('hardwareBackPress', h);
  }, [canBack]);

  const handleNav = useCallback((s) => {
    setCanBack(s.canGoBack);
    setCanFwd(s.canGoForward);
    setCurUrl(s.url);
    if (!s.loading) setState('loaded');
  }, []);

  const handleError = useCallback(() => {
    setState('fallback');
  }, []);

  const openBrowser = useCallback(() => {
    Linking.openURL('https://movie.vodu.me').catch(() => {});
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f23" />
      {(state === 'loading' || state === 'loaded') && (
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
      )}
      {state === 'fallback' && (
        <View style={styles.fallback}>
          <Text style={styles.fbIcon}>🎬</Text>
          <Text style={styles.fbTitle}>Movie Vodu</Text>
          <Text style={styles.fbMsg}>لم يتم تحميل الموقع تلقائياً</Text>
          <TouchableOpacity style={styles.fbBtn} onPress={openBrowser}>
            <Text style={styles.fbBtnText}>فتح في المتصفح</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.fbRetry} onPress={() => { setState('loading'); ref.current?.reload(); }}>
            <Text style={styles.fbRetryText}>إعادة المحاولة</Text>
          </TouchableOpacity>
        </View>
      )}
      {progress > 0 && progress < 1 && state !== 'fallback' && (
        <View style={styles.progress}><View style={[styles.progressFill, { width: `${progress * 100}%` }]} /></View>
      )}
      {state !== 'fallback' && (
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
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f23', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  webview: { flex: 1, backgroundColor: '#0f0f23' },
  progress: { height: 3, backgroundColor: '#333' },
  progressFill: { height: '100%', backgroundColor: '#e94560' },
  nav: { flexDirection: 'row', justifyContent: 'space-evenly', backgroundColor: '#1a1a2e', paddingVertical: 6, borderTopWidth: 1, borderTopColor: '#333' },
  navBtn: { padding: 10 },
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
