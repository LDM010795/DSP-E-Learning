import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, useMotionValue, useTransform } from "framer-motion"; // Importiere von framer-motion
import ButtonPrimary from "../components/ui_elements/buttons/button_primary";
import ButtonSecondary from "../components/ui_elements/buttons/button_secondary";
import LogoDSP from "../assets/dsp_no_background.png"; // Importiere das Logo
import useScrollAnimation from "../hooks/useScrollAnimation"; // Importiere den Hook
import {
  IoRocketOutline,
  IoLayersOutline,
  IoCodeSlashOutline,
  IoChatbubblesOutline,
  IoSchoolOutline,
  IoPlayCircleOutline,
  IoCheckmarkCircleOutline,
  IoPersonCircleOutline,
  IoClose,
} from "react-icons/io5";

// Hilfskomponente für animierte Abschnitte
interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: string; // Tailwind Delay Klasse, z.B. 'delay-300'
}
const AnimatedSection: React.FC<AnimatedSectionProps> = ({
  children,
  className = "",
  delay = "",
}) => {
  const [ref, isVisible] = useScrollAnimation<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${delay} ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      } ${className}`}
    >
      {children}
    </div>
  );
};

// Hilfskomponente für Feature-Karten
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: string;
}
const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  delay,
}) => (
  <AnimatedSection
    delay={delay}
    className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm text-center"
  >
    <div className="inline-block p-4 bg-dsp-orange_light text-dsp-orange rounded-full mb-4">
      {icon}
    </div>
    <h3 className="text-lg font-semibold mb-2 text-gray-800">{title}</h3>
    <p className="text-sm text-gray-600">{description}</p>
  </AnimatedSection>
);

function LandingPage() {
  // State für Parallax-Effekt
  const [scrollY, setScrollY] = useState(0);
  // State für das Video-Modal
  const [isVideoModalOpen, setVideoModalOpen] = useState(false);

  // Motion Values für Mausposition
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Transformationen für Parallax-Effekt der Kreise
  // Der Wert (z.B. 10, -15) bestimmt die Stärke und Richtung des Effekts
  const circle1X = useTransform(mouseX, (val) => val / 10);
  const circle1Y = useTransform(mouseY, (val) => val / 10);
  const circle2X = useTransform(mouseX, (val) => val / -15);
  const circle2Y = useTransform(mouseY, (val) => val / -15);
  const circle3X = useTransform(mouseX, (val) => val / 20);
  const circle3Y = useTransform(mouseY, (val) => val / -8);

  // Effekt zum Aktualisieren der Scroll-Position und Mausposition
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    const handleMouseMove = (event: MouseEvent) => {
      // Setze die Motion Values relativ zur Fenstergröße
      mouseX.set(event.clientX - window.innerWidth / 2);
      mouseY.set(event.clientY - window.innerHeight / 2);
    };

    // Listener hinzufügen
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handleMouseMove);

    // Cleanup-Funktion
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [mouseX, mouseY]); // Abhängigkeiten hinzufügen

  return (
    <div className="bg-gradient-to-b from-white to-gray-50 overflow-x-hidden mx-[-80px] my-[-40px]">
      {/* Hero Section - mit Parallax und Maus-Effekten */}
      <section className="relative overflow-hidden p-6 pt-20 pb-20 flex flex-col items-center justify-center text-center min-h-screen">
        {/* Parallax Hintergrund-Element mit Punktmuster */}
        <motion.div
          className="absolute inset-x-0 top-0 h-[150%] z-0"
          style={{
            // Nur der lineare Gradient bleibt übrig
            backgroundImage: `linear-gradient(to bottom right, #FFF7ED, white, #EFF6FF)`,
            backgroundSize: "100% 100%", // Nur noch Größe für den linearen Gradienten
            // Bestehender Parallax-Effekt für Scroll
            y: scrollY * 0.4,
          }}
        />

        {/* Animierte Kreise */}
        <motion.div
          className="absolute top-[15%] left-[10%] w-32 h-32 bg-dsp-orange/40 rounded-full filter blur-xl opacity-70 z-0"
          style={{ x: circle1X, y: circle1Y }}
        />
        <motion.div
          className="absolute bottom-[20%] right-[15%] w-48 h-48 bg-dsp-orange/40 rounded-full filter blur-2xl opacity-60 z-0"
          style={{ x: circle2X, y: circle2Y }}
        />
        <motion.div
          className="absolute top-[40%] right-[30%] w-24 h-24 bg-orange-200/50 rounded-full filter blur-lg opacity-70 z-0"
          style={{ x: circle3X, y: circle3Y }}
        />

        {/* Hero-Inhalt (muss über dem Hintergrund und den Kreisen liegen) */}
        <div className="relative z-20">
          {" "}
          {/* z-10 stellt sicher, dass der Inhalt über dem Parallax-Div liegt */}
          <AnimatedSection className="flex justify-center items-center">
            <img
              src={LogoDSP}
              alt="DataSmart Logo"
              className="mb-8 h-24 w-auto object-contain"
            />
          </AnimatedSection>
          <AnimatedSection delay="delay-100">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Willkommen bei DataSmart E-Learning!
            </h1>
          </AnimatedSection>
          <AnimatedSection delay="delay-200">
            <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto">
              Deine interaktive Plattform für praxisnahes Lernen im Bereich Data
              Science. Starte jetzt und erweitere deine Fähigkeiten.
            </p>
          </AnimatedSection>
          <AnimatedSection delay="delay-300">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/dashboard">
                <ButtonPrimary
                  title="Zum Dashboard"
                  onClick={() => {}}
                  classNameButton="w-full sm:w-auto"
                />
              </Link>
              <Link to="/modules">
                <ButtonSecondary
                  title="Module entdecken"
                  onClick={() => {}}
                  classNameButton="w-full sm:w-auto"
                />
              </Link>
            </div>
          </AnimatedSection>
          {/* Video Preview Section */}
          <AnimatedSection
            delay="delay-400"
            className="mt-16 w-full max-w-3xl mx-auto"
          >
            <div className="relative rounded-xl shadow-2xl overflow-hidden group">
              {/* Blurred Background Image */}
              <img
                src={LogoDSP} // Platzhalter - ersetzen durch relevantes Vorschaubild
                alt="Video Vorschau"
                className="w-full h-auto object-cover filter blur-md scale-105"
              />

              {/* Overlay und Play Button */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <button
                  onClick={() => setVideoModalOpen(true)} // Öffnet das Modal
                  className="relative flex items-center justify-center w-20 h-20 bg-white/80 rounded-full shadow-xl backdrop-blur-sm group-hover:bg-white transition-colors duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 cursor-pointer"
                  aria-label="Video abspielen"
                >
                  {/* Pulsierender Hintergrund */}
                  <span className="absolute inline-flex h-full w-full rounded-full bg-white opacity-75 animate-ping"></span>
                  {/* Play Icon */}
                  <IoPlayCircleOutline className="relative w-16 h-16 text-dsp-orange z-10" />
                </button>
              </div>

              {/* Dekorative Kreise */}
              <div className="absolute -left-5 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg opacity-80 hidden md:block"></div>
              <div className="absolute -right-4 -top-4 w-12 h-12 bg-orange-100 rounded-full shadow-lg opacity-70 hidden md:block"></div>
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-10 h-10 bg-white rounded-full shadow-lg opacity-80 hidden md:block"></div>
            </div>
          </AnimatedSection>
        </div>
      </section>
      {/* Features Section */}
      <section className="py-20 px-6 bg-white">
        <AnimatedSection className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-3">
            Was DataSmart Learning besonders macht
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            Entdecke die Vorteile unserer Lernplattform.
          </p>
        </AnimatedSection>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <FeatureCard
            icon={<IoRocketOutline size={28} />}
            title="Praxisnahe Projekte"
            description="Wende dein Wissen direkt in realitätsnahen Projekten und Fallstudien an."
            delay="delay-100"
          />
          <FeatureCard
            icon={<IoLayersOutline size={28} />}
            title="Strukturierte Lernpfade"
            description="Folge klaren Pfaden vom Anfänger bis zum Experten in verschiedenen Data-Science-Bereichen."
            delay="delay-200"
          />
          <FeatureCard
            icon={<IoCodeSlashOutline size={28} />}
            title="Interaktiver Code-Editor"
            description="Übe direkt im Browser mit unserem integrierten Code-Editor und sofortigem Feedback."
            delay="delay-300"
          />
        </div>
      </section>
      {/* How it Works Section */}
      <section className="py-20 px-6 bg-gray-100">
        <AnimatedSection className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-3">
            So einfach funktioniert's
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            In wenigen Schritten zu neuen Data-Science-Skills.
          </p>
        </AnimatedSection>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center ">
          <AnimatedSection delay="delay-100">
            <div className="mb-4">
              <IoPlayCircleOutline
                size={48}
                className="mx-auto text-dsp-orange"
              />
            </div>
            <h3 className="text-lg font-semibold mb-2">1. Modul wählen</h3>
            <p className="text-sm text-gray-600">
              Stöbere durch unsere Kurse und wähle das Thema, das dich
              interessiert.
            </p>
          </AnimatedSection>
          <AnimatedSection delay="delay-200">
            <div className="mb-4 ">
              <IoSchoolOutline size={48} className="mx-auto text-dsp-orange" />
            </div>
            <h3 className="text-lg font-semibold mb-2">2. Interaktiv lernen</h3>
            <p className="text-sm text-gray-600">
              Arbeite Videos durch, lies Texte und löse Aufgaben im Code-Editor.
            </p>
          </AnimatedSection>
          <AnimatedSection delay="delay-300">
            <div className="mb-4">
              <IoCheckmarkCircleOutline
                size={48}
                className="mx-auto text-dsp-orange"
              />
            </div>
            <h3 className="text-lg font-semibold mb-2">3. Wissen anwenden</h3>
            <p className="text-sm text-gray-600">
              Stelle dein Können in Projekten und der Abschlussprüfung unter
              Beweis.
            </p>
          </AnimatedSection>
        </div>
      </section>
      {/* Course Highlights Section */}
      <section className="py-20 px-6 bg-white">
        <AnimatedSection className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-3">
            Entdecke unsere Top-Themen
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            Ein Auszug aus unserem vielfältigen Kursangebot.
          </p>
        </AnimatedSection>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {[
            { name: "Python für Data Science", delay: "delay-100" },
            { name: "Excel für Analysten", delay: "delay-200" },
            { name: "SQL-Datenbanken", delay: "delay-300" },
            { name: "Power BI Dashboards", delay: "delay-400" },
          ].map((item) => (
            <AnimatedSection
              key={item.name}
              delay={item.delay}
              className="p-6 bg-gray-50 rounded-lg border border-gray-200 text-center font-medium text-gray-700"
            >
              {item.name}
            </AnimatedSection>
          ))}
        </div>
      </section>
      {/* Testimonials Section (Platzhalter) */}
      <section className="py-20 px-6 bg-gray-100">
        <AnimatedSection className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-3">
            Das sagen unsere Nutzer
          </h2>
          {/* <p className="text-gray-600">Optionaler Subtext</p> */}
        </AnimatedSection>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {[1, 2].map((i) => (
            <AnimatedSection
              key={i}
              delay={`delay-${i * 100}`}
              className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm"
            >
              <IoChatbubblesOutline className="text-dsp-orange text-3xl mb-3" />
              <p className="text-gray-600 italic mb-4">
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua."
              </p>
              <div className="flex items-center">
                <IoPersonCircleOutline className="text-gray-400 text-4xl mr-3" />
                <div>
                  <p className="font-semibold text-sm text-gray-800">
                    Max Mustermann {i}
                  </p>
                  <p className="text-xs text-gray-500">
                    Data Analyst bei Firma {i}
                  </p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>
      {/* Final CTA Section */}
      <section className="py-20 px-6 text-center bg-gradient-to-r from-dsp-orange to-orange-500 text-white">
        <AnimatedSection>
          <h2 className="text-3xl font-bold mb-4">
            Bereit, deine Data-Science-Karriere zu starten?
          </h2>
          <p className="mb-8 max-w-xl mx-auto">
            Registriere dich jetzt oder melde dich an, um vollen Zugriff auf
            alle Lerninhalte zu erhalten.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/dashboard">
              <ButtonSecondary
                title="Jetzt starten"
                onClick={() => {}}
                classNameButton="border border-white text-white hover:bg-white hover:text-dsp-orange w-full sm:w-auto"
              />
            </Link>
            <Link to="/modules">
              <ButtonSecondary
                title="Kurse ansehen"
                onClick={() => {}}
                classNameButton="border-white text-white hover:bg-white hover:text-dsp-orange w-full sm:w-auto"
              />
            </Link>
          </div>
        </AnimatedSection>
      </section>
      {/* Footer */}
      <footer className="p-6 text-center text-sm text-gray-500 bg-white border-t border-gray-200">
        © {new Date().getFullYear()} DataSmart Learning. Alle Rechte
        vorbehalten.
        {/* Optional: Links zu Impressum, Datenschutz */}
      </footer>

      {/* Video Modal */}
      {isVideoModalOpen && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setVideoModalOpen(false)} // Schließt Modal bei Klick auf Hintergrund
        >
          <div
            className="relative bg-white p-2 rounded-lg shadow-xl w-full max-w-4xl aspect-video"
            onClick={(e) => e.stopPropagation()} // Verhindert Schließen bei Klick im Modal
          >
            <button
              onClick={() => setVideoModalOpen(false)}
              className="absolute -top-3 -right-3 z-10 w-8 h-8 bg-gray-700 text-white rounded-full flex items-center justify-center hover:bg-gray-900 transition-colors"
              aria-label="Modal schließen"
            >
              <IoClose size={20} />
            </button>
            <iframe
              className="w-full h-full rounded"
              src="https://www.youtube.com/embed/r-uOLxNrNk8?autoplay=1" // Aktualisierte, verfügbare Data Analysis Video URL mit Autoplay
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
}

export default LandingPage;
