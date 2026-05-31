import { useState } from 'react';
import Onboarding from './components/Onboarding';
import { getStats, type CharacterStats } from './lib/storage';

function App() {
    const [stats, setStats] = useState<CharacterStats | null>(() => getStats());

    if (!stats) {
        return <Onboarding onComplete={(newStats) => setStats(newStats)} />;
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <div className="max-w-2xl mx-auto pt-12 px-4 text-center">
                <h1 className="text-3xl font-bold mb-4">🐾 {stats.name} 플래너</h1>
                <p className="mb-8 text-gray-600">
                    레벨: {stats.level} | 진화 단계: {stats.evolutionStage}
                </p>

                {/* 추후 여기에 실제 To-do 리스트 컴포넌트가 들어갑니다 */}
                <div className="p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-gray-400">투두 리스트 영역 준비 중...</p>
                </div>

                <button
                    onClick={() => {
                        localStorage.clear();
                        window.location.reload();
                    }}
                    className="mt-12 text-sm text-red-400 hover:text-red-500 underline"
                >
                    데이터 초기화 (테스트용)
                </button>
            </div>
        </div>
    );
}

export default App;
