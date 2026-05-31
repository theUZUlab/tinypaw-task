export interface CharacterStats {
    name: string;
    level: number;
    currentXp: number;
    requiredXp: number;
    evolutionStage: number; // 1: 퍼피, 2: 성견, 3: 최종
}

export interface Todo {
    id: string;
    text: string;
    completed: boolean;
}

export const getInitialStats = (name: string): CharacterStats => ({
    name,
    level: 1,
    currentXp: 0,
    requiredXp: 100,
    evolutionStage: 1,
});

export const getStats = (): CharacterStats | null => {
    const data = localStorage.getItem('tinyPaw_stats');
    return data ? JSON.parse(data) : null;
};

export const saveStats = (stats: CharacterStats) => {
    localStorage.setItem('tinyPaw_stats', JSON.stringify(stats));
};

export const getTodos = (): Todo[] => {
    const data = localStorage.getItem('tinyPaw_todos');
    return data ? JSON.parse(data) : [];
};

export const saveTodos = (todos: Todo[]) => {
    localStorage.setItem('tinyPaw_todos', JSON.stringify(todos));
};
