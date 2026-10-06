import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useApp, ActiveTab } from '../context/AppContext';

export const BottomNavBar: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();

  const tabs: { id: ActiveTab; label: string; icon: string }[] = [
    { id: 'home', label: 'Inicio', icon: '🧭' },
    { id: 'discover', label: 'Descubrir', icon: '🔥' },
    { id: 'map', label: 'Mapa', icon: '🗺️' },
    { id: 'passport', label: 'Pasaporte', icon: '🏆' },
    { id: 'profile', label: 'Perfil', icon: '❤️' }
  ];

  return (
    <View style={styles.navBar}>
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.navItem}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text style={[styles.iconText, isActive && styles.activeIconText]}>{tab.icon}</Text>
            <Text style={[styles.labelText, isActive && styles.activeLabelText]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  navBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: '#0f172a',
    borderTopWidth: 1,
    borderColor: '#1e293b',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 8
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    flex: 1
  },
  iconText: {
    fontSize: 18,
    marginBottom: 2
  },
  activeIconText: {
    transform: [{ scale: 1.15 }]
  },
  labelText: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '700'
  },
  activeLabelText: {
    color: '#34d399',
    fontWeight: '900'
  }
});
