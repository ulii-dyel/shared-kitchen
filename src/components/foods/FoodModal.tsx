'use client';

import { useState, useEffect } from 'react';
import { Plus, X, Trash2 } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import ReactMarkdown from 'react-markdown';
import { FoodWithDetails, UnitType, TagType } from '@/types/database';
import { useCalendar } from '@/context/CalendarContext';
import { format } from 'date-fns';

interface FoodModalProps {
    isOpen: boolean;
    onClose: () => void;
    food?: FoodWithDetails; // If provided, edit mode. If null, create mode.
    onSave?: (foodData: Partial<FoodWithDetails>) => void;
}

export default function FoodModal({ isOpen, onClose, food, onSave }: FoodModalProps) {
    const { entries, deleteFood, foods: allFoods } = useCalendar();

    // State
    const [name, setName] = useState('');
    const [recipe, setRecipe] = useState('');
    const [tags, setTags] = useState<{ name: string, type: TagType }[]>([]);
    const [ingredients, setIngredients] = useState<{ name: string, qty: number, unit: UnitType }[]>([]);

    // Temporary state for new tag/ingredient inputs
    const [newTagName, setNewTagName] = useState('');
    const [newTagType, setNewTagType] = useState<TagType>('specific');
    const [recipeTab, setRecipeTab] = useState<'write' | 'preview'>('write');

    // Derive existing unique tags for autocomplete
    const existingTags = Array.from(new Set(
        allFoods.flatMap(f => f.tags).map(t => t.name)
    )).sort();

    // Reset state when opening/closing or changing food
    useEffect(() => {
        if (isOpen) {
            if (food) {
                setName(food.name);
                setRecipe(food.recipe_markdown || '');
                setTags(food.tags.map(t => ({ name: t.name, type: t.type })));
                setIngredients(food.ingredients.map(i => ({
                    name: i.ingredient_name,
                    qty: i.quantity,
                    unit: i.unit
                })));
            } else {
                // Reset for create mode
                setName('');
                setRecipe('');
                setTags([]);
                setIngredients([]);
            }
        }
    }, [isOpen, food]);

    const handleAddTag = (e?: React.KeyboardEvent, tagName?: string) => {
        if (e) e.preventDefault();
        const nameToAdd = tagName || newTagName;
        if (nameToAdd.trim()) {
            setTags([...tags, { name: nameToAdd.trim(), type: newTagType }]);
            setNewTagName('');
        }
    };

    const handleAddIngredient = () => {
        setIngredients([...ingredients, { name: '', qty: 1, unit: 'gr' }]);
    };

    const handleSave = () => {
        if (!name.trim()) return;

        onSave?.({
            name,
            recipe_markdown: recipe,
            // @ts-ignore
            tags: tags.map(t => ({ ...t, id: t.id || `temp-${Date.now()}-${Math.random()}`, household_id: 'h1', color: null, created_at: '' })),
            // @ts-ignore
            ingredients: ingredients.map(i => ({ ...i, ingredient_name: i.name, quantity: i.qty, unit: i.unit }))
        });
        onClose();
    };


    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this food?')) {
            if (food) deleteFood(food.id);
            onClose();
        }
    };

    // Calculate history
    const history = food ? entries.filter(e => e.food_id === food.id) : [];

    // Suggestion logic
    const suggestions = newTagName.trim()
        ? existingTags.filter(t => t.toLowerCase().includes(newTagName.toLowerCase()) && !tags.find(existing => existing.name === t))
        : [];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={food ? 'Edit Food' : 'Add New Food'} size="lg">
            <div className="space-y-6">
                {/* Name */}
                <Input
                    label="Food Name"
                    placeholder="e.g. Chicken Curry"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                {/* Tags */}
                <div className="space-y-2">
                    <div className="flex justify-between items-baseline">
                        <label className="block text-sm font-medium text-[var(--text-secondary)]">Tags</label>
                        <span className="text-xs text-[var(--text-muted)]" title="Food tags are categories (e.g. 'Pasta'), Macro tags are for macronutrients (e.g. 'High Protein')">
                            What's the difference?
                        </span>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-2">
                        {tags.map((tag, idx) => (
                            <Badge key={idx} variant={tag.type === 'specific' ? 'specific' : 'global'}>
                                {tag.name}
                                <button
                                    onClick={() => setTags(tags.filter((_, i) => i !== idx))}
                                    className="ml-1 hover:text-red-400 focus:outline-none"
                                    type="button"
                                >
                                    <X size={12} />
                                </button>
                            </Badge>
                        ))}
                    </div>

                    <div className="relative">
                        <div className="flex gap-2">
                            <Input
                                placeholder="Add tag..."
                                value={newTagName}
                                onChange={(e) => setNewTagName(e.target.value)}
                                className="flex-1"
                                onKeyDown={(e) => e.key === 'Enter' && handleAddTag(e)}
                            />
                            <select
                                value={newTagType}
                                onChange={(e) => setNewTagType(e.target.value as TagType)}
                                className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-md px-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
                            >
                                <option value="global">Food</option>
                                <option value="specific">Macro</option>
                            </select>
                            <Button size="sm" variant="secondary" onClick={() => handleAddTag()}>Add</Button>
                        </div>

                        {/* Suggestions Dropdown */}
                        {suggestions.length > 0 && (
                            <div className="absolute top-full left-0 w-full mt-1 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-md shadow-lg z-50 max-h-32 overflow-y-auto">
                                {suggestions.map(suggestion => (
                                    <button
                                        key={suggestion}
                                        className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--bg-darker)] transition-colors"
                                        onClick={() => handleAddTag(undefined, suggestion)}
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <p className="text-xs text-[var(--text-muted)]">
                        * <strong>Food</strong>: General categories (e.g. "Dinner", "Italian") <br />
                        * <strong>Macro</strong>: Macronutrient details (e.g. "High Protein", "Low Carb")
                    </p>
                </div>

                {/* Ingredients */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="block text-sm font-medium text-[var(--text-secondary)]">Ingredients</label>
                        <Button size="sm" variant="ghost" onClick={handleAddIngredient} className="text-[var(--primary)]">
                            <Plus size={16} className="mr-1" /> Add Ingredient
                        </Button>
                    </div>

                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                        {ingredients.map((ing, idx) => (
                            <div key={idx} className="flex gap-2 items-center slide-in-bottom">
                                <Input
                                    placeholder="Item"
                                    value={ing.name}
                                    onChange={(e) => {
                                        const newIngs = [...ingredients];
                                        newIngs[idx].name = e.target.value;
                                        setIngredients(newIngs);
                                    }}
                                    className="flex-[2]"
                                />
                                <Input
                                    type="number"
                                    placeholder="Qty"
                                    value={ing.qty}
                                    onChange={(e) => {
                                        const newIngs = [...ingredients];
                                        newIngs[idx].qty = parseFloat(e.target.value) || 0;
                                        setIngredients(newIngs);
                                    }}
                                    className="w-20"
                                />
                                <select
                                    value={ing.unit}
                                    onChange={(e) => {
                                        const newIngs = [...ingredients];
                                        newIngs[idx].unit = e.target.value as UnitType;
                                        setIngredients(newIngs);
                                    }}
                                    className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-md px-2 h-[42px] text-sm text-[var(--text-primary)]"
                                >
                                    <option value="gr">gr</option>
                                    <option value="ml">ml</option>
                                    <option value="#">#</option>
                                    <option value="tbsp">tbsp</option>
                                    <option value="tsp">tsp</option>
                                </select>
                                <button
                                    onClick={() => setIngredients(ingredients.filter((_, i) => i !== idx))}
                                    className="p-2 text-[var(--text-muted)] hover:text-red-400"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                        {ingredients.length === 0 && (
                            <div className="text-sm text-[var(--text-muted)] italic text-center py-2 border border-dashed border-[var(--border-color)] rounded-md">
                                No ingredients listed
                            </div>
                        )}
                    </div>
                </div>

                {/* Recipe */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="block text-sm font-medium text-[var(--text-secondary)]">Recipe / Instructions</label>
                        <div className="flex bg-[var(--bg-darker)] p-1 rounded-lg">
                            <button
                                onClick={() => setRecipeTab('write')}
                                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${recipeTab === 'write' ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
                            >
                                Write
                            </button>
                            <button
                                onClick={() => setRecipeTab('preview')}
                                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${recipeTab === 'preview' ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
                            >
                                Preview
                            </button>
                        </div>
                    </div>

                    {recipeTab === 'write' ? (
                        <textarea
                            className="w-full h-48 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg p-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] resize-none font-mono text-sm leading-relaxed"
                            placeholder="Write cooking instructions here (Markdown supported)..."
                            value={recipe}
                            onChange={(e) => setRecipe(e.target.value)}
                        />
                    ) : (
                        <div className="w-full h-48 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg p-3 overflow-y-auto prose prose-invert prose-sm max-w-none custom-scrollbar">
                            {recipe ? (
                                <ReactMarkdown>{recipe}</ReactMarkdown>
                            ) : (
                                <p className="text-[var(--text-muted)] italic">Nothing to preview</p>
                            )}
                        </div>
                    )}
                    <p className="text-xs text-[var(--text-secondary)]">
                        Supports **bold**, *italics*, - lists, and [links](url).
                    </p>
                </div>

                {/* Usage History */}
                {
                    food && (
                        <div className="space-y-2 border-t border-[var(--border-color)] pt-4">
                            <label className="block text-sm font-medium text-[var(--text-secondary)]">Usage History</label>
                            {history.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(entry => (
                                        <span key={entry.id} className="text-xs px-2 py-1 bg-[var(--bg-darker)] rounded-md text-[var(--text-muted)] border border-[var(--border-color)]">
                                            {format(new Date(entry.date), 'MMM d, yyyy')}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-[var(--text-muted)] italic">Not planned yet</p>
                            )}
                        </div>
                    )
                }

                {/* Footer Actions */}
                <div className="flex justify-between items-center pt-4 border-t border-[var(--border-color)]">
                    <div>
                        {food && (
                            <Button variant="ghost" onClick={handleDelete} className="text-red-400 hover:text-red-300 hover:bg-red-400/10">
                                <Trash2 size={16} className="mr-2" /> Delete
                            </Button>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <Button variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button onClick={handleSave}>Save Food</Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
