import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as TaskManager from "expo-task-manager";

export const LOCATION_TASK =
  "background-location-task";

TaskManager.defineTask(
  LOCATION_TASK,
  async ({ data, error }: any) => {

    if (error) {
      console.log(error);
      return;
    }

    if (
      data?.locations?.length
    ) {

      try {

        const user =
          await AsyncStorage.getItem(
            "user"
          );

        const attendanceId =
          await AsyncStorage.getItem(
            "attendanceId"
          );

        if (
          !user ||
          !attendanceId
        ) {
          return;
        }

        const parsedUser =
          JSON.parse(user);

        const location =
          data.locations[0];

        await axios.post(
          "https://kikipie-tracker.vercel.app/api/location/update",
          {
            attendanceId,

            employeeId:
              parsedUser._id,

            latitude:
              location.coords.latitude,

            longitude:
              location.coords.longitude,

            accuracy:
              location.coords.accuracy,
          }
        );

      } catch (err) {

        console.log(
          "Background Tracking Error",
          err
        );
      }
    }
  }
);