import React from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import { Bubble, GiftedChat } from 'react-native-gifted-chat';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase
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
      messages: [],
      uid: 0,
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
      user: message.user,
    });
  };

  componentDidMount() {
    // Get & Set User's name as Chat Title
    let { name } = this.props.route.params;
    this.props.navigation.setOptions({ title: name });

    // Set personalized background color
    this.setState({
      backgroundColor: this.props.route.params.color,
    });

    // AUTHENTICATION
    /* Call Firestore auth() service, subscribe Anonymous user
       & save returned function to unsubscribe it */
    this.authUnsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
      // Subscribe Anonymous User (if none subscribed)
      if (!user) {
        await firebase.auth().signInAnonymously();
      }
      //update user state with current active user data
      this.setState({
        uid: user.uid,
        user: {
          _id: user.uid,
          name: name,
        },
      });
    });

    // FIRESTORE DB
    // Reference 'messages' Collection
    this.referenceChatMessages = firebase.firestore().collection('messages');
    /* Create "messages" collection observer & pass it a callback (to handle updates)
     then save returned function (used to unsubscribe observer):  */
    this.unsubscribe = this.referenceChatMessages
      .orderBy('createdAt', 'desc')
      .onSnapshot(this.onCollectionUpdate);
  }

  componentWillUnmount() {
    // stop listening to the collection changes & authentication
    this.unsubscribe();
    this.authUnsubscribe();
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
    this.setState({ messages });
  };

  // Add message to messages state
  onSend(messages = []) {
    this.setState((previousState) => ({
      messages: GiftedChat.append(previousState.messages, messages),
    }));
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

  render() {
    return (
      <View style={{ backgroundColor: this.state.backgroundColor, flex: 1 }}>
        <GiftedChat
          renderBubble={this.renderBubble.bind(this)}
          messages={this.state.messages}
          onSend={(message) => this.onSend(message)}
          user={{ _id: this.state.user._id, name: this.state.user.name }}
        />
        {Platform.OS === 'android' ? (
          <KeyboardAvoidingView behavior='height' />
        ) : null}
      </View>
    );
  }
}
