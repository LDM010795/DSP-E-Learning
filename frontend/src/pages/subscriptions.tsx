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

// Animation Variants
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

// Helper function für Farbberechnung
const getAccentColor = (planName: string) => {
  switch (planName) {
    case "Schüler":
      return "from-[#fa8c45] to-[#ff863d]";
    case "Standard":
      return "from-[#ff863d] to-[#fa8c45]";
    case "Business":
      return "from-[#fa8c45] to-[#e67e22]";
    default:
      return "from-gray-500 to-gray-700";
  }
};

// Helper function für Icons
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

const SubscriptionsPage: React.FC = () => {
  // State für Hover-Effekte
  const [hoveredPlan, setHoveredPlan] = useState<number | null>(null);
  const [scrollY, setScrollY] = useState(0);

  // Motion Values für Mausposition
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Transformationen für Parallax-Effekt der Kreise
  const circle1X = useTransform(mouseX, (val) => val / 10);
  const circle1Y = useTransform(mouseY, (val) => val / 10);
  const circle2X = useTransform(mouseX, (val) => val / -15);
  const circle2Y = useTransform(mouseY, (val) => val / -15);
  const circle3X = useTransform(mouseX, (val) => val / 20);
  const circle3Y = useTransform(mouseY, (val) => val / -8);

  // Effekt zum Aktualisieren der Scroll-Position und Mausposition
  useEffect(() => {
    // Throttled Event Handler für bessere Performance (60fps = ~16ms)
    const throttledHandleScroll = throttle(() => {
      setScrollY(window.scrollY);
    }, 16);

    const throttledHandleMouseMove = throttle((event: MouseEvent) => {
      // Setze die Motion Values relativ zur Fenstergröße
      mouseX.set(event.clientX - window.innerWidth / 2);
      mouseY.set(event.clientY - window.innerHeight / 2);
    }, 16);

    // Listener hinzufügen mit passive: true für bessere Performance
    window.addEventListener("scroll", throttledHandleScroll, { passive: true });
    window.addEventListener("mousemove", throttledHandleMouseMove, {
      passive: true,
    });

    // Cleanup-Funktion
    return () => {
      window.removeEventListener("scroll", throttledHandleScroll);
      window.removeEventListener("mousemove", throttledHandleMouseMove);
    };
  }, [mouseX, mouseY]);

  // Beispiel-Daten für Abo-Pläne
  const plans = [
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
    },
  ];

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
        className="absolute top-[15%] left-[10%] w-32 h-32 bg-[#ff863d]/30 rounded-full filter blur-xl opacity-70 z-0"
        style={{ x: circle1X, y: circle1Y }}
      />
      <motion.div
        className="absolute bottom-[20%] right-[15%] w-48 h-48 bg-[#ffe7d4]/40 rounded-full filter blur-2xl opacity-60 z-0"
        style={{ x: circle2X, y: circle2Y }}
      />
      <motion.div
        className="absolute top-[40%] right-[30%] w-24 h-24 bg-[#fa8c45]/50 rounded-full filter blur-lg opacity-70 z-0"
        style={{ x: circle3X, y: circle3Y }}
      />

      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute right-0 top-0 w-[800px] h-[800px] bg-[#ff863d] opacity-[0.02] rounded-full translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute left-0 bottom-0 w-[600px] h-[600px] bg-[#ffe7d4] opacity-[0.05] rounded-full -translate-x-1/3 translate-y-1/3"></div>

        {/* Animated geometric shapes */}
        <motion.div
          className="absolute top-[10%] left-[10%] w-16 h-16 bg-[#ffe7d4] opacity-10 rounded-lg"
          animate={{
            rotate: 360,
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute top-[20%] right-[15%] w-20 h-20 bg-[#ff863d] opacity-10 rounded-full"
          animate={{
            y: [0, -50, 0],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-[15%] right-[25%] w-24 h-24 bg-[#fa8c45] opacity-10 rounded-lg rotate-45"
          animate={{
            rotate: [45, 90, 45],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Große verschwommene Form */}
        <motion.div
          className="absolute top-[35%] left-[5%] w-56 h-56 bg-[#ff863d] opacity-30 rounded-full filter blur-[80px]"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Scharfe Formen */}
        <motion.div
          className="absolute top-[45%] right-[20%] w-28 h-28 bg-[#fa8c45] opacity-20 rounded-xl"
          animate={{
            rotate: [0, 90, 180, 270, 360],
            x: [0, 50, 0, -50, 0],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Cluster von kleinen Kreisen */}
        <div className="absolute bottom-[25%] left-[25%]">
          <motion.div
            className="absolute w-5 h-5 bg-[#ff863d] opacity-40 rounded-full"
            animate={{
              x: [0, 15, 0, -15, 0],
              y: [0, 10, -10, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
            }}
          />
          <motion.div
            className="absolute w-3 h-3 bg-[#fa8c45] opacity-50 rounded-full transform translate-x-8"
            animate={{
              x: [8, 20, 8, -5, 8],
              y: [0, -5, 5, 0],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              delay: 0.3,
            }}
          />
          <motion.div
            className="absolute w-4 h-4 bg-[#ffe7d4] opacity-40 rounded-full transform translate-x-5 translate-y-6"
            animate={{
              x: [5, 15, 5, -5, 5],
              y: [6, 0, 12, 6],
            }}
            transition={{
              duration: 9,
              repeat: Infinity,
              delay: 0.7,
            }}
          />
        </div>

        {/* Leicht verschwommene Elemente */}
        <motion.div
          className="absolute top-[60%] right-[35%] w-32 h-32 bg-[#ff863d] opacity-10 rounded-full filter blur-[20px]"
          animate={{
            scale: [1, 1.5, 1],
            x: [0, 30, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Polygone */}
        <motion.div
          className="absolute top-[15%] left-[40%] w-20 h-20 opacity-20 bg-gradient-to-br from-[#ff863d] to-[#ffe7d4]"
          style={{ clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" }}
          animate={{
            rotate: [0, 90, 0],
            scale: [1, 1.2, 0.8, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
          }}
        />

        {/* Starker Blur-Effekt im Hintergrund */}
        <motion.div
          className="absolute top-[70%] right-[10%] w-96 h-96 bg-[#fa8c45] opacity-5 rounded-full filter blur-[120px]"
          animate={{
            scale: [1, 1.2, 0.9, 1.2, 1],
            opacity: [0.05, 0.08, 0.05],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Schwebende transparente Linien */}
        <motion.div
          className="absolute top-[50%] left-[15%] w-40 h-[1px] bg-[#ff863d] opacity-30"
          animate={{
            rotate: [0, 20, -20, 0],
            width: ["10rem", "15rem", "10rem"],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
          }}
        />
        <motion.div
          className="absolute top-[53%] left-[15%] w-32 h-[1px] bg-[#ffe7d4] opacity-25"
          animate={{
            rotate: [0, -15, 15, 0],
            width: ["8rem", "12rem", "8rem"],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            delay: 0.5,
          }}
        />
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
              {/* Ribbons nur für mittlere und rechte Karte */}
              {plan.name === "Standard" && (
                <ComingSoonRibbon
                  position="top-right"
                  text="Demnächst verfügbar"
                />
              )}
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
                {/* Decorative circle */}
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

                {/* Button */}
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  disabled={plan.isCurrent}
                  className={`w-full py-4 px-6 rounded-xl font-bold text-base transition cursor-pointer ${
                    plan.isCurrent
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : plan.highlight
                        ? "bg-gradient-to-r from-[#ff863d] to-[#ff863d] text-white"
                        : `bg-gradient-to-r ${getAccentColor(
                            plan.name,
                          )} text-white`
                  } focus:outline-none focus:ring-2 focus:ring-dsp-orange focus:ring-opacity-50`}
                >
                  {plan.isCurrent ? "Aktueller Plan" : plan.cta}
                </motion.button>
              </div>

              {/* Hover indicator */}
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

        {/* FAQ or additional info section could be added here */}
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
