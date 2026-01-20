import { OkHiNitro } from './functions'
import type { OkHiException } from './types';

export async function isLocationServicesEnabled(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    OkHiNitro.isLocationServicesEnabled((result, error) => {
      if (typeof result === "boolean") {
        resolve(result)
      } else {
        const err: OkHiException = error || {code: "unknown", message: "unable to retrive result"}
        reject(err)
      }
    })
  });
}

export async function canOpenProtectedApps(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    OkHiNitro.canOpenProtectedApps((result, error) => {
      if (typeof result === "boolean") {
        resolve(result)
      } else {
        const err: OkHiException = error || {code: "unknown", message: "unable to retrive result"}
        reject(err)
      }
    })
  });
}

export async function getLocationAccuracyLevel(): Promise<"precise" | "no_permission" | "approximate"> {
  return new Promise((resolve, reject) => {
    OkHiNitro.getLocationAccuracyLevel((result, error) => {
      if (typeof result === "string") {
        resolve(result.toLowerCase() as any)
      } else {
        const err: OkHiException = error || {code: "unknown", message: "unable to retrive result"}
        reject(err)
      }
    })
  });
}

export async function isBackgroundLocationPermissionGranted(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    OkHiNitro.isBackgroundLocationPermissionGranted((result, error) => {
      if (typeof result === "boolean") {
        resolve(result)
      } else {
        const err: OkHiException = error || {code: "unknown", message: "unable to retrive result"}
        reject(err)
      }
    })
  });
}

export async function isCoarseLocationPermissionGranted(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    OkHiNitro.isCoarseLocationPermissionGranted((result, error) => {
      if (typeof result === "boolean") {
        resolve(result)
      } else {
        const err: OkHiException = error || {code: "unknown", message: "unable to retrive result"}
        reject(err)
      }
    })
  });
}

export async function isFineLocationPermissionGranted(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    OkHiNitro.isFineLocationPermissionGranted((result, error) => {
      if (typeof result === "boolean") {
        resolve(result)
      } else {
        const err: OkHiException = error || {code: "unknown", message: "unable to retrive result"}
        reject(err)
      }
    })
  });
}

export async function isPlayServicesAvailable(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    OkHiNitro.isPlayServicesAvailable((result, error) => {
      if (typeof result === "boolean") {
        resolve(result)
      } else {
        const err: OkHiException = error || {code: "unknown", message: "unable to retrive result"}
        reject(err)
      }
    })
  });
}

export async function isPostNotificationPermissionGranted(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    OkHiNitro.isPostNotificationPermissionGranted((result, error) => {
      if (typeof result === "boolean") {
        resolve(result)
      } else {
        const err: OkHiException = error || {code: "unknown", message: "unable to retrive result"}
        reject(err)
      }
    })
  });
}

export async function openProtectedApps(): Promise<void> {
  return new Promise(() => {
    return OkHiNitro.openProtectedApps()
  });
}

export async function requestBackgroundLocationPermission(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    OkHiNitro.requestBackgroundLocationPermission((result, error) => {
      if (typeof result === "boolean") {
        resolve(result)
      } else {
        const err: OkHiException = error || {code: "unknown", message: "unable to retrive result"}
        reject(err)
      }
    })
  });
}

export async function requestEnableLocationServices(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    OkHiNitro.requestEnableLocationServices((result, error) => {
      if (typeof result === "boolean") {
        resolve(result)
      } else {
        const err: OkHiException = error || {code: "unknown", message: "unable to retrive result"}
        reject(err)
      }
    })
  });
}

export async function requestLocationPermission(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    OkHiNitro.requestLocationPermission((result, error) => {
      if (typeof result === "boolean") {
        resolve(result)
      } else {
        const err: OkHiException = error || {code: "unknown", message: "unable to retrive result"}
        reject(err)
      }
    })
  });
}

export async function requestPostNotificationPermissions(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    OkHiNitro.requestPostNotificationPermissions((result, error) => {
      if (typeof result === "boolean") {
        resolve(result)
      } else {
        const err: OkHiException = error || {code: "unknown", message: "unable to retrive result"}
        reject(err)
      }
    })
  });
}