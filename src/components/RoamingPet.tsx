import { useState, useEffect, useRef } from 'react';
import { type CharacterStats } from '../lib/storage';

// ----------------------------------------------------------------------
// 1. 이미지 에셋 로드 (src/assets)
// ----------------------------------------------------------------------
import catImg from '../assets/cat.png';
import eeveeImg from '../assets/eevee.png';
import sylveonImg from '../assets/sylveon.png';
import leafeonImg from '../assets/leafeon.png';
import flareonImg from '../assets/flareon.png';
import glaceonImg from '../assets/glaceon.png';

const IMAGE_MAP = {
    cat: catImg,
    eevee: eeveeImg,
    sylveon: sylveonImg,
    leafeon: leafeonImg,
    flareon: flareonImg,
    glaceon: glaceonImg,
};

interface RoamingPetProps {
    stats: CharacterStats;
}

export default function RoamingPet({ stats }: RoamingPetProps) {
    // ----------------------------------------------------------------------
    // 2. 상태(State) 관리
    // ----------------------------------------------------------------------
    const posRef = useRef({ x: 50, y: 50 });
    const [renderPos, setRenderPos] = useState({ x: 50, y: 50 });

    const [transitionTime, setTransitionTime] = useState(0);
    const [anim, setAnim] = useState({ row: 0, col: 0 });

    const [isEvolving, setIsEvolving] = useState(false);
    const prevStageRef = useRef(stats.evolutionStage);

    useEffect(() => {
        if (stats.evolutionStage > prevStageRef.current) {
            setIsEvolving(true);
            setTimeout(() => setIsEvolving(false), 3000);
        }
        prevStageRef.current = stats.evolutionStage;
    }, [stats.evolutionStage]);

    // ----------------------------------------------------------------------
    // 3. 펫 AI 루프
    // ----------------------------------------------------------------------
    useEffect(() => {
        let active = true;
        const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

        const loop = async () => {
            await delay(1000);

            while (active) {
                const rand = Math.random();
                const currentX = posRef.current.x;
                const currentY = posRef.current.y;

                if (rand < 0.35) {
                    let targetX = currentX;
                    let targetY = currentY;

                    if (Math.random() < 0.5) {
                        targetX = Math.floor(Math.random() * 80) + 10;
                    } else {
                        targetY = Math.floor(Math.random() * 80) + 10;
                    }

                    const dx = targetX - currentX;
                    const dy = targetY - currentY;
                    const row = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 1 : 3) : dy > 0 ? 0 : 2;

                    posRef.current = { x: targetX, y: targetY };
                    if (active) {
                        setTransitionTime(4000);
                        setRenderPos({ x: targetX, y: targetY });
                    }

                    const walkEndTime = Date.now() + 4000;
                    let col = 0;
                    while (Date.now() < walkEndTime && active) {
                        if (active) setAnim({ row, col });
                        col = (col + 1) % 4;
                        await delay(200);
                    }
                } else if (rand < 0.5) {
                    let targetX = currentX + (Math.random() * 20 + 20);
                    if (targetX > 90) targetX = 90;

                    posRef.current = { x: targetX, y: currentY };
                    if (active) {
                        setTransitionTime(1500);
                        setRenderPos({ x: targetX, y: currentY });
                    }

                    const runEndTime = Date.now() + 1500;
                    let col = 2;
                    while (Date.now() < runEndTime && active) {
                        if (active) setAnim({ row: 7, col });
                        col = col === 2 ? 3 : 2;
                        await delay(120);
                    }
                } else if (rand < 0.65) {
                    if (active) setTransitionTime(0);
                    for (let i = 0; i < 4; i++) {
                        if (active) setAnim({ row: 4, col: i });
                        await delay(200);
                    }
                    await delay(5000);
                } else if (rand < 0.8) {
                    if (active) setTransitionTime(0);
                    for (let i = 0; i < 4; i++) {
                        if (active) setAnim({ row: 6, col: i });
                        await delay(200);
                    }
                    await delay(Math.floor(Math.random() * 5000) + 5000);
                } else if (rand < 0.9) {
                    if (active) setTransitionTime(0);
                    const sleepEndTime = Date.now() + 6000;
                    let col = 0;
                    while (Date.now() < sleepEndTime && active) {
                        if (active) setAnim({ row: 7, col });
                        col = col === 0 ? 1 : 0;
                        await delay(500);
                    }
                } else {
                    if (active) setTransitionTime(0);
                    const groomEndTime = Date.now() + 4000;
                    let col = 0;
                    while (Date.now() < groomEndTime && active) {
                        if (active) setAnim({ row: 5, col });
                        col = (col + 1) % 4;
                        await delay(250);
                    }
                }
                if (active) await delay(200);
            }
        };

        loop();
        return () => {
            active = false;
        };
    }, []);

    // ----------------------------------------------------------------------
    // 4. 진화 단계에 따른 이미지 선택
    // ----------------------------------------------------------------------
    let currentImage = IMAGE_MAP.cat;
    if (stats.evolutionStage === 2) currentImage = IMAGE_MAP.eevee;
    else if (stats.evolutionStage === 3 && stats.finalForm) currentImage = IMAGE_MAP[stats.finalForm];

    // ----------------------------------------------------------------------
    // 5. 렌더링 (UI)
    // ----------------------------------------------------------------------
    return (
        <div
            className="fixed pointer-events-none z-50 ease-linear transition-all"
            style={{
                left: `${renderPos.x}vw`,
                top: `${renderPos.y}vh`,
                transitionDuration: `${transitionTime}ms`,
                transform: `translate(-50%, -50%)`,
            }}
        >
            <div className="w-16 h-16 relative">
                {isEvolving && (
                    <div className="absolute inset-0 bg-yellow-300 rounded-full animate-pulse blur-md opacity-70 scale-150"></div>
                )}

                <div className="w-16 h-16 overflow-hidden relative">
                    <img
                        src={currentImage}
                        alt="My Pet"
                        className="absolute top-0 left-0 max-w-none"
                        style={{
                            width: '400%',
                            height: '800%',
                            transform: `translate(-${anim.col * 25}%, -${anim.row * 12.6}%)`,
                            imageRendering: 'pixelated',
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
