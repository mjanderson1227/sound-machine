import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Keyboard,
  Alert,
  TouchableWithoutFeedback,
  Platform,
} from "react-native";
import { Link } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { isClerkAPIResponseError, useSignUp } from "@clerk/clerk-expo";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import CodeInput from "@/components/CodeInput";

const styles = StyleSheet.create({
  inputBox: {
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 2,
    marginBottom: 35,
    minWidth: Math.floor(Dimensions.get("window").width / 1.2),
    minHeight: 35,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  viewLine: {
    borderTopColor: "black",
    borderTopWidth: 1,
    minWidth: 100,
    position: "relative",
    top: 8,
  },
});

const alertError = (message?: string) =>
  Alert.alert("An Error occurred", message);

const formSchema = z.object({
  firstName: z.string().max(100).min(1),
  lastName: z.string().max(100).min(1),
  emailAddress: z.string().email().max(100).min(4),
  password: z.string().max(100).min(8),
});

export default function SignUpPage() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [pendingVerification, setPendingVerification] = useState(true);
  const [code, setCode] = useState("");
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  // start the sign up process.
  const onSignUpPress = async ({
    firstName,
    lastName,
    emailAddress,
    password,
  }: z.infer<typeof formSchema>) => {
    if (!isLoaded) {
      return;
    }

    try {
      await signUp.create({
        firstName,
        lastName,
        emailAddress,
        password,
      });

      console.log("SignUp object created");

      // send the email.
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      // change the UI to our pending section.
      setPendingVerification(true);
    } catch (err: unknown) {
      if (isClerkAPIResponseError(err)) {
        const errorResponse = err.errors[0];
        alertError(
          errorResponse.message === "is unknown"
            ? errorResponse.longMessage
            : errorResponse.message,
        );
      } else {
        alertError("An unknown error has occurred");
      }
    }
  };

  const onPressVerify = async () => {
    if (!isLoaded) {
      return;
    }

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      await setActive({ session: completeSignUp.createdSessionId });
    } catch (err: unknown) {
      console.error(JSON.stringify(err, null, 2));
    }
  };

  return (
    <KeyboardAvoidingView
      className="bg-white h-full rounded-xl text-black px-10 pt-10 justify-center"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {!pendingVerification ? (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View>
            <Text className="mb-3 text-2xl font-bold text-center">
              Sign up for Serenity
            </Text>
            <Text className="mb-10 text-center">
              Welcome! Please create an account to continue
            </Text>
            <Controller
              name="firstName"
              control={control}
              render={({ field: { onChange, value, onBlur } }) => (
                <View>
                  <Text className="font-bold mb-2">First Name</Text>
                  <View style={styles.inputBox}>
                    <TextInput
                      className="w-full"
                      onChangeText={onChange}
                      onBlur={onBlur}
                      autoFocus={true}
                      autoComplete="given-name"
                      value={value}
                    ></TextInput>
                  </View>
                </View>
              )}
            />
            <Controller
              name="lastName"
              control={control}
              render={({ field: { onChange, value, onBlur } }) => (
                <View>
                  <Text className="font-bold mb-2">Last Name</Text>
                  <View style={styles.inputBox}>
                    <TextInput
                      className="w-full"
                      onChangeText={onChange}
                      onBlur={onBlur}
                      autoComplete="family-name"
                      value={value}
                    ></TextInput>
                  </View>
                </View>
              )}
            />
            <Controller
              name="emailAddress"
              control={control}
              render={({ field: { onChange, value, onBlur } }) => (
                <View>
                  <Text className="font-bold mb-2">Email Address</Text>
                  <View style={styles.inputBox}>
                    <TextInput
                      className="w-full"
                      onChangeText={onChange}
                      onBlur={onBlur}
                      value={value}
                      autoComplete="email"
                      keyboardType="email-address"
                    ></TextInput>
                  </View>
                </View>
              )}
            />
            <Controller
              name="password"
              control={control}
              render={({ field: { onChange, value, onBlur } }) => (
                <View>
                  <Text className="font-bold mb-2">Password</Text>
                  <View style={styles.inputBox}>
                    <TextInput
                      className="w-full"
                      onChangeText={onChange}
                      onBlur={onBlur}
                      value={value}
                      autoComplete="password-new"
                    ></TextInput>
                  </View>
                </View>
              )}
            />
            <TouchableOpacity
              onPress={handleSubmit(onSignUpPress)}
              className="mb-8 bg-slate-800 w-full h-12 items-center justify-center rounded-xl"
            >
              <Text className="text-white font-bold text-lg">Sign up</Text>
            </TouchableOpacity>
            <View className="flex-row justify-center gap-2 mb-8">
              <View style={styles.viewLine} />
              <Text className="font-bold">or</Text>
              <View style={styles.viewLine} />
            </View>
            <View className="font-bold text-lg bg-slate-800 w-full h-12 rounded-xl justify-center items-center">
              <Link href="/login" className="text-white font-bold text-lg">
                Log in
              </Link>
            </View>
          </View>
        </TouchableWithoutFeedback>
      ) : (
        <View className="text-center">
          <CodeInput />
        </View>
      )}
    </KeyboardAvoidingView>
  );
}
