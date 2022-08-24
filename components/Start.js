import React from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  ImageBackground,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default class Start extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      selectedColorIndex: 2,
    };
  }

  render() {
    const colors = ['#090C08', '#474056', '#8A95A5', '#B9C6AE'];
    return (
      <View style={styles.flex1}>
        <ImageBackground
          source={require('../assets/BackgroundImage.png')}
          style={styles.image}
        >
          <Text style={styles.title}>Chat App</Text>
          <View style={styles.uibox}>
            <TextInput
              style={styles.nameInput}
              onChangeText={(text) => this.setState({ name: text })}
              value={this.state.name}
              placeholder='👤 Type Your Name'
            />

            <View style={styles.selectColorBox}>
              <Text style={styles.selectColorTitle}>
                Choose Background Color:
              </Text>
              <View style={styles.colorsContainer}>
                <TouchableOpacity
                  style={[
                    styles.colorSelector,
                    {
                      backgroundColor: colors[0],
                      borderColor:
                        this.state.selectedColorIndex === 0
                          ? 'darkgrey'
                          : 'transparent',
                    },
                  ]}
                  onPress={() =>
                    this.setState({
                      selectedColorIndex: 0,
                    })
                  }
                />
                <TouchableOpacity
                  style={[
                    styles.colorSelector,
                    {
                      backgroundColor: colors[1],
                      borderColor:
                        this.state.selectedColorIndex === 1
                          ? 'darkgrey'
                          : 'transparent',
                    },
                  ]}
                  onPress={() => this.setState({ selectedColorIndex: 1 })}
                />
                <TouchableOpacity
                  style={[
                    styles.colorSelector,
                    {
                      backgroundColor: colors[2],
                      borderColor:
                        this.state.selectedColorIndex === 2
                          ? 'gray'
                          : 'transparent',
                    },
                  ]}
                  onPress={() => this.setState({ selectedColorIndex: 2 })}
                />
                <TouchableOpacity
                  style={[
                    styles.colorSelector,
                    {
                      backgroundColor: colors[3],
                      borderColor:
                        this.state.selectedColorIndex === 3
                          ? 'grey'
                          : 'transparent',
                    },
                  ]}
                  onPress={() => this.setState({ selectedColorIndex: 3 })}
                />
              </View>
            </View>
            <View style={styles.button}>
              <TouchableOpacity
                onPress={() =>
                  this.props.navigation.navigate('Chat', {
                    name: this.state.name,
                    color: colors[this.state.selectedColorIndex],
                  })
                }
              >
                <Text
                  style={{
                    color: '#FFFFFF',
                    fontSize: 18,
                    fontWeight: '600',
                  }}
                >
                  Start Chatting
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <StatusBar style='auto' />
        </ImageBackground>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
  image: {
    flex: 1,
    resizeMode: 'cover',
    flexDirection: 'column',
    alignItems: 'center',
  },
  title: {
    marginTop: 100,
    fontWeight: '600',
    color: 'white',
    flex: 1,
    fontSize: 45,
  },
  uibox: {
    flex: 0,
    marginBottom: '7%',
    alignItems: 'center',
    justifyContent: 'center',
    height: '44%',
    width: '88%',
    fontSize: 45,
    backgroundColor: 'whitesmoke',
  },
  nameInput: {
    height: 45,
    fontSize: 19,
    width: '88%',
    marginTop: '7%',
    borderColor: 'grey',
    borderWidth: 1,
    paddingLeft: 7,
  },
  selectColorBox: {
    flex: 2,
    flexDirection: 'column',
    width: '88%',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  selectColorTitle: {
    textAlign: 'left',
    alignSelf: 'flex-start',
    fontSize: 18,
    color: '#757083',
    marginTop: 30,
  },
  colorsContainer: {
    flexDirection: 'row',
  },
  colorSelector: {
    height: 48,
    width: 48,
    borderRadius: 24,
    margin: 3,
    marginTop: 10,
    borderWidth: 3,
    borderStyle: 'solid',
  },

  button: {
    marginTop: 'auto',
    height: 45,
    width: '88%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#757083',
    marginBottom: '7%',
  },
});
