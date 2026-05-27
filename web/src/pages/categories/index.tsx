import { useCallback, useState } from 'react';
import { CategoriesEmptyState } from './components/CategoriesEmptyState';
import { CategoriesErrorBanner } from './components/CategoriesErrorBanner';
import { CategoriesHeader } from './components/CategoriesHeader';
import { CategoriesLoadingState } from './components/CategoriesLoadingState';
import { CategoriesSection } from './components/CategoriesSection';
import { CategoriesWarningFooter } from './components/CategoriesWarningFooter';
import { CreateCategoryForm } from './components/CreateCategoryForm';
import { DeleteCategoryModal } from './components/DeleteCategoryModal';
import { useCategoriesData } from './hooks/useCategoriesData';
import { DEFAULT_COLOR } from './lib/color';
import type { Category } from './types';

export function CategoriesPage() {
  const {
    categories,
    favorites,
    rest,
    loading,
    error,
    creating,
    deleting,
    refresh,
    createCategory,
    renameCategory,
    deleteCategory,
    toggleFavorite,
    updateCategoryColor,
  } = useCategoriesData();

  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(DEFAULT_COLOR);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [colorEditingId, setColorEditingId] = useState<number | null>(null);
  const [colorEditValue, setColorEditValue] = useState(DEFAULT_COLOR);
  const [categoryPendingDelete, setCategoryPendingDelete] = useState<Category | null>(null);

  const resetNewForm = useCallback(() => {
    setShowNewForm(false);
    setNewName('');
    setNewColor(DEFAULT_COLOR);
  }, []);

  const onShowNewForm = useCallback(() => {
    setShowNewForm(true);
  }, []);

  const onCreateCategory = useCallback(async () => {
    const created = await createCategory(newName, newColor);
    if (created) resetNewForm();
  }, [createCategory, newColor, newName, resetNewForm]);

  const onStartRename = useCallback((category: Category) => {
    setEditingId(category.id);
    setEditName(category.name);
    setColorEditingId(null);
  }, []);

  const onCancelRename = useCallback(() => {
    setEditingId(null);
  }, []);

  const onSaveRename = useCallback(async (category: Category) => {
    const renamed = await renameCategory(category.id, editName);
    if (!renamed) return;
    setEditingId(null);
    setEditName('');
  }, [editName, renameCategory]);

  const onToggleColorEditor = useCallback((category: Category) => {
    setColorEditingId((currentId) => {
      if (currentId === category.id) {
        setColorEditValue(DEFAULT_COLOR);
        return null;
      }

      setColorEditValue(category.color ?? DEFAULT_COLOR);
      setEditingId(null);
      return category.id;
    });
  }, []);

  const onSaveColor = useCallback(async (category: Category) => {
    const updated = await updateCategoryColor(category.id, colorEditValue);
    if (!updated) return;
    setColorEditingId(null);
    setColorEditValue(DEFAULT_COLOR);
  }, [colorEditValue, updateCategoryColor]);

  const onToggleFavorite = useCallback((category: Category) => {
    void toggleFavorite(category);
  }, [toggleFavorite]);

  const onConfirmDelete = useCallback(async () => {
    if (!categoryPendingDelete) return;
    const deleted = await deleteCategory(categoryPendingDelete);
    if (deleted) setCategoryPendingDelete(null);
  }, [categoryPendingDelete, deleteCategory]);

  const onCloseDeleteModal = useCallback(() => {
    setCategoryPendingDelete(null);
  }, []);

  const onRetry = useCallback(() => {
    void refresh();
  }, [refresh]);

  return (
    <div className="flex flex-col gap-6" aria-busy={loading}>
      <CategoriesHeader totalCategories={categories.length} onShowNewForm={onShowNewForm} />

      {error ? <CategoriesErrorBanner error={error} loading={loading} onRetry={onRetry} /> : null}

      {showNewForm ? (
        <CreateCategoryForm
          newName={newName}
          newColor={newColor}
          creating={creating}
          onNameChange={setNewName}
          onColorChange={setNewColor}
          onCancel={resetNewForm}
          onCreate={onCreateCategory}
        />
      ) : null}

      {loading ? (
        <CategoriesLoadingState />
      ) : (
        <div className="flex flex-col gap-8">
          {categories.length === 0 ? <CategoriesEmptyState onShowNewForm={onShowNewForm} /> : null}

          <CategoriesSection
            title="Favorites"
            categories={favorites}
            showFavoriteIcon
            passFavoriteIndexes
            editingId={editingId}
            editName={editName}
            colorEditingId={colorEditingId}
            colorEditValue={colorEditValue}
            onEditNameChange={setEditName}
            onStartRename={onStartRename}
            onCancelRename={onCancelRename}
            onSaveRename={onSaveRename}
            onToggleFavorite={onToggleFavorite}
            onToggleColorEditor={onToggleColorEditor}
            onColorEditValueChange={setColorEditValue}
            onSaveColor={onSaveColor}
            onRequestDelete={setCategoryPendingDelete}
          />

          <CategoriesSection
            title="All categories"
            categories={rest}
            showDivider={favorites.length > 0}
            editingId={editingId}
            editName={editName}
            colorEditingId={colorEditingId}
            colorEditValue={colorEditValue}
            onEditNameChange={setEditName}
            onStartRename={onStartRename}
            onCancelRename={onCancelRename}
            onSaveRename={onSaveRename}
            onToggleFavorite={onToggleFavorite}
            onToggleColorEditor={onToggleColorEditor}
            onColorEditValueChange={setColorEditValue}
            onSaveColor={onSaveColor}
            onRequestDelete={setCategoryPendingDelete}
          />
        </div>
      )}

      <CategoriesWarningFooter />

      {categoryPendingDelete ? (
        <DeleteCategoryModal
          category={categoryPendingDelete}
          deleting={deleting}
          onClose={onCloseDeleteModal}
          onConfirm={onConfirmDelete}
        />
      ) : null}
    </div>
  );
}
