import React from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import { Bubble, GiftedChat } from 'react-native-gifted-chat';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase initializations
const firebase = require('firebase');
require('firebase/firestore');
// require('firebase/auth');

export default class Chat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      bubbleColor: '',
      messages: [],
      uid: 0,
    };

    // Initialize & Connect with FIRESTORE DB:
    if (!firebase.apps.length) {
      firebase.initializeApp({
        // Firestore Configuration Credentials
        apiKey: 'AIzaSyCBLjZWSL6qFPHcnlXuaDXwjuDSQA7dDfM',
        authDomain: 'topchat-app.firebaseapp.com',
        projectId: 'topchat-app',
        storageBucket: 'topchat-app.appspot.com',
        messagingSenderId: '365702031768',
        appId: '1:365702031768:web:c81f8784b835cb4f77e3ed',
        experimentalForceLongPolling: true,
      });
      // Reference "messages" collection (to query its documents)
      this.referenceChatMessages = firebase.firestore().collection('messages');
    }
  }

  // Adds message to Firestore DB
  addMessage = (message) => {
    this.referenceChatMessages.add({
      _id: message._id,
      test: message.text,
      createdAt: message.createdAt,
      user: message.user,
      uid: this.state.uid,
    });
  };

  componentDidMount() {
    // Get & Set User's name as Chat Title
    let name = this.props.route.params.name;
    this.props.navigation.setOptions({ title: name });

    // Set personalized Bubble color
    this.setState({
      bubbleColor: this.props.route.params.color,
      /* messages: [
        {
          _id: 1,
          text: "Hi Developer... Hope you are having a good day! 👍",
          createdAt: new Date(),
          user: {
            _id: 2,
            name: "React Native",
            avatar: "https://placeimg.com/140/140/any",
          },
        },
        {
          _id: 2,
          text: `Welcome ${this.props.route.params.name}, you've entered the Chat`,
          createdAt: new Date(),
          system: true,
        },
      ], */
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
        loggedInText: 'Hello there',
      });
    });

    // FIRESTORE DB
    // Reference 'messages' Collection
    this.referenceChatMessages = firebase.firestore().collection('messages');
    /* Create "messages" observer, pass it callback (to call with updates)
     and save returned function (used to unsubscribe observer):  */
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
        user: data.user,
      });
    });
    this.setState({ messages });
  };

  // Add message to messages state
  onSend(messages = []) {
    console.log(messages);
    this.setState((previousState) => ({
      messages: GiftedChat.append(previousState.messages, messages),
    }));
    // Update Firestore with last message
    this.addMessage(this.state.messages[0]);
  }

  renderBubble(props) {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: this.state.bubbleColor,
          },
        }}
      />
    );
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <GiftedChat
          renderBubble={this.renderBubble.bind(this)}
          messages={this.state.messages}
          onSend={(message) => this.onSend(message)}
          user={{ _id: 1 }}
        />
        {Platform.OS === 'android' ? (
          <KeyboardAvoidingView behavior='height' />
        ) : null}
      </View>
    );
  }
}
