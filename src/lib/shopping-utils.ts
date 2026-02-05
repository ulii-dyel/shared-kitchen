import { CalendarEntryWithFood, UnitType } from '@/types/database';

export interface ShoppingItem {
    id: string; // generated ID based on name+unit
    name: string;
    quantity: number;
    unit: UnitType;
    category?: string; // Optional: for sorting
}

export function aggregateIngredients(entries: CalendarEntryWithFood[]): ShoppingItem[] {
    const map = new Map<string, ShoppingItem>();

    entries.forEach(entry => {
        if (!entry.food || !entry.food.ingredients) return;

        entry.food.ingredients.forEach(ing => {
            const key = `${ing.ingredient_name.toLowerCase()}_${ing.unit}`;

            if (map.has(key)) {
                const item = map.get(key)!;
                item.quantity += Number(ing.quantity);
            } else {
                map.set(key, {
                    id: key,
                    name: ing.ingredient_name,
                    quantity: Number(ing.quantity),
                    unit: ing.unit,
                });
            }
        });
    });

    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
}
