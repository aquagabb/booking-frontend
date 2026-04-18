import React, { useState, useCallback, useEffect } from 'react';
import { Upload, Download, Trash2 } from 'lucide-react';
import { formatDate } from '../../../../lib/utils';
import { uploadBookingAttachment, deleteBookingAttachment, getBookingAttachments } from '../../../../api/bookings/bookings';
import type { Attachment, AttachmentsProps } from './types';
import ConfirmModal from '../../../../components/shared/Modals/ConfirmModal';
import { Message } from '../../../../components/shared/Messages';
import type { MessageType } from '../../../../components/shared/Messages';

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const getFileTypeFromName = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  const typeMap: Record<string, string> = {
    'pdf': 'application/pdf',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  };
  return typeMap[extension] || 'application/octet-stream';
};

const Attachements: React.FC<AttachmentsProps> = ({ bookingId }) => {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [attachmentToDelete, setAttachmentToDelete] = useState<number | null>(null);
  const [attachmentMessage, setAttachmentMessage] = useState<{ type: MessageType; message: string } | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const fetchAttachments = useCallback(async () => {
    if (!bookingId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await getBookingAttachments(bookingId);
      
      if (response.status === 200 && response.response?.data) {
        // Map API response to match our Attachment type
        const mappedAttachments = response.response.data.map((att: any) => ({
          id: att.id,
          name: att.name,
          url: att.url,
          createdAt: att.createdAt,
          uploadedAt: att.createdAt, // Use createdAt as uploadedAt for display
          type: att.type || getFileTypeFromName(att.name),
          size: att.size || 0,
        }));
        setAttachments(mappedAttachments);
      } else {
        setAttachments([]);
      }
    } catch (error) {
      console.error('Error fetching attachments:', error);
      setAttachments([]);
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    fetchAttachments();
  }, [fetchAttachments]);

  const processFile = useCallback(async (file: File) => {
    if (!file || !bookingId) return;

    try {
      setUploadingAttachment(true);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('objectName', 'booking');
      formData.append('objectId', bookingId);
      
      const response = await uploadBookingAttachment(bookingId, formData);
      
      if (response.status === 200 || response.status === 201) {
        const attachmentData = response.response?.data;
        
        const newAttachment: Attachment = {
          id: attachmentData?.id || Date.now(),
          name: attachmentData?.name || file.name,
          url: attachmentData?.url || URL.createObjectURL(file),
          type: attachmentData?.type || file.type,
          size: attachmentData?.size || file.size,
          createdAt: attachmentData?.createdAt || new Date().toISOString(),
          uploadedAt: attachmentData?.createdAt || attachmentData?.uploadedAt || new Date().toISOString(),
        };

        setAttachments(prev => [...prev, newAttachment]);
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading attachment:', error);
      setAttachmentMessage({ type: 'error', message: 'Failed to upload attachment. Please try again.' });
    } finally {
      setUploadingAttachment(false);
    }
  }, [bookingId]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await processFile(file);
    }
    // Reset input
    if (event.target) {
      event.target.value = '';
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    for (const file of files) {
      await processFile(file);
    }
  }, [processFile]);

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleDownload = useCallback((url: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const handleDeleteClick = (attachmentId: number) => {
    setAttachmentToDelete(attachmentId);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!bookingId || !attachmentToDelete) return;
    
    try {
      const response = await deleteBookingAttachment(bookingId, attachmentToDelete.toString());
      
      if (response.status === 200 || response.status === 204) {
        setAttachments(prev => prev.filter(att => att.id !== attachmentToDelete));
        setAttachmentMessage({ type: 'success', message: 'Attachment deleted successfully' });
        setIsDeleteModalOpen(false);
        setAttachmentToDelete(null);
      } else {
        throw new Error('Delete failed');
      }
    } catch (error) {
      console.error('Error deleting attachment:', error);
      setAttachmentMessage({ type: 'error', message: 'Failed to delete attachment. Please try again.' });
      setIsDeleteModalOpen(false);
      setAttachmentToDelete(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Attachments</h2>
      </div>

      {attachmentMessage && (
        <div className="mb-4">
          <Message
            type={attachmentMessage.type}
            message={attachmentMessage.message}
            variant="filled"
            dismissible
            onDismiss={() => setAttachmentMessage(null)}
          />
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileUpload}
        disabled={uploadingAttachment}
        multiple
      />

      {loading ? (
        <div className="text-center py-8">
          <p className="text-sm text-gray-500">Loading attachments...</p>
        </div>
      ) : attachments.length === 0 ? (
        <div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragging 
              ? 'border-primary bg-primary/5' 
              : 'border-gray-300 hover:border-primary hover:bg-gray-50'
            }
            ${uploadingAttachment ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragging ? 'text-primary' : 'text-gray-400'}`} />
          <p className="text-sm font-medium text-gray-700 mb-1">
            {uploadingAttachment ? 'Uploading...' : isDragging ? 'Drop files here' : 'Drag and drop files here'}
          </p>
          <p className="text-xs text-gray-500">
            or click to browse
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div
            onClick={handleClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors mb-3
              ${isDragging 
                ? 'border-primary bg-primary/5' 
                : 'border-gray-300 hover:border-primary hover:bg-gray-50'
              }
              ${uploadingAttachment ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <Upload className={`w-6 h-6 mx-auto mb-2 ${isDragging ? 'text-primary' : 'text-gray-400'}`} />
            <p className="text-xs font-medium text-gray-700">
              {uploadingAttachment ? 'Uploading...' : isDragging ? 'Drop files here' : 'Click or drag to add more files'}
            </p>
          </div>
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="group flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{attachment.name}</p>
                  <p className="text-xs text-gray-500">
                    {attachment.size ? formatFileSize(attachment.size) : 'Unknown size'} • {formatDate(attachment.uploadedAt || attachment.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleDownload(attachment.url, attachment.name)}
                  className="p-2 text-gray-500 hover:text-primary hover:bg-primary/10 rounded transition-colors"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteClick(attachment.id)}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Delete Attachment"
        text="Are you sure you want to delete this attachment? This action cannot be undone."
        cancelText="Cancel"
        confirmText="Delete"
        onClose={() => {
          setIsDeleteModalOpen(false);
          setAttachmentToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default Attachements;
