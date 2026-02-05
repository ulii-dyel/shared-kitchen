export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type UnitType = 'gr' | 'ml' | '#' | 'tbsp' | 'tsp'
export type TagType = 'specific' | 'global'

export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string
                    email: string
                    name: string
                    color: string
                    household_id: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    email: string
                    name: string
                    color?: string
                    household_id?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    name?: string
                    color?: string
                    household_id?: string | null
                    created_at?: string
                }
            }
            households: {
                Row: {
                    id: string
                    name: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    created_at?: string
                }
            }
            foods: {
                Row: {
                    id: string
                    household_id: string
                    name: string
                    recipe_markdown: string | null
                    image_url: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    household_id: string
                    name: string
                    recipe_markdown?: string | null
                    image_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    household_id?: string
                    name?: string
                    recipe_markdown?: string | null
                    image_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            tags: {
                Row: {
                    id: string
                    household_id: string
                    name: string
                    type: TagType
                    color: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    household_id: string
                    name: string
                    type: TagType
                    color?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    household_id?: string
                    name?: string
                    type?: TagType
                    color?: string | null
                    created_at?: string
                }
            }
            food_tags: {
                Row: {
                    food_id: string
                    tag_id: string
                }
                Insert: {
                    food_id: string
                    tag_id: string
                }
                Update: {
                    food_id?: string
                    tag_id?: string
                }
            }
            food_ingredients: {
                Row: {
                    id: string
                    food_id: string
                    ingredient_name: string
                    quantity: number
                    unit: UnitType
                    created_at: string
                }
                Insert: {
                    id?: string
                    food_id: string
                    ingredient_name: string
                    quantity: number
                    unit: UnitType
                    created_at?: string
                }
                Update: {
                    id?: string
                    food_id?: string
                    ingredient_name?: string
                    quantity?: number
                    unit?: UnitType
                    created_at?: string
                }
            }
            meal_slots: {
                Row: {
                    id: string
                    household_id: string
                    name: string
                    sort_order: number
                    is_visible: boolean
                    specific_date: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    household_id: string
                    name: string
                    sort_order?: number
                    is_visible?: boolean
                    specific_date?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    household_id?: string
                    name?: string
                    sort_order?: number
                    is_visible?: boolean
                    specific_date?: string | null
                    created_at?: string
                }
            }
            calendar_entries: {
                Row: {
                    id: string
                    household_id: string
                    food_id: string | null
                    meal_slot_id: string
                    date: string
                    is_leftover: boolean
                    created_by: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    household_id: string
                    food_id?: string | null
                    meal_slot_id: string
                    date: string
                    is_leftover?: boolean
                    created_by: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    household_id?: string
                    food_id?: string | null
                    meal_slot_id?: string
                    date?: string
                    is_leftover?: boolean
                    created_by?: string
                    created_at?: string
                }
            }
            usage_logs: {
                Row: {
                    id: string
                    food_id: string
                    used_date: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    food_id: string
                    used_date: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    food_id?: string
                    used_date?: string
                    created_at?: string
                }
            }
            favorites: {
                Row: {
                    id: string
                    user_id: string
                    food_id: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    food_id: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    food_id?: string
                    created_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            unit_type: UnitType
            tag_type: TagType
        }
    }
}

// Helper types for easier usage
export type User = Database['public']['Tables']['users']['Row']
export type Household = Database['public']['Tables']['households']['Row']
export type Food = Database['public']['Tables']['foods']['Row']
export type Tag = Database['public']['Tables']['tags']['Row']
export type FoodTag = Database['public']['Tables']['food_tags']['Row']
export type FoodIngredient = Database['public']['Tables']['food_ingredients']['Row']
export type MealSlot = Database['public']['Tables']['meal_slots']['Row']
export type CalendarEntry = Database['public']['Tables']['calendar_entries']['Row']
export type UsageLog = Database['public']['Tables']['usage_logs']['Row']
export type Favorite = Database['public']['Tables']['favorites']['Row']

// Extended types with relations
export interface FoodWithDetails extends Food {
    tags: Tag[]
    ingredients: FoodIngredient[]
    favorites: Favorite[]
}

export interface CalendarEntryWithFood extends CalendarEntry {
    food: FoodWithDetails | null
    meal_slot: MealSlot
}

export interface MealSlotWithEntries extends MealSlot {
    entries: CalendarEntryWithFood[]
}
