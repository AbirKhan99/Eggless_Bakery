import React, { useState, useEffect, useCallback } from 'react';
import { supabase, type CakePhoto } from '../../lib/supabase';
import { useToast } from './Toast';

export default function AdminCakes() {
  const { addToast } = useToast();
  const [cakes, setCakes] = useState<CakePhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Upload modal & form state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [altText, setAltText] = useState('');
  const [occasionTag, setOccasionTag] = useState('Birthday');
  const [customTag, setCustomTag] = useState('');
  const [uploading, setUploading] = useState(false);

  // Edit modal
  const [editingCake, setEditingCake] = useState<CakePhoto | null>(null);
  const [editAltText, setEditAltText] = useState('');
  const [editOccasionTag, setEditOccasionTag] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<CakePhoto | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Toggle visibility in-progress map
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [reorderingId, setReorderingId] = useState<string | null>(null);

  const fetchCakes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchErr } = await supabase
        .from('cake_photos')
        .select('*')
        .order('display_order', { ascending: true });

      if (fetchErr) throw fetchErr;

      setCakes(data || []);
    } catch (err: unknown) {
      console.error('Error fetching cakes:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to load cake portfolio.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCakes();
  }, [fetchCakes]);

  // File selection handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      if (!file.type.startsWith('image/')) {
        addToast({
          type: 'error',
          title: 'Invalid File',
          message: 'Please select an image file (JPEG, PNG, WEBP).',
        });
        return;
      }

      if (file.size > 8 * 1024 * 1024) {
        addToast({
          type: 'error',
          title: 'File Too Large',
          message: 'Maximum cake image file size is 8MB.',
        });
        return;
      }

      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setFilePreviewUrl(url);

      if (!altText) {
        const cleanName = file.name
          .replace(/\.[^/.]+$/, '')
          .replace(/[-_]/g, ' ');
        setAltText(`Eggless custom cake — ${cleanName}`);
      }
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      addToast({
        type: 'error',
        title: 'No File Selected',
        message: 'Please select an image to upload.',
      });
      return;
    }

    setUploading(true);
    try {
      // 1. Generate unique storage path
      const ext = selectedFile.name.split('.').pop() || 'jpg';
      const cleanFileName = selectedFile.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-');
      const timestamp = Date.now();
      const storagePath = `cakes/${timestamp}-${cleanFileName}.${ext}`;

      // 2. Upload to Supabase Storage 'cake-photos'
      const { error: storageErr } = await supabase.storage
        .from('cake-photos')
        .upload(storagePath, selectedFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (storageErr) throw storageErr;

      // 3. Get Public URL
      const { data: publicUrlData } = supabase.storage
        .from('cake-photos')
        .getPublicUrl(storagePath);

      const publicUrl = publicUrlData.publicUrl;

      // 4. Determine display_order (next in line)
      const nextOrder =
        cakes.length > 0
          ? Math.max(...cakes.map((c) => c.display_order || 0)) + 1
          : 1;

      const finalTag =
        occasionTag === 'Custom' ? customTag.trim() : occasionTag;

      // 5. Insert record into cake_photos table
      const { data: inserted, error: insertErr } = await supabase
        .from('cake_photos')
        .insert({
          storage_path: storagePath,
          public_url: publicUrl,
          alt_text: altText.trim() || null,
          occasion_tag: finalTag || null,
          display_order: nextOrder,
          is_visible: true,
          uploaded_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertErr) throw insertErr;

      if (inserted) {
        setCakes((prev) => [...prev, inserted]);
      } else {
        await fetchCakes();
      }

      addToast({
        type: 'success',
        title: 'Cake Uploaded',
        message: 'New cake photo was added to your portfolio!',
      });

      // Reset modal state
      setShowUploadModal(false);
      setSelectedFile(null);
      setFilePreviewUrl(null);
      setAltText('');
      setOccasionTag('Birthday');
      setCustomTag('');
    } catch (err: unknown) {
      console.error('Error uploading cake photo:', err);
      addToast({
        type: 'error',
        title: 'Upload Failed',
        message:
          err instanceof Error
            ? err.message
            : 'Could not upload image. Ensure Supabase Storage policy is set.',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleToggleVisibility = async (cake: CakePhoto) => {
    const newVisibility = !cake.is_visible;
    setTogglingId(cake.id);

    try {
      const { error: updateErr } = await supabase
        .from('cake_photos')
        .update({ is_visible: newVisibility })
        .eq('id', cake.id);

      if (updateErr) throw updateErr;

      setCakes((prev) =>
        prev.map((c) =>
          c.id === cake.id ? { ...c, is_visible: newVisibility } : c
        )
      );

      addToast({
        type: 'info',
        title: newVisibility ? 'Cake Visible' : 'Cake Hidden',
        message: `Cake is now ${newVisibility ? 'visible on public gallery' : 'hidden from public gallery'}.`,
      });
    } catch (err: unknown) {
      console.error('Error toggling cake visibility:', err);
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: err instanceof Error ? err.message : 'Could not change visibility.',
      });
    } finally {
      setTogglingId(null);
    }
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= cakes.length) return;

    const currentCake = cakes[index];
    const swapCake = cakes[targetIndex];
    setReorderingId(currentCake.id);

    try {
      const currentOrder = currentCake.display_order;
      const swapOrder = swapCake.display_order;

      // Update both records
      const [res1, res2] = await Promise.all([
        supabase
          .from('cake_photos')
          .update({ display_order: swapOrder })
          .eq('id', currentCake.id),
        supabase
          .from('cake_photos')
          .update({ display_order: currentOrder })
          .eq('id', swapCake.id),
      ]);

      if (res1.error) throw res1.error;
      if (res2.error) throw res2.error;

      // Update local state sorted
      const updatedList = [...cakes];
      updatedList[index] = { ...currentCake, display_order: swapOrder };
      updatedList[targetIndex] = { ...swapCake, display_order: currentOrder };
      updatedList.sort((a, b) => a.display_order - b.display_order);

      setCakes(updatedList);

      addToast({
        type: 'success',
        title: 'Order Updated',
        message: 'Cake display position adjusted.',
      });
    } catch (err: unknown) {
      console.error('Error updating order:', err);
      addToast({
        type: 'error',
        title: 'Reorder Failed',
        message: err instanceof Error ? err.message : 'Could not update order.',
      });
    } finally {
      setReorderingId(null);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingCake) return;
    setSavingEdit(true);

    try {
      const { error: editErr } = await supabase
        .from('cake_photos')
        .update({
          alt_text: editAltText.trim() || null,
          occasion_tag: editOccasionTag.trim() || null,
        })
        .eq('id', editingCake.id);

      if (editErr) throw editErr;

      setCakes((prev) =>
        prev.map((c) =>
          c.id === editingCake.id
            ? {
                ...c,
                alt_text: editAltText.trim() || null,
                occasion_tag: editOccasionTag.trim() || null,
              }
            : c
        )
      );

      addToast({
        type: 'success',
        title: 'Cake Details Saved',
        message: 'Information updated successfully.',
      });
      setEditingCake(null);
    } catch (err: unknown) {
      console.error('Error editing cake:', err);
      addToast({
        type: 'error',
        title: 'Save Failed',
        message: err instanceof Error ? err.message : 'Could not save details.',
      });
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteCake = async () => {
    if (!deleteTarget) return;
    setDeleting(true);

    try {
      // 1. Delete database record
      const { error: dbDeleteErr } = await supabase
        .from('cake_photos')
        .delete()
        .eq('id', deleteTarget.id);

      if (dbDeleteErr) throw dbDeleteErr;

      // 2. Try removing from storage (non-blocking if already missing)
      if (deleteTarget.storage_path) {
        await supabase.storage
          .from('cake-photos')
          .remove([deleteTarget.storage_path]);
      }

      setCakes((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      setDeleteTarget(null);

      addToast({
        type: 'success',
        title: 'Cake Deleted',
        message: 'Cake photo was permanently removed from portfolio.',
      });
    } catch (err: unknown) {
      console.error('Error deleting cake:', err);
      addToast({
        type: 'error',
        title: 'Delete Failed',
        message: err instanceof Error ? err.message : 'Could not delete cake photo.',
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="admin-cakes">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">Cake Gallery & Portfolio</h2>
          <p className="admin-page-subtitle">
            Upload new cake creations, toggle visibility, reorder items, or edit descriptions.
          </p>
        </div>
        <div className="admin-page-header__actions">
          <button
            type="button"
            className="btn btn-outline admin-btn--sm"
            onClick={fetchCakes}
            disabled={loading}
          >
            🔄 Refresh
          </button>
          <button
            type="button"
            className="btn btn-primary admin-btn--sm"
            onClick={() => setShowUploadModal(true)}
          >
            ➕ Upload New Cake
          </button>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="admin-alert admin-alert--error" role="alert">
          <p>
            <strong>Error:</strong> {error}
          </p>
          <button
            type="button"
            className="btn btn-outline admin-btn--sm"
            onClick={fetchCakes}
          >
            Retry
          </button>
        </div>
      )}

      {/* Cake Grid */}
      <div className="admin-section-card">
        <div className="admin-cakes-summary-bar">
          <span className="admin-cakes-count-text">
            <strong>{cakes.length}</strong> total cakes (
            {cakes.filter((c) => c.is_visible).length} visible on website)
          </span>
          <span className="admin-cell-subtext">
            Tip: Use arrow buttons to reorder how cakes appear on your home page.
          </span>
        </div>

        {loading ? (
          <div className="admin-cakes-grid admin-cakes-grid--skeleton">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="admin-cake-card-skeleton" />
            ))}
          </div>
        ) : cakes.length === 0 ? (
          <div className="admin-empty-state">
            <div className="admin-empty-state__icon">🎂</div>
            <p className="admin-empty-state__title">No cake photos yet</p>
            <p className="admin-empty-state__text">
              Click the button below to upload your first delicious eggless creation to your website gallery.
            </p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setShowUploadModal(true)}
            >
              ➕ Upload Cake Photo
            </button>
          </div>
        ) : (
          <div className="admin-cakes-grid">
            {cakes.map((cake, index) => {
              const isToggling = togglingId === cake.id;
              const isReordering = reorderingId === cake.id;

              return (
                <div
                  key={cake.id}
                  className={`admin-cake-card ${
                    !cake.is_visible ? 'admin-cake-card--hidden' : ''
                  }`}
                >
                  <div className="admin-cake-card__img-wrap">
                    <img
                      src={cake.public_url}
                      alt={cake.alt_text || 'Eggless cake'}
                      className="admin-cake-card__img"
                      loading="lazy"
                    />

                    {/* Order badge */}
                    <div className="admin-cake-card__order-badge">
                      #{index + 1}
                    </div>

                    {/* Visibility status */}
                    <button
                      type="button"
                      className={`admin-cake-card__vis-btn ${
                        cake.is_visible
                          ? 'admin-cake-card__vis-btn--visible'
                          : 'admin-cake-card__vis-btn--hidden'
                      }`}
                      onClick={() => handleToggleVisibility(cake)}
                      disabled={isToggling}
                      title={cake.is_visible ? 'Click to hide' : 'Click to show'}
                    >
                      {cake.is_visible ? '👁️ Public' : '🚫 Hidden'}
                    </button>
                  </div>

                  <div className="admin-cake-card__body">
                    <div className="admin-cake-card__meta">
                      {cake.occasion_tag && (
                        <span className="admin-pill admin-pill--occasion">
                          {cake.occasion_tag}
                        </span>
                      )}
                      <span className="admin-cell-subtext">
                        Order pos: {cake.display_order}
                      </span>
                    </div>

                    <p className="admin-cake-card__alt">
                      {cake.alt_text || (
                        <em className="admin-cell-muted">No description set</em>
                      )}
                    </p>

                    {/* Actions toolbar */}
                    <div className="admin-cake-card__toolbar">
                      {/* Reordering */}
                      <div className="admin-reorder-group">
                        <button
                          type="button"
                          className="admin-icon-btn"
                          onClick={() => handleMoveOrder(index, 'up')}
                          disabled={index === 0 || isReordering}
                          title="Move earlier in gallery"
                          aria-label="Move earlier"
                        >
                          ◀
                        </button>
                        <button
                          type="button"
                          className="admin-icon-btn"
                          onClick={() => handleMoveOrder(index, 'down')}
                          disabled={index === cakes.length - 1 || isReordering}
                          title="Move later in gallery"
                          aria-label="Move later"
                        >
                          ▶
                        </button>
                      </div>

                      {/* Edit / Delete */}
                      <div className="admin-action-btn-group">
                        <button
                          type="button"
                          className="btn btn-outline admin-btn--xs"
                          onClick={() => {
                            setEditingCake(cake);
                            setEditAltText(cake.alt_text || '');
                            setEditOccasionTag(cake.occasion_tag || '');
                          }}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          type="button"
                          className="admin-icon-btn admin-icon-btn--delete"
                          onClick={() => setDeleteTarget(cake)}
                          title="Delete cake photo"
                          aria-label="Delete cake"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div
          className="admin-modal-backdrop"
          onClick={() => !uploading && setShowUploadModal(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="admin-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Upload New Cake Photo</h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => !uploading && setShowUploadModal(false)}
                disabled={uploading}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="admin-modal-form">
              <div className="admin-modal-body">
                {/* Image picker */}
                <div className="form-group">
                  <label className="form-label">Cake Image</label>
                  <div className="admin-file-dropzone">
                    {filePreviewUrl ? (
                      <div className="admin-file-preview-wrap">
                        <img
                          src={filePreviewUrl}
                          alt="Preview"
                          className="admin-file-preview-img"
                        />
                        <button
                          type="button"
                          className="admin-file-remove-btn"
                          onClick={() => {
                            setSelectedFile(null);
                            setFilePreviewUrl(null);
                          }}
                        >
                          Remove / Choose another
                        </button>
                      </div>
                    ) : (
                      <label className="admin-file-picker-label">
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="admin-file-input"
                          onChange={handleFileChange}
                          disabled={uploading}
                        />
                        <span className="admin-file-picker-icon">📸</span>
                        <span className="admin-file-picker-text">
                          Click or drag to select a cake photo
                        </span>
                        <span className="admin-file-picker-sub">
                          Supports JPG, PNG, WebP up to 8MB
                        </span>
                      </label>
                    )}
                  </div>
                </div>

                {/* Alt Text */}
                <div className="form-group">
                  <label htmlFor="cake-alt-text" className="form-label">
                    Image Description (Alt Text & Caption)
                  </label>
                  <input
                    id="cake-alt-text"
                    type="text"
                    className="form-input"
                    placeholder="e.g. 2-tier Belgian Chocolate Birthday Cake with fresh strawberries"
                    value={altText}
                    onChange={(e) => setAltText(e.target.value)}
                    disabled={uploading}
                  />
                  <span className="admin-field-tip">
                    Helps with SEO accessibility and description in the full-screen lightbox.
                  </span>
                </div>

                {/* Occasion Tag */}
                <div className="form-group">
                  <label htmlFor="cake-occasion-tag" className="form-label">
                    Occasion Category
                  </label>
                  <select
                    id="cake-occasion-tag"
                    className="form-select"
                    value={occasionTag}
                    onChange={(e) => setOccasionTag(e.target.value)}
                    disabled={uploading}
                  >
                    <option value="Birthday">Birthday</option>
                    <option value="Wedding">Wedding</option>
                    <option value="Anniversary">Anniversary</option>
                    <option value="Baby Shower">Baby Shower</option>
                    <option value="Custom Theme">Custom Theme</option>
                    <option value="Cupcakes & Bakes">Cupcakes & Bakes</option>
                    <option value="Custom">Other (Specify below)</option>
                  </select>
                </div>

                {occasionTag === 'Custom' && (
                  <div className="form-group">
                    <label htmlFor="cake-custom-tag" className="form-label">
                      Custom Category Name
                    </label>
                    <input
                      id="cake-custom-tag"
                      type="text"
                      className="form-input"
                      placeholder="e.g. Corporate Celebration"
                      value={customTag}
                      onChange={(e) => setCustomTag(e.target.value)}
                      disabled={uploading}
                    />
                  </div>
                )}
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="btn btn-outline admin-btn--sm"
                  onClick={() => setShowUploadModal(false)}
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary admin-btn--sm"
                  disabled={uploading || !selectedFile}
                >
                  {uploading ? (
                    <span className="admin-btn-spinner-wrap">
                      <span className="admin-spinner" /> Uploading to Supabase...
                    </span>
                  ) : (
                    'Upload & Publish'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Details Modal */}
      {editingCake && (
        <div
          className="admin-modal-backdrop"
          onClick={() => !savingEdit && setEditingCake(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="admin-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Edit Cake Details</h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setEditingCake(null)}
                disabled={savingEdit}
              >
                ×
              </button>
            </div>

            <div className="admin-modal-body">
              <div className="admin-edit-preview-row">
                <img
                  src={editingCake.public_url}
                  alt={editingCake.alt_text || 'Cake'}
                  className="admin-edit-thumb"
                />
                <div>
                  <strong>Storage Path:</strong>
                  <div className="admin-cell-subtext">{editingCake.storage_path}</div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description / Alt Text</label>
                <input
                  type="text"
                  className="form-input"
                  value={editAltText}
                  onChange={(e) => setEditAltText(e.target.value)}
                  disabled={savingEdit}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Occasion / Category Tag</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Birthday, Wedding, Anniversary..."
                  value={editOccasionTag}
                  onChange={(e) => setEditOccasionTag(e.target.value)}
                  disabled={savingEdit}
                />
              </div>
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                className="btn btn-outline admin-btn--sm"
                onClick={() => setEditingCake(null)}
                disabled={savingEdit}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary admin-btn--sm"
                onClick={handleSaveEdit}
                disabled={savingEdit}
              >
                {savingEdit ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div
          className="admin-modal-backdrop"
          onClick={() => !deleting && setDeleteTarget(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="admin-modal-card admin-modal-card--sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Delete Cake Photo?</h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
              >
                ×
              </button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-delete-preview">
                <img
                  src={deleteTarget.public_url}
                  alt={deleteTarget.alt_text || 'Cake'}
                  className="admin-delete-thumb"
                />
              </div>
              <p>
                Are you sure you want to permanently delete this cake from your gallery and storage?
              </p>
              <p className="admin-cell-subtext">This cannot be reversed.</p>
            </div>
            <div className="admin-modal-footer">
              <button
                type="button"
                className="btn btn-outline admin-btn--sm"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary admin-btn--sm admin-btn--danger"
                onClick={handleDeleteCake}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete Photo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
