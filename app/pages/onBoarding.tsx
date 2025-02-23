import { useNavigation } from "expo-router";
import { useEffect } from "react";
import { Text } from "react-native-paper";

const OnBoarding = () => {
  const navigation = useNavigation();

  useEffect(() => {
    navigation.addListener("beforeRemove", (e) => {
      e.preventDefault();
      // Disable back
    });
  }, []);

  return <Text>Hiiiiiiii</Text>;
};

export default OnBoarding;
