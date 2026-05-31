import { useState } from 'react';
import { getInitialStats, saveStats, type CharacterStats } from '../lib/storage';

interface OnboardingProps {
    onComplete: (stats: CharacterStats) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
    const [name, setName] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        const initialStats = getInitialStats(name.trim());
        saveStats(initialStats);
        onComplete(initialStats);
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 rounded-3xl shadow-lg max-w-md w-full text-center">
                <div className="text-6xl mb-4">🐾</div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">파트너 맞이하기</h1>
                <p className="text-gray-500 mb-8">
                    당신의 할 일을 함께 해낼
                    <br />
                    강아지 친구의 이름을 지어주세요!
                </p>

                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="예: 로또, 백구"
                        className="w-full p-4 bg-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 mb-4 text-center font-bold text-lg"
                        maxLength={10}
                        autoFocus
                    />
                    <button
                        type="submit"
                        disabled={!name.trim()}
                        className="w-full py-4 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 transition-colors disabled:bg-gray-300"
                    >
                        모험 시작하기
                    </button>
                </form>
            </div>
        </div>
    );
}
