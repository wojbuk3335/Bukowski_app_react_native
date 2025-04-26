import { Text, TouchableOpacity } from "react-native";

const CustomButton = ({
  title,
  handlePress,
  containerStyles,
  textStyles,
  isLoading,
}) => {
  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      className={`rounded-xl min-h-[62px] flex flex-row justify-center items-center ${containerStyles} ${isLoading ? "opacity-50" : ""}`}
      style={{ backgroundColor: "#0d6efd" }} // Dodano styl z kolorem tła
      disabled={isLoading}
    >
      <Text className={`font-psemibold text-lg ${textStyles}`} style={{ color: "#ffffff" }}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default CustomButton;
