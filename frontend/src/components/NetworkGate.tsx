"use client";

import { useEffect, useRef } from "react";
import { useAccount, useChainId, useSwitchChain, useWalletClient } from "wagmi";
import { monadTestnet } from "@/lib/chain";

export function NetworkGate() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const { data: walletClient } = useWalletClient();
  const didPromptRef = useRef(false);

  useEffect(() => {
    if (!isConnected) return;
    if (chainId === monadTestnet.id) return;
    if (didPromptRef.current) return;

    didPromptRef.current = true;

    (async () => {
      try {
        await switchChainAsync({ chainId: monadTestnet.id });
      } catch (err: unknown) {
        const anyErr = err as { code?: number };
        const needsAdd = anyErr?.code === 4902;
        if (!needsAdd || !walletClient) return;

        const rpcUrl =
          process.env.NEXT_PUBLIC_MONAD_RPC || "https://testnet-rpc.monad.xyz";

        await walletClient.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: `0x${monadTestnet.id.toString(16)}`,
              chainName: monadTestnet.name,
              nativeCurrency: monadTestnet.nativeCurrency,
              rpcUrls: [rpcUrl],
            },
          ],
        });
      }
    })();
  }, [chainId, isConnected, switchChainAsync, walletClient]);

  return null;
}
