'use client';

import React from 'react';
import { motion } from 'framer-motion';

const ScrollStorySection = ({ children, animationType = "reveal" }) => {
  const variants = {
    reveal: {
      hidden: { opacity: 0, y: 50 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
    },
    zoom: {
      hidden: { opacity: 0, scale: 0.95 },
      visible: { opacity: 1, scale: 1, transition: { duration: 1, ease: [0.22, 1, 0.36, 1] } }
    }
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={variants[animationType]}
    >
      {children}
    </motion.div>
  );
};

export default ScrollStorySection;
