
import { motion } from "framer-motion";

export const LogoLoader = () => {
  return (
    <div className="relative w-64 h-64 mx-auto">
      <motion.div
        className="absolute inset-0 border-4 border-primary rounded-full"
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 360],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute inset-4 border-4 border-primary/60 rounded-full"
        animate={{
          scale: [1.2, 1, 1.2],
          rotate: [360, 0],
          opacity: [1, 0.5, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="text-lg font-semibold text-primary"
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          Generating Logo
        </motion.div>
      </div>
    </div>
  );
};
