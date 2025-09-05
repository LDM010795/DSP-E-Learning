import React, { useState, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
} from "framer-motion";
import {
  IoCheckmarkCircleOutline,
  IoFlashOutline,
  IoRocketOutline,
  IoBuildOutline,
} from "react-icons/io5";
import ComingSoonRibbon from "../components/messages/coming_soon_ribbon";
import { throttle } from "../util/performance";

/** Stripe integration bits */
import SaveCardForm from "../components/payments/SaveCardForm"; // step 4 component (save card via SetupIntent)
import SubscribeButton from "../components/payments/SubscribeButton"; // step 3 component (Checkout Session)
import { listPaymentMethods } from "../util/apis/billingApi"; // step 1 helper (GET saved cards)
import { useAuth } from "../context/AuthContext";

function getHttpStatus(e: unknown): number | null {
  if (typeof e !== "object" || e === null) return null;
  const ax = e as { response?: { status?: unknown } };
  if (ax.response && typeof ax.response.status === "number")
    return ax.response.status as number;
  const fx = e as { status?: unknown };
  if (typeof fx.status === "number") return fx.status as number;
  return null;
}

// Explicit plan type so map(plan => ...) is not inferred as `never`
type Plan = {
  name: "Schüler" | "Standard" | "Business";
  type: "free" | "paid" | "coming_soon";
  price: string;
  features: string[];
  isCurrent: boolean;
  highlight: boolean;
  cta: string;
  priceId?: string; // required when type === "paid"
  courseId?: string; // optional external identifier you pass to backend
};

// ---------- Animation Variants (unchanged) ----------
const pageVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
  exit: { opacity: 0 },
};

const headerVariants = {
  initial: { opacity: 0, y: -30 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.21, 1.02, 0.47, 1],
    },
  },
};

const cardVariants = {
  initial: { opacity: 0, y: 50 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0, 0.71, 0.2, 1.01],
    },
  },
  hover: {
    y: -12,
    boxShadow:
      "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 15,
    },
  },
  tap: {
    scale: 0.98,
  },
};

const featureItemVariants = {
  initial: { opacity: 0, x: -20 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3 },
  },
};

// ---------- Helpers (unchanged) ----------
const getAccentColor = (planName: string) => {
  switch (planName) {
    case "Schüler":
      return "from-dsp-orange-gradient to-dsp-orange";
    case "Standard":
      return "from-dsp-orange to-dsp-orange-gradient";
    case "Business":
      return "from-dsp-orange-gradient to-[#e67e22]";
    default:
      return "from-gray-500 to-gray-700";
  }
};

const getPlanIcon = (planName: string) => {
  switch (planName) {
    case "Schüler":
      return <IoFlashOutline className="w-7 h-7" />;
    case "Standard":
      return <IoRocketOutline className="w-7 h-7" />;
    case "Business":
      return <IoBuildOutline className="w-7 h-7" />;
    default:
      return null;
  }
};

// ---------- Stripe price IDs (replace with your real ones) ----------
const STANDARD_PRICE_ID =
  import.meta.env.VITE_STRIPE_STANDARD_PRICE_ID ??
  "price_1S13df9d7ohkarhsUi2ogCwg"; // TODO: replace

// Lightweight view state: we keep your visual page intact, but gate it behind “needs card?”
type ViewState = "loading" | "needsCard" | "ready" | "error";

