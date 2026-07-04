import axios from 'axios';

export interface AttendanceRecord {
    id: number;
    fixtureId: number;
    userId: number;
    hasTicket: boolean;
    seatSection?: string;
    seatBlock?: string;
    seatRow?: string;
    seatNumber?: string;
    ticketProvider?: string;
    purchaseDate?: string;
    notes?: string;
    hasDocument: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface AttendanceCount {
    fixtureId: number;
    goingCount: number;
    hasTicketCount: number;
}

export interface UpsertAttendancePayload {
    fixtureId: number;
    hasTicket: boolean;
    seatSection?: string;
    seatBlock?: string;
    seatRow?: string;
    seatNumber?: string;
    ticketProvider?: string;
    purchaseDate?: string;
    notes?: string;
}

export async function upsertAttendance(payload: UpsertAttendancePayload): Promise<AttendanceRecord> {
    const { data } = await axios.post<AttendanceRecord>('/attendance', payload);
    return data;
}

export async function getMyAttendance(): Promise<AttendanceRecord[]> {
    const { data } = await axios.get<AttendanceRecord[]>('/attendance/my');
    return data;
}

export async function getAttendanceCount(fixtureId: number): Promise<AttendanceCount> {
    const { data } = await axios.get<AttendanceCount>(`/attendance/${fixtureId}/count`);
    return data;
}

export async function cancelAttendance(id: number): Promise<void> {
    await axios.delete(`/attendance/${id}`);
}

export async function uploadAttendanceDocument(id: number, file: File): Promise<AttendanceRecord> {
    const form = new FormData();
    form.append('file', file);
    const { data } = await axios.post<AttendanceRecord>(`/attendance/${id}/upload`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
}

export function getAttendanceDocumentUrl(id: number): string {
    return `/attendance/${id}/document`;
}
