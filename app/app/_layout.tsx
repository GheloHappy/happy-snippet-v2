import { Stack } from "expo-router";

export default function RootLayout() {
  return (
      //<Provider store={store}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            {/*<Stack.Screen name="(app)" />*/}
          </Stack>
          //<Toast config={toastConfig} />
      //</Provider>
  );
}