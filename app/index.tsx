import React, { useState } from "react";
import {
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { router } from "expo-router";

export default function LoginScreen() {
  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const login = async () => {
    try {

      setLoading(true);

      const res =
        await axios.post(
          "https://kikipie-tracker.vercel.app/api/login",
          {
            email,
            password,
          }
        );

      const user =
        res.data.user;

      await AsyncStorage.setItem(
        "user",
        JSON.stringify(user)
      );

      router.replace(
        "/dashboard"
      );

    } catch (error: any) {

      Alert.alert(
        "Login Failed",
        error?.response?.data?.message ||
          "Something went wrong"
      );

    } finally {

      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>

      <Text style={styles.title}>
        Kikipie Tracker
      </Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={login}
      >
        <Text style={styles.buttonText}>
          {
            loading
              ? "Please Wait..."
              : "Login"
          }
        </Text>
      </TouchableOpacity>

    </View>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent:
        "center",
      padding: 25,
      backgroundColor:
        "#f1f5f9",
    },

    title: {
      fontSize: 32,
      fontWeight:
        "bold",
      textAlign:
        "center",
      marginBottom: 40,
      color: "#C8102E",
    },

    input: {
      backgroundColor:
        "#fff",
      borderWidth: 1,
      borderColor:
        "#ddd",
      padding: 15,
      borderRadius: 10,
      marginBottom: 15,
    },

    button: {
      backgroundColor:
        "#C8102E",
      padding: 15,
      borderRadius: 10,
    },

    buttonText: {
      color: "#fff",
      textAlign:
        "center",
      fontWeight:
        "bold",
      fontSize: 18,
    },
  });