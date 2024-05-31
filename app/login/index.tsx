import {
  TouchableOpacity,
  Dimensions,
  View,
  TextInput,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { isClerkAPIResponseError, useSignIn } from "@clerk/clerk-expo";

const loginSchema = z.object({
  emailAddress: z.string().email().max(100).min(4),
  password: z.string().max(100).min(8),
});

const styles = StyleSheet.create({
  inputBox: {
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 2,
    marginBottom: 35,
    maxWidth: Math.floor(Dimensions.get("window").width / 1.2),
    minHeight: 35,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
});

type LoginData = z.infer<typeof loginSchema>;

const alertError = (message?: string) =>
  Alert.alert("An Error occurred", message);

export default function LoginPage() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  });

  async function onSignIn({ password, emailAddress }: LoginData) {
    if (!isLoaded) {
      return;
    }

    try {
      const signInSession = await signIn.create({
        identifier: emailAddress,
        password,
      });

      await setActive({ session: signInSession.createdSessionId });
    } catch (err: unknown) {
      if (isClerkAPIResponseError(err)) {
        const errorResponse = err.errors[0];
        alertError(
          errorResponse.message === "is unknown"
            ? errorResponse.longMessage
            : errorResponse.message,
        );
      } else {
        alertError("An unknown error has occurred.");
      }
    }
  }

  return (
    <KeyboardAvoidingView
      className="bg-white h-full justify-center px-8"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Text className="mb-3 text-2xl font-bold text-center">
        Sign in to Serenity
      </Text>
      <Text className="mb-10 text-center">
        Welcome back! Please sign in to your account to continue.
      </Text>
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
              />
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
              />
            </View>
          </View>
        )}
      />
      <TouchableOpacity
        onPress={handleSubmit(onSignIn)}
        className="mb-8 bg-slate-800 w-full h-12 items-center justify-center rounded-xl"
      >
        <Text className="text-white font-bold text-lg">Sign up</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}
