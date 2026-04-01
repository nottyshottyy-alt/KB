import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, PerspectiveCamera, Environment, MeshDistortMaterial, Text, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import ErrorBoundary from './ErrorBoundary';

const MonitorModel = ({ isMobile }) => {
    const group = useRef();
    const [mouse, setMouse] = useState({ x: 0, y: 0 });

    // Handle mouse move for parallax on desktop
    useEffect(() => {
        if (isMobile) return;
        const handleMouseMove = (e) => {
            setMouse({
                x: (e.clientX / window.innerWidth - 0.5) * 2,
                y: (e.clientY / window.innerHeight - 0.5) * 2
            });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [isMobile]);

    useFrame((state) => {
        if (!group.current) return;
        const t = state.clock.getElapsedTime();
        
        if (!isMobile) {
            // Smooth mouse followers
            group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, mouse.y * 0.1, 0.1);
            group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, mouse.x * 0.1, 0.1);
        } else {
            // Subtle auto-motion on mobile
            group.current.rotation.y = Math.sin(t * 0.5) * 0.1;
        }
    });

    return (
        <group ref={group} rotation={[0.1, -0.2, 0]}>
            {/* Monitor Stand */}
            <mesh position={[0, -1.2, 0]}>
                <cylinderGeometry args={[0.05, 0.4, 0.5, 32]} />
                <meshStandardMaterial color="#222" metalness={0.9} roughness={0.1} />
            </mesh>

            {/* Monitor Body */}
            <RoundedBox args={[3.2, 1.8, 0.1]} radius={0.05} smoothness={4}>
                <meshStandardMaterial color="#111" metalness={0.8} roughness={0.2} />
            </RoundedBox>

            {/* Screen */}
            <mesh position={[0, 0, 0.051]}>
                <planeGeometry args={[3, 1.6]} />
                <MeshDistortMaterial 
                    color="#44d62c" 
                    speed={2} 
                    distort={0.1} 
                    radius={1}
                    emissive="#44d62c"
                    emissiveIntensity={0.8}
                    metalness={0.9}
                    roughness={0.1}
                />
            </mesh>

            {/* Decorative Glow Elements */}
            <mesh position={[0, 0, -0.05]} rotation={[0, Math.PI, 0]}>
                <planeGeometry args={[3.3, 1.9]} />
                <meshBasicMaterial color="#44d62c" transparent opacity={0.1} />
            </mesh>
        </group>
    );
};

const Hero3DScene = () => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
        <div className="w-full h-full relative">
            <Canvas dpr={[1, 2]} performance={{ min: 0.5 }} gl={{ antialias: true }} camera={{ position: [0, 0, 5], fov: isMobile ? 50 : 40 }}>
                <ambientLight intensity={0.4} />
                {/* Dynamic Fallback Lights */}
                <pointLight position={[10, 10, 10]} intensity={1.5} color="#44d62c" />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="#22c55e" />
                <spotLight position={[0, 5, 0]} angle={0.3} penumbra={1} intensity={2} color="#fff" />
                
                <ErrorBoundary fallback={
                    <group>
                        <pointLight position={[5, 5, 5]} intensity={2} color="#44d62c" />
                        <pointLight position={[-5, 5, 5]} intensity={1} color="#ffffff" />
                        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                            <MonitorModel isMobile={isMobile} />
                        </Float>
                    </group>
                }>
                    <Suspense fallback={null}>
                        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                            <MonitorModel isMobile={isMobile} />
                        </Float>
                        <Environment preset="city" />
                    </Suspense>
                </ErrorBoundary>
            </Canvas>
            
            {/* Fallback Text for SEO/Accessibility */}
            <div className="sr-only">
                3D Interactive Digital Monitor Environment
            </div>
        </div>
    );
};

export default Hero3DScene;
