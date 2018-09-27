import React, { Component } from "react";
import {
  View,
  ActivityIndicator,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  BackHandler,
  Linking,
  StatusBar,
} from "react-native";

import { Navigation } from "react-native-navigation";
import Ionicons from "react-native-vector-icons/Ionicons";
import FastImage from "react-native-fast-image";

import { TabBar } from "../../../components/tabBar";
import { LoginHeader } from "../../../components/loginHeader";
import { FormInput } from "../../../components/formInput";
import { InformationArea } from "../../../components/informationArea";
import ScrollableTabView from "@esteemapp/react-native-scrollable-tab-view";
import { Login } from "../../../providers/steem/auth";

import { addNewAccount } from "../../../redux/actions/accountAction";

import { lookupAccounts } from "../../../providers/steem/dsteem";
import { goToAuthScreens } from "../../../navigation";

// Styles
import styles from "./loginStyles";

class LoginScreen extends Component {
  static get options() {
    return {
      _statusBar: {
        visible: true,
        drawBehind: false,
      },
      topBar: {
        animate: true,
        hideOnScroll: false,
        drawBehind: false,
        noBorder: true,
        visible: true,
        elevation: 0,
        leftButtons: {},
        rightButtons: [
          {
            id: "signup",
            text: "Sign Up",
            color: "#a7adaf",
            marginRight: 50,
          },
        ],
      },
      layout: {
        backgroundColor: "#f5fcff",
      },
      bottomTabs: {
        visible: false,
        drawBehind: true,
      },
    };
  }
  constructor(props) {
    super(props);
    Navigation.events().bindComponent(this);
    this.handleUsername = this.handleUsername.bind(this);
    this.state = {
      username: "",
      password: "",
      isLoading: false,
      isUsernameValid: true,
    };
  }

  componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", () => {
      Navigation.pop(this.props.componentId);
      return true;
    });
    Linking.getInitialURL().then(url => {
      console.log(url);
    });
  }

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress");
  }

  _handleOnPressLogin = () => {
    const { componentId, dispatch } = this.props;
    const { password, username } = this.state;

    this.setState({ isLoading: true });

    Login(username, password)
      .then(result => {
        if (result) {
          dispatch(addNewAccount(result));
          Navigation.setStackRoot(componentId, {
            component: {
              name: "navigation.eSteem.PinCode",
              options: {
                topBar: {
                  visible: false,
                },
              },
            },
          });
        }
      })
      .catch(err => {
        alert(err);
        this.setState({ isLoading: false });
      });
  };

  handleUsername = async username => {
    await this.setState({ username });
    const validUsers = await lookupAccounts(username);
    await this.setState({ isUsernameValid: validUsers.includes(username) });
  };

  _handleOnPasswordChange = value => {
    this.setState({ password: value });
  };

  navigationButtonPressed({ buttonId }) {
    if (buttonId === "signup") {
      Linking.openURL("https://signup.steemit.com/?ref=esteem").catch(err =>
        console.error("An error occurred", err)
      );
    }
  }

  loginwithSc2 = () => {
    Navigation.push(this.props.componentId, {
      component: {
        name: "navigation.eSteem.SteemConnect",
        passProps: {},
        options: {
          topBar: {
            title: {
              text: "Login via SC2",
            },
          },
        },
      },
    });
  };

  render() {
    return (
      <View style={{ flex: 1 }}>
        <StatusBar hidden translucent />
        <LoginHeader
          title="Sign in"
          description="To get all the benefits using eSteem"
        />
        <ScrollableTabView
          style={styles.tabView}
          renderTabBar={() => (
            <TabBar
              style={styles.tabbar}
              tabUnderlineDefaultWidth={100} // default containerWidth / (numberOfTabs * 4)
              tabUnderlineScaleX={2} // default 3
              activeColor={"#357ce6"}
              inactiveColor={"#222"}
            />
          )}
        >
          <View tabLabel="Sign in" style={styles.tabbarItem}>
            <FormInput
              rightIconName="md-at"
              leftIconName="md-close-circle"
              isValid={this.state.isUsernameValid}
              onChange={value => this.handleUsername(value)}
              placeholder="Username"
              isEditable
              type="username"
              isFirstImage
              value={this.state.username}
            />
            <FormInput
              rightIconName="md-lock"
              leftIconName="md-close-circle"
              isValid={this.state.isUsernameValid}
              onChange={value => this._handleOnPasswordChange(value)}
              placeholder="Password or WIF"
              isEditable
              secureTextEntry
              type="password"
            />

            <InformationArea
              description="User credentials are kept locally on the device. Credentials are
                removed upon logout!"
              iconName="ios-information-circle-outline"
            />
            <View style={{ flexDirection: "row", margin: 30 }}>
              <View style={{ flex: 0.6 }}>
                <TouchableOpacity
                  onPress={goToAuthScreens}
                  style={{
                    alignContent: "center",
                    padding: "9%",
                  }}
                >
                  <Text
                    style={{
                      color: "#788187",
                      alignSelf: "center",
                      fontWeight: "bold",
                    }}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                onPress={this._handleOnPressLogin}
                style={{
                  flex: 0.4,
                  width: 100,
                  height: 50,
                  borderRadius: 30,
                  backgroundColor: "#357ce6",
                  flexDirection: "row",
                }}
              >
                {!this.state.isLoading ? (
                  <View
                    style={{
                      flex: 1,
                      flexDirection: "row",
                    }}
                  >
                    <Ionicons
                      color="white"
                      name="md-person"
                      style={{
                        alignSelf: "center",
                        fontSize: 25,
                        flex: 0.4,
                        left: 15,
                      }}
                    />
                    <Text
                      style={{
                        color: "white",
                        fontWeight: "600",
                        alignSelf: "center",
                        fontSize: 16,
                        flex: 0.6,
                      }}
                    >
                      LOGIN
                    </Text>
                  </View>
                ) : (
                  <ActivityIndicator
                    color="white"
                    style={{ alignSelf: "center", flex: 1 }}
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>
          <View tabLabel="SteemConnect" style={styles.steemConnectTab}>
            <InformationArea
              description="If you don't want to keep your password encrypted and saved on your device, you can use Steemconnect."
              iconName="ios-information-circle-outline"
            />
            <View
              style={{
                alignItems: "flex-end",
                backgroundColor: "#ffffff",
              }}
            >
              <TouchableOpacity
                onPress={this.loginwithSc2}
                style={{
                  width: 200,
                  height: 50,
                  borderRadius: 30,
                  backgroundColor: "#357ce6",
                  flexDirection: "row",
                  margin: 20,
                }}
              >
                <View style={{ flex: 1, flexDirection: "row" }}>
                  <Ionicons
                    color="white"
                    name="md-person"
                    style={{
                      alignSelf: "center",
                      fontSize: 25,
                      marginHorizontal: 20,
                    }}
                  />
                  <Text
                    style={{
                      color: "white",
                      fontWeight: "400",
                      alignSelf: "center",
                      fontSize: 16,
                    }}
                  >
                    steem
                    <Text style={{ fontWeight: "800" }}>connect</Text>
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollableTabView>
      </View>
    );
  }
}

export default LoginScreen;