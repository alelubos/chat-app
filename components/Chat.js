import React from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import { Bubble, GiftedChat, InputToolbar } from 'react-native-gifted-chat';
import CustomActions from './CustomActions';
import MapView from 'react-native-maps';

// Native Storage & Network Info packages
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

// FIREBASE imports & configuration
import firebase from 'firebase';
import 'firebase/firestore';
const firebaseConfig = {
  databaseURL: 'https://topchat-app.firebaseio.com',
  apiKey: 'AIzaSyCBLjZWSL6qFPHcnlXuaDXwjuDSQA7dDfM',
  authDomain: 'topchat-app.firebaseapp.com',
  projectId: 'topchat-app',
  storageBucket: 'topchat-app.appspot.com',
  messagingSenderId: '365702031768',
  appId: '1:365702031768:web:c81f8784b835cb4f77e3ed',
};

export default class Chat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      uid: 0,
      backgroundColor: '',
      messages: [],
      user: {
        _id: '',
        name: '',
      },
      image: '',
      location: '',
      isConnected: '',
    };

    // Initialize & Connect with FIRESTORE DB:
    if (typeof firebase === 'undefined')
      throw new Error('Firebase SDK not detected.');
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);

      // Reference "messages" collection (to query its documents)
      this.referenceChatMessages = firebase.firestore().collection('messages');
    }
  }

  // Adds message to Firestore
  addMessage = (message) => {
    this.referenceChatMessages.add({
      _id: message._id,
      text: message.text || '',
      createdAt: message.createdAt,
      user: message.user,
      image: message.image || null,
      location: message.location || null,
    });
    console.log('addMessage added: ', message);
  };

  async getMessages() {
    let messages = '';
    try {
      messages = (await AsyncStorage.getItem('messages')) || [];
      this.setState({ messages: JSON.parse(messages) });
    } catch (error) {
      console.log(error.message);
    }
  }

  componentDidMount() {
    // Get & Set User's name for Chat Title
    let { name } = this.props.route.params;
    this.props.navigation.setOptions({ title: name });

    // Set personalized background color
    this.setState({
      backgroundColor: this.props.route.params.color,
    });

    // Verify status on user's Network
    NetInfo.fetch().then((connection) => {
      if (connection.isConnected) {
        this.setState({ isConnected: true });

        // AUTHENTICATE User
        /* Call Firestore auth() service, subscribe Anonymous user
           & save returned function that serves to unsubscribe it */
        this.authUnsubscribe = firebase
          .auth()
          .onAuthStateChanged(async (user) => {
            // Subscribe Anonymous User (if none subscribed)
            if (!user) {
              await firebase.auth().signInAnonymously();
            }
            // Update user state with current authenticated user
            this.setState({
              uid: user.uid,
              user: {
                _id: user.uid,
                name: name,
              },
            });
          });

        // Reference to LOAD Messages from Firestore (updating state & local Storage)
        this.referenceChatMessages = firebase
          .firestore()
          .collection('messages');
        /* Create "messages" collection observer, pass it updates handler &
           save returned function (used to unsubscribe observer):  */
        this.unsubscribe = this.referenceChatMessages
          .orderBy('createdAt', 'desc')
          .onSnapshot(this.onCollectionUpdate);
      } else {
        this.setState({ isConnected: false });
        // Get messages from local Storage
        this.getMessages();
      }
    });
  }

  componentWillUnmount() {
    // Stop observing collection updates & authentication
    if (this.isConnected) {
      this.unsubscribe();
      this.authUnsubscribe();
    }
  }

  // Updates messages state after DB update
  onCollectionUpdate = (querySnapShot) => {
    const messages = [];
    querySnapShot.forEach((doc) => {
      let data = doc.data();
      messages.push({
        _id: data._id,
        createdAt: data.createdAt.toDate(),
        text: data.text || '',
        user: {
          _id: data.user._id,
          name: data.user.name,
          avatar: data.user.avatar || '',
        },
        image: data.image || '',
        location: data.location || '',
      });
    });
    // Flushes & Updates messages in state & local Storage
    this.setState({ messages }, () => this.saveMessages());
  };

  // Updates AsyncStorage from messages state
  async saveMessages() {
    try {
      await AsyncStorage.setItem(
        'messages',
        JSON.stringify(this.state.messages)
      );
    } catch (error) {
      console.log(error.message);
    }
  }

  // Removes messages from local storage & state (but not DB)
  async deleteMessages() {
    try {
      await AsyncStorage.removeItem('messages');
      this.setState({ messages: [] });
    } catch (error) {
      console.log(error.message);
    }
  }

  // Add sent message to messages state & update AsyncStorage
  onSend(messages = []) {
    console.log('onSend received messages: ', messages);
    this.setState(
      (previousState) => ({
        messages: GiftedChat.append(previousState.messages, messages),
      }),
      // callback gets fired only after setState is applied
      () => {
        // Update Firestore with last message
        this.addMessage(this.state.messages[0]);
        // Flashes
        // Update AsyncStorage messages
        this.saveMessages();
      }
    );
  }

  // Customize User's Message Bubble
  renderBubble(props) {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: 'steelblue',
          },
        }}
      />
    );
  }

  // Render InputBar in Chat only if online
  renderInputToolbar(props) {
    if (this.state.isConnected == false) {
      return;
    } else {
      return <InputToolbar {...props} />;
    }
  }

  // Function to pass to GiftedChat
  renderCustomActions = (props) => {
    return <CustomActions {...props} />;
  };

  // Render Map if message has location
  renderCustomView(props) {
    const { currentMessage } = props;
    if (currentMessage.location) {
      return (
        <MapView
          style={{ width: 150, height: 100, borderRadius: 13, margin: 3 }}
          region={{
            latitude: currentMessage.location.latitude,
            longitude: currentMessage.location.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        />
      );
    }
    return null;
  }

  render() {
    return (
      <View
        style={{
          backgroundColor: this.state.backgroundColor,
          flex: 1,
        }}
      >
        <GiftedChat
          renderBubble={this.renderBubble.bind(this)}
          messages={this.state.messages}
          onSend={(messages) => this.onSend(messages)}
          user={{ _id: this.state.user._id, name: this.state.user.name }}
          renderInputToolbar={this.renderInputToolbar.bind(this)}
          renderActions={this.renderCustomActions}
          renderCustomView={this.renderCustomView}
        />
        {Platform.OS === 'android' ? (
          <KeyboardAvoidingView behavior='height' />
        ) : null}
      </View>
    );
  }
}
