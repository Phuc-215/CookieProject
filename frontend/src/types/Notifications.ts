export type type = 'like' | 'follow' | 'comment' | 'recipe_trending' | 'system' | 'new_recipe';

export interface Notification {
    id: number;
    user_id: number;
    actor_id: number;
    recipe_id?: number;
    type: type,
    payload: any;
    is_read: boolean;
}