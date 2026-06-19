import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, StatusBar, BackHandler, Linking, Platform } from 'react-native';
import { WebView } from 'react-native-webview';

const URL = 'https://movie.vodu.me/index.php';
const UA = 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.165 Mobile Safari/537.36';

export default function App() {
  const ref = useRef(null);
  const [progress, setProgress] = useState(0);
  const [canBack, setCanBack] = useState(false);
  const [canFwd, setCanFwd] = useState(false);
  const [url, setUrl] = useState(URL);
  const [err, setErr] = useState(false);

  React.useEffect(() => {
    const h = () => { if (ref.current && canBack) { ref.current.goBack(); return true } return false };
    BackHandler.addEventListener('hardwareBackPress', h);
    return () => BackHandler.removeEventListener('hardwareBackPress', h);
  }, [canBack]);

  if (err) {
    return (
      <View style={s.c}>
        <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
        <Text style={s.er}>تعذر الاتصال بالموقع</Text>
        <TouchableOpacity style={s.rb} onPress={() => { setErr(false); ref.current?.reload() }}>
          <Text style={s.rt}>إعادة المحاولة</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={s.c}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      <WebView
        ref={ref}
        source={{ uri: URL }}
        style={s.wv}
        userAgent={UA}
        javaScriptEnabled
        domStorageEnabled
        allowFileAccess
        allowUniversalAccessFromFileURLs
        mixedContentMode="always"
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        setSupportMultipleWindows={false}
        allowsBackForwardNavigationGestures
        onLoadProgress={({ nativeEvent: { progress: p } }) => setProgress(p)}
        onNavigationStateChange={(s) => { setCanBack(s.canGoBack); setCanFwd(s.canGoForward); setUrl(s.url) }}
        onError={() => setErr(true)}
        onHttpError={() => setErr(true)}
        onShouldStartLoadWithRequest={(r) => {
          if (['intent:', 'tel:', 'mailto:', 'whatsapp:', 'tg:', 'viber:'].some(p => r.url.startsWith(p))) {
            Linking.openURL(r.url).catch(() => {});
            return false;
          }
          return true;
        }}
      />
      {progress > 0 && progress < 1 && (
        <View style={s.pb}><View style={[s.pf, { width: `${progress * 100}%` }]} /></View>
      )}
      <View style={s.nb}>
        <TouchableOpacity style={s.nbtn} onPress={() => ref.current?.goBack()} disabled={!canBack}>
          <Text style={[s.ni, !canBack && s.nd]}>◀</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.nbtn} onPress={() => ref.current?.goForward()} disabled={!canFwd}>
          <Text style={[s.ni, !canFwd && s.nd]}>▶</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.nbtn} onPress={() => ref.current?.reload()}>
          <Text style={s.ni}>⟳</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.nbtn} onPress={() => Linking.openURL(url).catch(() => {})}>
          <Text style={s.ni}>↗</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#0f0f23', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  wv: { flex: 1, backgroundColor: '#0f0f23' },
  pb: { height: 3, backgroundColor: '#333' },
  pf: { height: '100%', backgroundColor: '#e94560' },
  nb: { flexDirection: 'row', justifyContent: 'space-evenly', backgroundColor: '#1a1a2e', paddingVertical: 6, borderTopWidth: 1, borderTopColor: '#333' },
  nbtn: { padding: 10 },
  ni: { color: '#e94560', fontSize: 18 },
  nd: { color: '#555' },
  er: { color: '#e94560', fontSize: 18, textAlign: 'center', marginTop: 100 },
  rb: { backgroundColor: '#e94560', padding: 14, borderRadius: 8, marginHorizontal: 40, marginTop: 20, alignItems: 'center' },
  rt: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
