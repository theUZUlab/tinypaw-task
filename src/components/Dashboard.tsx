import { useState } from 'react';
import { type CharacterStats, type Todo, getTodos, saveTodos, saveStats } from '../lib/storage';

interface DashboardProps {
    stats: CharacterStats;
    onUpdateStats: (newStats: CharacterStats) => void;
}

// ----------------------------------------------------------------------
// 1. 상수 및 설정
// ----------------------------------------------------------------------
const PRIORITY_EMOJIS = {
    1: '🥇', // 1순위
    2: '🥈', // 2순위
    3: '🥉', // 3순위
};

export default function Dashboard({ stats, onUpdateStats }: DashboardProps) {
    // ----------------------------------------------------------------------
    // 2. 상태(State) 관리
    // ----------------------------------------------------------------------
    // ★ 에러 해결: useEffect를 지우고, 여기서 바로 로컬 스토리지 데이터를 가져옵니다 (Lazy Initialization)
    const [todos, setTodos] = useState<Todo[]>(() => getTodos());

    // 입력 폼 상태
    const [inputText, setInputText] = useState('');
    const [inputDate, setInputDate] = useState('');
    const [inputPriority, setInputPriority] = useState<1 | 2 | 3>(2);

    // 수정 모드 상태
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editText, setEditText] = useState('');
    const [editDate, setEditDate] = useState('');
    const [editPriority, setEditPriority] = useState<1 | 2 | 3>(2);

    // ----------------------------------------------------------------------
    // 3. 헬퍼 함수
    // ----------------------------------------------------------------------
    // 경험치 획득 및 진화 처리
    const gainXp = (amount: number) => {
        let { currentXp, level, requiredXp, evolutionStage } = stats;
        currentXp += amount;

        if (currentXp >= requiredXp) {
            currentXp -= requiredXp;
            level += 1;
            requiredXp = Math.floor(requiredXp * 1.2);

            if (level >= 10) evolutionStage = 3;
            else if (level >= 5) evolutionStage = 2;
        }

        const newStats = { ...stats, currentXp, level, requiredXp, evolutionStage };
        saveStats(newStats);
        onUpdateStats(newStats);
    };

    // 캐릭터 상태 텍스트
    const characterStageText =
        stats.evolutionStage === 3
            ? '🐺✨ 궁극의 수호신 (Stage 3)'
            : stats.evolutionStage === 2
              ? '🐕 늠름한 성견 (Stage 2)'
              : '🐶 뽀시래기 퍼피 (Stage 1)';

    // ----------------------------------------------------------------------
    // 4. 이벤트 핸들러
    // ----------------------------------------------------------------------
    const handleAddTodo = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        const newTodo: Todo = {
            id: crypto.randomUUID(),
            text: inputText.trim(),
            completed: false,
            dueDate: inputDate || undefined,
            priority: inputPriority,
        };

        const newTodos = [...todos, newTodo].sort((a, b) => {
            if (a.completed !== b.completed) return a.completed ? 1 : -1;
            return (a.priority || 2) - (b.priority || 2);
        });

        setTodos(newTodos);
        saveTodos(newTodos);
        setInputText('');
        setInputDate('');
        setInputPriority(2);
    };

    const handleToggleTodo = (id: string, currentlyCompleted: boolean) => {
        const newTodos = todos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo));
        setTodos(newTodos);
        saveTodos(newTodos);
        if (!currentlyCompleted) gainXp(20);
    };

    const handleDeleteTodo = (id: string) => {
        const newTodos = todos.filter((todo) => todo.id !== id);
        setTodos(newTodos);
        saveTodos(newTodos);
    };

    const handleStartEdit = (todo: Todo) => {
        setEditingId(todo.id);
        setEditText(todo.text);
        setEditDate(todo.dueDate || '');
        setEditPriority(todo.priority || 2);
    };

    const handleSaveEdit = (id: string) => {
        if (!editText.trim()) {
            setEditingId(null);
            return;
        }
        const newTodos = todos.map((todo) =>
            todo.id === id
                ? { ...todo, text: editText.trim(), dueDate: editDate || undefined, priority: editPriority }
                : todo,
        );
        setTodos(newTodos);
        saveTodos(newTodos);
        setEditingId(null);
    };

    // 데이터 초기화
    const handleReset = () => {
        if (window.confirm('정말 데이터를 다 날릴까요?')) {
            localStorage.clear();
            window.location.reload();
        }
    };

    // ----------------------------------------------------------------------
    // 5. 렌더링 (메인 UI)
    // ----------------------------------------------------------------------
    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20 pt-12 px-4">
            <div className="max-w-2xl mx-auto">
                {/* 헤더 */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-800">🐾 {stats.name} 플래너</h1>
                    <button onClick={handleReset} className="text-sm text-gray-400 hover:text-red-500 underline">
                        초기화
                    </button>
                </div>

                {/* 경험치 바 패널 */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-8 text-center">
                    <div className="h-40 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 border-2 border-dashed border-gray-200">
                        <span className="text-xl font-bold text-gray-500">{characterStageText}</span>
                    </div>
                    <div className="flex justify-between items-end mb-2 px-1">
                        <span className="font-bold text-gray-700">Lv. {stats.level}</span>
                        <span className="text-sm text-gray-500 font-medium">
                            {stats.currentXp} / {stats.requiredXp} XP
                        </span>
                    </div>
                    <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-amber-400 transition-all duration-500 ease-out"
                            style={{ width: `${(stats.currentXp / stats.requiredXp) * 100}%` }}
                        />
                    </div>
                </div>

                {/* 퀘스트 입력 폼 */}
                <form
                    onSubmit={handleAddTodo}
                    className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 mb-8 flex flex-col gap-3"
                >
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="오늘의 퀘스트를 입력하세요!"
                        className="w-full p-2 bg-transparent outline-none text-lg border-b-2 border-gray-100 focus:border-amber-400 transition-colors"
                    />
                    <div className="flex justify-between items-center flex-wrap gap-2">
                        <div className="flex gap-2">
                            <select
                                value={inputPriority}
                                onChange={(e) => setInputPriority(Number(e.target.value) as 1 | 2 | 3)}
                                className="bg-gray-50 p-2 rounded-xl text-sm outline-none cursor-pointer"
                            >
                                <option value={1}>🥇 1순위</option>
                                <option value={2}>🥈 2순위</option>
                                <option value={3}>🥉 3순위</option>
                            </select>
                            <input
                                type="date"
                                value={inputDate}
                                onChange={(e) => setInputDate(e.target.value)}
                                className="bg-gray-50 p-2 rounded-xl text-sm outline-none cursor-pointer text-gray-600"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition-colors shadow-sm"
                        >
                            추가
                        </button>
                    </div>
                </form>

                {/* 퀘스트 리스트 */}
                <div className="space-y-3">
                    {todos.map((todo) => (
                        <TodoItemCard
                            key={todo.id}
                            todo={todo}
                            isEditing={editingId === todo.id}
                            editText={editText}
                            editDate={editDate}
                            editPriority={editPriority}
                            onToggle={() => handleToggleTodo(todo.id, todo.completed)}
                            onDelete={() => handleDeleteTodo(todo.id)}
                            onStartEdit={() => handleStartEdit(todo)}
                            onSaveEdit={() => handleSaveEdit(todo.id)}
                            onCancelEdit={() => setEditingId(null)}
                            setEditText={setEditText}
                            setEditDate={setEditDate}
                            setEditPriority={setEditPriority}
                        />
                    ))}
                    {todos.length === 0 && (
                        <p className="text-center text-gray-400 py-8">아직 등록된 퀘스트가 없습니다!</p>
                    )}
                </div>
            </div>
        </div>
    );
}

