import React, {
    useEffect,
    useRef,
    useState,
} from "react";

import {
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as Location from "expo-location";
import { router } from "expo-router";

export default function Dashboard() {

  const [user, setUser] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(false);

  const [attendanceId, setAttendanceId] =
    useState("");

  const [currentLocation, setCurrentLocation] =
    useState("Waiting for GPS...");

  const locationSubscription =
    useRef<any>(null);

  useEffect(() => {

    loadUser();
    loadAttendance();

    return () => {

      if (
        locationSubscription.current
      ) {

        locationSubscription.current.remove();
      }
    };

  }, []);

  const loadUser =
    async () => {

      const storedUser =
        await AsyncStorage.getItem(
          "user"
        );

      if (
        storedUser
      ) {

        setUser(
          JSON.parse(
            storedUser
          )
        );
      }
    };

  const loadAttendance =
    async () => {

      const storedAttendance =
        await AsyncStorage.getItem(
          "attendanceId"
        );

      if (
        storedAttendance
      ) {

        setAttendanceId(
          storedAttendance
        );
      }
    };

  const startLocationTracking =
    async (
      attendanceIdValue: string,
      employeeId: string
    ) => {

      const permission =
        await Location.requestForegroundPermissionsAsync();

      if (
        permission.status !==
        "granted"
      ) {

        Alert.alert(
          "Permission Denied",
          "Location Permission Required"
        );

        return;
      }

      locationSubscription.current =
        await Location.watchPositionAsync(
          {
            accuracy:
              Location.Accuracy.High,
            timeInterval: 10000,
            distanceInterval: 10,
          },

          async (
            location
          ) => {

            const lat =
              location.coords.latitude;

            const lng =
              location.coords.longitude;

            const accuracy =
              location.coords.accuracy;

            setCurrentLocation(
              `${lat}, ${lng}`
            );

            try {

              await axios.post(
                "https://kikipie-tracker.vercel.app/api/location/update",
                {
                  attendanceId:
                    attendanceIdValue,

                  employeeId,

                  latitude:
                    lat,

                  longitude:
                    lng,

                  accuracy,
                }
              );

            } catch (
              error
            ) {

              console.log(
                error
              );
            }
          }
        );
    };

  const startDuty =
    async () => {

      try {

        if (!user) return;

        setLoading(true);

        const res =
          await axios.post(
            "https://kikipie-tracker.vercel.app/api/attendance/start",
            {
              employeeId:
                user._id,
            }
          );

        const id =
          res.data.attendance._id;

        await AsyncStorage.setItem(
          "attendanceId",
          id
        );

        setAttendanceId(
          id
        );

        await startLocationTracking(
          id,
          user._id
        );

        Alert.alert(
          "Success",
          "Duty Started Successfully"
        );

      } catch (error) {

        console.log(
          error
        );

        Alert.alert(
          "Error",
          "Unable To Start Duty"
        );

      } finally {

        setLoading(false);
      }
    };

  const endDuty =
    async () => {

      try {

        if (
          !attendanceId
        ) return;

        await axios.post(
          "https://kikipie-tracker.vercel.app/api/attendance/end",
          {
            attendanceId,
          }
        );

        if (
          locationSubscription.current
        ) {

          locationSubscription.current.remove();
        }

        await AsyncStorage.removeItem(
          "attendanceId"
        );

        setAttendanceId("");

        Alert.alert(
          "Success",
          "Duty Ended"
        );

      } catch (error) {

        console.log(
          error
        );
      }
    };

  const logout =
    async () => {

      await AsyncStorage.removeItem(
        "user"
      );

      await AsyncStorage.removeItem(
        "attendanceId"
      );

      router.replace(
        "/"
      );
    };

  return (
    <View style={styles.container}>

      <Text style={styles.title}>
        Employee Dashboard
      </Text>

      <View style={styles.card}>

        <Text style={styles.name}>
          {user?.name}
        </Text>

        <Text style={styles.email}>
          {user?.email}
        </Text>

      </View>

      <View style={styles.statusCard}>

        <Text style={styles.statusLabel}>
          Duty Status
        </Text>

        <Text
          style={{
            fontSize: 22,
            fontWeight: "bold",
            color:
              attendanceId
                ? "green"
                : "red",
          }}
        >
          {
            attendanceId
              ? "ON DUTY"
              : "OFF DUTY"
          }
        </Text>

      </View>

      <View style={styles.locationCard}>

        <Text style={styles.locationTitle}>
          Current Location
        </Text>

        <Text>
          {currentLocation}
        </Text>

      </View>

      <TouchableOpacity
        style={
          styles.greenButton
        }
        onPress={
          startDuty
        }
      >
        <Text
          style={
            styles.buttonText
          }
        >
          {
            loading
              ? "Please Wait..."
              : "Start Duty"
          }
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={
          styles.orangeButton
        }
        onPress={
          endDuty
        }
      >
        <Text
          style={
            styles.buttonText
          }
        >
          End Duty
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={
          styles.redButton
        }
        onPress={
          logout
        }
      >
        <Text
          style={
            styles.buttonText
          }
        >
          Logout
        </Text>
      </TouchableOpacity>

    </View>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      justifyContent:
        "center",
      backgroundColor:
        "#f1f5f9",
    },

    title: {
      fontSize: 30,
      fontWeight:
        "bold",
      textAlign:
        "center",
      color: "#C8102E",
      marginBottom: 20,
    },

    card: {
      backgroundColor:
        "#fff",
      padding: 20,
      borderRadius: 15,
      marginBottom: 20,
    },

    statusCard: {
      backgroundColor:
        "#fff",
      padding: 20,
      borderRadius: 15,
      marginBottom: 20,
      alignItems:
        "center",
    },

    locationCard: {
      backgroundColor:
        "#fff",
      padding: 20,
      borderRadius: 15,
      marginBottom: 20,
    },

    locationTitle: {
      fontWeight:
        "bold",
      marginBottom: 10,
    },

    statusLabel: {
      fontSize: 16,
      color: "#666",
      marginBottom: 10,
    },

    name: {
      fontSize: 24,
      fontWeight:
        "bold",
      color: "#000",
    },

    email: {
      marginTop: 5,
      fontSize: 16,
      color: "#555",
    },

    greenButton: {
      backgroundColor:
        "green",
      padding: 15,
      borderRadius: 12,
      marginBottom: 15,
    },

    orangeButton: {
      backgroundColor:
        "orange",
      padding: 15,
      borderRadius: 12,
      marginBottom: 15,
    },

    redButton: {
      backgroundColor:
        "#C8102E",
      padding: 15,
      borderRadius: 12,
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