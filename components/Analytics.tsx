"use client";
import { useEffect } from "react";
import * as Ackee from "ackee-tracker";

export default function Analytics() {
  useEffect(() => {
    console.log("✅ Analytics carregado!");

    try {
      const instance = Ackee.create("https://analytic.werioliveira.shop", {
        detailed: false,
        ignoreLocalhost: false,
        ignoreOwnVisits: false,
      });

      // Usar o domainId correto do Ackee
      instance.record("af883d40-7512-46e5-a343-5805ca7fb353")
    } catch (error) {
      console.error("❌ Erro no Ackee:", error);
    }
  }, []);

  return null;
}
