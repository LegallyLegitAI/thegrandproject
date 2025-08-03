export type Action =
  | { type: 'SET_AUTH_STATE'; payload: { isAuthenticated: boolean; user: AppState['user'] } }
  | { type: 'LOGOUT' }
  | { type: 'SET_PAGE'; payload: Page }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_RESULTS'; payload: { score: number; risks: Risk[] } }
  | { type: 'HYDRATE_STATE'; payload: Partial<AppState> }
  | { type: 'ANSWER_QUESTION'; payload: { questionId: string; answer: string } }
  | { type: 'SET_HEALTH_CHECK_STEP'; payload: number };
