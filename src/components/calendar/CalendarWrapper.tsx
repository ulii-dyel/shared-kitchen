'use client';

import { ReactNode } from 'react';
import { DndContext, DragOverlay, useSensors, useSensor, MouseSensor, TouchSensor, defaultDropAnimationSideEffects } from '@dnd-kit/core';
import { CalendarProvider, useCalendar } from '@/context/CalendarContext';
import { UserProvider } from '@/context/UserContext';
import { createPortal } from 'react-dom';
import FoodCard from '@/components/foods/FoodCard';
import { FoodWithDetails } from '@/types/database';
import { useState } from 'react';

function CalendarDndContext({ children }: { children: ReactNode }) {
    const { handleDragEnd } = useCalendar();
    const [activeFood, setActiveFood] = useState<FoodWithDetails | null>(null);

    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: {
                distance: 10,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250,
                tolerance: 5,
            },
        })
    );

    const dropAnimation = {
        sideEffects: defaultDropAnimationSideEffects({
            styles: {
                active: {
                    opacity: '0.5',
                },
            },
        }),
    };

    return (
        <DndContext
            id="calendar-dnd-context"
            sensors={sensors}
            onDragEnd={handleDragEnd}
            onDragStart={(event) => {
                if (event.active.data.current?.food) {
                    setActiveFood(event.active.data.current.food as FoodWithDetails);
                }
            }}
        >
            {children}
            {typeof window !== 'undefined' && createPortal(
                <DragOverlay dropAnimation={dropAnimation} zIndex={1000}>
                    {activeFood ? (
                        <div className="w-64 rotate-2 cursor-grabbing shadow-2xl">
                            <FoodCard food={activeFood} isDragging />
                        </div>
                    ) : null}
                </DragOverlay>,
                document.body
            )}
        </DndContext>
    );
}

export default function CalendarWrapper({ children }: { children: ReactNode }) {
    return (
        <UserProvider>
            <CalendarProvider>
                <CalendarDndContext>
                    {children}
                </CalendarDndContext>
            </CalendarProvider>
        </UserProvider>
    );
}