// ----------------------------------------------------------------------
// 6. 하위 컴포넌트: 개별 투두 아이템 카드
// ----------------------------------------------------------------------
// ★ 에러 해결: `any` 대신 정확한 타입(Interface)을 정의해 줍니다!
interface TodoItemCardProps {
    todo: Todo;
    isEditing: boolean;
    editText: string;
    editDate: string;
    editPriority: 1 | 2 | 3;
    onToggle: () => void;
    onDelete: () => void;
    onStartEdit: () => void;
    onSaveEdit: () => void;
    onCancelEdit: () => void;
    setEditText: (text: string) => void;
    setEditDate: (date: string) => void;
    setEditPriority: (priority: 1 | 2 | 3) => void;
}

function TodoItemCard({
    todo,
    isEditing,
    editText,
    editDate,
    editPriority,
    onToggle,
    onDelete,
    onStartEdit,
    onSaveEdit,
    onCancelEdit,
    setEditText,
    setEditDate,
    setEditPriority,
}: TodoItemCardProps) {
    return (
        <div
            className={`flex items-center p-4 rounded-2xl transition-all shadow-sm border border-gray-50 ${todo.completed ? 'bg-gray-50 opacity-60' : 'bg-white'}`}
        >
            {/* 완료 체크 버튼 */}
            <button
                onClick={onToggle}
                className={`w-6 h-6 rounded-full border-2 mr-4 flex-shrink-0 transition-colors ${todo.completed ? 'border-amber-500 bg-amber-500' : 'border-gray-300'}`}
            >
                {todo.completed && <span className="text-white text-sm block -mt-0.5">✓</span>}
            </button>

            {isEditing ? (
                // 수정 모드 UI
                <div className="flex-1 flex flex-col gap-2 mr-2">
                    <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="p-1 bg-transparent border-b-2 border-amber-400 outline-none text-lg text-gray-700"
                        autoFocus
                    />
                    <div className="flex gap-2">
                        <select
                            value={editPriority}
                            onChange={(e) => setEditPriority(Number(e.target.value) as 1 | 2 | 3)}
                            className="bg-gray-100 p-1 rounded-lg text-sm"
                        >
                            <option value={1}>🥇 1순위</option>
                            <option value={2}>🥈 2순위</option>
                            <option value={3}>🥉 3순위</option>
                        </select>
                        <input
                            type="date"
                            value={editDate}
                            onChange={(e) => setEditDate(e.target.value)}
                            className="bg-gray-100 p-1 rounded-lg text-sm text-gray-600"
                        />
                    </div>
                    <div className="flex gap-2 mt-1">
                        <button onClick={onSaveEdit} className="text-amber-500 font-bold text-sm">
                            저장
                        </button>
                        <button onClick={onCancelEdit} className="text-gray-400 font-bold text-sm">
                            취소
                        </button>
                    </div>
                </div>
            ) : (
                // 일반 모드 UI
                <>
                    <div className="flex-1 flex flex-col">
                        <span
                            className={`text-lg flex items-center gap-2 ${todo.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}
                        >
                            <span className="text-sm" title={`${todo.priority}순위`}>
                                {PRIORITY_EMOJIS[(todo.priority as 1 | 2 | 3) || 2]}
                            </span>
                            {todo.text}
                        </span>
                        {todo.dueDate && (
                            <span
                                className={`text-xs mt-1 ml-6 font-medium ${todo.completed ? 'text-gray-400' : 'text-red-400'}`}
                            >
                                마감: {todo.dueDate}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={onStartEdit}
                        className="text-gray-300 hover:text-amber-500 ml-2 font-bold transition-colors"
                    >
                        ✎
                    </button>
                    <button
                        onClick={onDelete}
                        className="text-gray-300 hover:text-red-500 font-bold ml-2 text-xl transition-colors"
                    >
                        ×
                    </button>
                </>
            )}
        </div>
    );
}
