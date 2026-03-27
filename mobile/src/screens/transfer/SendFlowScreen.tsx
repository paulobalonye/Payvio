import { useState } from "react";
import { View, StyleSheet } from "react-native";
import CountrySelectStep from "./steps/CountrySelectStep";
import RecipientStep from "./steps/RecipientStep";
import AmountStep from "./steps/AmountStep";
import ConfirmStep from "./steps/ConfirmStep";

type Step = "country" | "recipient" | "amount" | "confirm";

export default function SendFlowScreen({ navigation }: any) {
  const [step, setStep] = useState<Step>("country");
  const [country, setCountry] = useState<{ code: string; name: string; currency: string } | null>(null);
  const [recipient, setRecipient] = useState<any>(null);
  const [amount, setAmount] = useState<{ sendAmount: number; rate: any } | null>(null);

  return (
    <View style={styles.container}>
      {step === "country" && (
        <CountrySelectStep
          onSelect={(c) => { setCountry(c); setStep("recipient"); }}
          onBack={() => navigation.goBack()}
        />
      )}
      {step === "recipient" && country && (
        <RecipientStep
          country={country}
          onSelect={(r) => { setRecipient(r); setStep("amount"); }}
          onBack={() => setStep("country")}
        />
      )}
      {step === "amount" && country && recipient && (
        <AmountStep
          country={country}
          onConfirm={(a) => { setAmount(a); setStep("confirm"); }}
          onBack={() => setStep("recipient")}
        />
      )}
      {step === "confirm" && country && recipient && amount && (
        <ConfirmStep
          recipient={recipient}
          amount={amount}
          country={country}
          onSuccess={(transferId) => navigation.navigate("TransferTracking", { transferId })}
          onBack={() => setStep("amount")}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
