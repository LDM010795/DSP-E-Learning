import React from "react";
import { motion } from "framer-motion";
import { IoPeopleOutline, IoTrophyOutline } from "react-icons/io5";
import ComparisonBar from "../../components/charts/ComparisonBar";
import SubBackground from "../../components/layouts/SubBackground";

// Platzhalterdaten (Beispiele)
const comparisonData = [
  { name: "Modulabschluss", average: 65, user: 85, maxValue: 100, unit: "%" },
  { name: "Gelöste Aufgaben", average: 42, user: 48, maxValue: 60, unit: "" },
  {
    name: "Lernzeit (Std./Woche)",
    average: 6.5,
    user: 7.2,
    maxValue: 10,
    unit: "h",
  },
];
const userPosition =
  "Du gehörst zu den oberen 25% der Lernenden auf dieser Plattform.";

const Comparison: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="group"
    >
      <SubBackground className="hover:bg-white/80 transition-all duration-200">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 rounded-lg bg-[#ffe7d4]">
            <IoPeopleOutline className="w-5 h-5 text-dsp-orange" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 group-hover:text-dsp-orange transition-colors duration-200">
              Vergleich mit anderen Lernenden
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Wie du im Vergleich zu anderen Lernenden abschneidest
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
          {comparisonData.map((item, index) => (
            <motion.div
              key={item.name}
              className="text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
            >
              <p className="text-sm font-medium text-gray-700 mb-6">
                {item.name}
              </p>
              <div className="flex items-end justify-center gap-4 h-24">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                >
                  <ComparisonBar
                    value={item.average}
                    maxValue={item.maxValue}
                    colorClass="bg-gray-300"
                    label="Durchschnitt"
                    displayValue={`${item.average}${item.unit || ""}`}
                  />
                </motion.div>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                >
                  <ComparisonBar
                    value={item.user}
                    maxValue={item.maxValue}
                    colorClass="bg-gradient-to-t from-dsp-orange to-dsp-orange-gradient"
                    label="Du"
                    displayValue={`${item.user}${item.unit || ""}`}
                  />
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-8 p-4 bg-gradient-to-r from-[#ffe7d4]/50 to-[#ffe7d4]/30 border border-dsp-orange/20 rounded-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.8 }}
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-dsp-orange/10">
              <IoTrophyOutline className="w-6 h-6 text-dsp-orange" />
            </div>
            <div>
              <p className="font-semibold text-gray-800">Deine Position</p>
              <p className="text-sm text-gray-600 leading-relaxed">
                {userPosition}
              </p>
            </div>
          </div>
        </motion.div>
      </SubBackground>
    </motion.div>
  );
};

export default Comparison;
