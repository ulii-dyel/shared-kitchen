'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Filter, Plus, Clock, ShoppingCart, Calendar } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import DraggableFood from '@/components/calendar/DraggableFood';
import { useCalendar } from '@/context/CalendarContext';
import { useUser } from '@/context/UserContext';
import { differenceInCalendarDays } from 'date-fns';
import FoodModal from '@/components/foods/FoodModal';
import BulkFoodModal from '@/components/foods/BulkFoodModal';
import { FoodWithDetails } from '@/types/database';

export default function Sidebar() {
    const pathname = usePathname();
    const { foods, entries, addFood, updateFood, toggleFavorite } = useCalendar();
    const { currentUser, switchUser, partner, isLoading } = useUser();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<'all' | 'mine' | 'others' | 'recents'>('all');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [editingFood, setEditingFood] = useState<FoodWithDetails | undefined>(undefined);


    const filteredFoods = foods.filter(food => {
        // Search match
        const matchesSearch = food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            food.tags.some(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()));

        if (!matchesSearch) return false;

        // Filter match
        if (activeFilter === 'mine') {
            return food.favorites?.some(f => f.user_id === currentUser?.id);
        }
        if (activeFilter === 'others') {
            return food.favorites?.some(f => f.user_id === partner?.id);
        }
        if (activeFilter === 'recents') {
            // Find foods used in the last 7 days
            const recentIds = new Set(
                entries
                    .filter(e => {
                        const d = new Date(e.date);
                        const diff = differenceInCalendarDays(new Date(), d);
                        return diff >= 0 && diff <= 7;
                    })
                    .map(e => e.food_id)
            );
            return recentIds.has(food.id);
        }
        return true;
    });

    const handleEditFood = (food: FoodWithDetails) => {
        setEditingFood(food);
        setIsAddModalOpen(true);
    };

    const handleSaveFood = (foodData: Partial<FoodWithDetails>) => {
        if (editingFood) {
            // Update existing
            const updatedFood: FoodWithDetails = {
                ...editingFood,
                ...foodData,
                updated_at: new Date().toISOString()
            };
            updateFood(updatedFood);
        } else {
            // Create new
            const newFood: FoodWithDetails = {
                id: `food-${Date.now()}`,
                household_id: 'h1', // mock Household
                name: foodData.name || 'New Food',
                recipe_markdown: foodData.recipe_markdown || '',
                image_url: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                tags: [],
                ingredients: [],
                favorites: [],
                ...foodData
            } as FoodWithDetails;

            addFood(newFood);
        }
        setIsAddModalOpen(false);
        setEditingFood(undefined);
    };

    if (isLoading || !currentUser || !partner) return <aside className="hidden md:flex flex-col w-80 h-screen sticky top-0 border-r border-[var(--border-color)] bg-[var(--bg-darker)] skeleton-pulse"></aside>; // Simple loading state

    return (
        <aside className="hidden md:flex flex-col w-80 h-screen sticky top-0 border-r border-[var(--border-color)] bg-[var(--bg-darker)] overflow-hidden">
            {/* Desktop Navigation */}
            <div className="flex border-b border-[var(--border-color)]">
                <Link
                    href="/"
                    className={`flex-1 py-3 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${pathname === '/' ? 'bg-[var(--bg-card)] text-[var(--primary)] border-b-2 border-[var(--primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'}`}
                >
                    <Calendar size={18} />
                    Plan
                </Link>
                <Link
                    href="/shopping"
                    className={`flex-1 py-3 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${pathname === '/shopping' ? 'bg-[var(--bg-card)] text-[var(--primary)] border-b-2 border-[var(--primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'}`}
                >
                    <ShoppingCart size={18} />
                    Shop
                </Link>
            </div>

            {/* Header */}
            <div className="p-4 border-b border-[var(--border-color)] space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold font-display">Food Library</h2>
                    <div className="flex gap-1">
                        <Button size="sm" variant="ghost" className="!p-2 text-xs" onClick={() => setIsBulkModalOpen(true)} title="Bulk Add">
                            Bulk
                        </Button>
                        <Button size="sm" variant="ghost" className="!p-2" onClick={() => { setEditingFood(undefined); setIsAddModalOpen(true); }}>
                            <Plus size={20} />
                        </Button>
                    </div>
                </div>

                <FoodModal
                    isOpen={isAddModalOpen}
                    onClose={() => { setIsAddModalOpen(false); setEditingFood(undefined); }}
                    onSave={handleSaveFood}
                    food={editingFood}
                />

                <BulkFoodModal
                    isOpen={isBulkModalOpen}
                    onClose={() => setIsBulkModalOpen(false)}
                />

                <div className="space-y-3">
                    <div className="flex gap-2">
                        <Input
                            placeholder="Search foods..."
                            icon={<Search size={16} />}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="text-sm"
                        />
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveFilter('all')}
                            className={`px-3 py-1 rounded-full text-xs transition-colors border ${activeFilter === 'all' ? 'bg-[var(--bg-card)] border-[var(--primary)] text-[var(--primary)]' : 'border-transparent text-[var(--text-muted)] hover:bg-[var(--bg-card)]'}`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setActiveFilter('mine')}
                            className={`px-3 py-1 rounded-full text-xs transition-colors border ${activeFilter === 'mine' ? `bg-[var(--bg-card)] border-[${currentUser.color}] text-[${currentUser.color}]` : 'border-transparent text-[var(--text-muted)] hover:bg-[var(--bg-card)]'}`}
                            style={activeFilter === 'mine' ? { borderColor: currentUser.color, color: currentUser.color } : {}}
                        >
                            My Faves
                        </button>
                        <button
                            onClick={() => setActiveFilter('others')}
                            className={`px-3 py-1 rounded-full text-xs transition-colors border ${activeFilter === 'others' ? `bg-[var(--bg-card)] border-[${partner.color}] text-[${partner.color}]` : 'border-transparent text-[var(--text-muted)] hover:bg-[var(--bg-card)]'}`}
                            style={activeFilter === 'others' ? { borderColor: partner.color, color: partner.color } : {}}
                        >
                            {partner.name}'s
                        </button>
                        <button
                            onClick={() => setActiveFilter('recents')}
                            className={`px-3 py-1 rounded-full text-xs transition-colors border ${activeFilter === 'recents' ? 'bg-[var(--bg-card)] border-orange-400 text-orange-400' : 'border-transparent text-[var(--text-muted)] hover:bg-[var(--bg-card)]'}`}
                        >
                            History
                        </button>
                    </div>
                </div>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {filteredFoods.map(food => (
                    <DraggableFood
                        key={food.id}
                        food={food}
                        id={`sidebar-${food.id}`}
                        onClick={() => handleEditFood(food)}
                        onFavoriteToggle={() => toggleFavorite(food.id)}
                    />
                ))}
                {filteredFoods.length === 0 && (
                    <div className="text-center py-8 text-[var(--text-muted)]">
                        <p className="text-sm">No foods found</p>
                    </div>
                )}
            </div>

            {/* Footer / User Profile */}
            <div
                className="p-4 border-t border-[var(--border-color)] bg-[var(--bg-card)] cursor-pointer hover:bg-[var(--bg-card-hover)] transition-colors"
                onClick={() => switchUser(partner.id)}
            >
                <div className="flex items-center gap-3">
                    <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold transition-all"
                        style={{ backgroundColor: currentUser.color }}
                    >
                        {currentUser.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{currentUser.name}</p>
                        <p className="text-xs text-[var(--text-secondary)] truncate">Switch to {partner.name}</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
