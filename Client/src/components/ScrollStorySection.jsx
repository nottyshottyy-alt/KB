import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const ScrollStorySection = ({ children, className = "", animationType = "reveal" }) => {
    const sectionRef = useRef(null);

    useEffect(() => {
        const element = sectionRef.current;
        if (!element) return;

        let ctx = gsap.context(() => {
            if (animationType === "reveal") {
                gsap.fromTo(element, 
                    { opacity: 0, y: 50 },
                    { 
                        opacity: 1, 
                        y: 0, 
                        duration: 1,
                        ease: "power2.out",
                        scrollTrigger: {
                            trigger: element,
                            start: "top 85%",
                            toggleActions: "play none none none"
                        }
                    }
                );
            } else if (animationType === "zoom") {
                gsap.fromTo(element, 
                    { scale: 0.9, opacity: 0 },
                    { 
                        scale: 1, 
                        opacity: 1, 
                        duration: 1.2,
                        ease: "power2.out",
                        scrollTrigger: {
                            trigger: element,
                            start: "top 80%",
                            toggleActions: "play none none none"
                        }
                    }
                );
            }
        }, element);

        return () => ctx.revert();
    }, [animationType]);

    return (
        <div ref={sectionRef} className={className}>
            {children}
        </div>
    );
};

export default ScrollStorySection;
