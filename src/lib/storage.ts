// ----------------------------------------------------------------------
// 1. 타입 및 인터페이스 정의
// ----------------------------------------------------------------------
export interface CharacterStats {
    name: string;
    level: number;
    currentXp: number;
    requiredXp: number;
    evolutionStage: number; // 1: 퍼피, 2: 성견, 3: 최종 진화
}

export interface Todo {
    id: string;
    text: string;
    completed: boolean;
    dueDate?: string;
    priority?: 1 | 2 | 3; // 1: 긴급, 2: 보통, 3: 여유
}

// ----------------------------------------------------------------------
// 2. 초기 데이터 세팅
// ----------------------------------------------------------------------
export const getInitialStats = (name: string): CharacterStats => ({
    name,
    level: 1,
    currentXp: 0,
    requiredXp: 100,
    evolutionStage: 1,
});

// ----------------------------------------------------------------------
// 3. 캐릭터 스탯 스토리지 관리
// ----------------------------------------------------------------------
export const getStats = (): CharacterStats | null => {
    const data = localStorage.getItem('tinyPaw_stats');
    return data ? JSON.parse(data) : null;
};

export const saveStats = (stats: CharacterStats) => {
    localStorage.setItem('tinyPaw_stats', JSON.stringify(stats));
};

// ----------------------------------------------------------------------
// 4. 투두 리스트 스토리지 관리
// ----------------------------------------------------------------------
export const getTodos = (): Todo[] => {
    const data = localStorage.getItem('tinyPaw_todos');
    return data ? JSON.parse(data) : [];
};

export const saveTodos = (todos: Todo[]) => {
    localStorage.setItem('tinyPaw_todos', JSON.stringify(todos));
};