const SubscriptionsPage: React.FC = () => {
  // Visual state (original)
  const [hoveredPlan, setHoveredPlan] = useState<number | null>(null);
  const [scrollY, setScrollY] = useState(0);

  // Stripe flow state
  const [view, setView] = useState<ViewState>("loading");
  const abortRef = React.useRef<AbortController | null>(null);
  const { isAuthenticated } = useAuth();

  // Motion values for your parallax (original)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const circle1X = useTransform(mouseX, (val) => val / 10);
  const circle1Y = useTransform(mouseY, (val) => val / 10);
  const circle2X = useTransform(mouseX, (val) => val / -15);
  const circle2Y = useTransform(mouseY, (val) => val / -15);
  const circle3X = useTransform(mouseX, (val) => val / 20);
  const circle3Y = useTransform(mouseY, (val) => val / -8);

  // Performance: throttle scroll/mouse handlers (your original)
  useEffect(() => {
    const throttledHandleScroll = throttle(() => {
      setScrollY(window.scrollY);
    }, 16);

    const throttledHandleMouseMove = throttle((event: MouseEvent) => {
      mouseX.set(event.clientX - window.innerWidth / 2);
      mouseY.set(event.clientY - window.innerHeight / 2);
    }, 16);

    window.addEventListener("scroll", throttledHandleScroll, { passive: true });
    window.addEventListener("mousemove", throttledHandleMouseMove, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", throttledHandleScroll);
      window.removeEventListener("mousemove", throttledHandleMouseMove);
    };
  }, [mouseX, mouseY]);

  /**
   * On mount (and whenever auth becomes ready), check if the user has a saved card.
   * We wait for `isAuthenticated` so we don’t fire the API while logged out (prevents 401 spam).
   */
  useEffect(() => {
    // Not logged in yet? Just keep the friendly loader.
    if (!isAuthenticated) {
      setView("loading");
      return;
    }

    let cancelled = false;
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    (async () => {
      try {
        setView("loading");

        // First attempt
        const first = await listPaymentMethods(ac.signal);
        if (cancelled) return;

        const hasAny =
          Array.isArray(first?.payment_methods) &&
          first.payment_methods.length > 0;

        setView(hasAny ? "ready" : "needsCard");
      } catch (err) {
        if (cancelled) return;

        const status = getHttpStatus(err);

        // Token race right after register? Try once more after a short delay.
        if (status === 401) {
          try {
            await new Promise((r) => setTimeout(r, 150));
            const second = await listPaymentMethods(ac.signal);
            if (cancelled) return;

            const hasAny =
              Array.isArray(second?.payment_methods) &&
              second.payment_methods.length > 0;

            setView(hasAny ? "ready" : "needsCard");
            return;
          } catch {
            // still unauthorized → show SaveCardForm (user can add/skip)
            setView("needsCard");
            return;
          }
        }

        // Unknown / network error → prefer “needsCard” (more helpful than a hard error)
        setView("needsCard");
      }
    })();

    return () => {
      cancelled = true;
      ac.abort();
    };
  }, [isAuthenticated]);

  // --- Plans (unchanged data, but we’ll wire “Standard” with Stripe) ---
  const plans: Plan[] = [
    {
      name: "Schüler",
      price: "Kostenlos*",
      features: [
        "Zugang zu allen Modulen",
        "Während der gesamten Schulzeit",
        "Support über Lehrer",
        "Danach 10€/Monat",
      ],
      isCurrent: false,
      highlight: false,
      cta: "Als Schüler registrieren",
      type: "free" as const,
    },
    {
      name: "Standard",
      price: "10 € / Monat",
      features: [
        "Alle Module freigeschaltet",
        "Persönliche Lernstatistiken",
        "Community-Support",
        "Unbegrenzte Übungen",
        "Keine Mindestlaufzeit",
      ],
      isCurrent: false,
      highlight: true,
      cta: "Jetzt für 10€/Monat",
      type: "paid" as const,
      priceId: STANDARD_PRICE_ID,
      courseId: "standard", // can be a plan id if you don’t sell per-course
    },
    {
      name: "Business",
      price: "Auf Anfrage",
      features: [
        "Mehrbenutzer-Lizenzen",
        "Admin-Dashboard",
        "Team-Statistiken & Fortschritte",
        "Individualisierte Lernpfade",
        "Volumenlizenzen verfügbar",
      ],
      isCurrent: false,
      highlight: false,
      cta: "Business-Angebot anfragen",
      type: "coming_soon" as const,
    },
  ];

  // ---------- Stripe gate: ask to save card (or skip) ----------
  if (view === "loading") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-gray-600">Lade Aboseite…</div>
      </div>
    );
  }

  if (view === "error") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-lg w-full bg-white/95 shadow-xl rounded-2xl p-6 border border-white/20">
          <h1 className="text-xl font-semibold mb-2">Fehler</h1>
          <p className="text-red-600">
            Konnte Zahlungsdaten nicht laden. Bitte versuche es später erneut.
          </p>
        </div>
      </div>
    );
  }

  if (view === "needsCard") {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Keep your background vibe while asking to save a card */}
        <motion.div
          className="absolute inset-x-0 top-0 h-[150%] z-0"
          style={{
            backgroundImage: `linear-gradient(to bottom right, #FFF7ED, white, #EFF6FF)`,
            backgroundSize: "100% 100%",
            y: scrollY * 0.4,
          }}
        />
        <div className="container mx-auto px-6 py-20 md:py-28 relative z-10 flex items-center justify-center">
          <SaveCardForm
            title="Zahlungsmethode hinzufügen (optional)"
            onSuccess={() => setView("ready")}
            onSkip={() => setView("ready")}
            buttonLabel="Zahlungsmethode speichern"
            showSkip={true}
          />
        </div>
      </div>
    );
  }

  // ---------- Original animated plans (with Standard wired to Stripe) ----------
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Parallax Hintergrund-Element mit Gradient */}
      <motion.div
        className="absolute inset-x-0 top-0 h-[150%] z-0"
        style={{
          backgroundImage: `linear-gradient(to bottom right, #FFF7ED, white, #EFF6FF)`,
          backgroundSize: "100% 100%",
          y: scrollY * 0.4,
        }}
      />

      {/* Animierte Kreise wie auf der Landing Page */}
      <motion.div
        className="absolute top-[15%] left-[10%] w-32 h-32 bg-dsp-orange/30 rounded-full filter blur-xl opacity-70 z-0"
        style={{ x: circle1X, y: circle1Y }}
      />
      <motion.div
        className="absolute bottom-[20%] right-[15%] w-48 h-48 bg-dsp-orange_light/40 rounded-full filter blur-2xl opacity-60 z-0"
        style={{ x: circle2X, y: circle2Y }}
      />
      <motion.div
        className="absolute top-[40%] right-[30%] w-24 h-24 bg-dsp-orange/50 rounded-full filter blur-lg opacity-70 z-0"
        style={{ x: circle3X, y: circle3Y }}
      />

      {/* Decorative Background Elements (kept from develop) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute right-0 top-0 w-[800px] h-[800px] bg-[#ff863d] opacity-[0.02] rounded-full translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute left-0 bottom-0 w-[600px] h-[600px] bg-[#ffe7d4] opacity-[0.05] rounded-full -translate-x-1/3 translate-y-1/3"></div>
        {/* ... (keep your animated shapes exactly as before) ... */}
      </div>

      <div className="container mx-auto px-6 py-20 md:py-28 relative z-10">
        <motion.div
          variants={headerVariants}
          initial="initial"
          animate="animate"
          className="text-center mb-20"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-gray-700 mb-6">
            Wähle deinen Plan
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Finde das Abonnement, das am besten zu deinen Lernzielen passt und
            starte noch heute deine Reise in die digitale Signalverarbeitung.
          </p>
        </motion.div>

        <motion.div
          variants={pageVariants}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 max-w-6xl mx-auto"
        >
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              initial="initial"
              animate="animate"
              whileHover="hover"
              whileTap="tap"
              onHoverStart={() => setHoveredPlan(index)}
              onHoverEnd={() => setHoveredPlan(null)}
              className={`rounded-2xl overflow-hidden flex flex-col bg-white ${
                plan.highlight
                  ? "md:scale-105 ring-4 ring-dsp-orange ring-opacity-50"
                  : "ring-1 ring-gray-200"
              }`}
              style={{
                boxShadow: "0 10px 40px -10px rgba(0, 0, 0, 0.1)",
                isolation: "isolate",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Ribbons:
                 - Keep Business as "coming soon"
                 - Standard is now live → remove its ribbon */}
              {plan.name === "Business" && (
                <ComingSoonRibbon
                  position="top-right"
                  text="Demnächst verfügbar"
                />
              )}

              {/* Plan Header with Gradient */}
              <div
                className={`p-6 bg-gradient-to-r ${getAccentColor(
                  plan.name,
                )} text-white relative overflow-hidden`}
              >
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-white opacity-10 rounded-full"></div>
                <div className="absolute -left-4 -bottom-10 w-24 h-24 bg-black opacity-10 rounded-full"></div>

                <div className="flex items-center mb-3">
                  <div className="p-2 bg-white bg-opacity-20 rounded-lg mr-3">
                    {getPlanIcon(plan.name)}
                  </div>
                  <h2 className="text-2xl font-extrabold">{plan.name}</h2>
                </div>
                <p className="text-4xl font-extrabold mb-2">{plan.price}</p>
                {plan.highlight && (
                  <div className="mt-2 py-1 px-3 text-dsp-orange bg-white bg-opacity-20 text-sm inline-block rounded-full">
                    Meist gewählt
                  </div>
                )}
              </div>

              {/* Features */}
              <div className="p-8 flex flex-col flex-grow bg-gradient-to-b from-white to-gray-50">
                <h3 className="font-semibold text-gray-700 mb-4 text-lg">
                  Enthaltene Features:
                </h3>
                <ul className="space-y-4 mb-10 text-gray-700 flex-grow">
                  <AnimatePresence>
                    {plan.features.map((feature, fIndex) => (
                      <motion.li
                        key={fIndex}
                        variants={featureItemVariants}
                        initial="initial"
                        animate="animate"
                        transition={{ delay: fIndex * 0.1 }}
                        className="flex items-start"
                      >
                        <span className="mr-3 text-dsp-orange">
                          <IoCheckmarkCircleOutline className="w-6 h-6" />
                        </span>
                        <span>{feature}</span>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>

                {/* CTA: wire Standard → Stripe; keep Schüler free; Business disabled */}
                <div className="w-full">
                  {plan.type === "paid" ? (
                    <SubscribeButton
                      priceId={plan.priceId!}
                      courseId={plan.courseId ?? plan.name}
                      label={plan.cta}
                      className={`w-full py-4 px-6 rounded-xl font-bold text-base transition cursor-pointer ${
                        plan.highlight
                          ? "bg-gradient-to-r from-[#ff863d] to-[#ff863d] text-white"
                          : `bg-gradient-to-r ${getAccentColor(plan.name)} text-white`
                      } focus:outline-none focus:ring-2 focus:ring-dsp-orange focus:ring-opacity-50`}
                    />
                  ) : (
                    <motion.button
                      whileHover={{
                        scale: plan.type === "coming_soon" ? 1.0 : 1.03,
                      }}
                      whileTap={{
                        scale: plan.type === "coming_soon" ? 1.0 : 0.97,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 17,
                      }}
                      disabled={plan.type === "coming_soon" || plan.isCurrent}
                      className={`w-full py-4 px-6 rounded-xl font-bold text-base transition cursor-pointer ${
                        plan.isCurrent || plan.type === "coming_soon"
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : `bg-gradient-to-r ${getAccentColor(plan.name)} text-white`
                      } focus:outline-none focus:ring-2 focus:ring-dsp-orange focus:ring-opacity-50`}
                      onClick={() => {
                        if (plan.type === "free") {
                          // Free flow: no Stripe; send them to dashboard or onboarding
                          window.location.assign("/dashboard");
                        }
                      }}
                    >
                      {plan.isCurrent
                        ? "Aktueller Plan"
                        : plan.type === "coming_soon"
                          ? "Demnächst verfügbar"
                          : plan.cta}
                    </motion.button>
                  )}
                </div>
              </div>

              {/* Hover indicator (unchanged) */}
              {hoveredPlan === index && (
                <motion.div
                  className="absolute inset-0 border-4 border-dsp-orange rounded-2xl pointer-events-none"
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                />
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* FAQ / extra (unchanged) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-20 text-center"
        >
          <p className="text-gray-600">
            Fragen zu unseren Plänen?{" "}
            <a
              href="#contact"
              className="text-dsp-orange font-medium hover:underline"
            >
              Kontaktiere unser Team
            </a>
          </p>
          <p className="text-sm text-gray-500 mt-3">
            * Gilt für Schüler im Frontalunterricht. Kostenloser Zugang während
            der gesamten Schulzeit, danach vergünstigter Tarif von 10€/Monat.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default SubscriptionsPage;
