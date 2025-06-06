import React, { useState, useCallback, useContext } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import QRScannerSearch from '../QRScannerSearch';
import { GlobalStateContext } from '../../context/GlobalState';
import Voice from '@react-native-voice/voice';

// INFO: Voice recognition (react-native-voice) does NOT work in Expo Go, because Expo Go does not include native modules for speech-to-text.
// This error: [TypeError: Cannot read property 'startSpeech' of null] means the native bridge is missing.
// To use microphone/voice features, you must build a custom development client with Expo Dev Client or eject to bare React Native.

const SearchScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState(null);
  const { stateData, user, sizes, colors, goods } = useContext(GlobalStateContext);
  const isFocused = useIsFocused();

  useFocusEffect(
    useCallback(() => {
      setModalVisible(true);
      setShowQR(false);
      setShowSearchBar(false);
      return () => {
        setModalVisible(false);
        setShowQR(false);
        setShowSearchBar(false);
      };
    }, [])
  );

  const filteredData = stateData?.filter(item => {
    const search = searchText.trim().toLowerCase();
    if (!search) return true;
    const searchWords = search.split(/\s+/);
    const color = (item.color || '').toLowerCase();

    // Polish color stemming: remove common endings for basic matching
    const stemPolishColor = (str) =>
      str
        .replace(/(y|a|e|ego|ej|ą|ę|i|iego|iej|ym|im|ie|ich|ych|emu|emu|ący|ąca|ące|ami|ami|owi|owie|ów|om|ach|u|o|ą)$/g, '');

    const itemString = (
      (item.fullName || '') + ' ' +
      (item.size || '') + ' ' +
      (item.symbol || '') + ' ' +
      (item.barcode || '') + ' ' +
      color
    ).toLowerCase();

    return searchWords.every(word => {
      // Try stemmed color matching for Polish endings
      if (color && (stemPolishColor(color) === stemPolishColor(word))) return true;
      if (itemString.includes(word)) return true;
      // Also try stemmed word in itemString
      if (itemString.includes(stemPolishColor(word))) return true;
      return false;
    });
  }) || [];

  React.useEffect(() => {
    Voice.onSpeechResults = (e) => {
      console.log('onSpeechResults:', e); // Dodaj logowanie
      if (e.value && e.value.length > 0) {
        setSearchText(e.value[0]);
      }
      setIsListening(false);
    };
    Voice.onSpeechEnd = () => {
      console.log('onSpeechEnd');
      setIsListening(false);
    };
    Voice.onSpeechError = (err) => {
      console.log('onSpeechError:', err); // Dodaj logowanie
      setIsListening(false);
    };
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const startVoice = async () => {
    setIsListening(true);
    setVoiceError(null);
    try {
      await Voice.start('pl-PL');
      console.log('Voice started');
    } catch (e) {
      console.log('Voice start error:', e);
      setVoiceError('Błąd mikrofonu lub brak wsparcia urządzenia.');
      setIsListening(false);
    }
  };

  if (showQR) {
    return (
      <View style={{ flex: 1, backgroundColor: 'black' }}>
        <QRScannerSearch
          stateData={stateData}
          user={user}
          sizes={sizes}
          colors={colors}
          goods={goods}
          isActive={isFocused}
        />
        <TouchableOpacity
          style={[styles.optionButton, { margin: 16, width: '100%', alignSelf: 'stretch' }]}
          onPress={() => {
            setShowQR(false);
            setModalVisible(true);
          }}
        >
          <Text style={styles.optionText}>Powrót</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (showSearchBar) {
    return (
      <View style={styles.searchBarContainer}>
        <View style={styles.searchBarRow}>
          <TextInput
            style={styles.searchBar}
            placeholder="Szukaj..."
            placeholderTextColor="#888"
            value={searchText}
            onChangeText={setSearchText}
            autoFocus
          />
          <TouchableOpacity
            style={styles.micButton}
            onPress={startVoice}
            disabled={isListening}
          >
            <Text style={[styles.micIcon, isListening && styles.micIconActive]}>
              🎤
            </Text>
          </TouchableOpacity>
        </View>
        {/* Add a button to go back to the modal */}
        <TouchableOpacity
          style={[styles.optionButton, { marginBottom: 16, width: '100%', alignSelf: 'stretch' }]}
          onPress={() => {
            setShowSearchBar(false);
            setModalVisible(true);
          }}
        >
          <Text style={styles.optionText}>Powrót</Text>
        </TouchableOpacity>
        {voiceError && (
          <Text style={{ color: 'red', marginBottom: 8 }}>{voiceError}</Text>
        )}
        <FlatList
          data={filteredData}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.writeoffItem}>
              <View style={styles.writeoffRow}>
                <Text style={styles.writeoffName}>
                  {item.fullName} <Text style={styles.writeoffSize}> {item.size} </Text>
                </Text>
                <Text style={styles.writeoffSymbol}>{item.symbol}</Text>
                <Text style={styles.barcode}>{item.barcode}</Text>
              </View>
              <View style={styles.writeoffRow}>
                {/* Ilość tylko jeśli istnieje */}
                {item.qty !== undefined && item.qty !== null && item.qty !== '' && (
                  <Text style={styles.writeoffQty}>Ilość: {item.qty}</Text>
                )}
              </View>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Brak wyników</Text>
          }
          keyboardShouldPersistTaps="handled"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Wybierz opcję wyszukiwania</Text>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => {
                setModalVisible(false);
                setShowQR(true);
              }}
            >
              <Text style={styles.optionText}>Wyszukaj po kodzie </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => {
                setModalVisible(false);
                setShowSearchBar(true);
              }}
            >
              <Text style={styles.optionText}>Wyszukaj w wyszukiwarce</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.optionButton, styles.closeButton]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeText}>Zamknij</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'black',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'black',
    borderRadius: 10,
    padding: 16, // było 24
    alignItems: 'center',
    width: '70%', // było 80%
    color: '#fff',
  },
  modalTitle: {
    fontSize: 16, // było 18
    fontWeight: 'bold',
    marginBottom: 16, // było 20
    color: '#fff',
  },
  optionButton: {
    backgroundColor: '#0d6efd',
    padding: 8, // było 12
    borderRadius: 8,
    marginVertical: 6, // było 8
    width: '90%', // było 100%
    alignItems: 'center',
  },
  optionText: {
    fontSize: 14, // było 16
    color: '#fff',
  },
  closeButton: {
    backgroundColor: 'red',
  },
  closeText: {
    color: 'white',
    marginTop: 0, // remove marginTop so button looks consistent
  },
  searchBarContainer: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'flex-start',
    paddingTop: 40,
    paddingHorizontal: 16,
  },
  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchBar: {
    flex: 1,
    backgroundColor: 'black',
    color: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  micButton: {
    marginLeft: 10,
    padding: 10,
    backgroundColor: '#222',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  micIcon: {
    fontSize: 24,
    color: '#fff',
  },
  micIconActive: {
    color: '#0d6efd',
  },
  listItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  listItemText: {
    color: '#fff',
    fontSize: 13,
  },
  emptyText: {
    color: '#888',
    textAlign: 'center',
    marginTop: 24,
    fontSize: 13,
  },
  // --- Writeoff-like item styles ---
  writeoffItem: {
        backgroundColor: "#0d6efd",
        borderRadius: 5,
        margin: 5,
        alignItems: "center",
        justifyContent: "center", // center content vertically
        paddingTop:10,
        paddingLeft: 10,
        paddingRight: 10,

  },
  writeoffRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    position: 'relative', // ensure children can be absolutely positioned if needed
  },
  writeoffName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13, // było 16
    flex: 1,
  },
  writeoffSymbol: {
    position: 'absolute',
    right: 4,
    top: 2,
    color: 'white',
    fontWeight: 'bold',
    fontSize: 13, // było 16
    marginLeft: 12,
  },
  writeoffSize: {
    color: 'white',
    fontSize: 13, // było 16
  },
  writeoffQty: {
    color: '#fff',
    fontSize: 13, // było 14
    fontWeight: 'bold',
  },
  barcode: {
    position: 'absolute',
    right: 45,
    fontSize: 13,
    color: 'white',
  }
  
});

export default SearchScreen;