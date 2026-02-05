'use client';

import { useState } from 'react';
import { Search, Plus, Filter } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import FoodCard from '@/components/foods/FoodCard';
import FoodModal from '@/components/foods/FoodModal';
import BulkAddInput from '@/components/foods/BulkAddInput';
import { FoodWithDetails } from '@/types/database';

// Mock Data for initial view
const MOCK_FOODS: FoodWithDetails[] = [
    {
        id: '1',
        household_id: 'h1',
        name: 'Spaghetti Carbonara',
        recipe_markdown: 'Boil pasta. Fry guanciale. Mix egg yolks and pecorino...',
        image_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        tags: [
            { id: 't1', household_id: 'h1', name: 'Pasta', type: 'global', color: null, created_at: '' },
            { id: 't2', household_id: 'h1', name: 'Italian', type: 'specific', color: null, created_at: '' }
        ],
        ingredients: [],
        favorites: []
    },
    {
        id: '2',
        household_id: 'h1',
        name: 'Grilled Salmon Salad',
        recipe_markdown: 'Grill salmon. Chop veggies...',
        image_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        tags: [
            { id: 't3', household_id: 'h1', name: 'Fish', type: 'global', color: null, created_at: '' },
            { id: 't4', household_id: 'h1', name: 'Healthy', type: 'specific', color: null, created_at: '' }
        ],
        ingredients: [],
        favorites: [{ id: 'f1', user_id: 'u1', food_id: '2', created_at: '' }]
    },
    {
        id: '3',
        household_id: 'h1',
        name: 'Chicken Curry',
        recipe_markdown: '...',
        image_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        tags: [
            { id: 't5', household_id: 'h1', name: 'Chicken', type: 'global', color: null, created_at: '' },
            { id: 't6', household_id: 'h1', name: 'Spicy', type: 'specific', color: null, created_at: '' }
        ],
        ingredients: [],
        favorites: []
    }
];

export default function FoodsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [foods, setFoods] = useState<FoodWithDetails[]>(MOCK_FOODS); // In real app, fetch from Supabase
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFood, setEditingFood] = useState<FoodWithDetails | undefined>(undefined);
    const [showBulkAdd, setShowBulkAdd] = useState(false);

    // Filter logic
    const filteredFoods = foods.filter(food =>
        food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        food.tags.some(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleEdit = (food: FoodWithDetails) => {
        setEditingFood(food);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setEditingFood(undefined);
        setIsModalOpen(true);
    };

    const handleSave = (foodData: Partial<FoodWithDetails>) => {
        // Mock save
        if (editingFood) {
            setFoods(foods.map(f => f.id === editingFood.id ? { ...f, ...foodData } : f));
        } else {
            // Create new
            const newFood: FoodWithDetails = {
                ...MOCK_FOODS[0], // Copy structure
                id: Math.random().toString(),
                name: foodData.name || 'New Food',
                tags: [], // fix this later
                ...foodData
            } as FoodWithDetails;
            setFoods([newFood, ...foods]);
        }
    };

    const handleBulkAdd = (names: string[]) => {
        const newFoods = names.map((name, i) => ({
            ...MOCK_FOODS[0],
            id: `bulk-${Date.now()}-${i}`,
            name,
            tags: [],
            ingredients: [],
            favorites: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        } as FoodWithDetails));

        setFoods([...newFoods, ...foods]);
        setShowBulkAdd(false);
    };

    return (
        <div className="container py-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--text-primary)]">Food Database</h1>
                    <p className="text-[var(--text-secondary)]">Manage your recipes and ingredients</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => setShowBulkAdd(!showBulkAdd)}>
                        Bulk Add
                    </Button>
                    <Button onClick={handleCreate}>
                        <Plus size={20} />
                        Add New Food
                    </Button>
                </div>
            </div>

            {/* Bulk Add Section */}
            {showBulkAdd && (
                <div className="animate-slide-up">
                    <BulkAddInput onParse={handleBulkAdd} />
                </div>
            )}

            {/* Search & Filters */}
            <div className="flex gap-3">
                <div className="flex-1 max-w-md">
                    <Input
                        placeholder="Search by name or tag..."
                        icon={<Search size={18} />}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button variant="secondary">
                    <Filter size={18} className="mr-2" />
                    Filter
                </Button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredFoods.map(food => (
                    <FoodCard
                        key={food.id}
                        food={food}
                        onClick={() => handleEdit(food)}
                        onFavoriteToggle={() => {
                            // Mock toggle
                            console.log('Toggle favorite', food.id);
                        }}
                    />
                ))}
            </div>

            {/* Empty State */}
            {filteredFoods.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-[var(--border-color)] rounded-xl">
                    <p className="text-[var(--text-muted)] text-lg">No foods found matching "{searchQuery}"</p>
                    <Button variant="ghost" onClick={() => setSearchQuery('')} className="mt-2">
                        Clear Search
                    </Button>
                </div>
            )}

            {/* Modal */}
            <FoodModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                food={editingFood}
                onSave={handleSave}
            />
        </div>
    );
}
