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
import { Link, useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { isClerkAPIResponseError, useSignUp } from "@clerk/clerk-expo";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import CodeInput from "@/components/CodeInput";
import { ErrorMessage } from "@hookform/error-message";

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

type SignUpData = z.infer<typeof formSchema>;

export default function SignUpPage() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [pendingVerification, setPendingVerification] = useState(false);
  const router = useRouter();

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SignUpData>({
    resolver: zodResolver(formSchema),
  });

  // start the sign up process.
  const onSignUpPress = async ({
    firstName,
    lastName,
    emailAddress,
    password,
  }: SignUpData) => {
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
            : errorResponse.message
        );
      } else {
        alertError("An unknown error has occurred");
      }
    }
  };

  const onPressVerify = (code: string) => async () => {
    if (!isLoaded) {
      return;
    }

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      await setActive({ session: completeSignUp.createdSessionId });
      router.push("/");
    } catch (err: unknown) {
      console.error(JSON.stringify(err, null, 2));
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} className="h-full">
      <KeyboardAvoidingView
        className="h-full justify-center rounded-xl bg-white px-10 pt-10 text-black"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {!pendingVerification ? (
          <View>
            <Text className="mb-3 text-center text-2xl font-bold">
              Sign up for Serenity
            </Text>
            <Text className="mb-10 text-center">
              Welcome! Please create an account to continue
            </Text>
            <Controller
              name="firstName"
              control={control}
              render={({ field: { onChange, value, onBlur, name } }) => (
                <View>
                  <View className="mb-2 flex-row justify-between">
                    <Text className="font-bold">First Name</Text>
                    <ErrorMessage
                      name={name}
                      errors={errors}
                      render={({ message }) => (
                        <Text className="mb-2 text-red-500">{message}</Text>
                      )}
                    />
                  </View>
                  <View style={styles.inputBox}>
                    <TextInput
                      className="w-full"
                      onChangeText={onChange}
                      onBlur={onBlur}
                      autoComplete="given-name"
                      value={value}
                    />
                  </View>
                </View>
              )}
            />
            <Controller
              name="lastName"
              control={control}
              render={({ field: { onChange, value, onBlur, name } }) => (
                <View>
                  <View className="mb-2 flex-row justify-between">
                    <Text className="font-bold">Last Name</Text>
                    <ErrorMessage
                      name={name}
                      errors={errors}
                      render={({ message }) => (
                        <Text className="mb-2 text-red-500">{message}</Text>
                      )}
                    />
                  </View>
                  <View style={styles.inputBox}>
                    <TextInput
                      className="w-full"
                      onChangeText={onChange}
                      onBlur={onBlur}
                      autoComplete="family-name"
                      value={value}
                    />
                  </View>
                </View>
              )}
            />
            <Controller
              name="emailAddress"
              control={control}
              render={({ field: { onChange, value, onBlur, name } }) => (
                <View>
                  <View className="mb-2 flex-row justify-between">
                    <Text className="font-bold">Email Address</Text>
                    <ErrorMessage
                      name={name}
                      errors={errors}
                      render={({ message }) => (
                        <Text className="mb-2 text-red-500">{message}</Text>
                      )}
                    />
                  </View>
                  <View style={styles.inputBox}>
                    <TextInput
                      className="w-full"
                      onChangeText={onChange}
                      onBlur={onBlur}
                      value={value}
                      autoComplete="email"
                      keyboardType="email-address"
                    />
                  </View>
                </View>
              )}
            />
            <Controller
              name="password"
              control={control}
              render={({ field: { onChange, value, onBlur, name } }) => (
                <View>
                  <View className="mb-2 flex-row justify-between">
                    <Text className="font-bold">Password</Text>
                    <ErrorMessage
                      name={name}
                      errors={errors}
                      render={({ message }) => (
                        <Text className="mb-2 text-red-500">{message}</Text>
                      )}
                    />
                  </View>
                  <View style={styles.inputBox}>
                    <TextInput
                      className="w-full"
                      onChangeText={onChange}
                      onBlur={onBlur}
                      value={value}
                      autoComplete="password-new"
                    />
                  </View>
                </View>
              )}
            />
            <TouchableOpacity
              onPress={handleSubmit(onSignUpPress)}
              className="mb-8 h-12 w-full items-center justify-center rounded-xl bg-slate-800 font-bold"
            >
              <Text className="text-lg font-bold text-white">Sign up</Text>
            </TouchableOpacity>
            <View className="mb-8 flex-row justify-center gap-2">
              <View style={styles.viewLine} />
              <Text className="font-bold">or</Text>
              <View style={styles.viewLine} />
            </View>
            <View className="h-12 w-full items-center justify-center rounded-xl bg-slate-800 pt-3 text-lg font-bold text-white">
              <Link
                href="/login"
                className="h-full w-full text-center text-lg font-bold text-white"
              >
                <Text>Log in</Text>
              </Link>
            </View>
          </View>
        ) : (
          <CodeInput onVerify={onPressVerify} />
        )}
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}
