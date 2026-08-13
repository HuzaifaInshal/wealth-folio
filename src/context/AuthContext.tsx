/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, getUserProfile, createWealthFolioSpreadsheet } from '../services/googleSheets';

interface AuthContextType {
  user: UserProfile | null;
  accessToken: string | null;
  spreadsheetId: string | null;
  spreadsheetUrl: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  isSyncing: boolean;
  syncError: string | null;
  loginWithAccessToken: (token: string) => Promise<void>;
  updateSpreadsheetDetails: (id: string, url?: string) => void;
  setIsSyncing: (syncing: boolean) => void;
  setSyncError: (err: string | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('wealthfolio_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [accessToken, setAccessToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem('wealthfolio_access_token') || null;
    } catch {
      return null;
    }
  });

  const [spreadsheetId, setSpreadsheetId] = useState<string | null>(() => {
    try {
      return localStorage.getItem('wealthfolio_sheet_id') || null;
    } catch {
      return null;
    }
  });

  const [spreadsheetUrl, setSpreadsheetUrl] = useState<string | null>(() => {
    try {
      return localStorage.getItem('wealthfolio_sheet_url') || null;
    } catch {
      return null;
    }
  });

  const [isInitializing, setIsInitializing] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  useEffect(() => {
    setIsInitializing(false);
  }, []);

  const loginWithAccessToken = async (token: string) => {
    try {
      setSyncError(null);
      setIsSyncing(true);

      // Fetch User profile from Google
      const profile = await getUserProfile(token);
      setUser(profile);
      setAccessToken(token);

      localStorage.setItem('wealthfolio_access_token', token);
      localStorage.setItem('wealthfolio_user', JSON.stringify(profile));

      // Auto-create spreadsheet if none connected
      if (!spreadsheetId) {
        const sheetInfo = await createWealthFolioSpreadsheet(token);
        setSpreadsheetId(sheetInfo.spreadsheetId);
        setSpreadsheetUrl(sheetInfo.spreadsheetUrl);
        localStorage.setItem('wealthfolio_sheet_id', sheetInfo.spreadsheetId);
        localStorage.setItem('wealthfolio_sheet_url', sheetInfo.spreadsheetUrl);
      }
    } catch (err: any) {
      setSyncError(err.message || 'Failed to authorize Google Sheets');
      throw err;
    } finally {
      setIsSyncing(false);
    }
  };

  const updateSpreadsheetDetails = (id: string, url?: string) => {
    const cleanId = id.trim();
    const constructedUrl = url || `https://docs.google.com/spreadsheets/d/${cleanId}/edit`;
    setSpreadsheetId(cleanId);
    setSpreadsheetUrl(constructedUrl);
    localStorage.setItem('wealthfolio_sheet_id', cleanId);
    localStorage.setItem('wealthfolio_sheet_url', constructedUrl);
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    setSpreadsheetId(null);
    setSpreadsheetUrl(null);
    localStorage.removeItem('wealthfolio_access_token');
    localStorage.removeItem('wealthfolio_user');
    localStorage.removeItem('wealthfolio_sheet_id');
    localStorage.removeItem('wealthfolio_sheet_url');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        spreadsheetId,
        spreadsheetUrl,
        isAuthenticated: !!accessToken && !!user,
        isInitializing,
        isSyncing,
        syncError,
        loginWithAccessToken,
        updateSpreadsheetDetails,
        setIsSyncing,
        setSyncError,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
