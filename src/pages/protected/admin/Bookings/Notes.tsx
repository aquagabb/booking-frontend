import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { formatRelativeTime } from '../../../../lib/utils';
import { getBookingNotes, createUpdateBookingNote, deleteBookingNote } from '../../../../api/bookings/bookings';
import ConfirmModal from '../../../../components/shared/Modals/ConfirmModal';
import CustomTextarea from '../../../../components/shared/CustomTextarea';
import CustomInput from '../../../../components/shared/CustomInput';
import type { BookingNote, NotesProps } from './types';

const Notes = ({ bookingId, onNotesChange }: NotesProps) => {
  const { t } = useTranslation();
  const [notes, setNotes] = useState<BookingNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [noteText, setNoteText] = useState('');
  const [notePrice, setNotePrice] = useState<string>('');
  const [showAddNote, setShowAddNote] = useState(false);
  const [deleteNoteId, setDeleteNoteId] = useState<number | null>(null);

  const fetchNotes = useCallback(async () => {
    if (!bookingId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { status, response } = await getBookingNotes(bookingId);
      if (status === 200 && response?.data) {
        setNotes(response.data);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleAddNote = useCallback(async () => {
    if (!noteText.trim() || !bookingId) return;

    try {
      setProcessing(true);
      const priceValue = notePrice.trim() ? parseFloat(notePrice.trim()) : undefined;
      const { status } = await createUpdateBookingNote({
        bookingId: Number(bookingId),
        note: noteText.trim(),
        price: priceValue,
      });

      if (status === 200 || status === 201) {
        setNoteText('');
        setNotePrice('');
        setShowAddNote(false);
        await fetchNotes();
        onNotesChange?.();
      }
    } catch (error) {
      console.error('Error creating note:', error);
    } finally {
      setProcessing(false);
    }
  }, [noteText, notePrice, bookingId, fetchNotes]);

  const handleEditNote = useCallback((noteId: number) => {
    const note = notes.find((n) => n.id === noteId);
    if (note) {
      setNoteText(note.note);
      setNotePrice(note.price ? note.price.toString() : '');
      setEditingNoteId(noteId);
    }
  }, [notes]);

  const handleSaveNote = useCallback(async () => {
    if (!noteText.trim() || !editingNoteId) return;

    try {
      setProcessing(true);
      const priceValue = notePrice.trim() ? parseFloat(notePrice.trim()) : undefined;
      const { status } = await createUpdateBookingNote({
        id: editingNoteId,
        bookingId: Number(bookingId),
        note: noteText.trim(),
        price: priceValue,
      });

      if (status === 200 || status === 201) {
        setNoteText('');
        setNotePrice('');
        setEditingNoteId(null);
        await fetchNotes();
        onNotesChange?.();
      }
    } catch (error) {
      console.error('Error updating note:', error);
    } finally {
      setProcessing(false);
    }
  }, [noteText, notePrice, editingNoteId, bookingId, fetchNotes]);

  const handleDeleteClick = useCallback((noteId: number) => {
    setDeleteNoteId(noteId);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteNoteId) return;

    try {
      setProcessing(true);
      const { status } = await deleteBookingNote(deleteNoteId);
      if (status === 200 || status === 204) {
        await fetchNotes();
        onNotesChange?.();
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    } finally {
      setProcessing(false);
      setDeleteNoteId(null);
    }
  }, [deleteNoteId, fetchNotes]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteNoteId(null);
  }, []);

  const handleCancel = useCallback(() => {
    setShowAddNote(false);
    setEditingNoteId(null);
    setNoteText('');
    setNotePrice('');
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center h-32">
          <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-900">{t('bookings.notes.title')}</h2>
        {!showAddNote && !editingNoteId && (
          <button
            onClick={() => setShowAddNote(true)}
            disabled={processing}
            className="btn-outline flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {t('bookings.notes.add_note')}
          </button>
        )}
      </div>

      {showAddNote && (
        <div className="mb-4 p-4 rounded-lg border border-gray-200">
          <CustomTextarea
            label=""
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder={t('bookings.notes.placeholder')}
            rows={3}
            error={undefined}
          />
          <div className="mt-3">
            <CustomInput
              label="Price Adjustment"
              type="number"
              value={notePrice}
              onChange={(e) => setNotePrice(e.target.value)}
              placeholder="0.00"
              error={undefined}
            />
            <p className="text-xs text-gray-500 mt-1">Optional: Add a price adjustment for this note</p>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={handleAddNote}
              disabled={!noteText.trim() || processing}
              className="px-3 py-1.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {t('bookings.notes.save')}
            </button>
            <button
              onClick={handleCancel}
              disabled={processing}
              className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('common.cancel')}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {notes.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">{t('bookings.notes.no_notes')}</p>
        ) : (
          notes.map((note, index) => {
            const timeInfo = formatRelativeTime(note.createdAt);
            // Alternate rotation direction for visual variety
            const rotation = index % 2 === 0 ? '-0.5deg' : '0.5deg';
            return (
              <div 
                key={note.id} 
                className="p-4 rounded-lg bg-gray-50 border group relative transition-all  "
              >
                {editingNoteId === note.id ? (
                  <div>
                    <CustomTextarea
                      label=""
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder=""
                      rows={3}
                      error={undefined}
                    />
                    <div className="mt-3">
                      <CustomInput
                        label="Price Adjustment (€)"
                        type="number"
                        value={notePrice}
                        onChange={(e) => setNotePrice(e.target.value)}
                        placeholder="0.00"
                        error={undefined}
                      />
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={handleSaveNote}
                        disabled={!noteText.trim() || processing}
                        className="px-3 py-1.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {processing ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          ''
                        )}
                        {t('bookings.notes.save')}
                      </button>
                      <button
                        onClick={handleCancel}
                        disabled={processing}
                        className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {t('common.cancel')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">{note.note}</p>
                    {note.price !== undefined && note.price !== null && note.price !== 0 && (
                      <div className="mt-2 flex items-center gap-2 px-2 py-1 bg-blue-50 rounded-md w-fit">
                        <span className={clsx(
                          "text-xs font-medium",
                          note.price > 0 ? "text-blue-700" : "text-red-700"
                        )}>
                          {note.price > 0 ? '+' : ''}{note.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} lei
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-3 group">
                      <p 
                        className="text-xs text-gray-600 cursor-help"
                        title={timeInfo.full}
                      >
                        {timeInfo.relative}
                        {note.updatedAt && note.updatedAt !== note.createdAt && ` ${t('bookings.notes.edited')}`}
                      </p>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditNote(note.id)}
                          disabled={processing}
                          className="p-1.5 text-gray-500 hover:text-primary hover:bg-primary/10 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title={t('bookings.notes.edit_tooltip')}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(note.id)}
                          disabled={processing}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title={t('bookings.notes.delete_tooltip')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>

      <ConfirmModal
        isOpen={deleteNoteId !== null}
        title={t('bookings.notes.delete_title')}
        text={t('bookings.notes.delete_text')}
        cancelText={t('common.cancel')}
        confirmText={t('bookings.notes.delete_confirm')}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default Notes;

