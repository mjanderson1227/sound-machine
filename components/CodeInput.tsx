import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useRef, useState } from "react";

const styles = StyleSheet.create({
  inputBox: {
    borderWidth: 3,
    width: 50,
    height: 50,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default function CodeInput({
  onVerify,
}: {
  onVerify: (code: string) => () => Promise<void>;
}) {
  const [code, setCode] = useState<string[]>([...new Array(6)].map(() => ""));
  const refList = useRef<TextInput[]>([...new Array(6)]);

  const updateCode = (idx: number, text: string) => {
    setCode((previousCode) =>
      previousCode.map((prevText, curIndex) =>
        curIndex === idx ? text : prevText,
      ),
    );
  };

  // Partially apply the index of the input element on the onChange callback
  const handleTextChange = (idx: number) => (text: string) => {
    const { current } = refList;
    updateCode(idx, text);

    if (text.length && idx + 1 < current.length) current[idx + 1].focus();
  };

  return (
    <View>
      <Text className="text-center text-3xl mb-2 font-bold">
        Enter Verification Code
      </Text>
      <Text className="text-center mb-10 text-xl">
        Please enter the verification code that was sent to your email.
      </Text>
      <View className="flex-row justify-between mb-10">
        {code.map((_, idx) => (
          <View style={styles.inputBox} key={idx}>
            <TextInput
              keyboardType="number-pad"
              caretHidden={true}
              className="h-full w-full text-center text-3xl font-bold"
              maxLength={1}
              value={code[idx]}
              ref={(element) => (refList.current[idx] = element as TextInput)}
              onKeyPress={({ nativeEvent: { key: keyName } }) => {
                if (keyName === "Backspace" && idx - 1 >= 0)
                  refList.current[idx - 1].focus();
              }}
              onFocus={() => updateCode(idx, "")}
              onChangeText={handleTextChange(idx)}
            />
          </View>
        ))}
      </View>
      <TouchableOpacity
        onPress={onVerify(code.join(""))}
        className="bg-slate-800 w-full h-12 items-center justify-center rounded-xl"
      >
        <Text className="text-lg text-white font-bold">Verify</Text>
      </TouchableOpacity>
    </View>
  );
}
