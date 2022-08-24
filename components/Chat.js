import React from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import { Bubble, GiftedChat, InputToolbar } from 'react-native-gifted-chat';
// Native Storage & Network Info packages
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
// Firebase imports & configuration
const firebase = require('firebase');
require('firebase/firestore');
const firebaseConfig = {
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
      backgroundColor: '',
      isConnected: '',
      messages: [],
      user: {
        _id: '',
        name: '',
        avatar: '',
      },
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

  // Adds message to Firestore DB
  addMessage = (message) => {
    this.referenceChatMessages.add({
      _id: message._id,
      text: message.text || '',
      createdAt: message.createdAt,
      user: {
        ...this.state.user,
        name: this.state.user.name || 'anonymous user',
      },
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
           & save returned function to unsubscribe it */
        this.authUnsubscribe = firebase
          .auth()
          .onAuthStateChanged(async (user) => {
            // Subscribe Anonymous User (if none subscribed)
            if (!user) {
              await firebase.auth().signInAnonymously();
            }
            // Update user state with current authenticated user
            this.setState({
              user: {
                _id: user.uid,
                name: name,
              },
            });
          });

        // LOAD Messages from DB (updating state & local Storage)
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
    // Stop listening to the collection changes & authentication
    if (this.unsusbscribe) this.unsubscribe();
    if (this.authUnsusbscribe) this.authUnsubscribe();
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
      });
    });
    // Update messages in state & local Storage
    this.setState({ messages }, () => this.saveMessages());
  };

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

  // Add message to messages state
  onSend(messages = []) {
    this.setState(
      (previousState) => ({
        messages: GiftedChat.append(previousState.messages, messages),
      }),
      // callback is guaranteed to get fired once update is applied
      () => {
        this.saveMessages();
      }
    );
    // Update Firestore with last message
    this.addMessage(messages[0]);
  }

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

  renderInputToolbar(props) {
    if (this.state.isConnected == false) {
    } else {
      return <InputToolbar {...props} />;
    }
  }

  render() {
    return (
      <View style={{ backgroundColor: this.state.backgroundColor, flex: 1 }}>
        <GiftedChat
          renderBubble={this.renderBubble.bind(this)}
          messages={this.state.messages}
          onSend={(message) => this.onSend(message)}
          user={{ _id: this.state.user._id, name: this.state.user.name }}
          renderInputToolbar={this.renderInputToolbar.bind(this)}
        />
        {Platform.OS === 'android' ? (
          <KeyboardAvoidingView behavior='height' />
        ) : null}
      </View>
    );
  }
}
