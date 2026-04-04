import { useState, useEffect, useCallback } from 'react';
import { subscribeToMission, getMissionState } from '../services/scrapingProgress';
import type { ScrapingMissionState } from '../services/scrapingProgress';

export function useScrapingProgress(): ScrapingMissionState & { clearMission: () => void } {
  const [state, setState] = useState<ScrapingMissionState>(getMissionState());

  useEffect(() => {
    return subscribeToMission(setState);
  }, []);

  const clearMission = useCallback(() => {
    import('../services/scrapingProgress').then(m => m.clearMission());
  }, []);

  return { ...state, clearMission };
}
