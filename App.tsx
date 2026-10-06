import React from 'react';
import { StyleSheet, View, SafeAreaView, StatusBar } from 'react-native';
import { AppProvider, useApp } from './src/context/AppContext';
import { HomeScreen } from './src/screens/HomeScreen';
import { DiscoverScreen } from './src/screens/DiscoverScreen';
import { MapScreen } from './src/screens/MapScreen';
import { PassportScreen } from './src/screens/PassportScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { BottomNavBar } from './src/components/BottomNavBar';
import { PlaceDetailModal } from './src/components/PlaceDetailModal';

const MainApp: React.FC = () => {
  const { activeTab, selectedPlace, setSelectedPlace } = useApp();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#020617" />
      <View style={styles.container}>
        {/* Active Screen Router */}
        {activeTab === 'home' && <HomeScreen />}
        {activeTab === 'discover' && <DiscoverScreen />}
        {activeTab === 'map' && <MapScreen />}
        {activeTab === 'passport' && <PassportScreen />}
        {activeTab === 'profile' && <ProfileScreen />}

        {/* Floating Mobile Bottom Navigation */}
        <BottomNavBar />

        {/* Place Detail Modal */}
        <PlaceDetailModal place={selectedPlace} onClose={() => setSelectedPlace(null)} />
      </View>
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#020617' },
  container: { flex: 1, backgroundColor: '#020617' }
});
