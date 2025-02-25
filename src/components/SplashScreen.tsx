
import { motion } from "framer-motion";

export const SplashScreen = () => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-5xl font-bold text-primary mb-4">Logo Genie</h1>
        <p className="text-lg text-gray-600">Your AI-Powered Logo Designer</p>
      </motion.div>
    </div>
  );
};
