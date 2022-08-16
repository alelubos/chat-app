import React from "react";
import { Text, View } from "react-native";

export default class Chat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      backgroundColor: "",
    };
  }
  componentDidMount() {
    let name = this.props.route.params.name;
    this.setState({ backgroundColor: this.props.route.params.backgroundColor });
    this.props.navigation.setOptions({ title: name });
  }
  render() {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: this.state.backgroundColor,
        }}
      >
        <Text style={{ fontSize: 20, color: "white" }}>Chat Screen</Text>
      </View>
    );
  }
}
