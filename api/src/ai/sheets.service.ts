// sheets.service.ts
import { Injectable } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import { RoomsResponse } from './type/room.type';
import { ServicesResponse } from './type/service.type';
import { HotelResponse } from './type/hotel.type';
import { BookingsResponse } from './type/bookings.type';
import { BookingDto } from './dto/booking.dto';
import { DailyUpdateDto } from './dto/daily-update.dto';

@Injectable()
export class SheetsService {
  private readonly API_URL =
    'https://script.google.com/macros/s/AKfycbwChl7o1zTthXM1aprGH3sdkqqNglm1RYC61fZ0qPJzwQhHVN6-qT54yhXp-04LzZ4W/exec';

  async getRooms(): Promise<RoomsResponse> {
    try {
      const res: AxiosResponse<RoomsResponse> = await axios.get(this.API_URL, {
        params: { action: 'rooms' }, // đúng action theo Apps Script
      });
      return res.data;
    } catch (error) {
      console.error(error);
      throw new Error('Cannot fetch rooms from Google Apps Script');
    }
  }

  async getRoomStatus(date?: string): Promise<RoomsResponse> {
    try {
      const res: AxiosResponse<RoomsResponse> = await axios.get(this.API_URL, {
        params: { action: 'roomStatus', date },
      });
      return res.data;
    } catch (error) {
      console.error(error);
      throw new Error('Cannot fetch roomStatus from Google Apps Script');
    }
  }

  async getServices(): Promise<ServicesResponse> {
    try {
      const res: AxiosResponse<ServicesResponse> = await axios.get(
        this.API_URL,
        {
          params: { action: 'services' },
        },
      );
      return res.data;
    } catch (error) {
      console.error(error);
      throw new Error('Cannot fetch services from Google Apps Script');
    }
  }

  async getHotel(): Promise<HotelResponse> {
    try {
      const res: AxiosResponse<HotelResponse> = await axios.get(this.API_URL, {
        params: { action: 'hotel' },
      });
      return res.data;
    } catch (error) {
      console.error(error);
      throw new Error('Cannot fetch hotel info from Google Apps Script');
    }
  }

  async getBookings(): Promise<BookingsResponse> {
    try {
      const res = await axios.get<BookingsResponse>(this.API_URL, {
        params: { action: 'bookings' },
      });
      return res.data;
    } catch (error) {
      console.error(error);
      throw new Error('Cannot fetch bookings from Google Apps Script');
    }
  }

  async createBooking(data: BookingDto) {
    console.log('Creating booking:', data);
    try {
      const res = await axios.post(this.API_URL, {
        type: 'booking',
        ...data,
      });
      console.log('booking ok:', res.data);
      return res.data as { success: boolean; message: string };
    } catch (error) {
      console.log('booking error:', error);
      throw new Error('Cannot add booking via Google Apps Script');
    }
  }

  async dailyUpdate(data: DailyUpdateDto) {
    try {
      const res = await axios.post(this.API_URL, {
        type: 'daily_update',
        ...data,
      });
      return res.data as { success: boolean; message: string };
    } catch (error) {
      console.error(error);
      throw new Error('Cannot add daily update via Google Apps Script');
    }
  }
}
