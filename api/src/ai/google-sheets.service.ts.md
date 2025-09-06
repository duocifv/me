import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import * as fs from 'fs';

@Injectable()
export class GoogleSheetsService {
  private auth;
  private sheets;

  constructor() {
    const keyFile = 'keys/google-service-account.json'; // file JSON key
    this.auth = new google.auth.GoogleAuth({
      keyFile,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    this.sheets = google.sheets({ version: 'v4', auth: this.auth });
  }

  async getRooms(sheetId: string) {
    const res = await this.sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'rooms!A1:G', // sheet "rooms"
    });
    const rows = res.data.values;
    if (!rows || rows.length === 0) return [];

    const headers = rows[0];
    return rows.slice(1).map((row) => {
      let obj = {};
      headers.forEach((h, i) => (obj[h] = row[i]));
      return obj;
    });
  }

  async addBooking(sheetId: string, booking: any) {
    await this.sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'bookings!A1',
      valueInputOption: 'RAW',
      requestBody: {
        values: [
          [
            new Date().toISOString(),
            booking.name,
            booking.phone,
            booking.roomId,
            booking.checkIn,
            booking.checkOut,
          ],
        ],
      },
    });
    return { success: true };
  }
}
