import React, { useState, useEffect, useCallback } from 'react';
import { ScheduleItem } from '../types';
import { GoogleIcon } from './icons/GoogleIcon';
import { RefreshIcon } from './icons/RefreshIcon';
import { LogoutIcon } from './icons/LogoutIcon';

// Config variables from environment
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_API_KEY = process.env.API_KEY; 
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/calendar.events';

declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

interface GoogleCalendarManagerProps {
    schedule: ScheduleItem[];
    onUpdateScheduleItem: (chapterId: string, startTime: Date, updatedData: Partial<ScheduleItem>) => void;
}

// A simple script loader with caching to prevent re-loading
const loadedScripts = new Map<string, Promise<void>>();
const loadScript = (id: string, src: string): Promise<void> => {
    if (loadedScripts.has(src)) {
        return loadedScripts.get(src)!;
    }
    const promise = new Promise<void>((resolve, reject) => {
        if (document.getElementById(id)) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.id = id;
        script.src = src;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = (err) => {
            loadedScripts.delete(src); // Allow retrying
            reject(err);
        };
        document.body.appendChild(script);
    });
    loadedScripts.set(src, promise);
    return promise;
};


const GoogleCalendarManager: React.FC<GoogleCalendarManagerProps> = ({ schedule, onUpdateScheduleItem }) => {
    const [status, setStatus] = useState<'loading' | 'unconfigured' | 'ready' | 'error'>('loading');
    const [tokenClient, setTokenClient] = useState<any>(null);
    const [token, setToken] = useState<any>(null);
    const [user, setUser] = useState<any>(null); 
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncMessage, setSyncMessage] = useState('');

    const fetchUserProfile = useCallback(async (accessToken: string) => {
        try {
            const response = await fetch('https://www.googleapis.com/oauth2/v1/userinfo?alt=json', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            if (response.ok) {
                const profile = await response.json();
                setUser(profile);
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
        }
    }, []);
    
    useEffect(() => {
        const initialize = async () => {
            if (!GOOGLE_CLIENT_ID || !GOOGLE_API_KEY) {
                setStatus('unconfigured');
                return;
            }

            try {
                await Promise.all([
                    loadScript('gapi-script', 'https://apis.google.com/js/api.js'),
                    loadScript('gis-script', 'https://accounts.google.com/gsi/client'),
                ]);

                await new Promise<void>((resolve) => window.gapi.load('client', resolve));

                await window.gapi.client.init({
                    apiKey: GOOGLE_API_KEY,
                    discoveryDocs: [DISCOVERY_DOC],
                });

                const client = window.google.accounts.oauth2.initTokenClient({
                    client_id: GOOGLE_CLIENT_ID,
                    scope: SCOPES,
                    callback: (tokenResponse: any) => {
                        if (tokenResponse.error) {
                            console.error('Token error:', tokenResponse.error);
                            return;
                        }
                        setToken(tokenResponse);
                        fetchUserProfile(tokenResponse.access_token);
                    },
                });
                setTokenClient(client);
                setStatus('ready');

            } catch (error) {
                console.error("Failed to initialize Google Calendar services:", error);
                setStatus('error');
            }
        };
        initialize();
    }, [fetchUserProfile]);
    
    const handleAuthClick = () => {
        if (tokenClient) {
            tokenClient.requestAccessToken({ prompt: 'consent' });
        }
    };

    const handleSignoutClick = () => {
        if (token) {
            window.google.accounts.oauth2.revoke(token.access_token, () => {});
            setToken(null);
            setUser(null);
        }
    };
    
    const handleSyncClick = async () => {
        if (!token) {
            alert('Please connect your Google Account first.');
            return;
        }

        setIsSyncing(true);
        setSyncMessage('Starting sync...');

        const itemsToSync = schedule.filter(item => !item.googleEventId && !item.completed && item.startTime > new Date());
        
        if (itemsToSync.length === 0) {
            setSyncMessage('Everything is up to date!');
            setTimeout(() => {
                setIsSyncing(false);
                setSyncMessage('');
            }, 2000);
            return;
        }

        let successCount = 0;
        for (const item of itemsToSync) {
            setSyncMessage(`Syncing "${item.chapter}"...`);
            const event = {
                'summary': `Study: ${item.chapter} (${item.subject})`,
                'description': `Study session for ${item.subject} - ${item.chapter}, planned via JEE Prep Planner.`,
                'start': {
                    'dateTime': item.startTime.toISOString(),
                    'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone,
                },
                'end': {
                    'dateTime': item.endTime.toISOString(),
                    'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone,
                },
            };

            try {
                const request = window.gapi.client.calendar.events.insert({
                    'calendarId': 'primary',
                    'resource': event,
                });
                
                const response = await request;
                onUpdateScheduleItem(item.chapterId, item.startTime, { googleEventId: response.result.id });
                successCount++;
            } catch (error: any) {
                console.error(`Error syncing item ${item.chapterId}:`, error);
                if (error.result?.error?.message) {
                    setSyncMessage(`Error: ${error.result.error.message}`);
                } else {
                    setSyncMessage(`Error syncing "${item.chapter}". Check console.`);
                }
            }
        }
        
        setSyncMessage(`Synced ${successCount} of ${itemsToSync.length} new items.`);
        setTimeout(() => {
            setIsSyncing(false);
            setSyncMessage('');
        }, 3000);
    };

    if (status === 'loading') {
        return (
            <div className="text-center p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                <p className="text-slate-400">Loading Calendar Integration...</p>
            </div>
        );
    }
    
    if (status === 'unconfigured' || status === 'error') {
         return (
            <div className="text-center p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                <p className="text-yellow-500">Google Calendar integration is not available.</p>
                <p className="text-xs text-slate-400 mt-1">{status === 'unconfigured' ? 'Required configuration is missing.' : 'Failed to load Google services.'}</p>
            </div>
        );
    }
    
    return (
        <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
            <h3 className="text-lg font-bold mb-3 text-slate-200">Google Calendar Integration</h3>
            {token && user ? (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="text-sm text-center sm:text-left">
                        <p className="text-slate-300">Connected as:</p>
                        <p className="font-semibold text-sky-400">{user.email}</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleSignoutClick} className="bg-slate-600 hover:bg-slate-700 text-white font-semibold py-2 px-3 rounded-md transition-colors flex items-center gap-2 text-sm">
                            <LogoutIcon className="w-4 h-4" /> Disconnect
                        </button>
                        <button onClick={handleSyncClick} disabled={isSyncing} className="btn-gradient-primary flex items-center justify-center gap-2 text-sm disabled:opacity-60 disabled:cursor-wait">
                            <RefreshIcon className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                            {isSyncing ? 'Syncing...' : 'Sync Now'}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-2">
                     <p className="text-slate-400 text-sm text-center mb-2">Connect your Google Calendar to automatically sync your study sessions.</p>
                    <button onClick={handleAuthClick} className="btn-gradient-secondary flex items-center justify-center gap-2">
                        <GoogleIcon /> Connect Google Calendar
                    </button>
                </div>
            )}
            {isSyncing && syncMessage && <p className="text-center text-sm text-slate-400 mt-3">{syncMessage}</p>}
        </div>
    );
};

export default GoogleCalendarManager;
