import { useState } from 'react';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import { getStats, type CharacterStats } from './lib/storage';

export default function App() {
    // ----------------------------------------------------------------------
    // 1. 상태(State) 관리
    // ----------------------------------------------------------------------
    // 처음 렌더링될 때 로컬 스토리지에서 정보를 딱 한 번만 가져옵니다 (Lazy Initialization)
    const [stats, setStats] = useState<CharacterStats | null>(() => getStats());

    // ----------------------------------------------------------------------
    // 2. 화면 라우팅 (렌더링)
    // ----------------------------------------------------------------------
    // 로컬 스토리지에 캐릭터 정보(이름 등)가 없으면 온보딩(이름 짓기) 화면을 보여줍니다.
    if (!stats) {
        return <Onboarding onComplete={(newStats) => setStats(newStats)} />;
    }

    // 캐릭터 정보가 존재하면 메인 대시보드(투두 리스트) 화면을 보여줍니다.
    return <Dashboard stats={stats} onUpdateStats={setStats} />;
}
