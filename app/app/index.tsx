import {Animated, Text} from "react-native";
import View = Animated.View;
import "../global.css"

export default function Login() {
    return (
        <>
            <View className="flex-1 items-center justify-center w-full">
                <Text className="text-2xl font-bold">Login</Text>
            </View>
        </>
    )
}