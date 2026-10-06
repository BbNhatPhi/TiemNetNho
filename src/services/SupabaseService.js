import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

class SupabaseService {
    constructor() {
        this.client = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;
        this.user = null;
        this.onAuthStateChange = null;
    }

    init(callback) {
        if (!this.client) {
            console.warn("Supabase credentials not found in env.");
            if (callback) callback(null);
            return;
        }
        
        this.client.auth.getSession().then(({ data: { session } }) => {
            this.user = session?.user || null;
            if (callback) callback(this.user);
        });

        this.client.auth.onAuthStateChange((event, session) => {
            this.user = session?.user || null;
            if (this.onAuthStateChange) this.onAuthStateChange(event, this.user);
        });
    }

    async signUp(email, password) {
        if (!this.client) return { error: { message: "Supabase not configured." } };
        return await this.client.auth.signUp({ email, password });
    }

    async signIn(email, password) {
        if (!this.client) return { error: { message: "Supabase not configured." } };
        return await this.client.auth.signInWithPassword({ email, password });
    }

    async signOut() {
        if (!this.client) return;
        return await this.client.auth.signOut();
    }

    async getSaveData() {
        if (!this.client || !this.user) return null;
        try {
            const { data, error } = await this.client
                .from('saves')
                .select('save_data, updated_at')
                .eq('user_id', this.user.id)
                .single();
            if (error) {
                if (error.code === 'PGRST116') return null; // No row found
                console.error("Error fetching save:", error);
                return null;
            }
            return data;
        } catch(e) {
            console.error("Network error fetching save:", e);
            return null;
        }
    }

    async uploadSaveData(saveData) {
        if (!this.client || !this.user) return false;
        try {
            const { error } = await this.client
                .from('saves')
                .upsert({ 
                    user_id: this.user.id, 
                    save_data: saveData,
                    updated_at: new Date(saveData.updated_at).toISOString()
                }, {
                    onConflict: 'user_id'
                });
                
            if (error) {
                console.error("Error uploading save:", error);
                return false;
            }
            return true;
        } catch(e) {
            console.error("Network error uploading save:", e);
            return false;
        }
    }
}

export const supabaseService = new SupabaseService();
