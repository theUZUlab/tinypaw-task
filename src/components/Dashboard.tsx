import { useState } from 'react';
import { type CharacterStats, type Todo, getTodos, saveTodos, saveStats } from '../lib/storage';
import RoamingPet from './RoamingPet';

interface DashboardProps {
    stats: CharacterStats;
    onUpdateStats: (newStats: CharacterStats) => void;
}

const PRIORITY_EMOJIS = { 1: '🥇', 2: '🥈', 3: '🥉' };

const getRandomForm = () => {
    const forms = ['sylveon', 'leafeon', 'flareon', 'glaceon'] as const;
    return forms[Math.floor(Math.random() * forms.length)];
};

const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const userDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
    return userDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });
};

export default function Dashboard({ stats, onUpdateStats }: DashboardProps) {
    const [todos, setTodos] = useState<Todo[]>(() => getTodos());
    const [inputText, setInputText] = useState('');
    const [inputDate, setInputDate] = useState('');
    const [inputPriority, setInputPriority] = useState<1 | 2 | 3>(2);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editText, setEditText] = useState('');
    const [editDate, setEditDate] = useState('');
    const [editPriority, setEditPriority] = useState<1 | 2 | 3>(2);

    const saveAndSort = (newTodos: Todo[]) => {
        const sorted = [...newTodos].sort((a, b) => {
            if (a.completed !== b.completed) return a.completed ? 1 : -1;
            if (a.priority !== b.priority) return (a.priority || 2) - (b.priority || 2);
            const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
            const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
            return dateA - dateB;
        });
        setTodos(sorted);
        saveTodos(sorted);
    };

    const gainXp = (amount: number) => {
        let { currentXp, level, requiredXp, evolutionStage, finalForm } = stats;
        currentXp = Math.max(0, currentXp + amount);
        if (currentXp >= requiredXp) {
            currentXp -= requiredXp;
            level += 1;
            requiredXp = Math.floor(requiredXp * 1.2);
            if (level >= 10 && evolutionStage < 3) {
                evolutionStage = 3;
                finalForm = getRandomForm();
            } else if (level >= 5 && evolutionStage < 2) {
                evolutionStage = 2;
            }
        }
        const newStats = { ...stats, currentXp, level, requiredXp, evolutionStage, finalForm };
        saveStats(newStats);
        onUpdateStats(newStats);
    };

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
        saveAndSort([...todos, newTodo]);
        setInputText('');
        setInputDate('');
    };

    const handleToggleTodo = (id: string, completed: boolean) => {
        const newTodos = todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
        saveAndSort(newTodos);
        gainXp(completed ? -20 : 20);
    };

    const handleDelete = (id: string) => {
        saveAndSort(todos.filter((t) => t.id !== id));
    };

    const handleStartEdit = (todo: Todo) => {
        setEditingId(todo.id);
        setEditText(todo.text);
        setEditDate(todo.dueDate || '');
        setEditPriority(todo.priority || 2);
    };

    const handleSaveEdit = (id: string) => {
        saveAndSort(
            todos.map((t) =>
                t.id === id ? { ...t, text: editText, dueDate: editDate || undefined, priority: editPriority } : t,
            ),
        );
        setEditingId(null);
    };

    const handleReset = () => {
        if (confirm('모든 데이터를 초기화할까요?')) {
            localStorage.clear();
            window.location.reload();
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-noonnu p-4 pb-20">
            <RoamingPet stats={stats} />

            <div className="max-w-md mx-auto z-10 relative">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-medium">🐾 {stats.name}</h1>
                    <button
                        onClick={handleReset}
                        className="border-2 border-black px-2 text-xs font-medium hover:bg-black hover:text-white"
                    >
                        RESET
                    </button>
                </div>

                <div className="bg-white border-2 border-black p-4 mb-6 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                    <p className="font-medium text-sm mb-2 uppercase">
                        {stats.evolutionStage === 3 ? `✨ LV.${stats.level} (${stats.finalForm})` : `LV.${stats.level}`}
                    </p>
                    <div className="w-full h-4 border-2 border-black bg-gray-200">
                        <div
                            className="h-full bg-black transition-all"
                            style={{ width: `${(stats.currentXp / stats.requiredXp) * 100}%` }}
                        />
                    </div>
                </div>

                <form
                    onSubmit={handleAddTodo}
                    className="bg-white border-2 border-black p-4 mb-6 shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                >
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Quest..."
                        className="w-full p-2 border-2 border-black mb-2 font-medium focus:bg-amber-100 outline-none"
                    />
                    <div className="flex gap-2">
                        <input
                            type="date"
                            lang="en"
                            value={inputDate}
                            onChange={(e) => setInputDate(e.target.value)}
                            className="border-2 border-black p-1 text-xs font-medium shadow-[1px_1px_0px_rgba(0,0,0,1)] outline-none"
                        />
                        <select
                            onChange={(e) => setInputPriority(Number(e.target.value) as 1 | 2 | 3)}
                            className="border-2 border-black p-1 text-xs font-medium shadow-[1px_1px_0px_rgba(0,0,0,1)] outline-none"
                        >
                            <option value={1}>🥇</option>
                            <option value={2}>🥈</option>
                            <option value={3}>🥉</option>
                        </select>
                        <button type="submit" className="flex-1 bg-black text-white font-medium hover:bg-gray-800">
                            ADD
                        </button>
                    </div>
                </form>

                <div className="space-y-4">
                    {todos.map((todo) => (
                        <div
                            key={todo.id}
                            className="bg-white border-2 border-black p-5 shadow-[2px_2px_0px_rgba(0,0,0,1)] flex items-start gap-4"
                        >
                            <button
                                onClick={() => handleToggleTodo(todo.id, todo.completed)}
                                className="w-8 h-8 border-2 border-black flex-shrink-0 flex items-center justify-center font-bold text-lg"
                            >
                                {todo.completed ? 'X' : ''}
                            </button>

                            {editingId === todo.id ? (
                                <div className="flex-1 w-full">
                                    <input
                                        value={editText}
                                        onChange={(e) => setEditText(e.target.value)}
                                        className="w-full border-2 border-black mb-3 p-2 font-medium outline-none"
                                    />
                                    <div className="flex gap-2 mb-3">
                                        <input
                                            type="date"
                                            lang="en"
                                            value={editDate}
                                            onChange={(e) => setEditDate(e.target.value)}
                                            className="border-2 border-black p-1 text-xs font-medium shadow-[1px_1px_0px_rgba(0,0,0,1)] outline-none"
                                        />
                                        <select
                                            value={editPriority}
                                            onChange={(e) => setEditPriority(Number(e.target.value) as 1 | 2 | 3)}
                                            className="border-2 border-black p-1 text-xs font-bold shadow-[1px_1px_0px_rgba(0,0,0,1)] outline-none"
                                        >
                                            <option value={1}>🥇</option>
                                            <option value={2}>🥈</option>
                                            <option value={3}>🥉</option>
                                        </select>
                                    </div>
                                    <button
                                        onClick={() => handleSaveEdit(todo.id)}
                                        className="text-xs font-medium border-2 border-black px-3 py-1 bg-black text-white hover:bg-gray-800"
                                    >
                                        SAVE
                                    </button>
                                </div>
                            ) : (
                                <div className="flex-1">
                                    <p
                                        className={`font-medium mb-1 ${todo.completed ? 'line-through text-gray-400' : ''}`}
                                    >
                                        {PRIORITY_EMOJIS[(todo.priority as 1 | 2 | 3) || 2]} {todo.text}
                                    </p>
                                    {todo.dueDate && (
                                        <p className="text-[11px] text-gray-500 font-bold mb-2">
                                            📅 {formatDate(todo.dueDate)}
                                        </p>
                                    )}
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleStartEdit(todo)}
                                            className="text-[11px] underline hover:text-amber-600"
                                        >
                                            EDIT
                                        </button>
                                        <button
                                            onClick={() => handleDelete(todo.id)}
                                            className="text-[11px] text-red-500 underline hover:text-red-700"
                                        >
                                            DEL
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
