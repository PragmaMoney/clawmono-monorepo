"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Rnd } from "react-rnd";

type LogEntry = { ts: string; text: string };

export default function SimulationPage() {
  type NodeKey = "agentA" | "agentB" | "gateway" | "smartA" | "smartB" | "poolA" | "poolB";
  const DEFAULT_SERVICE_ID =
    "0x0f03bb4150e3ecc7282c9b267aebb306c541e54e7ed8274defa5afaa1a397275";
  const DEFAULT_SERVICE_URL = "https://sim.example.com/api";
  const [agentAReady, setAgentAReady] = useState(false);
  const [agentBReady, setAgentBReady] = useState(false);
  const [agentAInitializing, setAgentAInitializing] = useState(false);
  const [agentBInitializing, setAgentBInitializing] = useState(false);
  const [agentARegistering, setAgentARegistering] = useState(false);
  const [agentBRegistering, setAgentBRegistering] = useState(false);
  const [agentASeeding, setAgentASeeding] = useState(false);
  const [agentBSeeding, setAgentBSeeding] = useState(false);
  const [agentAServiceRegistering, setAgentAServiceRegistering] = useState(false);
  const [agentBServiceRegistering, setAgentBServiceRegistering] = useState(false);
  const [agentASmartVisible, setAgentASmartVisible] = useState(false);
  const [agentBSmartVisible, setAgentBSmartVisible] = useState(false);
  const [agentAPoolVisible, setAgentAPoolVisible] = useState(false);
  const [agentBPoolVisible, setAgentBPoolVisible] = useState(false);
  const [agentAEoa, setAgentAEoa] = useState<string | null>(null);
  const [agentASmartAccount, setAgentASmartAccount] = useState<string | null>(null);
  const [agentAId, setAgentAId] = useState<string | null>(null);
  const [agentAServiceId, setAgentAServiceId] = useState<string | null>(DEFAULT_SERVICE_ID);
  const [agentAServiceUrl, setAgentAServiceUrl] = useState<string | null>(DEFAULT_SERVICE_URL);
  const [agentAPool, setAgentAPool] = useState<string | null>(null);
  const [agentBEoa, setAgentBEoa] = useState<string | null>(null);
  const [agentBSmartAccount, setAgentBSmartAccount] = useState<string | null>(null);
  const [agentBId, setAgentBId] = useState<string | null>(null);
  const [agentBServiceId, setAgentBServiceId] = useState<string | null>(DEFAULT_SERVICE_ID);
  const [agentBServiceUrl, setAgentBServiceUrl] = useState<string | null>(DEFAULT_SERVICE_URL);
  const [agentBPool, setAgentBPool] = useState<string | null>(null);
  const [agentASmartUsdc, setAgentASmartUsdc] = useState("0.00");
  const [agentBSmartUsdc, setAgentBSmartUsdc] = useState("0.00");
  const [gatewayUsdc, setGatewayUsdc] = useState("0.00");
  const [agentAPayingServiceB, setAgentAPayingServiceB] = useState(false);
  const [servicesRegistered, setServicesRegistered] = useState(false);
  const [agentATvl, setAgentATvl] = useState("0.00");
  const [agentBTvl, setAgentBTvl] = useState("0.00");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [zoom, setZoom] = useState(0.60);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [boxScale, setBoxScale] = useState(1);
  const [apiKey, setApiKey] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const viewRef = useRef<HTMLDivElement | null>(null);
  const settingsButtonRef = useRef<HTMLButtonElement | null>(null);
  const settingsPanelRef = useRef<HTMLDivElement | null>(null);
  const toastHideTimerRef = useRef<number | null>(null);
  const toastClearTimerRef = useRef<number | null>(null);

  const boxSize = { w: 260, h: 150 };
  const agentBoxSize = { w: 250, h: 165 };
  const smartBoxSize = { w: 250, h: 130 };
  const [positions, setPositions] = useState({
    agentA: { x: 100, y: 70 },
    agentB: { x: 900, y: 70 },
    gateway: { x: 500, y: 360 },
    smartA: { x: 100, y: 270 },
    smartB: { x: 900, y: 270 },
    poolA: { x: 100, y: 450 },
    poolB: { x: 900, y: 450 },
  });
  const [sizes, setSizes] = useState({
    agentA: { w: agentBoxSize.w, h: agentBoxSize.h },
    agentB: { w: agentBoxSize.w, h: agentBoxSize.h },
    gateway: { w: boxSize.w, h: boxSize.h },
    smartA: { w: smartBoxSize.w, h: smartBoxSize.h },
    smartB: { w: smartBoxSize.w, h: smartBoxSize.h },
    poolA: { w: smartBoxSize.w, h: smartBoxSize.h },
    poolB: { w: smartBoxSize.w, h: smartBoxSize.h },
  });

  useEffect(() => {
    setHydrated(true);
  }, []);

  const nowLabel = () => new Date().toLocaleTimeString();
  const nowIso = () => new Date().toISOString();

  const addLog = (text: string) => {
    const ts = hydrated ? nowLabel() : "--:--:--";
    setLogs((prev) => [{ ts, text }, ...prev].slice(0, 12));
  };

  const simProxyUrl = (process.env.NEXT_PUBLIC_PROXY_URL || "").replace(/\/$/, "");
  const explorerBase = "https://monad-testnet.socialscan.io";

  const showToast = (message: string) => {
    console.log(`[simulation] ${message}`);
    if (toastHideTimerRef.current) window.clearTimeout(toastHideTimerRef.current);
    if (toastClearTimerRef.current) window.clearTimeout(toastClearTimerRef.current);
    setToastMessage(message);
    window.requestAnimationFrame(() => {
      setToastVisible(true);
    });
    toastHideTimerRef.current = window.setTimeout(() => {
      setToastVisible(false);
    }, 2400);
    toastClearTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  useEffect(() => {
    return () => {
      if (toastHideTimerRef.current) window.clearTimeout(toastHideTimerRef.current);
      if (toastClearTimerRef.current) window.clearTimeout(toastClearTimerRef.current);
    };
  }, []);

  const ensureKey = () => {
    if (!apiKey.trim()) return false;
    if (!simProxyUrl) {
      showToast("Proxy URL Not Set.");
      return false;
    }
    return true;
  };

  const applyState = (state: {
    logs?: { ts: string; text: string }[];
    walletA?: { address: string };
    walletB?: { address: string };
    regA?: { agentId: string; smartAccount: string; poolAddress: string };
    regB?: { agentId: string; smartAccount: string; poolAddress: string };
    service?: { idHex: string; url: string; ownerAgentId?: string };
    balances?: {
      funderMon?: string;
      funderUsdc?: string;
      agentASmartMon?: string;
      agentASmartUsdc?: string;
      agentBSmartMon?: string;
      agentBSmartUsdc?: string;
      poolAUsdc?: string;
      poolBUsdc?: string;
    };
  }) => {
    if (state.walletA?.address) {
      setAgentAEoa(state.walletA.address);
      setAgentAReady(true);
    }
    if (state.walletB?.address) {
      setAgentBEoa(state.walletB.address);
      setAgentBReady(true);
    }
    if (state.regA) {
      setAgentAId(state.regA.agentId);
      setAgentASmartAccount(state.regA.smartAccount);
      setAgentAPool(state.regA.poolAddress);
      setAgentASmartVisible(true);
      setAgentAPoolVisible(true);
    }
    if (state.regB) {
      setAgentBId(state.regB.agentId);
      setAgentBSmartAccount(state.regB.smartAccount);
      setAgentBPool(state.regB.poolAddress);
      setAgentBSmartVisible(true);
      setAgentBPoolVisible(true);
    }
    if (state.service?.idHex) {
      setAgentAServiceId(state.service.idHex);
      setAgentAServiceUrl(state.service.url ?? null);
      setAgentBServiceId(state.service.idHex);
      setAgentBServiceUrl(state.service.url ?? null);
      setServicesRegistered(true);
    }
    if (state.balances) {
      if (state.balances.agentASmartUsdc) setAgentASmartUsdc(state.balances.agentASmartUsdc);
      if (state.balances.agentBSmartUsdc) setAgentBSmartUsdc(state.balances.agentBSmartUsdc);
      if (state.balances.poolAUsdc) setAgentATvl(state.balances.poolAUsdc);
      if (state.balances.poolBUsdc) setAgentBTvl(state.balances.poolBUsdc);
    }
    if (state.logs && state.logs.length) {
      const mapped = state.logs
        .slice()
        .reverse()
        .map((entry) => ({ ts: entry.ts, text: entry.text }));
      setLogs(mapped.slice(0, 12));
    }
  };

  const applyResponseLogs = (rawLogs: string[] | undefined) => {
    if (!rawLogs || rawLogs.length === 0) return;
    const parsed = rawLogs
      .map((line) => {
        const match = line.match(/^\[(.+?)\]\s*(.*)$/);
        if (match) {
          return { ts: match[1], text: match[2] };
        }
        return { ts: nowIso(), text: line };
      })
      .reverse();
    setLogs(parsed.slice(0, 12));
  };

  const runDemoStep = (step: string) => {
    const stamp = nowLabel();
    const push = (text: string) => addLog(text);
    if (step === "init") {
      setAgentAEoa("0x35ac16EdD84Ec0C1397C41c260BC288593E90B6C");
      setAgentBEoa("0x367CF2175C3Db73Fb4496578773eEE991590b0d3");
      setAgentAReady(true);
      setAgentBReady(true);
      push(`Demo: Initialized new EOAs.`);
      push(`Demo: Agent A EOA created.`);
      push(`Demo: Agent B EOA created.`);
      return;
    }
    if (step === "register") {
      setAgentAId("172");
      setAgentBId("173");
      setAgentASmartAccount("0x53e7A5d01325d9c2A48FE026D9eEb612c5e80722");
      setAgentBSmartAccount("0xDB3D454B56933ce0ce350A0B01B9E7B3e2805825");
      setAgentAPool("0x9b3a7b531Ee1cDB115D5cd5f5d00a4F9D6fFB0Cb");
      setAgentBPool("0xa5cde960079168A48Cbe2d61A630A370A5393C10");
      setAgentASmartVisible(true);
      setAgentBSmartVisible(true);
      setAgentAPoolVisible(true);
      setAgentBPoolVisible(true);
      push(`Demo: Agent A registered (agentId 172).`);
      push(`Demo: Agent B registered (agentId 173).`);
      return;
    }
    if (step === "seed") {
      setAgentASmartUsdc("0.5");
      setAgentBSmartUsdc("0.5");
      setAgentATvl("0.5");
      setAgentBTvl("1.0");
      push(`Demo: Pools seeded and balances updated.`);
      return;
    }
    if (step === "register-service") {
      setServicesRegistered(true);
      push(`Demo: Service registered by Agent B.`);
      return;
    }
    if (step === "pay") {
      push(`Demo: Agent A paid for service via x402 gateway.`);
      return;
    }
    if (step === "reset") {
      setAgentAEoa(null);
      setAgentBEoa(null);
      setAgentAId(null);
      setAgentBId(null);
      setAgentASmartAccount(null);
      setAgentBSmartAccount(null);
      setAgentAPool(null);
      setAgentBPool(null);
      setAgentASmartVisible(false);
      setAgentBSmartVisible(false);
      setAgentAPoolVisible(false);
      setAgentBPoolVisible(false);
      setServicesRegistered(false);
      setAgentASmartUsdc("0.00");
      setAgentBSmartUsdc("0.00");
      setAgentATvl("0.00");
      setAgentBTvl("0.00");
      setLogs([{ ts: stamp, text: "Demo: Simulation reset." }]);
      return;
    }
  };

  const callSimStep = async (step: string) => {
    if (isActionRunning) return;
    if (!ensureKey()) {
      showToast("No API key provided. Running demo mode.");
      await new Promise((resolve) => setTimeout(resolve, 3000));
      runDemoStep(step);
      return;
    }
    console.log(`[simulation] calling step "${step}"`);
    addLog(`Simulation: running step "${step}"...`);
    try {
      const resp = await fetch(`${simProxyUrl}/sim/step`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey.trim()}`,
        },
        body: JSON.stringify({ runId: "sim1", step }),
      });
      const json = await resp.json();
      console.log("[simulation] response", json);
      if (Array.isArray(json.events)) {
        console.log("[simulation] events", json.events);
      }
      if (!resp.ok) {
        const msg = json.error || "Simulation step failed.";
        showToast(msg);
        addLog(`Error: ${msg}`);
        return;
      }
      const lastEvent = Array.isArray(json.events) ? json.events.at(-1) : null;
      if (lastEvent?.state) applyState(lastEvent.state);
      if (Array.isArray(json.logs)) {
        applyResponseLogs(json.logs);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Simulation step failed.";
      showToast(msg);
      addLog(`Error: ${msg}`);
    }
  };

  const renderLogText = (text: string) => {
    const parts: Array<string | { value: string; kind: "tx" | "address" }> = [];
    const pattern = /0x[a-fA-F0-9]{64}|0x[a-fA-F0-9]{40}/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }
      const value = match[0];
      const kind = value.length === 66 ? "tx" : "address";
      parts.push({ value, kind });
      lastIndex = match.index + value.length;
    }
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }
    return parts.map((part, idx) => {
      if (typeof part === "string") return <span key={idx}>{part}</span>;
      const href =
        part.kind === "tx"
          ? `${explorerBase}/tx/${part.value}`
          : `${explorerBase}/address/${part.value}`;
      return (
        <a
          key={`${part.value}-${idx}`}
          href={href}
          target="_blank"
          rel="noreferrer"
          className="text-emerald-300 underline decoration-emerald-400/60 hover:text-emerald-200"
        >
          {part.value}
        </a>
      );
    });
  };

  const formatLogTs = (ts: string) => {
    if (ts === "--:--:--") return ts;
    const parsed = Date.parse(ts);
    if (Number.isNaN(parsed)) return ts;
    return new Date(parsed).toLocaleTimeString();
  };

  const isActionRunning =
    agentAInitializing ||
    agentBInitializing ||
    agentARegistering ||
    agentBRegistering ||
    agentASeeding ||
    agentBSeeding ||
    agentAServiceRegistering ||
    agentBServiceRegistering ||
    agentAPayingServiceB;
  const initializingAgents = agentAInitializing || agentBInitializing;
  const registeringAgents = agentARegistering || agentBRegistering;
  const seedingPools = agentASeeding || agentBSeeding;
  const registeringServices = agentAServiceRegistering || agentBServiceRegistering;

  const handleInitializeAgents = async () => {
    if (isActionRunning || (agentAReady && agentBReady)) return;
    setAgentAInitializing(true);
    setAgentBInitializing(true);
    await callSimStep("init");
    setAgentAInitializing(false);
    setAgentBInitializing(false);
  };

  const handleRegisterAgents = async () => {
    if (isActionRunning || !agentAReady || !agentBReady || (agentAPoolVisible && agentBPoolVisible)) return;
    setAgentARegistering(true);
    setAgentBRegistering(true);
    await callSimStep("register");
    setAgentARegistering(false);
    setAgentBRegistering(false);
  };

  const handleSeedPools = async () => {
    if (isActionRunning || !agentAPoolVisible || !agentBPoolVisible) return;
    setAgentASeeding(true);
    setAgentBSeeding(true);
    await callSimStep("seed");
    setAgentASeeding(false);
    setAgentBSeeding(false);
  };

  const handleRegisterServices = async () => {
    if (isActionRunning || !agentAReady || !agentBReady || servicesRegistered) return;
    setAgentAServiceRegistering(true);
    setAgentBServiceRegistering(true);
    await callSimStep("register-service");
    setAgentAServiceRegistering(false);
    setAgentBServiceRegistering(false);
  };

  const handleInitAgentA = async () => {
    if (agentAReady || agentAInitializing || isActionRunning) return;
    setAgentAInitializing(true);
    await callSimStep("init");
    setAgentAInitializing(false);
  };

  const handleInitAgentB = async () => {
    if (agentBReady || agentBInitializing || isActionRunning) return;
    setAgentBInitializing(true);
    await callSimStep("init");
    setAgentBInitializing(false);
  };

  const handleRegisterAgentA = async () => {
    if (!agentAReady || agentARegistering || agentAPoolVisible || isActionRunning) return;
    setAgentARegistering(true);
    await callSimStep("register");
    setAgentARegistering(false);
  };

  const handleRegisterAgentB = async () => {
    if (!agentBReady || agentBRegistering || agentBPoolVisible || isActionRunning) return;
    setAgentBRegistering(true);
    await callSimStep("register");
    setAgentBRegistering(false);
  };

  const handleSeedPoolA = () => {
    if (!agentAPoolVisible || agentASeeding || isActionRunning) return;
    setAgentASeeding(true);
    callSimStep("seed").finally(() => setAgentASeeding(false));
  };

  const handleSeedPoolB = () => {
    if (!agentBPoolVisible || agentBSeeding || isActionRunning) return;
    setAgentBSeeding(true);
    callSimStep("seed").finally(() => setAgentBSeeding(false));
  };

  const handlePayForServiceB = () => {
    if (
      isActionRunning ||
      agentAPayingServiceB ||
      !agentASmartVisible ||
      !agentBSmartVisible ||
      !agentBPoolVisible
    ) return;

    setAgentAPayingServiceB(true);
    callSimStep("pay").finally(() => setAgentAPayingServiceB(false));
  };

  const handleRegisterServiceA = () => {
    if (isActionRunning || !agentAReady || agentAServiceRegistering) return;
    setAgentAServiceRegistering(true);
    callSimStep("register-service").finally(() => setAgentAServiceRegistering(false));
  };

  const handleRegisterServiceB = () => {
    if (isActionRunning || !agentBReady || agentBServiceRegistering) return;
    setAgentBServiceRegistering(true);
    callSimStep("register-service").finally(() => setAgentBServiceRegistering(false));
  };

  const resetSimulation = () => {
    if (ensureKey()) {
      callSimStep("reset");
    }
    setAgentAReady(false);
    setAgentBReady(false);
    setAgentAInitializing(false);
    setAgentBInitializing(false);
    setAgentARegistering(false);
    setAgentBRegistering(false);
    setAgentASeeding(false);
    setAgentBSeeding(false);
    setAgentAServiceRegistering(false);
    setAgentBServiceRegistering(false);
    setAgentASmartVisible(false);
    setAgentBSmartVisible(false);
    setAgentAPoolVisible(false);
    setAgentBPoolVisible(false);
    setAgentAEoa(null);
    setAgentASmartAccount(null);
    setAgentAId(null);
    setAgentAServiceId(null);
    setAgentAServiceUrl(null);
    setAgentAPool(null);
    setAgentBEoa(null);
    setAgentBSmartAccount(null);
    setAgentBId(null);
    setAgentBServiceId(null);
    setAgentBServiceUrl(null);
    setAgentBPool(null);
    setAgentASmartUsdc("0.00");
    setAgentBSmartUsdc("0.00");
    setGatewayUsdc("0.00");
    setAgentAPayingServiceB(false);
    setServicesRegistered(false);
    setAgentATvl("0.00");
    setAgentBTvl("0.00");
    setLogs([]);
    setZoom(0.6);
    setBoxScale(1);
    setPositions({
      agentA: { x: 100, y: 50 },
      agentB: { x: 900, y: 50 },
      gateway: { x: 500, y: 340 },
      smartA: { x: 100, y: 250 },
      smartB: { x: 900, y: 250 },
      poolA: { x: 100, y: 430 },
      poolB: { x: 900, y: 430 },
    });
    setSizes({
      agentA: { w: agentBoxSize.w, h: agentBoxSize.h },
      agentB: { w: agentBoxSize.w, h: agentBoxSize.h },
      gateway: { w: boxSize.w, h: boxSize.h },
      smartA: { w: smartBoxSize.w, h: smartBoxSize.h },
      smartB: { w: smartBoxSize.w, h: smartBoxSize.h },
      poolA: { w: smartBoxSize.w, h: smartBoxSize.h },
      poolB: { w: smartBoxSize.w, h: smartBoxSize.h },
    });
    addLog("Simulation restored to initial state.");
  };

  const gridBg = useMemo(
    () => ({
      backgroundImage:
        "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
      backgroundSize: "24px 24px",
    }),
    []
  );

  useEffect(() => {
    const el = viewRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const next = Math.min(2, Math.max(0.5, zoom - e.deltaY * 0.001));
      setZoom(next);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoom]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!settingsOpen) return;
      const target = event.target as Node | null;
      if (!target) return;
      if (settingsButtonRef.current?.contains(target)) return;
      if (settingsPanelRef.current?.contains(target)) return;
      setSettingsOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [settingsOpen]);

  const contentScale = (node: NodeKey) => {
    const base =
      node === "agentA" || node === "agentB"
        ? agentBoxSize
      : node === "smartA" || node === "smartB" || node === "poolA" || node === "poolB"
        ? smartBoxSize
      : boxSize;
    return Math.max(0.55, Math.min(1.5, Math.min(sizes[node].w / base.w, sizes[node].h / base.h)));
  };

  const applyGlobalBoxScale = (nextScale: number) => {
    const ratio = nextScale / boxScale;
    setSizes((prev) => ({
      agentA: {
        w: Math.max(160, Math.round(prev.agentA.w * ratio)),
        h: Math.max(90, Math.round(prev.agentA.h * ratio)),
      },
      agentB: {
        w: Math.max(160, Math.round(prev.agentB.w * ratio)),
        h: Math.max(90, Math.round(prev.agentB.h * ratio)),
      },
      gateway: {
        w: Math.max(160, Math.round(prev.gateway.w * ratio)),
        h: Math.max(90, Math.round(prev.gateway.h * ratio)),
      },
      smartA: {
        w: Math.max(160, Math.round(prev.smartA.w * ratio)),
        h: Math.max(90, Math.round(prev.smartA.h * ratio)),
      },
      smartB: {
        w: Math.max(160, Math.round(prev.smartB.w * ratio)),
        h: Math.max(90, Math.round(prev.smartB.h * ratio)),
      },
      poolA: {
        w: Math.max(160, Math.round(prev.poolA.w * ratio)),
        h: Math.max(90, Math.round(prev.poolA.h * ratio)),
      },
      poolB: {
        w: Math.max(160, Math.round(prev.poolB.w * ratio)),
        h: Math.max(90, Math.round(prev.poolB.h * ratio)),
      },
    }));
    setBoxScale(nextScale);
  };

  const nodeCenter = (node: NodeKey) => ({
    x: positions[node].x + sizes[node].w / 2,
    y: positions[node].y + sizes[node].h / 2,
  });

  const EXPLORER_BASE = "https://monad-testnet.socialscan.io/address";
  const isFullAddress = (v: string | null) => !!v && /^0x[a-fA-F0-9]{40}$/.test(v);
  const shortAddress = (v: string | null) => (v ? `${v.slice(0, 6)}...${v.slice(-4)}` : "Not set");
  const renderControlSpinner = () => (
    <span className="inline-block h-3 w-3 rounded-full border border-white/40 border-t-white animate-spin mr-1 align-[-1px]" />
  );

  const edgeConnector = (from: NodeKey, to: NodeKey) => {
    const fromCenter = nodeCenter(from);
    const toCenter = nodeCenter(to);
    const dx = toCenter.x - fromCenter.x;
    const dy = toCenter.y - fromCenter.y;
    type Side = "top" | "right" | "bottom" | "left";
    const oppositeSide = (side: Side): Side => {
      if (side === "top") return "bottom";
      if (side === "bottom") return "top";
      if (side === "left") return "right";
      return "left";
    };
    const pointOnSide = (node: NodeKey, side: Side) => {
      const c = nodeCenter(node);
      const halfW = sizes[node].w / 2;
      const halfH = sizes[node].h / 2;
      if (side === "top") return { x: c.x, y: c.y - halfH };
      if (side === "bottom") return { x: c.x, y: c.y + halfH };
      if (side === "left") return { x: c.x - halfW, y: c.y };
      return { x: c.x + halfW, y: c.y };
    };

    // Directional rule:
    // use the dominant axis so right/left is chosen when mostly horizontal,
    // and top/bottom when mostly vertical.
    let fromSide: Side;
    if (Math.abs(dx) >= Math.abs(dy)) {
      fromSide = dx >= 0 ? "right" : "left";
    } else {
      fromSide = dy >= 0 ? "bottom" : "top";
    }

    const toSide = oppositeSide(fromSide);
    return {
      start: pointOnSide(from, fromSide),
      end: pointOnSide(to, toSide),
    };
  };

  return (
    <div className="min-h-screen bg-pragma-dark text-white">
      {toastMessage && (
        <div
          className={cn(
            "toast-shell fixed bottom-6 right-6 z-50 w-[min(360px,90vw)] rounded-xl border border-lobster-primary/60 bg-lobster-primary px-4 py-3 text-sm text-white shadow-lg",
            toastVisible ? "toast-visible" : ""
          )}
        >
          <div className="mt-1 text-white/90">{toastMessage}</div>
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-4xl font-bold">Simulation</h1>
            <p className="text-white/70 mt-2">
              Visualize agents, smart accounts, pools, and gateway flow in real time.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 lg:sticky lg:top-6 self-start">
            <div className="relative rounded-2xl border border-white/10 bg-black/40 overflow-hidden min-h-[520px]">
              <div className="absolute inset-0 bg-gradient-to-br from-[#14111a]/70 via-transparent to-[#0a0a0a]/80" />

              <div className="relative z-10 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="font-display text-2xl font-semibold">Agent Grid</h2>
                    <p className="text-white/60 text-sm">
                      Live flow: Agent A, Agent B, x402 Gateway.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-widest text-white/40">KEY</span>
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(event) => setApiKey(event.target.value)}
                      placeholder="key"
                      autoComplete="off"
                      className="w-32 rounded-md border border-white/10 bg-black/60 px-2 py-1 text-[11px] text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
                    />
                    <button
                      onClick={() => {
                        if (!apiKey.trim()) {
                          showToast("API key required to call simulation steps.");
                        } else {
                          showToast("API key stored for this session.");
                        }
                      }}
                      className="rounded-md bg-emerald-500/20 px-2 py-1 text-[11px] font-semibold text-emerald-100 hover:bg-emerald-500/30"
                      aria-label="Save API key"
                      title="Save API key"
                    >
                      <svg
                        aria-hidden="true"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                        <polyline points="17 21 17 13 7 13 7 21" />
                        <polyline points="7 3 7 8 15 8" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div
                  ref={viewRef}
                  className="relative mt-8 h-[460px] overflow-hidden rounded-2xl border border-white/10"
                  style={gridBg}
                >
                  <div className="absolute top-3 left-3 z-30">
                    <button
                      ref={settingsButtonRef}
                      onClick={() => setSettingsOpen((v) => !v)}
                      className="h-9 w-9 rounded-lg bg-black/70 border border-white/15 hover:bg-black/85 transition-colors"
                      aria-label="Open simulation settings"
                      title="Simulation settings"
                    >
                      <span className="text-lg leading-none">⚙</span>
                    </button>
                  {settingsOpen && (
                    <div
                      ref={settingsPanelRef}
                      className="mt-2 w-72 rounded-xl border border-white/15 bg-black/85 backdrop-blur p-4 space-y-4"
                    >
                      <div>
                        <label className="text-xs text-white/70">Zoom: {zoom.toFixed(2)}x</label>
                        <input
                          type="range"
                          min="0.5"
                          max="2"
                          step="0.05"
                          value={zoom}
                          onChange={(e) => setZoom(Number(e.target.value))}
                          className="w-full mt-2 accent-lobster-primary"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-white/70">Box Size: {boxScale.toFixed(2)}x</label>
                        <input
                          type="range"
                          min="0.6"
                          max="1.8"
                          step="0.05"
                          value={boxScale}
                          onChange={(e) => applyGlobalBoxScale(Number(e.target.value))}
                          className="w-full mt-2 accent-lobster-primary"
                        />
                      </div>
                      <button
                        onClick={() => {
                          setZoom(1);
                          addLog("View reset.");
                        }}
                        className="w-full px-4 py-2 rounded-lg text-sm font-medium bg-white/10 hover:bg-white/20 transition-colors"
                      >
                        Reset View
                      </button>
                    </div>
                  )}
                  </div>
                  <div className="absolute inset-0 bg-black/40" />

                  <div
                    className="absolute inset-0 sim-canvas"
                    style={{
                      width: `${100 / zoom}%`,
                      height: `${100 / zoom}%`,
                      transform: `scale(${zoom})`,
                      transformOrigin: "0 0",
                    }}
                  >
                    <Rnd
                    bounds="parent"
                    size={{ width: sizes.agentA.w, height: sizes.agentA.h }}
                    position={{ x: positions.agentA.x, y: positions.agentA.y }}
                    onDragStop={(_, d) =>
                      setPositions((p) => ({
                        ...p,
                        agentA: { ...p.agentA, x: d.x, y: d.y },
                      }))
                    }
                    className="z-10 sim-draggable"
                    minWidth={160}
                    minHeight={110}
                    onResizeStop={(_, __, ref, ___, position) => {
                      setSizes((s) => ({
                        ...s,
                        agentA: { w: ref.offsetWidth, h: ref.offsetHeight },
                      }));
                      setPositions((p) => ({
                        ...p,
                        agentA: { x: position.x, y: position.y },
                      }));
                    }}
                    scale={zoom}
                  >
                    <div className="relative h-full">
                      <div
                        className={cn(
                          "relative rounded-2xl border border-white/10 bg-black/70 p-4 h-full overflow-hidden",
                          agentAReady ? "pop-in" : ""
                        )}
                      >
                        <div
                          style={{
                            transform: `scale(${contentScale("agentA")})`,
                            transformOrigin: "top left",
                            width: `${100 / contentScale("agentA")}%`,
                          }}
                        >
                          <div className="text-white/60 text-xs">Agent A</div>
                          <div className="font-display text-xl mt-2">moneybot</div>
                          <div className="text-[10px] text-white/60 mt-2">
                            EOA: {agentAInitializing ? (
                              <>
                                <span className="inline-block h-3 w-3 rounded-full border border-white/40 border-t-lobster-primary animate-spin mr-1 align-[-1px]" />
                                Initializing...
                              </>
                            ) : isFullAddress(agentAEoa) ? (
                              <a
                                href={`${EXPLORER_BASE}/${agentAEoa}`}
                                target="_blank"
                                rel="noreferrer"
                                className="underline decoration-white/30 hover:decoration-lobster-primary"
                              >
                                {shortAddress(agentAEoa)}
                              </a>
                            ) : "Not initialized"}
                          </div>
                          <div className="text-[10px] text-white/60 mt-1">
                            Service Id: {agentAInitializing ? (
                              <>
                                <span className="inline-block h-3 w-3 rounded-full border border-white/40 border-t-lobster-primary animate-spin mr-1 align-[-1px]" />
                                Setting...
                              </>
                          ) : `${(agentAServiceId ?? DEFAULT_SERVICE_ID).slice(0, 10)}...${(agentAServiceId ?? DEFAULT_SERVICE_ID).slice(-8)}`}
                        </div>
                        <div className="text-[10px] text-white/60 mt-1 break-all">
                          Service URL: {agentAInitializing ? (
                            <>
                              <span className="inline-block h-3 w-3 rounded-full border border-white/40 border-t-lobster-primary animate-spin mr-1 align-[-1px]" />
                              Setting...
                            </>
                          ) : agentAServiceUrl ?? DEFAULT_SERVICE_URL}
                        </div>
                        </div>
                      </div>
                    </div>
                  </Rnd>

                  {agentASmartVisible && (
                    <Rnd
                      bounds="parent"
                      size={{ width: sizes.smartA.w, height: sizes.smartA.h }}
                      position={{ x: positions.smartA.x, y: positions.smartA.y }}
                      onDragStop={(_, d) =>
                        setPositions((p) => ({
                          ...p,
                          smartA: { ...p.smartA, x: d.x, y: d.y },
                        }))
                      }
                      className="z-10 sim-draggable"
                      minWidth={160}
                      minHeight={90}
                      onResizeStop={(_, __, ref, ___, position) => {
                        setSizes((s) => ({
                          ...s,
                          smartA: { w: ref.offsetWidth, h: ref.offsetHeight },
                        }));
                        setPositions((p) => ({
                          ...p,
                          smartA: { x: position.x, y: position.y },
                        }));
                      }}
                      scale={zoom}
                    >
                      <div className="relative rounded-2xl border border-sky-400/50 bg-sky-500/20 p-4 h-full overflow-hidden pop-in">
                        <div
                          style={{
                            transform: `scale(${contentScale("smartA")})`,
                            transformOrigin: "top left",
                            width: `${100 / contentScale("smartA")}%`,
                          }}
                        >
                          <div className="text-sky-200 text-sm">Smart Account</div>
                          <div className="text-xs text-white/90 mt-2">
                            Address: {isFullAddress(agentASmartAccount) ? (
                              <a
                                href={`${EXPLORER_BASE}/${agentASmartAccount}`}
                                target="_blank"
                                rel="noreferrer"
                                className="underline decoration-white/30 hover:decoration-sky-200"
                              >
                                {shortAddress(agentASmartAccount)}
                              </a>
                            ) : "Not set"}
                          </div>
                          <div className="text-xs text-white/90 mt-1">
                            Agent Id: {agentAId ?? "Not set"}
                          </div>
                          <div className="text-xs text-white/90 mt-1">
                            USDC: {agentASmartUsdc}
                          </div>
                        </div>
                      </div>
                    </Rnd>
                  )}

                  {agentAPoolVisible && (
                    <Rnd
                      bounds="parent"
                      size={{ width: sizes.poolA.w, height: sizes.poolA.h }}
                      position={{ x: positions.poolA.x, y: positions.poolA.y }}
                      onDragStop={(_, d) =>
                        setPositions((p) => ({
                          ...p,
                          poolA: { ...p.poolA, x: d.x, y: d.y },
                        }))
                      }
                      className="z-10 sim-draggable"
                      minWidth={160}
                      minHeight={90}
                      onResizeStop={(_, __, ref, ___, position) => {
                        setSizes((s) => ({
                          ...s,
                          poolA: { w: ref.offsetWidth, h: ref.offsetHeight },
                        }));
                        setPositions((p) => ({
                          ...p,
                          poolA: { x: position.x, y: position.y },
                        }));
                      }}
                      scale={zoom}
                    >
                      <div className="relative rounded-2xl border border-lobster-primary/50 bg-lobster-primary/20 p-4 h-full overflow-hidden pop-in">
                        <div
                          style={{
                            transform: `scale(${contentScale("poolA")})`,
                            transformOrigin: "top left",
                            width: `${100 / contentScale("poolA")}%`,
                          }}
                        >
                          <div className="text-lobster-primary/80 text-sm">Agent Pool</div>
                          <div className="font-display text-base mt-2 text-white">afAgent</div>
                          <div className="text-xs text-white/80 mt-2">
                            {isFullAddress(agentAPool) ? (
                              <a
                                href={`${EXPLORER_BASE}/${agentAPool}`}
                                target="_blank"
                                rel="noreferrer"
                                className="underline decoration-white/30 hover:decoration-lobster-primary"
                              >
                                {shortAddress(agentAPool)}
                              </a>
                            ) : "Not set"}
                          </div>
                          <div className="text-xs text-white/70 mt-1">
                            TVL: {agentASeeding ? (
                              <>
                                <span className="inline-block h-3 w-3 rounded-full border border-white/40 border-t-lobster-primary animate-spin mr-1 align-[-1px]" />
                                Seeding...
                              </>
                            ) : `${agentATvl} USDC`}
                          </div>
                        </div>
                      </div>
                    </Rnd>
                  )}

                  {agentBPoolVisible && (
                    <Rnd
                      bounds="parent"
                      size={{ width: sizes.poolB.w, height: sizes.poolB.h }}
                      position={{ x: positions.poolB.x, y: positions.poolB.y }}
                      onDragStop={(_, d) =>
                        setPositions((p) => ({
                          ...p,
                          poolB: { ...p.poolB, x: d.x, y: d.y },
                        }))
                      }
                      className="z-10 sim-draggable"
                      minWidth={160}
                      minHeight={90}
                      onResizeStop={(_, __, ref, ___, position) => {
                        setSizes((s) => ({
                          ...s,
                          poolB: { w: ref.offsetWidth, h: ref.offsetHeight },
                        }));
                        setPositions((p) => ({
                          ...p,
                          poolB: { x: position.x, y: position.y },
                        }));
                      }}
                      scale={zoom}
                    >
                      <div className="relative rounded-2xl border border-lobster-primary/50 bg-lobster-primary/20 p-4 h-full overflow-hidden pop-in">
                        <div
                          style={{
                            transform: `scale(${contentScale("poolB")})`,
                            transformOrigin: "top left",
                            width: `${100 / contentScale("poolB")}%`,
                          }}
                        >
                          <div className="text-lobster-primary/80 text-sm">Agent Pool</div>
                          <div className="font-display text-base mt-2 text-white">bfAgent</div>
                          <div className="text-xs text-white/80 mt-2">
                            {isFullAddress(agentBPool) ? (
                              <a
                                href={`${EXPLORER_BASE}/${agentBPool}`}
                                target="_blank"
                                rel="noreferrer"
                                className="underline decoration-white/30 hover:decoration-lobster-primary"
                              >
                                {shortAddress(agentBPool)}
                              </a>
                            ) : "Not set"}
                          </div>
                          <div className="text-xs text-white/70 mt-1">
                            TVL: {agentBSeeding ? (
                              <>
                                <span className="inline-block h-3 w-3 rounded-full border border-white/40 border-t-lobster-primary animate-spin mr-1 align-[-1px]" />
                                Seeding...
                              </>
                            ) : `${agentBTvl} USDC`}
                          </div>
                        </div>
                      </div>
                    </Rnd>
                  )}

                  <Rnd
                    bounds="parent"
                    size={{ width: sizes.agentB.w, height: sizes.agentB.h }}
                    position={{ x: positions.agentB.x, y: positions.agentB.y }}
                    onDragStop={(_, d) =>
                      setPositions((p) => ({
                        ...p,
                        agentB: { ...p.agentB, x: d.x, y: d.y },
                      }))
                    }
                    className="z-10 sim-draggable"
                    minWidth={160}
                    minHeight={110}
                    onResizeStop={(_, __, ref, ___, position) => {
                      setSizes((s) => ({
                        ...s,
                        agentB: { w: ref.offsetWidth, h: ref.offsetHeight },
                      }));
                      setPositions((p) => ({
                        ...p,
                        agentB: { x: position.x, y: position.y },
                      }));
                    }}
                    scale={zoom}
                  >
                    <div className="relative rounded-2xl border border-white/10 bg-black/70 p-4 h-full overflow-hidden">
                      <div
                        style={{
                          transform: `scale(${contentScale("agentB")})`,
                          transformOrigin: "top left",
                          width: `${100 / contentScale("agentB")}%`,
                        }}
                      >
                        <div className="text-white/60 text-xs">Agent B</div>
                        <div className="font-display text-xl mt-2">tbd</div>
                        <div className="text-[10px] text-white/60 mt-2">
                          EOA: {agentBInitializing ? (
                            <>
                              <span className="inline-block h-3 w-3 rounded-full border border-white/40 border-t-lobster-primary animate-spin mr-1 align-[-1px]" />
                              Initializing...
                            </>
                          ) : isFullAddress(agentBEoa) ? (
                            <a
                              href={`${EXPLORER_BASE}/${agentBEoa}`}
                              target="_blank"
                              rel="noreferrer"
                              className="underline decoration-white/30 hover:decoration-lobster-primary"
                            >
                              {shortAddress(agentBEoa)}
                            </a>
                          ) : "Not initialized"}
                        </div>
                        <div className="text-[10px] text-white/60 mt-1">
                          Service Id: {agentBInitializing ? (
                            <>
                              <span className="inline-block h-3 w-3 rounded-full border border-white/40 border-t-lobster-primary animate-spin mr-1 align-[-1px]" />
                              Setting...
                            </>
                          ) : `${(agentBServiceId ?? DEFAULT_SERVICE_ID).slice(0, 10)}...${(agentBServiceId ?? DEFAULT_SERVICE_ID).slice(-8)}`}
                        </div>
                        <div className="text-[10px] text-white/60 mt-1 break-all">
                          Service URL: {agentBInitializing ? (
                            <>
                              <span className="inline-block h-3 w-3 rounded-full border border-white/40 border-t-lobster-primary animate-spin mr-1 align-[-1px]" />
                              Setting...
                            </>
                          ) : agentBServiceUrl ?? DEFAULT_SERVICE_URL}
                        </div>
                      </div>
                    </div>
                  </Rnd>

                  {agentBSmartVisible && (
                    <Rnd
                      bounds="parent"
                      size={{ width: sizes.smartB.w, height: sizes.smartB.h }}
                      position={{ x: positions.smartB.x, y: positions.smartB.y }}
                      onDragStop={(_, d) =>
                        setPositions((p) => ({
                          ...p,
                          smartB: { ...p.smartB, x: d.x, y: d.y },
                        }))
                      }
                      className="z-10 sim-draggable"
                      minWidth={160}
                      minHeight={90}
                      onResizeStop={(_, __, ref, ___, position) => {
                        setSizes((s) => ({
                          ...s,
                          smartB: { w: ref.offsetWidth, h: ref.offsetHeight },
                        }));
                        setPositions((p) => ({
                          ...p,
                          smartB: { x: position.x, y: position.y },
                        }));
                      }}
                      scale={zoom}
                    >
                      <div className="relative rounded-2xl border border-sky-400/50 bg-sky-500/20 p-4 h-full overflow-hidden pop-in">
                        <div
                          style={{
                            transform: `scale(${contentScale("smartB")})`,
                            transformOrigin: "top left",
                            width: `${100 / contentScale("smartB")}%`,
                          }}
                        >
                          <div className="text-sky-200 text-sm">Smart Account</div>
                          <div className="text-xs text-white/90 mt-2">
                            Address: {isFullAddress(agentBSmartAccount) ? (
                              <a
                                href={`${EXPLORER_BASE}/${agentBSmartAccount}`}
                                target="_blank"
                                rel="noreferrer"
                                className="underline decoration-white/30 hover:decoration-sky-200"
                              >
                                {shortAddress(agentBSmartAccount)}
                              </a>
                            ) : "Not set"}
                          </div>
                          <div className="text-xs text-white/90 mt-1">
                            Agent Id: {agentBId ?? "Not set"}
                          </div>
                          <div className="text-xs text-white/90 mt-1">
                            USDC: {agentBSmartUsdc}
                          </div>
                        </div>
                      </div>
                    </Rnd>
                  )}

                  <Rnd
                    bounds="parent"
                    size={{ width: sizes.gateway.w, height: sizes.gateway.h }}
                    position={{
                      x: positions.gateway.x,
                      y: positions.gateway.y,
                    }}
                    onDragStop={(_, d) =>
                      setPositions((p) => ({
                        ...p,
                        gateway: { ...p.gateway, x: d.x, y: d.y },
                      }))
                    }
                    className="z-10 sim-draggable"
                    minWidth={180}
                    minHeight={100}
                    onResizeStop={(_, __, ref, ___, position) => {
                      setSizes((s) => ({
                        ...s,
                        gateway: { w: ref.offsetWidth, h: ref.offsetHeight },
                      }));
                      setPositions((p) => ({
                        ...p,
                        gateway: { x: position.x, y: position.y },
                      }));
                    }}
                    scale={zoom}
                  >
                    <div className="relative rounded-2xl border border-indigo-300/50 bg-indigo-500/20 p-4 h-full overflow-hidden">
                      <div
                        style={{
                          transform: `scale(${contentScale("gateway")})`,
                          transformOrigin: "top left",
                          width: `${100 / contentScale("gateway")}%`,
                        }}
                      >
                        <div className="text-indigo-200 text-xs">Contract</div>
                        <div className="font-display text-xl mt-2">x402 Gateway</div>
                        <div className="text-xs text-white/70 mt-2">
                          Address: <a
                            href={`${EXPLORER_BASE}/0x8887dD91C983b2c647a41DEce32c34E79c7C33df`}
                            target="_blank"
                            rel="noreferrer"
                            className="underline decoration-white/30 hover:decoration-indigo-200"
                          >
                            {shortAddress("0x8887dD91C983b2c647a41DEce32c34E79c7C33df")}
                          </a>
                        </div>
                        <div className="text-xs text-white/70 mt-1">
                          USDC: {gatewayUsdc}
                        </div>
                      </div>
                    </div>
                  </Rnd>

                    {agentASmartVisible && (
                      <svg className="absolute inset-0 pointer-events-none z-20" width="100%" height="100%">
                        <defs>
                          <marker
                            id="smartArrowA"
                            viewBox="0 0 10 10"
                            refX="8"
                            refY="5"
                            markerWidth="6"
                            markerHeight="6"
                            orient="auto-start-reverse"
                          >
                            <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(56,189,248,0.95)" />
                          </marker>
                        </defs>
                        {(() => {
                          const { start, end } = edgeConnector("agentA", "smartA");
                          return (
                            <>
                              <path
                                d={`M ${start.x} ${start.y} L ${end.x} ${end.y}`}
                                stroke="rgba(56,189,248,0.95)"
                                strokeWidth="2.8"
                                fill="none"
                                markerEnd="url(#smartArrowA)"
                              />
                              <circle cx={start.x} cy={start.y} r="4" fill="#38bdf8" />
                            </>
                          );
                        })()}
                      </svg>
                    )}
                    {agentAPoolVisible && agentASmartVisible && (
                      <svg className="absolute inset-0 pointer-events-none z-20" width="100%" height="100%">
                        <defs>
                          <marker
                            id="poolArrowA"
                            viewBox="0 0 10 10"
                            refX="8"
                            refY="5"
                            markerWidth="6"
                            markerHeight="6"
                            orient="auto-start-reverse"
                          >
                            <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(255,79,79,0.95)" />
                          </marker>
                        </defs>
                        {(() => {
                          const { start, end } = edgeConnector("smartA", "poolA");
                          return (
                            <>
                              <path
                                d={`M ${start.x} ${start.y} L ${end.x} ${end.y}`}
                                stroke="rgba(255,79,79,0.95)"
                                strokeWidth="2.8"
                                fill="none"
                                markerEnd="url(#poolArrowA)"
                              />
                              <circle cx={start.x} cy={start.y} r="4" fill="#ff4f4f" />
                            </>
                          );
                        })()}
                      </svg>
                    )}
                    {agentBSmartVisible && (
                      <svg className="absolute inset-0 pointer-events-none z-20" width="100%" height="100%">
                        <defs>
                          <marker
                            id="smartArrowB"
                            viewBox="0 0 10 10"
                            refX="8"
                            refY="5"
                            markerWidth="6"
                            markerHeight="6"
                            orient="auto-start-reverse"
                          >
                            <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(56,189,248,0.95)" />
                          </marker>
                        </defs>
                        {(() => {
                          const { start, end } = edgeConnector("agentB", "smartB");
                          return (
                            <>
                              <path
                                d={`M ${start.x} ${start.y} L ${end.x} ${end.y}`}
                                stroke="rgba(56,189,248,0.95)"
                                strokeWidth="2.8"
                                fill="none"
                                markerEnd="url(#smartArrowB)"
                              />
                              <circle cx={start.x} cy={start.y} r="4" fill="#38bdf8" />
                            </>
                          );
                        })()}
                      </svg>
                    )}
                    {agentBPoolVisible && agentBSmartVisible && (
                      <svg className="absolute inset-0 pointer-events-none z-20" width="100%" height="100%">
                        <defs>
                          <marker
                            id="poolArrowB"
                            viewBox="0 0 10 10"
                            refX="8"
                            refY="5"
                            markerWidth="6"
                            markerHeight="6"
                            orient="auto-start-reverse"
                          >
                            <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(255,79,79,0.95)" />
                          </marker>
                        </defs>
                        {(() => {
                          const { start, end } = edgeConnector("smartB", "poolB");
                          return (
                            <>
                              <path
                                d={`M ${start.x} ${start.y} L ${end.x} ${end.y}`}
                                stroke="rgba(255,79,79,0.95)"
                                strokeWidth="2.8"
                                fill="none"
                                markerEnd="url(#poolArrowB)"
                              />
                              <circle cx={start.x} cy={start.y} r="4" fill="#ff4f4f" />
                            </>
                          );
                        })()}
                      </svg>
                    )}
                    {agentAPayingServiceB && (
                      <svg className="absolute inset-0 pointer-events-none z-30" width="100%" height="100%">
                        <defs>
                          <marker
                            id="payFlowToGateway"
                            viewBox="0 0 10 10"
                            refX="8"
                            refY="5"
                            markerWidth="6"
                            markerHeight="6"
                            orient="auto-start-reverse"
                          >
                            <path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b" />
                          </marker>
                          <marker
                            id="payFlowToSmartB"
                            viewBox="0 0 10 10"
                            refX="8"
                            refY="5"
                            markerWidth="6"
                            markerHeight="6"
                            orient="auto-start-reverse"
                          >
                            <path d="M 0 0 L 10 5 L 0 10 z" fill="#38bdf8" />
                          </marker>
                          <marker
                            id="payFlowToPoolB"
                            viewBox="0 0 10 10"
                            refX="8"
                            refY="5"
                            markerWidth="6"
                            markerHeight="6"
                            orient="auto-start-reverse"
                          >
                            <path d="M 0 0 L 10 5 L 0 10 z" fill="#22c55e" />
                          </marker>
                        </defs>
                        {(() => {
                          const toGateway = edgeConnector("smartA", "gateway");
                          const toSmartB = edgeConnector("gateway", "smartB");
                          const toPoolB = edgeConnector("gateway", "poolB");
                          return (
                            <>
                              <path
                                d={`M ${toGateway.start.x} ${toGateway.start.y} L ${toGateway.end.x} ${toGateway.end.y}`}
                                className="beam"
                                stroke="#f59e0b"
                                strokeWidth="3"
                                fill="none"
                                markerEnd="url(#payFlowToGateway)"
                              />
                              <path
                                d={`M ${toSmartB.start.x} ${toSmartB.start.y} L ${toSmartB.end.x} ${toSmartB.end.y}`}
                                className="beam"
                                stroke="#38bdf8"
                                strokeWidth="3"
                                fill="none"
                                markerEnd="url(#payFlowToSmartB)"
                              />
                              <path
                                d={`M ${toPoolB.start.x} ${toPoolB.start.y} L ${toPoolB.end.x} ${toPoolB.end.y}`}
                                className="beam"
                                stroke="#22c55e"
                                strokeWidth="3"
                                fill="none"
                                markerEnd="url(#payFlowToPoolB)"
                              />
                            </>
                          );
                        })()}
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-black/50 p-4">
              <h3 className="font-display text-lg mb-2">Simulation Controls</h3>
              <div className="sim-scrollbar-muted space-y-3 max-h-[400px] overflow-y-auto pr-1">
                <div className="space-y-1.5">
                  <p className="text-[10px] uppercase tracking-wide text-white/50">Flow</p>
                  <button
                    onClick={handleInitializeAgents}
                    className={cn(
                      "w-full px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                      agentAReady && agentBReady
                        ? "bg-emerald-500/20 text-emerald-200 cursor-default"
                        : initializingAgents
                          ? "bg-white/15 text-white/80 cursor-wait"
                        : "bg-lobster-primary text-white hover:bg-lobster-hover"
                    )}
                    disabled={isActionRunning || (agentAReady && agentBReady)}
                  >
                    {initializingAgents ? (
                      <>
                        {renderControlSpinner()}
                        Initializing Agents...
                      </>
                    ) : agentAReady && agentBReady ? "Agents Initialized" : "Initialize Agent"}
                  </button>
                  <button
                    onClick={handleRegisterAgents}
                    className="w-full px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/20 transition-colors"
                    disabled={isActionRunning || !agentAReady || !agentBReady || (agentAPoolVisible && agentBPoolVisible)}
                  >
                    {registeringAgents ? (
                      <>
                        {renderControlSpinner()}
                        Registering Agents...
                      </>
                    ) : agentAPoolVisible && agentBPoolVisible ? "Agents Registered" : "Register Agent"}
                  </button>
                  <button
                    onClick={handleSeedPools}
                    className="w-full px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/20 transition-colors"
                    disabled={isActionRunning || !agentAPoolVisible || !agentBPoolVisible}
                  >
                    {seedingPools ? (
                      <>
                        {renderControlSpinner()}
                        Seeding Pools...
                      </>
                    ) : "Seed"}
                  </button>
                  <button
                    onClick={handleRegisterServices}
                    className="w-full px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/20 transition-colors"
                    disabled={isActionRunning || !agentAReady || !agentBReady || servicesRegistered}
                  >
                    {registeringServices ? (
                      <>
                        {renderControlSpinner()}
                        Registering Services...
                      </>
                    ) : servicesRegistered ? "Agent B Service Registered" : "Agent B Registers Service"}
                  </button>
                  <button
                    onClick={handlePayForServiceB}
                    className="w-full px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500/20 text-amber-100 hover:bg-amber-500/30 transition-colors"
                    disabled={
                      isActionRunning ||
                      !agentASmartVisible ||
                      !agentBSmartVisible ||
                      !agentBPoolVisible ||
                      !servicesRegistered
                    }
                  >
                    {agentAPayingServiceB ? (
                      <>
                        {renderControlSpinner()}
                        Agent A: Paying Service B...
                      </>
                    ) : "Agent A Pay for Service B"}
                  </button>
                </div>

                <div className="space-y-1.5">
                  <p className="text-[10px] uppercase tracking-wide text-white/50">Global</p>
                  <button
                    onClick={resetSimulation}
                    className="w-full px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/20 transition-colors"
                    disabled={isActionRunning}
                  >
                    Restore Simulation
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/50 p-5">
              <h3 className="font-display text-xl mb-3">Live Log</h3>
              <div className="sim-scrollbar rounded-xl border border-emerald-400/20 bg-black/90 max-h-[320px] overflow-auto p-3 font-mono text-xs leading-5">
                {logs.length === 0 && (
                  <div className="text-emerald-300/70">
                    &gt; waiting for activity...
                  </div>
                )}
                {logs.map((log, idx) => (
                  <div key={`${log.ts}-${idx}`} className="text-emerald-200 whitespace-pre-wrap break-words">
                    <span className="text-emerald-400/70">[{formatLogTs(log.ts)}]</span> {">"} {renderLogText(log.text)}
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>

      <style jsx>{`
        .toast-shell {
          opacity: 0;
          transform: translate3d(0, 12px, 0);
          transition: opacity 200ms ease, transform 260ms cubic-bezier(0.22, 1, 0.36, 1);
          will-change: transform, opacity;
        }
        .toast-visible {
          opacity: 1;
          transform: translate3d(0, 0, 0);
        }
        .pop-in {
          animation: popIn 0.4s ease-out;
        }
        .glow-ring {
          background: radial-gradient(
            circle at 50% 50%,
            rgba(255, 79, 79, 0.35),
            transparent 70%
          );
          filter: blur(8px);
        }
        .beam {
          stroke-dasharray: 8 8;
          stroke-linecap: round;
          animation: dash 1.2s linear infinite;
        }
        .sim-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(52, 211, 153, 0.85) rgba(255, 255, 255, 0.08);
        }
        .sim-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .sim-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.08);
          border-radius: 9999px;
        }
        .sim-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(52, 211, 153, 0.85);
          border-radius: 9999px;
        }
        .sim-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(16, 185, 129, 0.95);
        }
        .sim-scrollbar-muted {
          scrollbar-width: thin;
          scrollbar-color: rgba(156, 163, 175, 0.8) rgba(255, 255, 255, 0.08);
        }
        .sim-scrollbar-muted::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .sim-scrollbar-muted::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.08);
          border-radius: 9999px;
        }
        .sim-scrollbar-muted::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.8);
          border-radius: 9999px;
        }
        .sim-scrollbar-muted::-webkit-scrollbar-thumb:hover {
          background: rgba(107, 114, 128, 0.9);
        }
        .react-rnd {
          transition: box-shadow 0.15s ease;
        }
        .react-rnd:focus-within,
        .react-rnd:hover {
          box-shadow: 0 0 0 1px rgba(255, 79, 79, 0.3);
        }
        @keyframes popIn {
          0% {
            transform: scale(0.96);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes dash {
          to {
            stroke-dashoffset: -32;
          }
        }
      `}</style>
    </div>
  );
}
