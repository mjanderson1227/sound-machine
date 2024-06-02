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
  Alert.alert("An Error occurred", message ?? "An unknown error has occurred.");

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
            : errorResponse.message
        );
      } else {
        alertError();
      }
    }
  }

  return (
    <KeyboardAvoidingView
      className="h-full justify-center bg-white px-8"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Text className="mb-3 text-center text-2xl font-bold">
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
            <Text className="mb-2 font-bold">Email Address</Text>
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
            <Text className="mb-2 font-bold">Password</Text>
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
        className="mb-8 h-12 w-full items-center justify-center rounded-xl bg-slate-800"
      >
        <Text className="text-lg font-bold text-white">Sign up</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}
