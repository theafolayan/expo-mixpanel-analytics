import { useState, useEffect, useCallback } from "react";
import { Platform, Dimensions } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import * as Device from "expo-device";
import { Buffer } from "buffer";

const MIXPANEL_API_URL = "https://api.mixpanel.com";

// Singleton Class
class ExpoMixpanelAnalytics {
  static instance: ExpoMixpanelAnalytics | null = null;
  ready = false;
  token: string;
  storageKey: string;
  userId?: string | null;
  clientId?: string;
  platform?: string;
  model?: string;
  queue: any[] = [];
  constants: { [key: string]: string | number | void } = {};
  superProps: any = {};
  brand?: string;

  private constructor(token: string, storageKey = "mixpanel:super:props") {
    this.storageKey = storageKey;
    this.token = token;
    this.userId = null;
    this.clientId = Constants.deviceId;

    this.constants = {
      app_build_number: Constants.manifest?.revisionId,
      app_id: Constants.manifest?.slug,
      app_name: Constants.manifest?.name,
      app_version_string: Constants.manifest?.version,
      device_name: Constants.deviceName,
      expo_app_ownership: Constants.appOwnership || undefined,
      os_version: Platform.Version,
    };

    Constants.getWebViewUserAgentAsync().then((userAgent) => {
      const { width, height } = Dimensions.get("window");
      Object.assign(this.constants, {
        screen_height: height,
        screen_size: `${width}x${height}`,
        screen_width: width,
        user_agent: userAgent,
      });

      this.brand = Device.brand || undefined;
      this.platform = Platform.OS;
      this.model = Device.modelName || undefined;

      AsyncStorage.getItem(this.storageKey, (_, result) => {
        if (result) {
          try {
            this.superProps = JSON.parse(result) || {};
          } catch {}
        }

        this.ready = true;
        this._flush();
      });
    });
  }

  // Singleton instance
  static getInstance(token: string) {
    if (!ExpoMixpanelAnalytics.instance) {
      ExpoMixpanelAnalytics.instance = new ExpoMixpanelAnalytics(token);
    }
    return ExpoMixpanelAnalytics.instance;
  }

  // Register super properties
  register(props: any) {
    this.superProps = props;
    try {
      AsyncStorage.setItem(this.storageKey, JSON.stringify(props));
    } catch {}
  }

  // Track an event
  track(name: string, props?: any) {
    this.queue.push({ name, props });
    this._flush();
  }

  // Identify user
  identify(userId?: string) {
    this.userId = userId;
  }

  // Reset user and super properties
  reset() {
    this.identify(this.clientId);
    try {
      AsyncStorage.setItem(this.storageKey, JSON.stringify({}));
    } catch {}
  }

  // People methods for managing user profiles
  peopleSet(props: any) {
    this._people("set", props);
  }

  _people(operation: string, props: any) {
    if (this.userId) {
      const data = {
        $token: this.token,
        $distinct_id: this.userId,
      };
      data[`$${operation}`] = props;
      this._pushProfile(data);
    }
  }

  _flush() {
    if (this.ready) {
      while (this.queue.length) {
        const event = this.queue.pop();
        this._pushEvent(event).then(() => (event.sent = true));
      }
    }
  }

  _pushEvent(event: any) {
    const data = {
      event: event.name,
      properties: {
        ...this.constants,
        ...(event.props || {}),
        ...this.superProps,
      },
    };

    if (this.userId) {
      data.properties.distinct_id = this.userId;
    }

    data.properties.token = this.token;
    data.properties.client_id = this.clientId;
    data.properties.platform = this.platform;
    data.properties.model = this.model;

    const buffer = new Buffer(JSON.stringify(data)).toString("base64");
    return fetch(`${MIXPANEL_API_URL}/track/?data=${buffer}`);
  }

  _pushProfile(data: any) {
    const buffer = new Buffer(JSON.stringify(data)).toString("base64");
    return fetch(`${MIXPANEL_API_URL}/engage/?data=${buffer}`);
  }
}

// Hooks API
const useExpoMixpanelAnalytics = (
  token: string,
  storageKey = "mixpanel:super:props"
) => {
  const [mixpanelInstance, setMixpanelInstance] =
    useState<ExpoMixpanelAnalytics | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const instance = ExpoMixpanelAnalytics.getInstance(token);
    setMixpanelInstance(instance);

    if (instance.ready) {
      setReady(true);
    }
  }, [token]);

  const register = useCallback(
    (props: any) => {
      if (mixpanelInstance) {
        mixpanelInstance.register(props);
      }
    },
    [mixpanelInstance]
  );

  const track = useCallback(
    (name: string, props?: any) => {
      if (mixpanelInstance) {
        mixpanelInstance.track(name, props);
      }
    },
    [mixpanelInstance]
  );

  const identify = useCallback(
    (userId: string) => {
      if (mixpanelInstance) {
        mixpanelInstance.identify(userId);
      }
    },
    [mixpanelInstance]
  );

  const reset = useCallback(() => {
    if (mixpanelInstance) {
      mixpanelInstance.reset();
    }
  }, [mixpanelInstance]);

  const peopleSet = useCallback(
    (props: any) => {
      if (mixpanelInstance) {
        mixpanelInstance.peopleSet(props);
      }
    },
    [mixpanelInstance]
  );

  return {
    ready,
    register,
    track,
    identify,
    reset,
    peopleSet,
  };
};

export { ExpoMixpanelAnalytics, useExpoMixpanelAnalytics };
