/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { InvestmentSource, Transaction } from '../types';

const SHEETS_API_BASE = 'https://sheets.googleapis.com/v4/spreadsheets';
const USERINFO_API_BASE = 'https://www.googleapis.com/oauth2/v3/userinfo';

export interface UserProfile {
  email: string;
  name: string;
  picture?: string;
}

/**
 * Fetch Google User Profile info using access token
 */
export async function getUserProfile(accessToken: string): Promise<UserProfile> {
  const res = await fetch(USERINFO_API_BASE, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch user profile (${res.status})`);
  }
  const data = await res.json();
  return {
    email: data.email || 'user@gmail.com',
    name: data.name || data.email?.split('@')[0] || 'Google User',
    picture: data.picture,
  };
}

/**
 * Auto-create WealthFolio Data Vault spreadsheet in Google Drive
 */
export async function createWealthFolioSpreadsheet(
  accessToken: string,
  title: string = 'WealthFolio Data Vault'
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
  const body = {
    properties: { title },
    sheets: [
      {
        properties: { title: 'Investments' },
        data: [
          {
            startRow: 0,
            startColumn: 0,
            rowData: [
              {
                values: [
                  { userEnteredValue: { stringValue: 'ID' } },
                  { userEnteredValue: { stringValue: 'Name' } },
                  { userEnteredValue: { stringValue: 'Category' } },
                  { userEnteredValue: { stringValue: 'InvestedAmount' } },
                  { userEnteredValue: { stringValue: 'CurrentValuation' } },
                  { userEnteredValue: { stringValue: 'Notes' } },
                  { userEnteredValue: { stringValue: 'UpdatedAt' } },
                ],
              },
            ],
          },
        ],
      },
      {
        properties: { title: 'Transactions' },
        data: [
          {
            startRow: 0,
            startColumn: 0,
            rowData: [
              {
                values: [
                  { userEnteredValue: { stringValue: 'ID' } },
                  { userEnteredValue: { stringValue: 'Type' } },
                  { userEnteredValue: { stringValue: 'Date' } },
                  { userEnteredValue: { stringValue: 'SourceID' } },
                  { userEnteredValue: { stringValue: 'TargetID' } },
                  { userEnteredValue: { stringValue: 'Amount' } },
                  { userEnteredValue: { stringValue: 'NewValuation' } },
                  { userEnteredValue: { stringValue: 'Note' } },
                ],
              },
            ],
          },
        ],
      },
    ],
  };

  const res = await fetch(SHEETS_API_BASE, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to create Google Sheet: ${errText}`);
  }

  const data = await res.json();
  return {
    spreadsheetId: data.spreadsheetId,
    spreadsheetUrl: data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${data.spreadsheetId}/edit`,
  };
}

/**
 * Fetch investments from Google Sheet
 */
export async function fetchSheetInvestments(
  accessToken: string,
  spreadsheetId: string
): Promise<InvestmentSource[]> {
  const url = `${SHEETS_API_BASE}/${spreadsheetId}/values/Investments!A2:G1000`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    if (res.status === 404) return [];
    throw new Error(`Failed to fetch investments from Google Sheet (${res.status})`);
  }

  const data = await res.json();
  const rows: string[][] = data.values || [];

  return rows.map((row) => ({
    id: row[0] || `inv_${Date.now()}`,
    name: row[1] || 'Unnamed Source',
    category: row[2] || 'mutual_fund',
    investedAmount: parseFloat(row[3]) || 0,
    currentValuation: parseFloat(row[4]) || 0,
    notes: row[5] || undefined,
  }));
}

/**
 * Fetch transactions from Google Sheet
 */
export async function fetchSheetTransactions(
  accessToken: string,
  spreadsheetId: string
): Promise<Transaction[]> {
  const url = `${SHEETS_API_BASE}/${spreadsheetId}/values/Transactions!A2:H1000`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    if (res.status === 404) return [];
    throw new Error(`Failed to fetch transactions from Google Sheet (${res.status})`);
  }

  const data = await res.json();
  const rows: string[][] = data.values || [];

  return rows.map((row) => ({
    id: row[0] || `tx_${Date.now()}`,
    type: (row[1] as any) || 'invest',
    date: row[2] || new Date().toISOString(),
    sourceId: row[3] || '',
    targetId: row[4] || undefined,
    amount: parseFloat(row[5]) || 0,
    newValuation: row[6] ? parseFloat(row[6]) : undefined,
    note: row[7] || undefined,
  }));
}

/**
 * Append or update an investment source in Google Sheet
 */
export async function saveSheetInvestment(
  accessToken: string,
  spreadsheetId: string,
  investment: InvestmentSource
): Promise<void> {
  const rowValues = [
    investment.id,
    investment.name,
    investment.category,
    investment.investedAmount.toString(),
    investment.currentValuation.toString(),
    investment.notes || '',
    new Date().toISOString(),
  ];

  // Try fetching existing rows to see if we should update or append
  const fetchUrl = `${SHEETS_API_BASE}/${spreadsheetId}/values/Investments!A2:A1000`;
  const getRes = await fetch(fetchUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (getRes.ok) {
    const getData = await getRes.json();
    const rows: string[][] = getData.values || [];
    const rowIndex = rows.findIndex((r) => r[0] === investment.id);

    if (rowIndex !== -1) {
      const sheetRowNumber = rowIndex + 2;
      const updateUrl = `${SHEETS_API_BASE}/${spreadsheetId}/values/Investments!A${sheetRowNumber}:G${sheetRowNumber}?valueInputOption=USER_ENTERED`;
      await fetch(updateUrl, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ values: [rowValues] }),
      });
      return;
    }
  }

  // Append new row
  const appendUrl = `${SHEETS_API_BASE}/${spreadsheetId}/values/Investments!A:G:append?valueInputOption=USER_ENTERED`;
  await fetch(appendUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ values: [rowValues] }),
  });
}

/**
 * Delete an investment source from Google Sheet
 */
export async function deleteSheetInvestment(
  accessToken: string,
  spreadsheetId: string,
  investmentId: string
): Promise<void> {
  const fetchUrl = `${SHEETS_API_BASE}/${spreadsheetId}/values/Investments!A2:G1000`;
  const getRes = await fetch(fetchUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!getRes.ok) return;

  const getData = await getRes.json();
  const rows: string[][] = getData.values || [];
  const updatedRows = rows.filter((r) => r[0] !== investmentId);

  // Clear existing range and write updated rows back
  const clearUrl = `${SHEETS_API_BASE}/${spreadsheetId}/values/Investments!A2:G1000:clear`;
  await fetch(clearUrl, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (updatedRows.length > 0) {
    const updateUrl = `${SHEETS_API_BASE}/${spreadsheetId}/values/Investments!A2:G${updatedRows.length + 1}?valueInputOption=USER_ENTERED`;
    await fetch(updateUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values: updatedRows }),
    });
  }
}

/**
 * Append a transaction log entry in Google Sheet
 */
export async function appendSheetTransaction(
  accessToken: string,
  spreadsheetId: string,
  transaction: Transaction
): Promise<void> {
  const rowValues = [
    transaction.id,
    transaction.type,
    transaction.date,
    transaction.sourceId,
    transaction.targetId || '',
    transaction.amount.toString(),
    transaction.newValuation !== undefined ? transaction.newValuation.toString() : '',
    transaction.note || '',
  ];

  const appendUrl = `${SHEETS_API_BASE}/${spreadsheetId}/values/Transactions!A:H:append?valueInputOption=USER_ENTERED`;
  await fetch(appendUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ values: [rowValues] }),
  });
}
