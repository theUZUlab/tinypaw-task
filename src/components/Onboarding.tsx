import { useState, useEffect } from 'react';
import { getInitialStats, saveStats, type CharacterStats } from '../lib/storage';
import catImg from '../assets/cat.png';

interface OnboardingProps {
    onComplete: (stats: CharacterStats) => void;
}

// ----------------------------------------------------------------------
// 대화 데이터 정의
// ----------------------------------------------------------------------
const DIALOGUE = [
    '안녕? 반갑다냥! 🐾',
    '난 앞으로 네 목표 달성을 도와줄 파트너다냥.',
    '네가 여기서 투두리스트 퀘스트를 완료할 때마다, 그 경험치를 먹고 내가 쑥쑥 성장할 거라냥!',
    '나랑 같이 모험을 떠날 준비가 됐다면, 제일 먼저 내 예쁜 이름부터 지어달라냥!',
];

export default function Onboarding({ onComplete }: OnboardingProps) {
    // ----------------------------------------------------------------------
    // 상태(State) 관리
    // ----------------------------------------------------------------------
    const [name, setName] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [displayedText, setDisplayedText] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    // 고양이 애니메이션
    const [frame, setFrame] = useState(0);
    const [actionRow, setActionRow] = useState(4);

    // ----------------------------------------------------------------------
    // 효과(Effect)
    // ----------------------------------------------------------------------

    // 1. 타이핑 애니메이션 로직
    useEffect(() => {
        const resetTyping = setTimeout(() => {
            setIsTyping(true);
            setDisplayedText('');
        }, 0);

        let i = 0;
        const fullText = DIALOGUE[currentIndex];

        const typingInterval = setInterval(() => {
            setDisplayedText(fullText.slice(0, i + 1));
            i++;
            if (i >= fullText.length) {
                setIsTyping(false);
                clearInterval(typingInterval);
            }
        }, 50);

        return () => {
            clearTimeout(resetTyping);
            clearInterval(typingInterval);
        };
    }, [currentIndex]);

    // 2. 고양이 애니메이션
    useEffect(() => {
        const animInterval = setInterval(() => setFrame((prev) => (prev + 1) % 4), 250);
        const actionInterval = setInterval(() => setActionRow((prev) => (prev === 4 ? 5 : 4)), 4000);
        return () => {
            clearInterval(animInterval);
            clearInterval(actionInterval);
        };
    }, []);

    // ----------------------------------------------------------------------
    // 핸들러
    // ----------------------------------------------------------------------
    const handleNext = () => {
        if (isTyping) {
            setDisplayedText(DIALOGUE[currentIndex]);
            setIsTyping(false);
        } else if (currentIndex < DIALOGUE.length - 1) {
            setCurrentIndex((prev) => prev + 1);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        const initialStats = getInitialStats(name.trim());
        saveStats(initialStats);
        onComplete(initialStats);
    };

    // ----------------------------------------------------------------------
    // 렌더링 (UI)
    // ----------------------------------------------------------------------
    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
            <div className="bg-white border-4 border-black p-6 w-full max-w-sm flex flex-col items-center shadow-[8px_8px_0px_rgba(0,0,0,1)]">
                {/* 💬 픽셀 스타일 말풍선 */}
                <div className="relative bg-white border-4 border-black p-4 mb-6 w-full min-h-[120px] flex items-center shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                    <p className="text-gray-800 text-sm leading-relaxed font-noonnu font-medium whitespace-pre-line">
                        {displayedText}
                    </p>

                    {!isTyping && currentIndex < DIALOGUE.length - 1 && (
                        <button
                            onClick={handleNext}
                            className="absolute bottom-2 right-2 animate-bounce bg-black text-white px-2 py-1 text-xs"
                        >
                            ▶
                        </button>
                    )}
                </div>

                <div className="w-20 h-20 overflow-hidden relative mb-6">
                    <img
                        src={catImg}
                        alt="Cat Partner"
                        className="absolute top-0 left-0 max-w-none"
                        style={{
                            width: '400%',
                            height: '800%',
                            transform: `translate(-${frame * 25}%, -${actionRow * 12.5}%)`,
                            imageRendering: 'pixelated',
                        }}
                    />
                </div>

                {currentIndex === DIALOGUE.length - 1 && !isTyping && (
                    <form onSubmit={handleSubmit} className="w-full">
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="이름을 입력하세요"
                            className="w-full p-3 border-4 border-black mb-4 font-noonnu font-medium text-center outline-none focus:bg-amber-100"
                            maxLength={10}
                            autoFocus
                        />
                        <button
                            type="submit"
                            className="w-full py-3 bg-black text-white font-medium font-noonnu hover:bg-gray-800 transition-colors"
                        >
                            모험 시작하기
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
