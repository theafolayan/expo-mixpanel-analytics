# Expo Mixpanel Analytics

**Up to date** Mixpanel integration for use with React Native apps built on Expo.

A comprehensive analytics integration for React Native and Expo apps, allowing seamless connection to Mixpanel. This package provides developers with the flexibility to choose between a hook-based API or a singleton approach for tracking events, identifying users, and managing user profiles.

With automatic device information capture, support for super properties, and an easy-to-use interface that simplifies integrating Mixpanel into your mobile applications.

## Key Features

- Supports both React hooks and traditional singleton APIs.
- Track user events, identify users, and manage profile information.
- Automatically collects device details such as platform, screen size, OS version, and more.
- Persistent super properties across all tracked events.
Easily integrates with Expo and React Native environments.

### Credits

Forked from `@bothrs/expo-mixpanel-analytics` to add support for expo SDK 50 & Above.

## Installation

```bash
npx expo install @theafolayan/expo-mixpanel-analytics --save
```

## Default Parameters

Your React Native app's screen resolution, app name, app ID, app version, device information and multiple other parameters will be automatically resolved and sent with each event.

## Explanation

- Singleton Class (`ExpoMixpanelAnalytics`): This provides global access to Mixpanel's core methods like `track()`, `identify()`, `reset()`, and `peopleSet()`. It's initialized only once and shared throughout the app.

- Hooks API (`useExpoMixpanelAnalytics`): The hook wraps around the singleton, allowing you to use Mixpanel's features within a functional component. The hook initializes the singleton and provides functions like `track()`, `identify()`, and `reset()`.

## Usage

## Singleton Usage

```javascript
import { ExpoMixpanelAnalytics } from "@theafolayan/expo-mixpanel-analytics";

// Get the singleton instance
const mixpanel = ExpoMixpanelAnalytics.getInstance("your_mixpanel_token");

// Track an event
mixpanel.track("ButtonClicked", { button_name: "Submit" });

// Identify a user
mixpanel.identify("user_12345");

// Set user profile properties
mixpanel.peopleSet({ plan: "Pro", last_login: new Date() });

// Reset user identity and clear super properties
mixpanel.reset();


```

## 2. Hooks Usage

```javascript
import React, { useEffect } from "react";
import { View, Button } from "react-native";
import { useExpoMixpanelAnalytics } from "@theafolayan/expo-mixpanel-analytics";

const MyApp = () => {
  const { ready, track, identify, peopleSet, reset } = useExpoMixpanelAnalytics("your_mixpanel_token");

  useEffect(() => {
    if (ready) {
      // Identify the user
      identify("user_12345");

      // Track an event
      track("AppLoaded");

      // Set user profile properties
      peopleSet({ plan: "Pro", login_count: 1 });
    }
  }, [ready, track, identify, peopleSet]);

  return (
    <View>
      <Button title="Track Purchase" onPress={() => track("Purchase", { product: "Shoes", price: 99.99 })} />
      <Button title="Reset User" onPress={reset} />
    </View>
  );
};

export default MyApp;

```

## API

### Singleton API

- `track(eventName: string, props?: object)`: Tracks an event with optional properties.
- `identify(userId: string)`: Identifies the user for Mixpanel tracking.
- `register(superProps: object)`: Registers super properties that are included with every event.

- `reset()`: Resets the user identity and clears super properties.
- `peopleSet(props: object)`: Sets user profile properties.

## Hooks API

- `track(eventName: string, props?: object`): Tracks an event with optional properties.
- `identify(userId: string)`: Identifies the user for Mixpanel tracking.
- `register(superProps: object)`: Registers super properties that are included with every event.
- `reset()`: Resets the user identity and clears super properties.
- `peopleSet(props: object)`: Sets user profile properties.
- `ready: boolean`: Indicates if Mixpanel is initialized and ready.

## References

[Mixpanel HTTP API Reference](https://developer.mixpanel.com/reference/overview)
