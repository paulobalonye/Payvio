import { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import CountrySelectStep from "./steps/CountrySelectStep";
import RecipientStep from "./steps/RecipientStep";
import AmountStep from "./steps/AmountStep";
import FundingSourceStep from "./steps/FundingSourceStep";
import ConfirmStep from "./steps/ConfirmStep";
import KycScreen from "../auth/KycScreen";
import { api } from "../../api";

type Step = "kyc_check" | "country" | "recipient" | "amount" | "funding" | "confirm";

export default function SendFlowScreen({ navigation }: any) {
  const [step, setStep] = useState<Step>("kyc_check");
  const [country, setCountry] = useState<{ code: string; name: string; currency: string } | null>(null);
  const [recipient, setRecipient] = useState<any>(null);
  const [amount, setAmount] = useState<{ sendAmount: number; rate: any } | null>(null);
  const [fundingSource, setFundingSource] = useState<{ type: string; label: string } | null>(null);

  // Check KYC on mount
  useEffect(() => {
    checkKyc();
  }, []);

  const checkKyc = async () => {
    try {
      const { data } = await api.get("/user/profile");
      if (data.data.kyc_status === "approved") {
        setStep("country");
      }
      // else stays on kyc_check which shows KycScreen
    } catch {
      // stays on kyc_check
    }
  };

  return (
    <View style={styles.container}>
      {step === "kyc_check" && (
        <KycScreen navigation={{
          navigate: (screen: string) => {
            if (screen === "KycStatus") navigation.navigate("KycStatus");
            else if (screen === "Main") setStep("country");
          },
          goBack: () => navigation.goBack(),
        }} />
      )}
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
          onConfirm={(a) => { setAmount(a); setStep("funding"); }}
          onBack={() => setStep("recipient")}
        />
      )}
      {step === "funding" && country && recipient && amount && (
        <FundingSourceStep
          amount={amount.sendAmount}
          onSelect={(source) => { setFundingSource(source); setStep("confirm"); }}
          onBack={() => setStep("amount")}
        />
      )}
      {step === "confirm" && country && recipient && amount && (
        <ConfirmStep
          recipient={recipient}
          amount={amount}
          country={country}
          onSuccess={(transferId) => navigation.navigate("TransferTracking", { transferId })}
          onBack={() => setStep("funding")}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
