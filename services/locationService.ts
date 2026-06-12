import * as Location from "expo-location";

import {
    LOCATION_TASK,
} from "../tasks/backgroundLocation";

export async function startBackgroundTracking() {

  const permission =
    await Location.requestForegroundPermissionsAsync();

  if (
    permission.status !==
    "granted"
  ) {
    throw new Error(
      "Location permission denied"
    );
  }

  const backgroundPermission =
    await Location.requestBackgroundPermissionsAsync();

  if (
    backgroundPermission.status !==
    "granted"
  ) {
    throw new Error(
      "Background permission denied"
    );
  }

  const alreadyStarted =
    await Location.hasStartedLocationUpdatesAsync(
      LOCATION_TASK
    );

  if (
    alreadyStarted
  ) {
    return;
  }

  await Location.startLocationUpdatesAsync(
    LOCATION_TASK,
    {
      accuracy:
        Location.Accuracy.BestForNavigation,

      timeInterval:
        15000,

      distanceInterval:
        10,

      showsBackgroundLocationIndicator:
        true,

      foregroundService: {
        notificationTitle:
          "Kikipie Tracker Running",

        notificationBody:
          "Location tracking is active",

        notificationColor:
          "#C8102E",
      },
    }
  );
}

export async function stopBackgroundTracking() {

  const started =
    await Location.hasStartedLocationUpdatesAsync(
      LOCATION_TASK
    );

  if (
    started
  ) {

    await Location.stopLocationUpdatesAsync(
      LOCATION_TASK
    );
  }
}