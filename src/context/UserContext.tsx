'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types/database';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface UserContextType {
    currentUser: User | null;
    partner: User | null;
    isLoading: boolean;
    switchUser: (userId: string) => void; // Deprecated in real auth, maps to signOut mostly or no-op
    getUserColor: (userId: string) => string;
    refreshProfile: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [partner, setPartner] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();
    const router = useRouter();

    const fetchProfile = async () => {
        try {
            const { data: { user: authUser } } = await supabase.auth.getUser();

            if (!authUser) {
                setCurrentUser(null);
                setPartner(null);
                setIsLoading(false);
                return;
            }

            // Fetch my profile
            const { data: profile, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', authUser.id)
                .single();

            if (error || !profile) {
                console.error('Error fetching profile:', error);
                return;
            }

            // Force type assertion or ensure compatible shape
            const currentUserProfile = profile as User;
            setCurrentUser(currentUserProfile);

            // Fetch partner (other user in same household)
            if (currentUserProfile.household_id) {
                const { data: householdMembers } = await supabase
                    .from('users')
                    .select('*')
                    .eq('household_id', currentUserProfile.household_id)
                    .neq('id', currentUserProfile.id)
                    .limit(1);

                if (householdMembers && householdMembers.length > 0) {
                    setPartner(householdMembers[0] as User);
                } else {
                    setPartner({
                        id: 'placeholder-partner',
                        name: 'Partner',
                        color: '#f472b6',
                        email: '',
                        household_id: currentUserProfile.household_id,
                        created_at: ''
                    });
                }
            }

        } catch (err) {
            console.error('Unexpected error in fetchProfile:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                fetchProfile();
            } else if (event === 'SIGNED_OUT') {
                setCurrentUser(null);
                setPartner(null);
                router.push('/login');
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const switchUser = async (userId: string) => {
        // In real auth, we can't just switch user without credentials.
        // This button now acts as a Sign Out / Switch Account button
        await supabase.auth.signOut();
        router.push('/login');
    };

    const getUserColor = (userId: string) => {
        if (currentUser?.id === userId) return currentUser.color || '#4361ee';
        if (partner?.id === userId) return partner.color || '#f472b6';
        return '#a855f7';
    };

    return (
        <UserContext.Provider value={{
            currentUser,
            partner,
            isLoading,
            switchUser,
            getUserColor,
            refreshProfile: fetchProfile
        }}>
            {children}
        </UserContext.Provider>
    );
}

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
