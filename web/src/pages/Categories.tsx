import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Category {
  id: number;
  name: string;
  description: string;
  keywords: string;
  isDefault: boolean;
  createdAt: string;
  transactionCount: number;
}

interface CategoryListResponse {
  data: Category[];
}

interface CategoryMutationResponse {
  data: Category;
}

interface CategoryTransaction {
  id: number;
  statementId: number;
  date: string;
  description: string;
  amount: number;
  type: 'debit' | 'credit';
  status: 'needs_review' | 'auto_categorized' | 'confirmed';
}

interface CategoryTransactionsResponse {
  data: CategoryTransaction[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

const TRANSACTIONS_PAGE_SIZE = 25;

function formatAmount(cents: number): string {
  const value = Math.abs(cents) / 100;
  const formatted = value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  return cents < 0 ? `-$${formatted}` : `$${formatted}`;
}

function emptyForm() {
  return {
    name: '',
    description: '',
    keywords: ''
  };
}

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [newCategoryForm, setNewCategoryForm] = useState(emptyForm);

  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [updatingCategoryId, setUpdatingCategoryId] = useState<number | null>(null);
  const [deletingCategoryId, setDeletingCategoryId] = useState<number | null>(null);

  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedCategoryTransactions, setSelectedCategoryTransactions] = useState<CategoryTransaction[]>([]);
  const [selectedCategoryTotal, setSelectedCategoryTotal] = useState(0);
  const [selectedCategoryOffset, setSelectedCategoryOffset] = useState(0);
  const [selectedCategoryLoading, setSelectedCategoryLoading] = useState(false);
  const [selectedCategoryError, setSelectedCategoryError] = useState<string | null>(null);

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === selectedCategoryId) ?? null,
    [categories, selectedCategoryId]
  );

  const canGoSelectedPrevious = selectedCategoryOffset > 0;
  const canGoSelectedNext = selectedCategoryOffset + TRANSACTIONS_PAGE_SIZE < selectedCategoryTotal;

  const loadCategories = async (preserveSelected = true) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/categories', { credentials: 'include' });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        const message = (payload as { error?: string }).error ?? `Failed to load categories (${response.status})`;
        throw new Error(message);
      }

      const payload = (await response.json()) as CategoryListResponse;
      setCategories(payload.data);

      if (!preserveSelected) {
        setSelectedCategoryId(null);
      } else if (selectedCategoryId !== null && !payload.data.some((category) => category.id === selectedCategoryId)) {
        setSelectedCategoryId(null);
      }
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const loadSelectedCategoryTransactions = async (categoryId: number, offset = 0) => {
    setSelectedCategoryLoading(true);
    setSelectedCategoryError(null);

    try {
      const params = new URLSearchParams();
      params.set('limit', String(TRANSACTIONS_PAGE_SIZE));
      params.set('offset', String(offset));

      const response = await fetch(`/api/categories/${categoryId}/transactions?${params.toString()}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        const message = (payload as { error?: string }).error ?? `Failed to load category transactions (${response.status})`;
        throw new Error(message);
      }

      const payload = (await response.json()) as CategoryTransactionsResponse;
      setSelectedCategoryTransactions(payload.data);
      setSelectedCategoryTotal(payload.pagination.total);
      setSelectedCategoryOffset(payload.pagination.offset);
    } catch (fetchError) {
      setSelectedCategoryError(fetchError instanceof Error ? fetchError.message : 'Failed to load category transactions');
    } finally {
      setSelectedCategoryLoading(false);
    }
  };

  useEffect(() => {
    void loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedCategoryId === null) {
      setSelectedCategoryTransactions([]);
      setSelectedCategoryTotal(0);
      setSelectedCategoryOffset(0);
      setSelectedCategoryError(null);
      return;
    }

    void loadSelectedCategoryTransactions(selectedCategoryId, selectedCategoryOffset);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategoryId, selectedCategoryOffset]);

  const onCreateCategory = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newCategoryForm)
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        const message = (payload as { error?: string }).error ?? `Failed to create category (${response.status})`;
        throw new Error(message);
      }

      const payload = (await response.json()) as CategoryMutationResponse;
      setCategories((previous) => [...previous, payload.data].sort((a, b) => a.name.localeCompare(b.name)));
      setNewCategoryForm(emptyForm());
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Failed to create category');
    } finally {
      setSubmitting(false);
    }
  };

  const startEditing = (category: Category) => {
    setEditingCategoryId(category.id);
    setEditForm({
      name: category.name,
      description: category.description,
      keywords: category.keywords
    });
  };

  const onSaveCategory = async (categoryId: number) => {
    if (updatingCategoryId !== null) {
      return;
    }

    setUpdatingCategoryId(categoryId);
    setError(null);

    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        const message = (payload as { error?: string }).error ?? `Failed to update category (${response.status})`;
        throw new Error(message);
      }

      const payload = (await response.json()) as CategoryMutationResponse;
      setCategories((previous) =>
        previous
          .map((category) => (category.id === categoryId ? payload.data : category))
          .sort((a, b) => a.name.localeCompare(b.name))
      );
      setEditingCategoryId(null);

      if (selectedCategoryId === categoryId) {
        setSelectedCategoryOffset(0);
      }
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Failed to update category');
    } finally {
      setUpdatingCategoryId(null);
    }
  };

  const onDeleteCategory = async (category: Category) => {
    if (category.isDefault) {
      setError('Default categories cannot be deleted.');
      return;
    }

    const confirmed = window.confirm(
      `Delete "${category.name}"? Transactions in this category will become uncategorized and need review.`
    );

    if (!confirmed) {
      return;
    }

    setDeletingCategoryId(category.id);
    setError(null);

    try {
      const response = await fetch(`/api/categories/${category.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        const message = (payload as { error?: string }).error ?? `Failed to delete category (${response.status})`;
        throw new Error(message);
      }

      setCategories((previous) => previous.filter((row) => row.id !== category.id));

      if (selectedCategoryId === category.id) {
        setSelectedCategoryId(null);
        setSelectedCategoryTransactions([]);
        setSelectedCategoryTotal(0);
        setSelectedCategoryOffset(0);
      }

      if (editingCategoryId === category.id) {
        setEditingCategoryId(null);
      }
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Failed to delete category');
    } finally {
      setDeletingCategoryId(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Category Management</CardTitle>
          <CardDescription>Create and maintain categories used for transaction classification.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-4" onSubmit={onCreateCategory}>
            <Input
              placeholder="Name"
              value={newCategoryForm.name}
              onChange={(event) => setNewCategoryForm((prev) => ({ ...prev, name: event.target.value }))}
              disabled={submitting}
              required
            />
            <Input
              placeholder="Description"
              value={newCategoryForm.description}
              onChange={(event) => setNewCategoryForm((prev) => ({ ...prev, description: event.target.value }))}
              disabled={submitting}
              required
            />
            <Input
              placeholder="Keywords (comma separated)"
              value={newCategoryForm.keywords}
              onChange={(event) => setNewCategoryForm((prev) => ({ ...prev, keywords: event.target.value }))}
              disabled={submitting}
              required
            />
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Adding...' : 'Add Category'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
          <CardDescription>{categories.length} categories available.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {error ? <p className="text-sm text-[var(--destructive)]">{error}</p> : null}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Keywords</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Transactions</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-[var(--muted-foreground)]">
                    Loading categories...
                  </TableCell>
                </TableRow>
              ) : categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-[var(--muted-foreground)]">
                    No categories found.
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category) => {
                  const isEditing = editingCategoryId === category.id;
                  const isUpdating = updatingCategoryId === category.id;
                  const isDeleting = deletingCategoryId === category.id;
                  const isSelected = selectedCategoryId === category.id;

                  return (
                    <TableRow key={category.id} className={isSelected ? 'bg-[var(--muted)]/40' : undefined}>
                      <TableCell>
                        {isEditing ? (
                          <Input
                            value={editForm.name}
                            onChange={(event) => setEditForm((prev) => ({ ...prev, name: event.target.value }))}
                            disabled={isUpdating}
                          />
                        ) : (
                          category.name
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Input
                            value={editForm.description}
                            onChange={(event) => setEditForm((prev) => ({ ...prev, description: event.target.value }))}
                            disabled={isUpdating}
                          />
                        ) : (
                          category.description
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Input
                            value={editForm.keywords}
                            onChange={(event) => setEditForm((prev) => ({ ...prev, keywords: event.target.value }))}
                            disabled={isUpdating}
                          />
                        ) : (
                          category.keywords
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={category.isDefault ? 'default' : 'success'}>
                          {category.isDefault ? 'Default' : 'Custom'}
                        </Badge>
                      </TableCell>
                      <TableCell>{category.transactionCount}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant={isSelected ? 'default' : 'outline'}
                            onClick={() => {
                              setSelectedCategoryId(category.id);
                              setSelectedCategoryOffset(0);
                            }}
                            disabled={isDeleting}
                          >
                            View Data
                          </Button>

                          {isEditing ? (
                            <>
                              <Button type="button" size="sm" onClick={() => void onSaveCategory(category.id)} disabled={isUpdating}>
                                {isUpdating ? 'Saving...' : 'Save'}
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingCategoryId(null)}
                                disabled={isUpdating}
                              >
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <Button type="button" size="sm" variant="outline" onClick={() => startEditing(category)} disabled={isDeleting}>
                              Edit
                            </Button>
                          )}

                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => void onDeleteCategory(category)}
                            disabled={isDeleting || category.isDefault}
                          >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {selectedCategory ? `Categorized Transactions: ${selectedCategory.name}` : 'Categorized Transactions'}
          </CardTitle>
          <CardDescription>
            {selectedCategory
              ? `${selectedCategoryTotal} transaction(s) currently assigned to this category.`
              : 'Select a category to inspect assigned transactions.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedCategoryError ? <p className="text-sm text-[var(--destructive)]">{selectedCategoryError}</p> : null}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!selectedCategory ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-[var(--muted-foreground)]">
                    Pick a category above to view its transaction data.
                  </TableCell>
                </TableRow>
              ) : selectedCategoryLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-[var(--muted-foreground)]">
                    Loading transactions...
                  </TableCell>
                </TableRow>
              ) : selectedCategoryTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-[var(--muted-foreground)]">
                    No transactions are assigned to this category yet.
                  </TableCell>
                </TableRow>
              ) : (
                selectedCategoryTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{transaction.date}</TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell className={transaction.type === 'debit' ? 'text-red-500' : 'text-green-500'}>
                      {formatAmount(transaction.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={transaction.status === 'confirmed' ? 'success' : 'warning'}>{transaction.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {selectedCategory ? (
            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedCategoryOffset((value) => Math.max(0, value - TRANSACTIONS_PAGE_SIZE))}
                disabled={!canGoSelectedPrevious || selectedCategoryLoading}
              >
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedCategoryOffset((value) => value + TRANSACTIONS_PAGE_SIZE)}
                disabled={!canGoSelectedNext || selectedCategoryLoading}
              >
                Next
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
