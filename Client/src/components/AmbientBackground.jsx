import React from 'react';
import { motion } from 'framer-motion';

const AmbientBackground = ({ children, className = "" }) => {
    return (
        <div className={`relative w-full min-h-full overflow-hidden ${className}`}>
            {/* Liquid Gradients */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <motion.div 
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 90, 0],
                        x: [0, 50, 0],
                        y: [0, -30, 0],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary-500/10 blur-[120px] rounded-full"
                />
                <motion.div 
                    animate={{
                        scale: [1.2, 1, 1.2],
                        rotate: [0, -120, 0],
                        x: [0, -80, 0],
                        y: [0, 40, 0],
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full"
                />
                <motion.div 
                    animate={{
                        scale: [1, 1.5, 1],
                        x: [0, 100, 0],
                        y: [0, 100, 0],
                    }}
                    transition={{
                        duration: 30,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-purple-500/5 blur-[100px] rounded-full"
                />
            </div>
            
            {/* Content Overflow */}
            <div className="relative z-10 w-full h-full">
                {children}
            </div>
        </div>
    );
};

export default AmbientBackground;
