export interface OmbiSearchResponse {
  id: string;
  mediaType: 'movie' | 'tv';
  title: string;
  poster: string;
  overview: string;
}

export interface OmbiRequestResponse {
  result: boolean;
  message?: string;
  isError: boolean;
  errorMessage?: string;
  errorCode?: string;
  requestId: number;
}
