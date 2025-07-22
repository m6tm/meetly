import { createClient } from '@/utils/supabase/client';
import { useEffect } from 'react';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

export function useRealtimeUpdates({
    channel,
    table,
    schema = 'public',
    event,
    callback,
}: {
    channel: string;
    table: string;
    schema?: string;
    event: RealtimeEvent;
    callback: (payload: RealtimePostgresChangesPayload<any>) => void;
}, dependencies: any[] = []) {
    const supabase = createClient();

    useEffect(() => {
        const subscription = supabase
            .channel(channel)
            .on(
                'postgres_changes' as any,
                {
                    event,
                    schema,
                    table,
                },
                callback
            )
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, [channel, table, schema, event, callback, ...dependencies]);
}