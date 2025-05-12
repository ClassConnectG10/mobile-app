export class SearchFilters {
  constructor(
    public searchQuery: string,
    public startDate: Date | null,
    public endDate: Date | null,
    public level: string,
    public modality: string,
    public category: string
  ) {}
}
