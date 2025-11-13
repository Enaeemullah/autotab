export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface Paginated<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function toPagination(options: PaginationOptions = {}): Required<PaginationOptions> {
  const page = Math.max(1, options.page ?? 1);
  const limit = Math.min(100, Math.max(1, options.limit ?? 25));
  return { page, limit };
}

export function buildPaginated<T>(
  data: T[],
  total: number,
  options: Required<PaginationOptions>
): Paginated<T> {
  return {
    data,
    total,
    page: options.page,
    limit: options.limit,
    totalPages: Math.ceil(total / options.limit)
  };
}
