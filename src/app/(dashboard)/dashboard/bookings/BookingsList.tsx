'use client';

import { useState } from 'react';
import { formatPt } from '@/lib/time';

interface Booking {
  id: string;
  type: string;
  status: string;
  customerName: string;
  customerEmail: string;
  athleteName: string;
  startDateTimeUTC: string;
  endDateTimeUTC: string;
  classOccurrenceId?: string;
  priceCents: number; // Actual booking price
  service: {
    title: string;
    basePriceCents: number;
    coach: {
      user: {
        name: string | null;
      };
    } | null;
  };
  classOccurrence?: any;
}

interface BookingsListProps {
  bookings: Booking[];
}

interface CancelDialogState {
  booking: Booking | null;
  isOpen: boolean;
  isSubmitting: boolean;
}

export default function BookingsList({ bookings }: BookingsListProps) {
  const [cancelDialog, setCancelDialog] = useState<CancelDialogState>({
    booking: null,
    isOpen: false,
    isSubmitting: false
  });
  
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  // Separate bookings into active and cancelled
  const activeBookings = bookings.filter(booking => booking.status === 'CONFIRMED');
  const cancelledBookings = bookings.filter(booking => booking.status === 'CANCELLED');

  const handleCancelClick = (booking: Booking) => {
    setCancelDialog({
      booking,
      isOpen: true,
      isSubmitting: false
    });
  };

  const handleCancelConfirm = async () => {
    if (!cancelDialog.booking) return;

    setCancelDialog(prev => ({ ...prev, isSubmitting: true }));

    try {
      const response = await fetch(`/api/dashboard/bookings/${cancelDialog.booking.id}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel booking');
      }

      showToast(data.message || 'Booking cancelled successfully', 'success');
      setCancelDialog({ booking: null, isOpen: false, isSubmitting: false });
      
      // Reload the page to refresh the bookings list
      window.location.reload();

    } catch (error: any) {
      console.error('Cancel error:', error);
      showToast(error.message || 'Failed to cancel booking', 'error');
      setCancelDialog(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  const handleCancelClose = () => {
    if (cancelDialog.isSubmitting) return;
    setCancelDialog({ booking: null, isOpen: false, isSubmitting: false });
  };

  const now = new Date();

  // Function to render a booking card
  const renderBookingCard = (booking: Booking, index: number) => {
    const isClass = !!booking.classOccurrenceId;
    const when = formatPt(new Date(booking.startDateTimeUTC), "EEE, MMM d • h:mm a 'PT'");
    const title = isClass ? booking.service.title : 'Private Lesson';
    const isPast = new Date(booking.startDateTimeUTC) < now;
    
    return (
      <div key={booking.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
        {/* Mobile-first responsive layout */}
        <div className="space-y-4">
          {/* Header: Title and badges */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <div className={`w-3 h-3 rounded-full ${isClass ? 'bg-green-500' : 'bg-blue-500'} flex-shrink-0`}></div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  isClass 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {isClass ? 'Class' : 'Private'}
                </span>
                {booking.status === 'CANCELLED' && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Cancelled
                  </span>
                )}
              </div>
            </div>
            
            {/* Time badge on desktop, moved below on mobile */}
            <div className="hidden sm:block text-right">
              <div className="text-xs text-gray-500 uppercase tracking-wide">
                {isPast ? 'Past' : `${Math.ceil((new Date(booking.startDateTimeUTC).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))} days`}
              </div>
            </div>
          </div>

          {/* Details section - vertical on mobile, horizontal on desktop */}
          <div className="space-y-3 sm:space-y-2">
            {/* Date and Time */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h6a2 2 0 012 2v4m-6 6v7m8-3v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4m8-3V8a2 2 0 00-2-2H8a2 2 0 00-2 2v6" />
              </svg>
              <span className="font-medium">{when}</span>
            </div>
            
            {/* Price */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              <span>${(booking.priceCents / 100).toFixed(2)}</span>
            </div>

            {/* Time badge on mobile */}
            <div className="sm:hidden">
              <div className="text-xs text-gray-500 uppercase tracking-wide">
                {isPast ? 'Past' : `${Math.ceil((new Date(booking.startDateTimeUTC).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))} days`}
              </div>
            </div>
          </div>
          
          {/* Private lesson customer details */}
          {!isClass && (
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <div className="space-y-2 sm:space-y-0 sm:flex sm:items-center sm:gap-6">
                <div className="flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="font-medium text-blue-900">Customer:</span>
                  <span className="text-blue-800 break-words">{booking.customerName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="font-medium text-blue-900">Athlete:</span>
                  <span className="text-blue-800 break-words">{booking.athleteName}</span>
                </div>
              </div>
            </div>
          )}

          {/* Action buttons - only for confirmed bookings */}
          {!isPast && booking.status === 'CONFIRMED' && (
            <div className="flex justify-end pt-2">
              <button
                onClick={() => handleCancelClick(booking)}
                className="inline-flex items-center px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-200 text-sm font-medium"
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-xl transition-all duration-300 ${
          toast.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <div className="flex items-center gap-3">
            {toast.type === 'success' ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            )}
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      {cancelDialog.isOpen && cancelDialog.booking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full animate-scale-up">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Cancel Booking?</h3>
                  <p className="text-sm text-gray-600">This action cannot be undone</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-3 h-3 rounded-full ${!!cancelDialog.booking.classOccurrenceId ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                  <h4 className="font-medium text-gray-900">
                    {!!cancelDialog.booking.classOccurrenceId ? cancelDialog.booking.service.title : 'Private Lesson'}
                  </h4>
                </div>
                <p className="text-sm text-gray-600 mb-1">
                  {formatPt(new Date(cancelDialog.booking.startDateTimeUTC), "EEEE, MMMM d 'at' h:mm a 'PT'")}
                </p>
                <p className="text-sm text-gray-600">
                  Customer: {cancelDialog.booking.customerName} • Athlete: {cancelDialog.booking.athleteName}
                </p>
              </div>
              
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-amber-900 mb-1">The customer will be notified</p>
                    <p className="text-xs text-amber-700">
                      A cancellation email with calendar update will be sent to {cancelDialog.booking.customerEmail}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-gray-50 rounded-b-2xl flex gap-3">
              <button 
                onClick={handleCancelClose}
                disabled={cancelDialog.isSubmitting}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Keep Booking
              </button>
              <button 
                onClick={handleCancelConfirm}
                disabled={cancelDialog.isSubmitting}
                className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {cancelDialog.isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    Cancelling...
                  </>
                ) : (
                  'Cancel Booking'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Bookings Section */}
      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Active Bookings</h2>
                <p className="text-sm text-gray-600">Your confirmed upcoming classes and private lessons</p>
              </div>
              <div className="text-sm text-gray-500">
                {activeBookings.length} {activeBookings.length === 1 ? 'booking' : 'bookings'}
              </div>
            </div>
          </div>
          
          {activeBookings.length === 0 ? (
            <div className="text-center py-12 px-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h6a2 2 0 012 2v4m-6 6v7m8-3v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4m8-3V8a2 2 0 00-2-2H8a2 2 0 00-2 2v6" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No active bookings</h3>
              <p className="text-gray-600">You don't have any confirmed classes or private lessons scheduled</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {activeBookings.map((booking, index) => renderBookingCard(booking, index))}
            </div>
          )}
        </div>

        {/* Cancelled Bookings Section */}
        {cancelledBookings.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-red-50 px-6 py-4 border-b border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Cancelled Bookings</h2>
                  <p className="text-sm text-gray-600">Recently cancelled classes and private lessons</p>
                </div>
                <div className="text-sm text-gray-500">
                  {cancelledBookings.length} {cancelledBookings.length === 1 ? 'cancellation' : 'cancellations'}
                </div>
              </div>
            </div>
            
            <div className="divide-y divide-gray-100">
              {cancelledBookings.map((booking, index) => renderBookingCard(booking, index))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
