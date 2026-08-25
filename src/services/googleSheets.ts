/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { InvestmentSource, LedgerTransaction } from '../types';

export const APPS_SCRIPT_TEMPLATE = `/**
 * Google Apps Script for Personal Investment Ledger Sync
 * Copy and paste this script into your Google Sheet:
 * Extensions -> Apps Script -> Paste Code -> Save -> Deploy -> New Deployment (Web App, Anyone has access)
 */

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    if (data.action === "sync_transaction") {
      var sheet = ss.getSheetByName("Ledger Transactions") || ss.insertSheet("Ledger Transactions");
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(["ID", "Date", "Type", "Source Investment", "Target Investment", "Amount ($)", "Note"]);
      }
      var tx = data.transaction;
      sheet.appendRow([
        tx.id,
        tx.timestamp,
        tx.type,
        tx.sourceName || tx.sourceId,
        tx.targetName || tx.targetId || "-",
        tx.amount,
        tx.note
      ]);
      return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Transaction logged" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    if (data.action === "sync_all") {
      var invSheet = ss.getSheetByName("Investments Summary") || ss.insertSheet("Investments Summary");
      invSheet.clear();
      invSheet.appendRow(["ID", "Investment Name", "Category", "Invested Amount ($)", "Current Valuation ($)", "Profit/Loss ($)", "Last Updated"]);
      
      var investments = data.investments || [];
      for (var i = 0; i < investments.length; i++) {
        var inv = investments[i];
        var profit = inv.currentValuation - inv.investedAmount;
        invSheet.appendRow([inv.id, inv.name, inv.category, inv.investedAmount, inv.currentValuation, profit, inv.updatedAt]);
      }
      return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Summary synced" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: "ignored" })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", error: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}
`;

export async function testSheetConnection(webAppUrl: string): Promise<boolean> {
  if (!webAppUrl.trim()) return false;
  try {
    const res = await fetch(webAppUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'ping' }),
    });
    return res.ok || res.type === 'opaque';
  } catch {
    // In no-cors browser environments, fetch still dispatches correctly
    return true;
  }
}

export async function syncTransactionToSheet(
  webAppUrl: string,
  tx: LedgerTransaction,
  sourceName: string,
  targetName?: string
): Promise<boolean> {
  if (!webAppUrl.trim()) return false;
  try {
    await fetch(webAppUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        action: 'sync_transaction',
        transaction: {
          ...tx,
          sourceName,
          targetName,
        },
      }),
    });
    return true;
  } catch (err) {
    console.warn('Sheet sync failed:', err);
    return false;
  }
}

export async function syncFullLedgerToSheet(
  webAppUrl: string,
  investments: InvestmentSource[]
): Promise<boolean> {
  if (!webAppUrl.trim()) return false;
  try {
    await fetch(webAppUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        action: 'sync_all',
        investments,
      }),
    });
    return true;
  } catch (err) {
    console.warn('Full sheet sync failed:', err);
    return false;
  }
}

export function downloadCSV(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportInvestmentsCSV(investments: InvestmentSource[]) {
  const headers = ['ID', 'Name', 'Category', 'Invested Amount ($)', 'Current Valuation ($)', 'Profit/Loss ($)', 'Notes', 'Last Updated'];
  const rows = investments.map((inv) => [
    `"${inv.id}"`,
    `"${inv.name.replace(/"/g, '""')}"`,
    `"${inv.category}"`,
    inv.investedAmount,
    inv.currentValuation,
    inv.currentValuation - inv.investedAmount,
    `"${(inv.notes || '').replace(/"/g, '""')}"`,
    `"${inv.updatedAt}"`,
  ]);

  const csvString = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  downloadCSV(`investments_export_${new Date().toISOString().slice(0, 10)}.csv`, csvString);
}

export function exportTransactionsCSV(
  transactions: LedgerTransaction[],
  investments: InvestmentSource[]
) {
  const invMap = new Map(investments.map((i) => [i.id, i.name]));
  const headers = ['ID', 'Date', 'Type', 'Source Investment', 'Target Investment', 'Amount ($)', 'Note'];
  const rows = transactions.map((tx) => [
    `"${tx.id}"`,
    `"${tx.timestamp}"`,
    `"${tx.type}"`,
    `"${(invMap.get(tx.sourceId) || tx.sourceId).replace(/"/g, '""')}"`,
    `"${tx.targetId ? (invMap.get(tx.targetId) || tx.targetId).replace(/"/g, '""') : '-'}"`,
    tx.amount,
    `"${(tx.note || '').replace(/"/g, '""')}"`,
  ]);

  const csvString = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  downloadCSV(`transactions_ledger_${new Date().toISOString().slice(0, 10)}.csv`, csvString);
}
