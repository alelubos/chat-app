import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { connectActionSheet } from '@expo/react-native-action-sheet';
import * as Location from 'expo-location';

// Expo API for accessing Images in smartphone
import * as ImagePicker from 'expo-image-picker';
// import * as Permissions from 'expo-permissions'; <- Deprecated

import firebase from 'firebase';
import 'firebase/firestore';

// import * as Location from 'expo-location';
// import MapView from 'react-native-maps';

class CustomAction extends Component {
  // Take and send a Photo------------------------------------------------------
  async takePhoto() {
    // Request Access to Camera
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    try {
      if (status === 'granted') {
        // Launch Camera
        let result = await ImagePicker.launchCameraAsync({
          mediaTypes: 'Images',
        }).catch((error) => console.error(error));

        // If not cancelled, upload photo to Firebase Storage and send in chat
        if (!result.cancelled) {
          const imageUrl = await this.uploadImageFetch(result.uri);
          this.props.onSend({ image: imageUrl });
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  // Pick up Image from Gallery to send in the Chat -----------------------------
  async pickImage() {
    // Request Access to Media Library
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    try {
      if (status === 'granted') {
        let result = await ImagePicker.launchImageLibraryAsync({
          // Only images are allowed
          mediaTypes: 'Images',
        }).catch((error) => console.error(error));

        // upload and send selected image
        if (!result.cancelled) {
          const imageUrl = await this.uploadImageFetch(result.uri);
          this.props.onSend({ image: imageUrl });
        }
      }
    } catch (error) {
      console.error(error.message);
    }
  }

  // Convert image to Blob & upload it to Firebase/Storage ---------------------
  // returns Image's URL
  async uploadImageFetch(uri) {
    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        resolve(xhr.response);
      };
      xhr.onerror = function (e) {
        console.log(e);
        reject(new TypeError('Network request failed'));
      };
      xhr.responseType = 'blob';
      xhr.open('GET', uri, true);
      xhr.send(null);
    });

    const imageNameBefore = uri.split('/');
    const imageName = imageNameBefore[imageNameBefore.length - 1];

    const ref = firebase.storage().ref(`images/${imageName}`);

    const snapshot = await ref.put(blob);
    blob.close();
    return await snapshot.ref.getDownloadURL();
  }

  // Get and send current Geolocation ------------------------------------------
  async getLocation() {
    // Request User Permissions for location
    const { status } = await Location.requestForegroundPermissionsAsync();
    try {
      if (status === 'granted') {
        let location = await Location.getCurrentPositionAsync({});
        if (location) {
          this.props.onSend({
            location: {
              longitude: location.coords.longitude,
              latitude: location.coords.latitude,
            },
          });
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  // Display Action Bar -upon pressing (+)- & with Options functionality -------
  onActionPress = () => {
    const options = [
      'Pick an Image from Media Gallery',
      'Take a Photo',
      'Share Your Location',
      'Cancel',
    ];
    const cancelButtonIndex = options.length - 1;
    this.props.showActionSheetWithOptions(
      { options, cancelButtonIndex },
      async (buttonIndex) => {
        switch (buttonIndex) {
          case 0:
            console.log('User want to Pickup Image');
            return this.pickImage();
          case 1:
            console.log('User wants to Take a Picture');
            return this.takePhoto();
          case 2:
            console.log('User wants to get current Location');
            return this.getLocation();
          default:
            return;
        }
      }
    );
  };

  render() {
    return (
      <TouchableOpacity
        accessible={true}
        accessibiltyLabel='More options'
        accessibilityHint='You can choose to send an image, to take and send a photo or your geolocation'
        style={[styles.container]}
        onPress={this.onActionPress}
      >
        <View style={[styles.wrapper, this.props.wrapperStyle]}>
          <Text style={[styles.iconText, this.props.iconTextStyle]}>+</Text>
        </View>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: 26,
    height: 26,
    marginLeft: 10,
    marginBottom: 10,
  },
  wrapper: {
    borderRadius: 13,
    borderColor: '#b2b2b2',
    borderWidth: 2,
    flex: 1,
  },
  iconText: {
    color: '#d2d2d2',
    fontWeight: '700',
    fontSize: 15,
    backgroundColor: 'transparent',
    textAlign: 'center',
  },
});

CustomAction.contextTypes = {
  actionSheet: PropTypes.func,
};

const CustomActions = connectActionSheet(CustomAction);

export default CustomActions;
